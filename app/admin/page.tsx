"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import DashboardNav from "@/components/dashboard-nav"
import { 
  Users, Building2, BarChart3, ShieldAlert, LayoutDashboard, 
  Search, RefreshCw, Loader2, CheckCircle2, XCircle 
} from "lucide-react"

interface SystemStats {
  totalUsers: number
  totalAgencies: number
  totalContacts: number
  averageContactsViewedToday: number
}

interface UserUsage {
  id: string
  email: string
  contactsViewedToday: number
  isAdmin: boolean
  lastActive?: string // Optional: if your API supports it
}

export default function AdminPage() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()
  
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalAgencies: 0,
    totalContacts: 0,
    averageContactsViewedToday: 0,
  })
  const [userUsage, setUserUsage] = useState<UserUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (isLoaded && !userId) router.push("/")
  }, [isLoaded, userId, router])

  const fetchAdminData = async () => {
    try {
      const [statsRes, usageRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/user-usage")
      ])

      if (statsRes.ok) setStats(await statsRes.json())
      if (usageRes.ok) {
        const data = await usageRes.json()
        setUserUsage(data.users)
      }
    } catch (error) {
      console.error("Error fetching admin data:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (userId) fetchAdminData()
  }, [userId])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchAdminData()
  }

  // Filter users based on search
  const filteredUsers = userUsage.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header with Refresh */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <ShieldAlert className="text-primary w-8 h-8" /> 
              Admin Console
            </h1>
            <p className="text-muted-foreground mt-1">System overview and user compliance monitoring.</p>
          </div>
          
          <button 
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Sync Data
          </button>
        </div>

        {/* System Stats Grid - Professional Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* Total Users */}
          <div className="bg-surface border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Users</span>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">{loading ? "-" : stats.totalUsers}</div>
          </div>

          {/* Total Agencies */}
          <div className="bg-surface border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Agencies</span>
              <Building2 className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">{loading ? "-" : stats.totalAgencies.toLocaleString()}</div>
          </div>

          {/* Total Contacts */}
          <div className="bg-surface border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contacts</span>
              <LayoutDashboard className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">{loading ? "-" : (stats.totalContacts / 1000).toFixed(1) + "k"}</div>
          </div>

          {/* Avg Usage */}
          <div className="bg-surface border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg. Usage</span>
              <BarChart3 className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">{loading ? "-" : stats.averageContactsViewedToday.toFixed(1)}</div>
          </div>
        </div>

        {/* Users Table Section */}
        <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
          
          {/* Table Toolbar */}
          <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-foreground">User Directory</h2>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input 
                type="text"
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="bg-gray-50/50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Usage (Today)</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                   // Skeleton Loading Rows
                   [1,2,3,4,5].map(i => (
                     <tr key={i}>
                       <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div></td>
                       <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div></td>
                       <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div></td>
                       <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div></td>
                     </tr>
                   ))
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      No users found matching "{searchTerm}"
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const isOverLimit = !user.isAdmin && user.contactsViewedToday >= 50
                    
                    return (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${user.isAdmin ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'}`}>
                               {user.email[0].toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-foreground">{user.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${user.isAdmin ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                             {user.isAdmin ? "Admin" : "Customer"}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2 text-sm">
                             <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${isOverLimit ? 'bg-red-500' : 'bg-primary'}`} 
                                  style={{ width: `${Math.min((user.contactsViewedToday / 50) * 100, 100)}%` }}
                                />
                             </div>
                             <span className="font-medium text-foreground">{user.contactsViewedToday}</span>
                             <span className="text-muted-foreground">/ {user.isAdmin ? "∞" : "50"}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                          {isOverLimit ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                              <XCircle size={12} /> Limit Hit
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                              <CheckCircle2 size={12} /> Active
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Table Footer */}
          <div className="bg-gray-50/50 px-6 py-3 border-t border-border text-xs text-muted-foreground">
             Showing {filteredUsers.length} users
          </div>
        </div>
      </main>
    </div>
  )
}
