import { auth, currentUser } from "@clerk/nextjs/server"
import { getSupabaseServer } from "@/lib/supabase-server"

const DAILY_LIMIT = 50
const ITEMS_PER_PAGE = 10

export async function GET(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await getSupabaseServer()

    // 1. Try to find the user in Supabase
    let { data: user, error: userError } = await supabase
      .from("users")
      .select("id, is_admin")
      .eq("clerk_id", userId)
      .single()

    // 2. SELF-HEALING: If user missing, fetch details from Clerk and create them
    if (!user) {
      console.log("User missing in DB, fetching real details from Clerk...")

      // Fetch full user profile to get the REAL email
      const clerkUser = await currentUser()
      
      // robust email fallback using userId to prevent unique constraint violations
      const email = clerkUser?.emailAddresses[0]?.emailAddress || `missing-${userId}@example.com`

      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert([
          { 
            clerk_id: userId, 
            email: email,
            is_admin: false 
          }
        ])
        .select("id, is_admin")
        .single()

      if (createError) {
        console.error("Failed to lazy-create user:", createError)
        
        // Handle race condition: if user was created by webhook or another request in the meantime
        if (createError.code === '23505') { 
           const { data: existing } = await supabase
             .from("users")
             .select("id, is_admin")
             .eq("clerk_id", userId)
             .single()
           user = existing
        } else {
           return Response.json({ error: "User sync failed" }, { status: 500 })
        }
      } else {
        user = newUser
      }
    }

    // 3. Check if admin - admins have no limit
    if (user.is_admin) {
      return handleContactsQuery(request, supabase)
    }

    // 4. Check daily usage for non-admin users
    const today = new Date().toISOString().split("T")[0]
    const { data: usage } = await supabase
      .from("daily_usage")
      .select("contacts_viewed")
      .eq("user_id", user.id)
      .eq("date", today)
      .single()

    const contactsViewedToday = usage?.contacts_viewed || 0
    const remainingContacts = Math.max(0, DAILY_LIMIT - contactsViewedToday)
    const hasExceeded = contactsViewedToday >= DAILY_LIMIT

    if (hasExceeded) {
      return Response.json(
        {
          error: "Daily limit exceeded",
          usage: {
            contactsViewedToday,
            remainingContacts: 0,
            hasExceeded: true,
          },
        },
        { status: 429 }
      )
    }

    // 5. Proceed to fetch contacts
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""
    const offset = (page - 1) * ITEMS_PER_PAGE

    let query = supabase.from("contacts").select("*", { count: "exact" })

    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,title.ilike.%${search}%`
      )
    }

    const {
      data: contacts,
      count,
      error: contactsError,
    } = await query.range(offset, offset + ITEMS_PER_PAGE - 1).order("first_name")

    if (contactsError) throw contactsError

    // 6. Increment contacts viewed
    const newTotal = contactsViewedToday + (contacts?.length || 0)

    if (contacts?.length > 0) {
      await supabase.from("daily_usage").upsert([
        {
          user_id: user.id,
          date: today,
          contacts_viewed: newTotal,
        },
      ])
    }

    const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE)

    return Response.json({
      contacts: contacts || [],
      totalPages,
      currentPage: page,
      usage: {
        contactsViewedToday: newTotal,
        remainingContacts: Math.max(0, DAILY_LIMIT - newTotal),
        hasExceeded: false,
      },
    })

  } catch (error) {
    console.error("Error fetching contacts:", error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Helper function defined OUTSIDE the main GET function
async function handleContactsQuery(request: Request, supabase: any) {
  const { searchParams } = new URL(request.url)
  const page = Number.parseInt(searchParams.get("page") || "1")
  const search = searchParams.get("search") || ""
  const itemsPerPage = 10
  const offset = (page - 1) * itemsPerPage

  let query = supabase.from("contacts").select("*", { count: "exact" })

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,title.ilike.%${search}%`
    )
  }

  const { data, count, error } = await query.range(offset, offset + itemsPerPage - 1).order("first_name")

  if (error) throw error

  const totalPages = Math.ceil((count || 0) / itemsPerPage)

  return Response.json({
    contacts: data || [],
    totalPages,
    currentPage: page,
    usage: {
      contactsViewedToday: 0,
      remainingContacts: Number.POSITIVE_INFINITY,
      hasExceeded: false,
    },
  })
}
