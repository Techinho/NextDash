"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import DashboardNav from "@/components/dashboard-nav"
import UpgradeModal from "@/components/upgrade-modal"
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Clock,
  Eye,
  X,
  RotateCw,
  AlertTriangle,
  History,
} from "lucide-react"

interface Contact {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  title: string
  department: string
  mailing_address: string
  physical_address: string
  city: string
  state: string
  zip: string
  district: string
  source: string
}

interface UsageData {
  contactsViewedToday: number
  hasExceeded: boolean
}

interface ApiResponse {
  contacts: Contact[]
  totalPages: number
  currentPage: number
  usage: UsageData
  error?: string
}

const DAILY_LIMIT = 50

export default function ContactsPage() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()

  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [accountSetupLoading, setAccountSetupLoading] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")

  const [usage, setUsage] = useState<UsageData>({
    contactsViewedToday: 0,
    hasExceeded: false,
  })
  const [isAdmin, setIsAdmin] = useState(false)
  const [jumpPage, setJumpPage] = useState("")

  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [timeUntilReset, setTimeUntilReset] = useState("")
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setUTCHours(24, 0, 0, 0)
      const diff = tomorrow.getTime() - now.getTime()
      if (diff <= 0) {
        setTimeUntilReset("soon")
        return
      }
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor(
        (diff % (1000 * 60 * 60)) / (1000 * 60),
      )
      setTimeUntilReset(`${hours}h ${minutes}m`)
    }
    updateTimer()
    const id = setInterval(updateTimer, 60000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (isLoaded && !userId) router.push("/")
  }, [isLoaded, userId, router])

  // Load admin flag so we can show advanced controls to admins
  useEffect(() => {
    if (!userId) return
    const check = async () => {
      try {
        const res = await fetch("/api/user/is-admin")
        const json = await res.json()
        setIsAdmin(!!json.isAdmin)
      } catch (err) {
        console.error("is-admin check failed:", err)
      }
    }
    check()
  }, [userId])

  const fetchData = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setAccountSetupLoading(false)

    try {
      const qs = new URLSearchParams({
        page: String(currentPage),
        search: searchTerm,
      })
      const res = await fetch(`/api/contacts?${qs.toString()}`)

      if (res.status === 401) {
        setAccountSetupLoading(true)
        setTimeout(() => fetchData(), 3000)
        return
      }

      const data: ApiResponse = await res.json()

      setContacts(data.contacts || [])
      setTotalPages(data.totalPages || 0)
      setUsage(
        data.usage || { contactsViewedToday: 0, hasExceeded: false },
      )
    } catch (err) {
      console.error("contacts fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [userId, currentPage, searchTerm])

  useEffect(() => {
    const id = setTimeout(() => {
      fetchData()
    }, 400)
    return () => clearTimeout(id)
  }, [fetchData])

  // Helper for numbered pagination
  const getPageNumbers = () => {
    const pages: Array<number | string> = []
    const maxVisible = 5
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages)
      }
    }
    return pages
  }

  const handleJumpPage = (e: React.FormEvent) => {
    e.preventDefault()
    const page = Number(jumpPage)
    if (!Number.isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      setJumpPage("")
    }
  }

  if (accountSetupLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-foreground">
          Setting up your account...
        </h2>
      </div>
    )
  }

  const progress = Math.min(
    (usage.contactsViewedToday / DAILY_LIMIT) * 100,
    100,
  )
  const isNearLimit = usage.contactsViewedToday >= DAILY_LIMIT * 0.8

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Contacts Database
              </h1>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                Browse and manage agency contacts.
                {usage.hasExceeded ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-xs font-medium">
                    <History size={10} /> History Mode
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100 text-xs font-medium">
                    <RotateCw size={10} /> Feed Updates Daily
                  </span>
                )}
              </p>
            </div>

            {!isAdmin && (
              <div
                className={`px-4 py-2 rounded-lg border bg-surface shadow-sm flex items-center gap-3 ${
                  isNearLimit
                    ? "border-red-200 bg-red-50/10"
                    : "border-border"
                }`}
              >
                <div className="text-sm font-medium text-foreground">Daily Usage</div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isNearLimit ? "bg-red-500" : "bg-primary"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className={`text-sm font-bold ${isNearLimit ? "text-red-500" : "text-primary"}`}>
                    {usage.contactsViewedToday}/{DAILY_LIMIT}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, title..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-4 pr-4 py-3 border border-border rounded-xl bg-surface text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        {/* Limit banner (hidden for admins) */}
        {!isAdmin && usage.hasExceeded && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-full text-amber-600">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="font-bold text-amber-900">
                  Daily Limit Reached
                </h3>
                <p className="text-sm text-amber-700">
                  Showing contacts viewed today. New contacts unlock in{" "}
                  <span className="font-mono font-bold">
                    {timeUntilReset}
                  </span>
                  .
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="bg-amber-600 text-white hover:bg-amber-700 px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              Upgrade to Unlimited
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden min-h-[400px]">
          {/* Header row */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50/50 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <div className="col-span-3">Name</div>
            <div className="col-span-3">Location</div>
            <div className="col-span-3">Title</div>
            <div className="col-span-2">Contacts</div>
            <div className="col-span-1 text-right">Action</div>
          </div>

          <div className="divide-y divide-border">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                <p className="text-sm text-muted-foreground">
                  Loading contacts...
                </p>
              </div>
            ) : contacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="p-3 bg-gray-50 rounded-full mb-3">
                  <AlertTriangle
                    className="text-gray-400"
                    size={24}
                  />
                </div>
                <p className="text-lg font-medium text-foreground">
                  No contacts found
                </p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or come back after reset.
                </p>
              </div>
            ) : (
              contacts.map((c) => (
                <div
                  key={c.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors items-center"
                >
                  <div className="col-span-3 font-medium text-foreground truncate">
                    {c.first_name} {c.last_name}
                  </div>
                  <div className="col-span-3 text-sm text-muted-foreground truncate">
                    {c.city ? `${c.city}, ${c.state}` : "—"}
                  </div>
                  <div
                    className="col-span-3 text-sm text-foreground truncate"
                    title={c.title}
                  >
                    {c.title || "—"}
                  </div>
                  <div className="col-span-2 flex flex-col gap-0.5 truncate">
                    <a
                      href={`mailto:${c.email}`}
                      className="text-sm text-primary hover:underline truncate"
                    >
                      {c.email}
                    </a>
                    <span className="text-xs text-muted-foreground">
                      {c.phone || "No Phone"}
                    </span>
                  </div>
                  <div className="col-span-1 text-right">
                    <button
                      onClick={() => setSelectedContact(c)}
                      className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-primary transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 border-t border-border pt-4 gap-3">
            <p className="text-sm text-muted-foreground">Page <span className="font-medium text-foreground">{currentPage}</span> of {totalPages}</p>

            {isAdmin ? (
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="w-9 h-9 flex items-center justify-center border border-border rounded-lg bg-surface hover:bg-gray-50 disabled:opacity-50"
                    title="First"
                  >
                    «
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-9 h-9 flex items-center justify-center border border-border rounded-lg bg-surface hover:bg-gray-50 disabled:opacity-50"
                    title="Previous"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div className="hidden sm:flex items-center gap-1">
                    {getPageNumbers().map((page, idx) => (
                      <button
                        key={idx}
                        onClick={() => typeof page === "number" && setCurrentPage(page)}
                        disabled={page === "..."}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${page === currentPage ? "bg-primary text-white shadow-sm" : page === "..." ? "cursor-default text-muted-foreground" : "hover:bg-gray-100 text-foreground"}`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 flex items-center justify-center border border-border rounded-lg bg-surface hover:bg-gray-50 disabled:opacity-50"
                    title="Next"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 flex items-center justify-center border border-border rounded-lg bg-surface hover:bg-gray-50 disabled:opacity-50"
                    title="Last"
                  >
                    »
                  </button>
                </div>

                <form onSubmit={handleJumpPage} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Go to</span>
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={jumpPage}
                    onChange={(e) => setJumpPage(e.target.value)}
                    placeholder="#"
                    className="w-16 py-1 px-2 border border-border rounded-md text-sm text-center focus:ring-2 focus:ring-primary outline-none"
                  />
                </form>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.max(1, p - 1))
                  }
                  disabled={currentPage === 1 || loading}
                  className="px-4 py-2 border border-border rounded-lg flex items-center gap-2 bg-surface disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages || loading}
                  className="px-4 py-2 border border-border rounded-lg flex items-center gap-2 bg-surface disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-end justify-end sm:items-center sm:justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-background rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border bg-gray-50/80">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Contact Details
                </h2>
                <p className="text-xs text-muted-foreground">
                  ID: {selectedContact.id.slice(0, 8)}
                </p>
              </div>
              <button
                onClick={() => setSelectedContact(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-2xl font-bold">
                  {selectedContact.first_name[0]}
                  {selectedContact.last_name[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {selectedContact.first_name}{" "}
                    {selectedContact.last_name}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedContact.title || "No Title Provided"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-muted-foreground uppercase block mb-2">
                  Contact Information
                </label>
                <div className="p-3 border border-border rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    Email
                  </p>
                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {selectedContact.email}
                  </a>
                </div>
                <div className="p-3 border border-border rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    Phone
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {selectedContact.phone || "Not Available"}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Address
                </label>
                <p className="text-sm mt-2 text-foreground leading-relaxed">
                  {selectedContact.mailing_address ||
                    selectedContact.physical_address ||
                    "No address on file"}
                  <br />
                  {selectedContact.city}, {selectedContact.state}{" "}
                  {selectedContact.zip}
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-border bg-gray-50/50 flex justify-end">
              <button
                onClick={() => setSelectedContact(null)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        remaining={0}
      />
    </div>
  )
}
