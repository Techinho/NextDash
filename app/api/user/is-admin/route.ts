import { auth } from "@clerk/nextjs/server"
import { getSupabaseServer } from "@/lib/supabase-server"

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ isAdmin: false })
    }

    const supabase = await getSupabaseServer()

    const { data: user, error } = await supabase.from("users").select("is_admin").eq("clerk_id", userId).single()

    if (error || !user) {
      return Response.json({ isAdmin: false })
    }

    return Response.json({ isAdmin: user.is_admin || false })
  } catch (error) {
    console.error("Error checking admin status:", error)
    return Response.json({ isAdmin: false })
  }
}
