import { auth } from "@clerk/nextjs/server"
import { getSupabaseServer } from "@/lib/supabase-server"

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""
    const itemsPerPage = 10
    const offset = (page - 1) * itemsPerPage

    const supabase = await getSupabaseServer()

    let query = supabase.from("agencies").select("*", { count: "exact" })

    if (search) {
      query = query.or(`name.ilike.%${search}%,state.ilike.%${search}%,county.ilike.%${search}%`)
    }

    const { data, count, error } = await query.range(offset, offset + itemsPerPage - 1).order("name")

    if (error) throw error

    const totalPages = Math.ceil((count || 0) / itemsPerPage)

    return Response.json({
      agencies: data || [],
      totalPages,
      currentPage: page,
    })
  } catch (error) {
    console.error("Error fetching agencies:", error)
    return Response.json({ error: "Failed to fetch agencies" }, { status: 500 })
  }
}
