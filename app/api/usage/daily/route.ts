import { auth } from "@clerk/nextjs/server"
import { getSupabaseServer } from "@/lib/supabase-server"

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await getSupabaseServer()

    // Get user ID from Clerk ID
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, is_admin")
      .eq("clerk_id", userId)
      .single()

    if (userError || !user) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }

    // Admins have unlimited usage
    if (user.is_admin) {
       return Response.json({
        contactsViewedToday: 0,
        remainingContacts: 999999,
        limit: 999999,
        hasExceeded: false,
      })
    }

    const today = new Date().toISOString().split("T")[0]
    const { data: usage } = await supabase
      .from("daily_usage")
      .select("contacts_viewed")
      .eq("user_id", user.id)
      .eq("date", today)
      .single()

    const contactsViewedToday = usage?.contacts_viewed || 0
    const limit = 50 // Ensure this matches your constant in contacts/route.ts

    return Response.json({
      contactsViewedToday,
      remainingContacts: Math.max(0, limit - contactsViewedToday),
      limit,
      hasExceeded: contactsViewedToday >= limit,
    })

  } catch (error) {
    console.error("Error fetching daily usage:", error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
