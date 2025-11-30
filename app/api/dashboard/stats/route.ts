import { auth, currentUser } from "@clerk/nextjs/server"
import { getSupabaseServer } from "@/lib/supabase-server"

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = await getSupabaseServer()

  // 1) Ensure user exists (same pattern as contacts route)
  let { data: user, error: userError } = await supabase
    .from("users")
    .select("id, email")
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
      .select()
      .single()

    user = newUser || null
  }

  // If for some reason user is still null, fail clearly
  if (!user) {
    return Response.json(
      { error: "User sync failed", agencies: 0, contacts: 0, contactsViewedToday: 0, recentAgencies: [], recentContacts: [] },
      { status: 500 },
    )
  }

  const today = new Date().toISOString().split("T")[0]

  // 2) Fetch stats in parallel
  const [
    agenciesRes,
    contactsRes,
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
      .select("id, name, state, type")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("contacts")
      .select("id, first_name, last_name, title, department, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  const agenciesCount = agenciesRes.count || 0
  const contactsCount = contactsRes.count || 0
  const contactsViewedToday = usageRes.data?.contacts_viewed || 0

  return Response.json({
    agencies: agenciesCount,
    contacts: contactsCount,
    contactsViewedToday,
    recentAgencies: recentAgenciesRes.data || [],
    recentContacts: recentContactsRes.data || [],
  })
}
