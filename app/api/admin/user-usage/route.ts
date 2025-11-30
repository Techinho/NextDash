import { auth } from "@clerk/nextjs/server"
import { getSupabaseServer } from "@/lib/supabase-server"

export async function GET(req: Request) {
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

    // Support pagination and optional search for admin users list
    const searchParams = new URL(req.url).searchParams
    const page = Number(searchParams.get("page") || "1")
    const limit = Number(searchParams.get("limit") || "25")
    const search = (searchParams.get("search") || "").trim()

    const today = new Date().toISOString().split("T")[0]

    // Count total users (for pagination)
    const { count: totalCount } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })

    const offset = (page - 1) * limit

    // Build query for users + today's usage
    let query = supabase
      .from("users")
      .select(
        `id, email, is_admin, daily_usage (contacts_viewed, date)`,
        { count: "exact" },
      )
      .order("email", { ascending: true })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.ilike("email", `%${search}%`)
    }

    const { data: users, error: usersError, count } = await query

    if (usersError) throw usersError

    const formattedUsers = (users || []).map((user: any) => ({
      id: user.id,
      email: user.email,
      isAdmin: user.is_admin,
      contactsViewedToday: user.daily_usage?.[0]?.contacts_viewed || 0,
      lastActive: user.daily_usage?.[0]?.date || undefined,
    }))

    const total = typeof totalCount === "number" ? totalCount : (count || 0)
    const totalPages = Math.max(1, Math.ceil((total || 0) / limit))

    return Response.json({ users: formattedUsers, totalPages, currentPage: page, totalCount: total })
  } catch (error) {
    console.error("Error fetching user usage:", error)
    return Response.json({ error: "Failed to fetch user usage" }, { status: 500 })
  }
}
