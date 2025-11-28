import { auth } from "@clerk/nextjs/server"
import { getSupabaseServer } from "@/lib/supabase-server"

const ITEMS_PER_PAGE = 10

export async function GET(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await getSupabaseServer()
    const { searchParams } = new URL(request.url)
    
    const page = Number.parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""
    const offset = (page - 1) * ITEMS_PER_PAGE

    // Build Query
    let query = supabase.from("agencies").select("*", { count: "exact" })

    // Search Logic (Name, State, or County)
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,state.ilike.%${search}%,county.ilike.%${search}%`
      )
    }

    // Deterministic Sort
    const { data, count, error } = await query
      .range(offset, offset + ITEMS_PER_PAGE - 1)
      .order("name", { ascending: true })
      .order("id", { ascending: true }) // Tie-breaker

    if (error) throw error

    const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE)

    return Response.json({
      agencies: data || [],
      totalPages,
      currentPage: page,
      totalCount: count
    })

  } catch (error) {
    console.error("Error fetching agencies:", error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
