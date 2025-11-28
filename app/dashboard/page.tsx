"use client"

import { useAuth } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import DashboardNav from "@/components/dashboard-nav"

export default function DashboardPage() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    agencies: 0,
    contacts: 0,
    contactsViewedToday: 0,
  })

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/")
    }
  }, [isLoaded, userId, router])

  useEffect(() => {
    if (!userId) return

    const fetchStats = async () => {
      try {
        const res = await fetch("/api/dashboard/stats")
        const data = await res.json()
        setStats(data)
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }

    fetchStats()
  }, [userId])

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted">Welcome back! Here's an overview of your data.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <h3 className="text-sm font-medium text-muted mb-2">Total Agencies</h3>
            <p className="text-3xl font-bold text-primary">{stats.agencies}</p>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-muted mb-2">Total Contacts</h3>
            <p className="text-3xl font-bold text-primary">{stats.contacts}</p>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-muted mb-2">Contacts Viewed Today</h3>
            <p className="text-3xl font-bold text-primary">{stats.contactsViewedToday}</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/dashboard/agencies" className="card hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">View Agencies</h2>
                <p className="text-muted text-sm">Browse all registered agencies</p>
              </div>
              <span className="text-2xl">→</span>
            </div>
          </Link>

          <Link href="/dashboard/contacts" className="card hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">View Contacts</h2>
                <p className="text-muted text-sm">Search and filter contacts</p>
              </div>
              <span className="text-2xl">→</span>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}
