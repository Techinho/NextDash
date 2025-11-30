import { auth, currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase-server"

const DAILY_LIMIT = 50
const PAGE_SIZE = 10

type SupabaseClient = Awaited<ReturnType<typeof getSupabaseServer>>

export async function GET(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await getSupabaseServer()

    // 1) Ensure local user
    let { data: user } = await supabase
      .from("users")
      .select("id,is_admin,email")
      .eq("clerk_id", userId)
      .single()

    if (!user) {
      const clerkUser = await currentUser()
      const email =
        clerkUser?.emailAddresses[0]?.emailAddress ||
        `missing-${userId}@example.com`

      const { data: newUser } = await supabase
        .from("users")
        .insert([{ clerk_id: userId, email }])
        .select()
        .single()

      user = newUser as typeof user
    }

    if (!user) {
      return NextResponse.json({ error: "User sync failed" }, { status: 500 })
    }

    const url = new URL(req.url)
    const page = Number(url.searchParams.get("page") || "1")
    const search = (url.searchParams.get("search") || "").trim()

    // Admin: no limits, no rotation
    if (user.is_admin) {
      return handleAdmin(supabase, page, search)
    }

    const today = new Date().toISOString().slice(0, 10)

    // 2) Load today’s usage
    const { data: usageRow, error: usageError } = await supabase
      .from("daily_usage")
      .select("contacts_viewed, viewed_contact_ids")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle()

    if (usageError && usageError.code !== "PGRST116") {
      // PGRST116 = no rows, safe to ignore
      throw usageError
    }

    const viewedIdsToday: string[] = usageRow?.viewed_contact_ids || []
    const viewedCountToday = viewedIdsToday.length
    const hasExceeded = viewedCountToday >= DAILY_LIMIT

    // 3) Behaviour branches
    if (search) {
      return handleSearch(
        supabase,
        page,
        search,
        hasExceeded,
        viewedIdsToday,
        viewedCountToday,
      )
    }

    if (hasExceeded) {
      return handleHistoryMode(
        supabase,
        page,
        viewedIdsToday,
        viewedCountToday,
      )
    }

    return handleRotatedFeed(
      supabase,
      page,
      user.id,
      today,
      viewedIdsToday,
      viewedCountToday,
    )
  } catch (err: any) {
    console.error("contacts GET error:", err)
    return NextResponse.json(
      { error: err?.message || "Internal error" },
      { status: 500 },
    )
  }
}

/* ---------- Helpers ---------- */

async function handleAdmin(
  supabase: SupabaseClient,
  page: number,
  search: string,
) {
  let query = supabase.from("contacts").select("*", { count: "exact" })
  const offset = (page - 1) * PAGE_SIZE

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,title.ilike.%${search}%`,
    )
  }

  const { data, count, error } = await query
    .order("id", { ascending: true })
    .range(offset, offset + PAGE_SIZE - 1)

  if (error) throw error

  return NextResponse.json({
    contacts: data || [],
    totalPages: Math.ceil((count || 0) / PAGE_SIZE),
    currentPage: page,
    usage: {
      contactsViewedToday: 0,
      hasExceeded: false,
    },
  })
}

async function handleSearch(
  supabase: SupabaseClient,
  page: number,
  search: string,
  hasExceeded: boolean,
  viewedIdsToday: string[],
  viewedCountToday: number,
) {
  let query = supabase.from("contacts").select("*", { count: "exact" })

  if (hasExceeded) {
    if (viewedIdsToday.length === 0) {
      return NextResponse.json(
        {
          contacts: [],
          totalPages: 0,
          currentPage: page,
          usage: {
            contactsViewedToday: viewedCountToday,
            hasExceeded: true,
          },
        },
        { status: 429 },
      )
    }
    query = query.in("id", viewedIdsToday)
  }

  query = query.or(
    `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,title.ilike.%${search}%`,
  )

  const offset = (page - 1) * PAGE_SIZE
  const { data, count, error } = await query
    .order("id", { ascending: true })
    .range(offset, offset + PAGE_SIZE - 1)

  if (error) throw error

  return NextResponse.json({
    contacts: data || [],
    totalPages: Math.ceil((count || 0) / PAGE_SIZE),
    currentPage: page,
    usage: {
      contactsViewedToday: viewedCountToday,
      hasExceeded,
    },
  })
}

async function handleHistoryMode(
  supabase: SupabaseClient,
  page: number,
  viewedIdsToday: string[],
  viewedCountToday: number,
) {
  if (viewedIdsToday.length === 0) {
    return NextResponse.json(
      {
        contacts: [],
        totalPages: 0,
        currentPage: page,
        usage: {
          contactsViewedToday: viewedCountToday,
          hasExceeded: true,
        },
      },
      { status: 429 },
    )
  }

  const offset = (page - 1) * PAGE_SIZE
  const { data, count, error } = await supabase
    .from("contacts")
    .select("*", { count: "exact" })
    .in("id", viewedIdsToday)
    .order("id", { ascending: true })
    .range(offset, offset + PAGE_SIZE - 1)

  if (error) throw error

  return NextResponse.json({
    contacts: data || [],
    totalPages: Math.ceil((count || 0) / PAGE_SIZE),
    currentPage: page,
    usage: {
      contactsViewedToday: viewedCountToday,
      hasExceeded: true,
    },
  })
}

async function handleRotatedFeed(
  supabase: SupabaseClient,
  page: number,
  userId: string,
  today: string,
  viewedIdsToday: string[],
  viewedCountToday: number,
) {
  const { count: totalCount, error: countError } = await supabase
    .from("contacts")
    .select("*", { count: "exact", head: true })

  if (countError) throw countError

  const total = totalCount || 0
  if (total === 0) {
    return NextResponse.json({
      contacts: [],
      totalPages: 0,
      currentPage: page,
      usage: {
        contactsViewedToday: viewedCountToday,
        hasExceeded: false,
      },
    })
  }

  const dayOfYear = getDayOfYear()
  const rotationStart = (dayOfYear * PAGE_SIZE) % total

  let offset = rotationStart + (page - 1) * PAGE_SIZE
  if (offset >= total) offset = offset % total

  const windowSize = PAGE_SIZE * 3
  let end = offset + windowSize - 1
  if (end >= total) end = total - 1

  const { data: windowContacts, error } = await supabase
    .from("contacts")
    .select("*")
    .order("id", { ascending: true })
    .range(offset, end)

  if (error) throw error

  const pool = windowContacts || []
  const fresh = pool.filter(
    (c: any) => !viewedIdsToday.includes(c.id as string),
  )
  const pageContacts = fresh.slice(0, PAGE_SIZE)

  const newIds = pageContacts.map((c: any) => c.id as string)
  const updatedViewedIds = [...viewedIdsToday, ...newIds]
  const newCount = updatedViewedIds.length

  if (newIds.length > 0) {
    const { error: upsertErr } = await supabase.from("daily_usage").upsert(
      [
        {
          user_id: userId,
          date: today,
          contacts_viewed: newCount,
          viewed_contact_ids: updatedViewedIds,
        },
      ],
      { onConflict: "user_id,date" },
    )
    if (upsertErr) throw upsertErr
  }

  return NextResponse.json({
    contacts: pageContacts,
    totalPages: Math.ceil(total / PAGE_SIZE),
    currentPage: page,
    usage: {
      contactsViewedToday: newCount,
      hasExceeded: newCount >= DAILY_LIMIT,
    },
  })
}

function getDayOfYear(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}
