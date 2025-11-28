"use client"

import { useEffect, useState } from "react"
import { useAuth, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import DashboardNav from "@/components/dashboard-nav"
import { Users, Building2, BarChart3, ArrowRight, Loader2, Lock } from "lucide-react"

interface DashboardData {
  agencies: number
  contacts: number
  contactsViewedToday: number
  recentAgencies: Array<{ id: string, name: string, state: string, type: string }>
  recentContacts: Array<{ id: string, first_name: string, last_name: string, title: string, department: string }>
}

export default function DashboardPage() {
  const { userId, isLoaded } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && !userId) router.push("/")
  }, [isLoaded, userId, router])

  useEffect(() => {
    if (!userId) return
    const fetchData = async () => {
      try {
        const res = await fetch("/api/dashboard/stats")
        const json = await res.json()
        setData(json)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [userId])

  if (loading || !data) {
     return (
        <div className="min-h-screen bg-background flex items-center justify-center">
           <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
     )
  }

  const dailyLimit = 50
  const usagePercentage = Math.min((data.contactsViewedToday / dailyLimit) * 100, 100)
  const isNearLimit = data.contactsViewedToday >= (dailyLimit * 0.8)

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      {/* UPDATED: Responsive Padding (px-4 for mobile, px-8 for desktop) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header: Stacks on mobile */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Welcome back, {user?.firstName}.</p>
          </div>
          
          {/* Daily Limit Badge: Auto width on mobile to avoid stretching */}
          <div className={`w-fit flex items-center gap-3 px-4 py-2 rounded-full border ${isNearLimit ? 'bg-red-50 border-red-200 text-red-700' : 'bg-surface border-border text-foreground'} shadow-sm`}>
             <span className="text-xs font-semibold uppercase tracking-wider">Daily Limit</span>
             <span className="text-sm font-bold">{data.contactsViewedToday} / {dailyLimit}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-3 mb-8">
          
          {/* Card 1 */}
          <div className="bg-surface border border-border rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
               <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Contacts</p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground mt-2">{data.contacts.toLocaleString()}</h3>
               </div>
               <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  <Users size={24} />
               </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-surface border border-border rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
               <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Agencies</p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground mt-2">{data.agencies.toLocaleString()}</h3>
               </div>
               <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                  <Building2 size={24} />
               </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-surface border border-border rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
               <p className="text-sm font-medium text-muted-foreground">Daily Usage</p>
               <BarChart3 size={20} className="text-muted-foreground" />
            </div>
            <div className="flex items-end gap-2 mb-2">
               <h3 className="text-2xl sm:text-3xl font-bold text-foreground">{data.contactsViewedToday}</h3>
               <span className="text-sm text-muted-foreground mb-1">used</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
               <div 
                  className={`h-full rounded-full transition-all duration-1000 ${isNearLimit ? 'bg-red-500' : 'bg-primary'}`} 
                  style={{ width: `${usagePercentage}%` }}
               />
            </div>
          </div>
        </div>

        {/* Data Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
           
           {/* Recent Contacts */}
           <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="px-4 sm:px-6 py-4 border-b border-border bg-gray-50/30">
                 <h3 className="font-semibold text-foreground">Newest Contacts</h3>
              </div>
              <div className="flex-1">
                 <ul className="divide-y divide-border">
                    {data.recentContacts.length === 0 ? (
                       <li className="px-6 py-8 text-sm text-muted-foreground text-center">No contacts found.</li>
                    ) : (
                       data.recentContacts.map((contact) => (
                          <li key={contact.id} className="px-4 sm:px-6 py-4 hover:bg-gray-50/50 transition-colors flex items-center justify-between group">
                             <div className="min-w-0 flex-1 mr-3">
                                <p className="text-sm font-medium text-foreground truncate">
                                   {contact.first_name} {contact.last_name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                   {contact.title || "No Title"}
                                </p>
                             </div>
                             <button 
                                onClick={() => router.push(`/dashboard/contacts?search=${encodeURIComponent(contact.last_name)}`)}
                                className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-gray-100 text-xs font-medium text-muted-foreground hover:bg-primary hover:text-white transition-colors"
                             >
                                <Lock size={12} /> <span className="hidden sm:inline">Unlock</span>
                             </button>
                          </li>
                       ))
                    )}
                 </ul>
              </div>
              <div className="p-3 sm:p-4 border-t border-border bg-gray-50/30">
                 <button 
                    onClick={() => router.push("/dashboard/contacts")}
                    className="w-full flex items-center justify-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                 >
                    View All <ArrowRight size={16} />
                 </button>
              </div>
           </div>

           {/* Recent Agencies */}
           <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="px-4 sm:px-6 py-4 border-b border-border bg-gray-50/30">
                 <h3 className="font-semibold text-foreground">Newest Agencies</h3>
              </div>
              <div className="flex-1">
                 <ul className="divide-y divide-border">
                    {data.recentAgencies.length === 0 ? (
                       <li className="px-6 py-8 text-sm text-muted-foreground text-center">No agencies found.</li>
                    ) : (
                       data.recentAgencies.map((agency) => (
                          <li key={agency.id} className="px-4 sm:px-6 py-4 hover:bg-gray-50/50 transition-colors flex items-center justify-between">
                             <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{agency.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                   <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium border ${agency.type === 'County' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                      {agency.type}
                                   </span>
                                   <span className="text-xs text-muted-foreground">{agency.state}</span>
                                </div>
                             </div>
                          </li>
                       ))
                    )}
                 </ul>
              </div>
              <div className="p-3 sm:p-4 border-t border-border bg-gray-50/30">
                 <button 
                    onClick={() => router.push("/dashboard/agencies")}
                    className="w-full flex items-center justify-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                 >
                    Browse Directory <ArrowRight size={16} />
                 </button>
              </div>
           </div>

        </div>
      </main>
    </div>
  )
}
