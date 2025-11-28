import { auth } from "@clerk/nextjs/server"
import { getSupabaseServer } from "@/lib/supabase-server"

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await getSupabaseServer()

    // Get user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, is_admin")
      .eq("clerk_id", userId)
      .single()

    if (userError || !user) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }

    let contactsViewedToday = 0
    let contactsViewedThisMonth = 0
    let remainingContactsToday = 50

    if (!user.is_admin) {
      const today = new Date().toISOString().split("T")[0]
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]

      // Get today's usage
      const { data: todayUsage } = await supabase
        .from("daily_usage")
        .select("contacts_viewed")
        .eq("user_id", user.id)
        .eq("date", today)
        .single()

      contactsViewedToday = todayUsage?.contacts_viewed || 0
      remainingContactsToday = Math.max(0, 50 - contactsViewedToday)

      // Get this month's usage
      const { data: monthUsage } = await supabase
        .from("daily_usage")
        .select("contacts_viewed")
        .eq("user_id", user.id)
        .gte("date", startOfMonth)

      contactsViewedThisMonth =
        monthUsage?.reduce((total: number, item: any) => total + (item.contacts_viewed || 0), 0) || 0
    }

    return Response.json({
      email: user.email,
      isAdmin: user.is_admin,
      contactsViewedToday,
      contactsViewedThisMonth,
      remainingContactsToday,
    })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return Response.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}
