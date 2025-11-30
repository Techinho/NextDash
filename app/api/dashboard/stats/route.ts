import { auth, currentUser } from "@clerk/nextjs/server"
import { getSupabaseServer } from "@/lib/supabase-server"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = await getSupabaseServer()

  // 1) Ensure user exists and load is_admin
  let { data: user } = await supabase
    .from("users")
    .select("id, email, is_admin")
    .eq("clerk_id", userId)
    .single()

  if (!user) {
    const clerkUser = await currentUser()
    const email =
      clerkUser?.emailAddresses[0]?.emailAddress ||
      `missing-${userId}@example.com`

    const { data: newUser } = await supabase
      .from("users")
      .insert([{ clerk_id: userId, email }])
      .select("id, email, is_admin")
      .single()

    user = newUser || null
  }

  if (!user) {
    return Response.json(
      { error: "User sync failed" },
      { status: 500 },
    )
  }

  const today = new Date().toISOString().split("T")[0]
  // Include PII fields for admins only
  const contactSelect = user.is_admin
    ? "id, first_name, last_name, title, department, created_at, email, phone"
    : "id, first_name, last_name, title, department, created_at"
  // Include extra agency fields for admins (website, phone, county, population, physical_address)
  const agencySelect = user.is_admin
    ? "id, name, state, type, website, phone, county, population, physical_address, state_code"
    : "id, name, state, type"

  const [
    agenciesCountRes,
    contactsCountRes,
    usageRes,
    recentAgenciesRes,
    recentContactsRes,
  ] = await Promise.all([
    supabase.from("agencies").select("*", { count: "exact", head: true }),
    supabase.from("contacts").select("*", { count: "exact", head: true }),
    supabase
      .from("daily_usage")
      .select("contacts_viewed")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle(),
    supabase
      .from("agencies")
      .select(agencySelect)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("contacts")
      .select(contactSelect)
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  return Response.json({
    agencies: agenciesCountRes.count || 0,
    contacts: contactsCountRes.count || 0,
    contactsViewedToday: usageRes.data?.contacts_viewed || 0,
    recentAgencies: recentAgenciesRes.data || [],
    recentContacts: recentContactsRes.data || [],
    isAdmin: !!user.is_admin, 
  })
}
