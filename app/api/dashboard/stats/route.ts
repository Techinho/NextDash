import { auth } from "@clerk/nextjs/server"
import { getSupabaseServer } from "@/lib/supabase-server"

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await getSupabaseServer()

    const [agenciesRes, contactsRes] = await Promise.all([
      supabase.from("agencies").select("id", { count: "exact" }),
      supabase.from("contacts").select("id", { count: "exact" }),
    ])

    const agencies = agenciesRes.count || 0
    const contacts = contactsRes.count || 0

    // Get current user's contact count for today
    const { data: userUsage } = await supabase.from("users").select("id").eq("clerk_id", userId).single()

    let contactsViewedToday = 0
    if (userUsage) {
      const { data: usage } = await supabase
        .from("daily_usage")
        .select("contacts_viewed")
        .eq("user_id", userUsage.id)
        .eq("date", new Date().toISOString().split("T")[0])
        .single()

      contactsViewedToday = usage?.contacts_viewed || 0
    }

    return Response.json({
      agencies,
      contacts,
      contactsViewedToday,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
