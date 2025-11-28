import { auth } from "@clerk/nextjs/server"
import { getSupabaseServer } from "@/lib/supabase-server"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = await getSupabaseServer()

  // 1. Get User ID
  const { data: user } = await supabase.from("users").select("id").eq("clerk_id", userId).single()
  if (!user) return Response.json({ agencies: 0, contacts: 0, contactsViewedToday: 0, recentAgencies: [], recentContacts: [] })

  // 2. Fetch Data
  const [agenciesCount, contactsCount, usage, recentAgencies, recentContacts] = await Promise.all([
    supabase.from("agencies").select("*", { count: "exact", head: true }),
    supabase.from("contacts").select("*", { count: "exact", head: true }),
    supabase.from("daily_usage").select("contacts_viewed").eq("user_id", user.id).eq("date", new Date().toISOString().split("T")[0]).single(),
    
    // Fetch 5 newest agencies (SAFE)
    supabase.from("agencies").select("id, name, state, type").order("created_at", { ascending: false }).limit(5),
    
    // Fetch 5 newest contacts (SAFE FIELDS ONLY - NO EMAIL/PHONE)
    supabase.from("contacts")
      .select("id, first_name, last_name, title, department, created_at") // <--- REMOVED EMAIL
      .order("created_at", { ascending: false })
      .limit(5)
  ])

  return Response.json({
    agencies: agenciesCount.count || 0,
    contacts: contactsCount.count || 0,
    contactsViewedToday: usage.data?.contacts_viewed || 0,
    recentAgencies: recentAgencies.data || [],
    recentContacts: recentContacts.data || []
  })
}
