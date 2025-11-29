"use client"

import { useEffect, useState } from "react"
import { useAuth, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import DashboardNav from "@/components/dashboard-nav"
import { Users, Building2, BarChart3, ArrowRight, Loader2, Lock, ShieldCheck } from "lucide-react"

interface DashboardData {
  agencies: number
  contacts: number
  contactsViewedToday: number
  recentAgencies: Array<{ id: string, name: string, state: string, type: string }>
  recentContacts: Array<{ id: string, first_name: string, last_name: string, title: string, department: string }>
}

// Helper to make numbers look professional (e.g. 1,200 -> 1.2k+)
const formatMetric = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M+'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k+'
  return num.toLocaleString()
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Overview of your database access.</p>
          </div>
          
          {/* Daily Limit Badge */}
          <div className={`w-fit flex items-center gap-3 px-4 py-2 rounded-full border ${isNearLimit ? 'bg-red-50 border-red-200 text-red-700' : 'bg-surface border-border text-foreground'} shadow-sm`}>
             <span className="text-xs font-semibold uppercase tracking-wider">Daily Credits</span>
             <span className="text-sm font-bold">{data.contactsViewedToday} / {dailyLimit}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-3 mb-8">
          
          {/* Card 1: Total Contacts (Rounded) */}
          <div className="bg-surface border border-border rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
               <div>
                  <p className="text-sm font-medium text-muted-foreground">Available Contacts</p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground mt-2">{formatMetric(data.contacts)}</h3>
               </div>
               <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  <Users size={24} />
               </div>
            </div>
          </div>

          {/* Card 2: Agencies (Rounded) */}
          <div className="bg-surface border border-border rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
               <div>
                  <p className="text-sm font-medium text-muted-foreground">Tracked Agencies</p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground mt-2">{formatMetric(data.agencies)}</h3>
               </div>
               <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                  <Building2 size={24} />
               </div>
            </div>
          </div>

          {/* Card 3: Usage */}
          <div className="bg-surface border border-border rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
               <p className="text-sm font-medium text-muted-foreground">Usage Today</p>
               <BarChart3 size={20} className="text-muted-foreground" />
            </div>
            <div className="flex items-end gap-2 mb-2">
               <h3 className="text-2xl sm:text-3xl font-bold text-foreground">{data.contactsViewedToday}</h3>
               <span className="text-sm text-muted-foreground mb-1">viewed</span>
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
           
           {/* Recent Contacts (MASKED for Professionalism) */}
           <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="px-4 sm:px-6 py-4 border-b border-border bg-gray-50/30 flex justify-between items-center">
                 <h3 className="font-semibold text-foreground">Newest Opportunities</h3>
                 <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Live Feed</span>
              </div>
              <div className="flex-1">
                 <ul className="divide-y divide-border">
                    {data.recentContacts.length === 0 ? (
                       <li className="px-6 py-8 text-sm text-muted-foreground text-center">No recent contacts.</li>
                    ) : (
                       data.recentContacts.map((contact) => (
                          <li key={contact.id} className="px-4 sm:px-6 py-4 hover:bg-gray-50/50 transition-colors flex items-center justify-between group">
                             <div className="min-w-0 flex-1 mr-3">
                                <div className="flex items-center gap-2 mb-1">
                                   {/* Avatar Initials */}
                                   <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                                      {contact.first_name?.[0]}{contact.last_name?.[0]}
                                   </div>
                                   {/* BLURRED Name - Protects Data */}
                                   <p className="text-sm font-medium text-foreground blur-[4px] select-none opacity-60">
                                      {contact.first_name} {contact.last_name}
                                   </p>
                                   <ShieldCheck size={12} className="text-green-500 ml-1" />
                                </div>
                                <p className="text-xs font-medium text-muted-foreground truncate pl-8">
                                   {contact.title || "Government Official"}
                                </p>
                             </div>
                             <button 
                                onClick={() => router.push(`/dashboard/contacts?search=${encodeURIComponent(contact.last_name)}`)}
                                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/5 border border-primary/10 text-xs font-medium text-primary hover:bg-primary hover:text-white transition-all"
                             >
                                <Lock size={12} /> <span className="hidden sm:inline">Unlock Details</span>
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
                    Search Full Database <ArrowRight size={16} />
                 </button>
              </div>
           </div>

           {/* Recent Agencies (Public Info - No Masking Needed) */}
           <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="px-4 sm:px-6 py-4 border-b border-border bg-gray-50/30">
                 <h3 className="font-semibold text-foreground">Recently Added Agencies</h3>
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
