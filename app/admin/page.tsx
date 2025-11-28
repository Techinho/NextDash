"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import DashboardNav from "@/components/dashboard-nav"

interface SystemStats {
  totalUsers: number
  totalAgencies: number
  totalContacts: number
  averageContactsViewedToday: number
  usersWithLimitExceeded: number
}

interface UserUsage {
  id: string
  email: string
  contactsViewedToday: number
  isAdmin: boolean
}

export default function AdminPage() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalAgencies: 0,
    totalContacts: 0,
    averageContactsViewedToday: 0,
    usersWithLimitExceeded: 0,
  })
  const [userUsage, setUserUsage] = useState<UserUsage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/")
    }
  }, [isLoaded, userId, router])

  useEffect(() => {
    if (!userId) return

    const fetchAdminData = async () => {
      setLoading(true)
      try {
        const [statsRes, usageRes] = await Promise.all([fetch("/api/admin/stats"), fetch("/api/admin/user-usage")])

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }

        if (usageRes.ok) {
          const usageData = await usageRes.json()
          setUserUsage(usageData.users)
        }
      } catch (error) {
        console.error("Error fetching admin data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [userId])

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted">System statistics and user management</p>
        </div>

        {/* System Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="card">
            <h3 className="text-sm font-medium text-muted mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-primary">{stats.totalUsers}</p>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-muted mb-2">Total Agencies</h3>
            <p className="text-3xl font-bold text-primary">{stats.totalAgencies}</p>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-muted mb-2">Total Contacts</h3>
            <p className="text-3xl font-bold text-primary">{stats.totalContacts}</p>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-muted mb-2">Avg. Contacts/User</h3>
            <p className="text-3xl font-bold text-primary">{stats.averageContactsViewedToday.toFixed(1)}</p>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-muted mb-2">Limit Exceeded</h3>
            <p className="text-3xl font-bold text-red-500">{stats.usersWithLimitExceeded}</p>
          </div>
        </div>

        {/* User Usage Table */}
        <div className="card">
          <h2 className="text-xl font-bold text-foreground mb-6">User Activity</h2>

          <div className="table-container">
            <table className="w-full">
              <thead className="bg-background border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Contacts Viewed Today</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted">
                      Loading...
                    </td>
                  </tr>
                ) : userUsage.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted">
                      No users found
                    </td>
                  </tr>
                ) : (
                  userUsage.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-background transition-colors">
                      <td className="px-6 py-4 text-sm text-foreground font-medium">{user.email}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            user.isAdmin ? "bg-primary text-white" : "bg-secondary text-foreground border border-border"
                          }`}
                        >
                          {user.isAdmin ? "Admin" : "User"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {user.contactsViewedToday} / {user.isAdmin ? "∞" : "50"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {!user.isAdmin && user.contactsViewedToday >= 50 ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 border border-red-300">
                            Limit Exceeded
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 border border-green-300">
                            Active
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
