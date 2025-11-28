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

    // Get all users with today's usage
    const today = new Date().toISOString().split("T")[0]

    const { data: users, error: usersError } = await supabase
      .from("users")
      .select(`
        id,
        email,
        is_admin,
        daily_usage (contacts_viewed)
      `)
      .eq("daily_usage.date", today)

    if (usersError) throw usersError

    const formattedUsers = (users || []).map((user: any) => ({
      id: user.id,
      email: user.email,
      isAdmin: user.is_admin,
      contactsViewedToday: user.daily_usage?.[0]?.contacts_viewed || 0,
    }))

    return Response.json({ users: formattedUsers })
  } catch (error) {
    console.error("Error fetching user usage:", error)
    return Response.json({ error: "Failed to fetch user usage" }, { status: 500 })
  }
}
