import { auth, currentUser } from "@clerk/nextjs/server"
import { getSupabaseServer } from "@/lib/supabase-server"

const DAILY_LIMIT = 50
const ITEMS_PER_PAGE = 10

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const supabase = await getSupabaseServer()

    // 1. User Sync
    let { data: user } = await supabase.from("users").select("id, is_admin").eq("clerk_id", userId).single()
    if (!user) {
      const clerkUser = await currentUser()
      const email = clerkUser?.emailAddresses[0]?.emailAddress || `missing-${userId}@example.com`
      const { data: newUser } = await supabase.from("users").insert([{ clerk_id: userId, email }]).select().single()
      user = newUser || { id: 'temp', is_admin: false } // Fallback prevents crash
    }

    if (user?.is_admin) return handleContactsQuery(request, supabase)

    // 2. Usage Check
    const today = new Date().toISOString().split("T")[0]
    const { data: allUsage } = await supabase.from("daily_usage").select("contacts_viewed, viewed_contact_ids, date").eq("user_id", user.id)

    const contactsViewedToday = allUsage?.find((u: any) => u.date === today)?.contacts_viewed || 0
    const allViewedIds = allUsage?.flatMap((u: any) => u.viewed_contact_ids || []) || []
    const previouslyViewedIds: string[] = [...new Set(allViewedIds as string[])]
    const limitReached = contactsViewedToday >= DAILY_LIMIT

    // 3. Query Setup
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""
    let offset = (page - 1) * ITEMS_PER_PAGE

    // ROTATION LOGIC
    if (!search && !limitReached) {
        const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
        offset += ((dayOfYear || 1) * 100) % 50000
    }

    // *** FIX: NO JOIN ("agencies(name)" REMOVED) ***
    let query = supabase.from("contacts").select("*", { count: "exact" })

    if (limitReached) {
        if (previouslyViewedIds.length > 0) {
             query = query.in('id', previouslyViewedIds)
             offset = (page - 1) * ITEMS_PER_PAGE // Reset offset for history view
        } else {
             return Response.json({ contacts: [], totalPages: 0, usage: { contactsViewedToday, hasExceeded: true } })
        }
    }

    if (search) {
      offset = (page - 1) * ITEMS_PER_PAGE
      query = query.or(`first_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data: contacts, count, error } = await query
      .order('id', { ascending: true }) // <--- STABILITY FIX
      .range(offset, offset + ITEMS_PER_PAGE - 1)
    
    if (error) throw error

    // Usage Update Logic (Simplified for safety)
    let finalContacts = contacts || []
    if (!limitReached && previouslyViewedIds.length > 0) {
      finalContacts = finalContacts.filter((c: any) => !previouslyViewedIds.includes(c.id))
    }
    finalContacts = finalContacts.slice(0, ITEMS_PER_PAGE)

    // Allow/Block Logic
    const newIds = finalContacts.map((c: any) => c.id).filter((id: string) => !previouslyViewedIds.includes(id))
    if (limitReached && newIds.length > 0) {
        return Response.json({ error: "Limit Exceeded", usage: { hasExceeded: true } }, { status: 429 })
    }

    // Write Usage
    if (newIds.length > 0) {
       const updatedIds = [...previouslyViewedIds, ...newIds]
       await supabase.from("daily_usage").upsert([{
          user_id: user.id, date: today, contacts_viewed: updatedIds.length, viewed_contact_ids: updatedIds
       }], { onConflict: 'user_id, date' })
    }

    return Response.json({
      contacts: finalContacts,
      totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE),
      currentPage: page,
      usage: { contactsViewedToday: contactsViewedToday + newIds.length, hasExceeded: limitReached }
    })

  } catch (error: any) {
    console.error("Route Crash:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

async function handleContactsQuery(request: Request, supabase: any) {
  // Admin Logic (No Join)
  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get("page") || "1")
  const offset = (page - 1) * ITEMS_PER_PAGE
  
  let query = supabase.from("contacts").select("*", { count: "exact" })
  
  const { data, count } = await query
      .order('id', { ascending: true }) // <--- STABILITY FIX
      .range(offset, offset + ITEMS_PER_PAGE - 1)
  
  return Response.json({ contacts: data || [], totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE), currentPage: page, usage: { hasExceeded: false } })
}
