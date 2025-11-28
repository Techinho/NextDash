"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import DashboardNav from "@/components/dashboard-nav"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Agency {
  id: string
  name: string
  state: string
  state_code: string
  type: string
  population: number
  website: string
  county: string
}

export default function AgenciesPage() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const itemsPerPage = 10

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/")
    }
  }, [isLoaded, userId, router])

  useEffect(() => {
    if (!userId) return

    const fetchAgencies = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/agencies?page=${currentPage}&search=${encodeURIComponent(searchTerm)}`)
        const data = await res.json()
        setAgencies(data.agencies)
        setTotalPages(data.totalPages)
      } catch (error) {
        console.error("Error fetching agencies:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAgencies()
  }, [userId, currentPage, searchTerm])

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Agencies</h1>

          <div className="flex gap-4 mb-6">
            <input
              type="text"
              placeholder="Search agencies by name, state, or county..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="flex-1 px-4 py-2 border border-border rounded-lg bg-surface text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="w-full">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">State</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">County</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Population</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Website</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted">
                    Loading...
                  </td>
                </tr>
              ) : agencies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted">
                    No agencies found
                  </td>
                </tr>
              ) : (
                agencies.map((agency) => (
                  <tr key={agency.id} className="border-b border-border hover:bg-background transition-colors">
                    <td className="px-6 py-4 text-sm text-foreground font-medium">{agency.name}</td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary text-foreground border border-border">
                        {agency.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{agency.state_code}</td>
                    <td className="px-6 py-4 text-sm text-muted">{agency.county}</td>
                    <td className="px-6 py-4 text-sm text-muted">{agency.population?.toLocaleString() || "N/A"}</td>
                    <td className="px-6 py-4 text-sm">
                      {agency.website ? (
                        <a
                          href={agency.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary"
                          style={{ "--hover-color": "#229799" } as React.CSSProperties}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#229799")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#48cfcb")}
                        >
                          Visit
                        </a>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
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
      </main>
    </div>
  )
}
