import { auth, currentUser } from "@clerk/nextjs/server"
import { getSupabaseServer } from "@/lib/supabase-server"

const DAILY_LIMIT = 50
const ITEMS_PER_PAGE = 10

export async function GET(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await getSupabaseServer()

    // 1. User Sync
    let { data: user } = await supabase.from("users").select("id, is_admin").eq("clerk_id", userId).single()

    if (!user) {
      const clerkUser = await currentUser()
      const email = clerkUser?.emailAddresses[0]?.emailAddress || `missing-${userId}@example.com`
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert([{ clerk_id: userId, email, is_admin: false }])
        .select("id, is_admin")
        .single()

      if (createError?.code === '23505') {
           const { data: existing } = await supabase.from("users").select("id, is_admin").eq("clerk_id", userId).single()
           user = existing
      } else if (createError) {
           return Response.json({ error: "Sync failed" }, { status: 500 })
      } else {
           user = newUser
      }
    }

    if (user.is_admin) return handleContactsQuery(request, supabase)

    // 2. Usage Check
    const today = new Date().toISOString().split("T")[0]
    const { data: usage } = await supabase
      .from("daily_usage")
      .select("viewed_contact_ids")
      .eq("user_id", user.id)
      .eq("date", today)
      .single()

    const previouslyViewedIds: string[] = usage?.viewed_contact_ids || []
    const contactsViewedToday = previouslyViewedIds.length
    const limitReached = contactsViewedToday >= DAILY_LIMIT

    // 3. Build Query
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""
    const offset = (page - 1) * ITEMS_PER_PAGE

    // UPDATED: Join with agencies table to get the Name
    let query = supabase.from("contacts").select("*, agencies(name)", { count: "exact" })

    if (limitReached) {
        if (previouslyViewedIds.length > 0) {
             query = query.in('id', previouslyViewedIds)
        } else {
             return Response.json({
                contacts: [], totalPages: 0, currentPage: 1,
                usage: { contactsViewedToday, remainingContacts: 0, hasExceeded: true }
             })
        }
    }

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,title.ilike.%${search}%`)
    }

    const { data: contacts, count, error: contactsError } = await query
      .range(offset, offset + ITEMS_PER_PAGE - 1)
      .order("first_name", { ascending: true })
      .order("id", { ascending: true }) 

    if (contactsError) throw contactsError

    // 4. Check New IDs
    let newUniqueContactsCount = 0
    let allowRequest = true

    if (contacts && contacts.length > 0) {
        const incomingIds = contacts.map((c: any) => c.id)
        const newIds = incomingIds.filter(id => !previouslyViewedIds.includes(id))
        newUniqueContactsCount = newIds.length

        if (limitReached && newUniqueContactsCount > 0) {
            allowRequest = false
        }
    }

    if (!allowRequest) {
        return Response.json({
            error: "Daily limit exceeded",
            usage: { contactsViewedToday, remainingContacts: 0, hasExceeded: true },
        }, { status: 429 })
    }

    // 5. Update Usage
    let finalTotal = contactsViewedToday
    
    if (contacts && contacts.length > 0 && newUniqueContactsCount > 0) {
      const newContactIds = contacts.map((c: any) => c.id)
      const uniqueSet = new Set([...previouslyViewedIds, ...newContactIds])
      const uniqueArray = Array.from(uniqueSet)
      
      await supabase.from("daily_usage").upsert([{
          user_id: user.id,
          date: today,
          contacts_viewed: uniqueArray.length,
          viewed_contact_ids: uniqueArray
      }], { onConflict: 'user_id, date' })
      
      finalTotal = uniqueArray.length
    }

    const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE)

    return Response.json({
      contacts: contacts || [],
      totalPages,
      currentPage: page,
      usage: {
        contactsViewedToday: finalTotal,
        remainingContacts: Math.max(0, DAILY_LIMIT - finalTotal),
        hasExceeded: finalTotal >= DAILY_LIMIT,
      },
    })

  } catch (error) {
    console.error("Error fetching contacts:", error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

async function handleContactsQuery(request: Request, supabase: any) {
  const { searchParams } = new URL(request.url)
  const page = Number.parseInt(searchParams.get("page") || "1")
  const search = searchParams.get("search") || ""
  const offset = (page - 1) * ITEMS_PER_PAGE
  // UPDATED: Join with agencies
  let query = supabase.from("contacts").select("*, agencies(name)", { count: "exact" })
  
  if (search) query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,title.ilike.%${search}%`)
  
  const { data, count, error } = await query
      .range(offset, offset + ITEMS_PER_PAGE - 1)
      .order("first_name", { ascending: true })
      .order("id", { ascending: true })
      
  if (error) throw error
  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE)
  return Response.json({
    contacts: data || [],
    totalPages,
    currentPage: page,
    usage: { contactsViewedToday: 0, remainingContacts: 9999, hasExceeded: false }
  })
}
