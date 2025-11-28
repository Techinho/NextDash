import { auth } from "@clerk/nextjs/server"
import { getSupabaseServer } from "@/lib/supabase-server"

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await getSupabaseServer()

    // Check if admin
    const { data: adminUser, error: adminError } = await supabase
      .from("users")
      .select("is_admin")
      .eq("clerk_id", userId)
      .single()

    if (adminError || !adminUser?.is_admin) {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get stats
    const [usersRes, agenciesRes, contactsRes, usageRes] = await Promise.all([
      supabase.from("users").select("id", { count: "exact" }),
      supabase.from("agencies").select("id", { count: "exact" }),
      supabase.from("contacts").select("id", { count: "exact" }),
      supabase.from("daily_usage").select("contacts_viewed, user_id"),
    ])

    const totalUsers = usersRes.count || 0
    const totalAgencies = agenciesRes.count || 0
    const totalContacts = contactsRes.count || 0

    // Calculate average contacts viewed
    let averageContactsViewedToday = 0
    let usersWithLimitExceeded = 0

    if (usageRes.data) {
      const usageByUser: Record<string, number> = {}
      usageRes.data.forEach((usage: any) => {
        usageByUser[usage.user_id] = usage.contacts_viewed
        if (usage.contacts_viewed >= 50) {
          usersWithLimitExceeded++
        }
      })

      const totalContacted = Object.values(usageByUser).reduce((a, b) => a + (b as number), 0)
      averageContactsViewedToday = totalUsers > 0 ? totalContacted / totalUsers : 0
    }

    return Response.json({
      totalUsers,
      totalAgencies,
      totalContacts,
      averageContactsViewedToday,
      usersWithLimitExceeded,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
