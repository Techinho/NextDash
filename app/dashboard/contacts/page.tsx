"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import DashboardNav from "@/components/dashboard-nav"
import UpgradeModal from "@/components/upgrade-modal"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Contact {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  title: string
  department: string
}

interface UsageData {
  remainingContacts: number
  contactsViewedToday: number
  hasExceeded: boolean
}

export default function ContactsPage() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [usage, setUsage] = useState<UsageData>({
    remainingContacts: 50,
    contactsViewedToday: 0,
    hasExceeded: false,
  })
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const itemsPerPage = 10

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/")
    }
  }, [isLoaded, userId, router])

  useEffect(() => {
    if (!userId) return

    const fetchUsage = async () => {
      try {
        const res = await fetch("/api/usage/daily")
        const data = await res.json()
        setUsage(data)

        if (data.hasExceeded) {
          setShowUpgradeModal(true)
        }
      } catch (error) {
        console.error("Error fetching usage:", error)
      }
    }

    fetchUsage()
  }, [userId])

  useEffect(() => {
    if (!userId || usage.hasExceeded) return

    const fetchContacts = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/contacts?page=${currentPage}&search=${encodeURIComponent(searchTerm)}`)

        if (!res.ok) {
          if (res.status === 429) {
            setShowUpgradeModal(true)
            const data = await res.json()
            setUsage(data)
          }
          return
        }

        const data = await res.json()
        setContacts(data.contacts)
        setTotalPages(data.totalPages)
        setUsage(data.usage)
      } catch (error) {
        console.error("Error fetching contacts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
  }, [userId, currentPage, searchTerm, usage.hasExceeded])

  const progressPercentage = (usage.contactsViewedToday / 50) * 100
  const isNearLimit = usage.contactsViewedToday > 40

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Contacts</h1>

          {/* Daily Limit Tracker */}
          <div className={`card mb-6 border-2 ${isNearLimit ? "border-red-500" : "border-primary"}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">Daily Contacts Viewed</span>
              <span className={`text-sm font-semibold ${isNearLimit ? "text-red-500" : "text-primary"}`}>
                {usage.contactsViewedToday} / 50
              </span>
            </div>
            <div className="w-full bg-background rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${isNearLimit ? "bg-red-500" : "bg-primary"}`}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
            {isNearLimit && <p className="text-xs text-red-500 mt-2">You're approaching your daily limit!</p>}
          </div>

          <div className="flex gap-4 mb-6">
            <input
              type="text"
              placeholder="Search contacts by name, email, or title..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="flex-1 px-4 py-2 border border-border rounded-lg bg-surface text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={usage.hasExceeded}
            />
          </div>
        </div>

        {usage.hasExceeded ? (
          <div className="card text-center py-12">
            <p className="text-lg text-foreground mb-4">You've reached your daily contact limit.</p>
            <button onClick={() => setShowUpgradeModal(true)} className="btn-primary">
              View Upgrade Options
            </button>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="table-container">
              <table className="w-full">
                <thead className="bg-background border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Phone</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Title</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Department</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted">
                        Loading...
                      </td>
                    </tr>
                  ) : contacts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted">
                        No contacts found
                      </td>
                    </tr>
                  ) : (
                    contacts.map((contact) => (
                      <tr key={contact.id} className="border-b border-border hover:bg-background transition-colors">
                        <td className="px-6 py-4 text-sm text-foreground font-medium">
                          {contact.first_name} {contact.last_name}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-primary"
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#229799")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#48cfcb")}
                          >
                            {contact.email}
                          </a>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted">{contact.phone || "—"}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{contact.title}</td>
                        <td className="px-6 py-4 text-sm text-muted">{contact.department}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted">
                  Page {currentPage} of {totalPages}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <ChevronLeft size={18} />
                    Previous
                  </button>

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Next
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        remaining={usage.remainingContacts}
      />
    </div>
  )
}
