import { getSupabaseServer } from "./supabase-server"

export async function getUserFromDatabase(clerkId: string) {
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase.from("users").select("*").eq("clerk_id", clerkId).single()

  if (error) {
    console.error("Error fetching user:", error)
    return null
  }

  return data
}

export async function createUserInDatabase(clerkId: string, email: string) {
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase
    .from("users")
    .insert([{ clerk_id: clerkId, email }])
    .select()
    .single()

  if (error) {
    console.error("Error creating user:", error)
    return null
  }

  return data
}

export async function isAdminUser(clerkId: string) {
  const user = await getUserFromDatabase(clerkId)
  return user?.is_admin || false
}
