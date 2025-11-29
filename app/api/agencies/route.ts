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
    
    // FIX: Read 'limit' from URL, default to 10 if missing, max cap at 100
    const limitParam = Number.parseInt(searchParams.get("limit") || "10")
    const itemsPerPage = Math.min(Math.max(limitParam, 1), 100) // Ensure between 1 and 100

    const search = searchParams.get("search") || ""
    const offset = (page - 1) * itemsPerPage

    const supabase = await getSupabaseServer()

    let query = supabase.from("agencies").select("*", { count: "exact" })

    if (search) {
      query = query.or(`name.ilike.%${search}%,state.ilike.%${search}%,county.ilike.%${search}%`)
    }

    // Use the dynamic itemsPerPage
    const { data, count, error } = await query.range(offset, offset + itemsPerPage - 1).order("name")

    if (error) throw error

    const totalPages = Math.ceil((count || 0) / itemsPerPage)

    return Response.json({
      agencies: data || [],
      totalPages,
      currentPage: page,
      totalCount: count || 0 // Useful for frontend to show "Total X agencies"
    })

  } catch (error) {
    console.error("Error fetching agencies:", error)
    return Response.json({ error: "Failed to fetch agencies" }, { status: 500 })
  }
}
