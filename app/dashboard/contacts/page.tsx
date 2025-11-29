"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@clerk/nextjs" 
import { useRouter } from "next/navigation"
import DashboardNav from "@/components/dashboard-nav"
import UpgradeModal from "@/components/upgrade-modal"
import { ChevronLeft, ChevronRight, Loader2, Lock, Clock, Eye, X, RotateCw } from "lucide-react"

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
  // agencies?: { name: string } // Disabled for stability
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
  const [accountSetupLoading, setAccountSetupLoading] = useState(false)
  
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  
  const [usage, setUsage] = useState<UsageData>({
    remainingContacts: 50,
    contactsViewedToday: 0,
    hasExceeded: false,
  })
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [timeUntilReset, setTimeUntilReset] = useState("")
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setUTCHours(24, 0, 0, 0) 
      const diff = tomorrow.getTime() - now.getTime()
      if (diff <= 0) { setTimeUntilReset("soon"); return }
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      setTimeUntilReset(`${hours}h ${minutes}m`)
    }
    updateTimer()
    const interval = setInterval(updateTimer, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isLoaded && !userId) router.push("/")
  }, [isLoaded, userId, router])

  const fetchData = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setAccountSetupLoading(false)

    try {
      const endpoint = `/api/contacts?page=${currentPage}&search=${encodeURIComponent(searchTerm)}`
      const res = await fetch(endpoint)

      if (res.status === 401) {
        setAccountSetupLoading(true)
        setTimeout(() => fetchData(), 3000)
        return
      }

      if (res.status === 429) {
        const data = await res.json()
        setUsage(data.usage)
        setContacts([])
        setLoading(false)
        return
      }

      if (!res.ok) throw new Error("Failed to fetch data")
      const data = await res.json()
      setContacts(data.contacts)
      setTotalPages(data.totalPages)
      setUsage(data.usage)

    } catch (error) {
      console.error("Error loading contacts:", error)
    } finally {
      setLoading(false)
    }
  }, [userId, currentPage, searchTerm])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const dailyLimit = 50
  const progressPercentage = Math.min((usage.contactsViewedToday / dailyLimit) * 100, 100)
  const isNearLimit = usage.contactsViewedToday >= (dailyLimit * 0.8)

  if (accountSetupLoading) {
     return (
       <div className="min-h-screen bg-background flex flex-col items-center justify-center">
         <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
         <h2 className="text-xl font-semibold text-foreground">Setting up your account...</h2>
       </div>
     )
  }

  // Logic: Only lock if exceeded AND NOT searching (allows user to clear bad search)
  const isLocked = usage.hasExceeded && contacts.length === 0 && searchTerm === ""

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
               <h1 className="text-3xl font-bold text-foreground">Contacts Database</h1>
               <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  Browse and manage agency contacts.
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100 text-xs font-medium">
                     <RotateCw size={10} /> Feed Updates Daily
                  </span>
               </p>
            </div>
             <div className={`px-4 py-2 rounded-lg border bg-surface shadow-sm flex items-center gap-3 ${isNearLimit ? "border-red-200 bg-red-50/10" : "border-border"}`}>
                <div className="text-sm font-medium text-foreground">Daily Usage</div>
                <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                           className={`h-full rounded-full transition-all duration-500 ${isNearLimit ? "bg-red-500" : "bg-primary"}`}
                           style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                    <span className={`text-sm font-bold ${isNearLimit ? "text-red-500" : "text-primary"}`}>
                       {usage.contactsViewedToday}/{dailyLimit}
                    </span>
                </div>
             </div>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder={isLocked ? "Search is locked until reset..." : "Search by name, email, title..."}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              disabled={isLocked}
              className={`w-full pl-4 pr-4 py-3 border border-border rounded-xl bg-surface text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all 
                ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''}`}
            />
            {isLocked && (
               <div className="absolute right-4 top-3 flex items-center gap-1 text-red-500 text-sm font-medium">
                  <Lock size={14} /> Search Locked
               </div>
            )}
          </div>
        </div>

        {usage.hasExceeded && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-red-100 rounded-full text-red-600"><Clock size={20} /></div>
               <div>
                 <h3 className="font-bold text-red-900">Daily Limit Reached</h3>
                 <p className="text-sm text-red-700">Limit resets in <span className="font-mono font-bold">{timeUntilReset}</span>.</p>
               </div>
            </div>
            <button onClick={() => setShowUpgradeModal(true)} className="btn-primary px-6 py-2 text-sm whitespace-nowrap shadow-none">Upgrade Plan</button>
          </div>
        )}

        {/* Content Locked State (Only if truly locked out, not just empty search) */}
        {usage.hasExceeded && contacts.length === 0 && searchTerm === "" ? (
          <div className="flex flex-col items-center justify-center py-20 bg-surface border border-border rounded-xl shadow-sm text-center">
            <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4"><Lock size={32} /></div>
            <h2 className="text-xl font-bold text-foreground mb-2">Content Locked</h2>
            <p className="text-muted-foreground max-w-md mb-6">Come back in {timeUntilReset} or upgrade for unlimited access.</p>
          </div>
        ) : (
          <>
            {/* Results Table */}
            <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name & Agency</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contacts</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loading ? (
                      <tr><td colSpan={5} className="px-6 py-12 text-center"><Loader2 className="animate-spin inline w-5 h-5" /> Loading...</td></tr>
                    ) : contacts.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">No contacts found matching "{searchTerm}"</td></tr>
                    ) : (
                      contacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground">{contact.first_name} {contact.last_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                           {contact.city ? `${contact.city}, ${contact.state}` : "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground max-w-xs truncate" title={contact.title}>
                          {contact.title || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <div className="flex flex-col gap-1">
                               <a href={`mailto:${contact.email}`} className="text-sm text-primary hover:underline">{contact.email}</a>
                               <span className="text-xs text-muted-foreground">{contact.phone || "No Phone"}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button 
                             onClick={() => setSelectedContact(contact)}
                             className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-primary transition-colors"
                             title="View Details"
                           >
                             <Eye size={18} />
                           </button>
                        </td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 border-t border-border pt-4">
                <p className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 border border-border rounded-lg flex items-center gap-2 bg-surface disabled:opacity-50"><ChevronLeft size={16} /> Previous</button>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 border border-border rounded-lg flex items-center gap-2 bg-surface disabled:opacity-50">Next <ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-end justify-end sm:items-center bg-black/50 backdrop-blur-sm p-4">
           <div className="w-full max-w-lg bg-background rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-right">
              <div className="flex items-center justify-between p-6 border-b border-border bg-gray-50/50">
                 <h2 className="text-lg font-bold">Contact Details</h2>
                 <button onClick={() => setSelectedContact(null)} className="p-2 hover:bg-gray-200 rounded-full"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                 <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Full Name</label>
                    <p className="text-lg font-medium">{selectedContact.first_name} {selectedContact.last_name}</p>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-xs font-semibold text-muted-foreground uppercase">Title</label>
                       <p>{selectedContact.title || "—"}</p>
                    </div>
                    <div>
                       <label className="text-xs font-semibold text-muted-foreground uppercase">Department</label>
                       <p>{selectedContact.department || "—"}</p>
                    </div>
                 </div>
                 <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <label className="text-xs font-semibold text-blue-700 uppercase">Contact Info</label>
                    <div className="mt-2 space-y-1">
                       <p className="text-sm"><span className="font-medium">Email:</span> {selectedContact.email}</p>
                       <p className="text-sm"><span className="font-medium">Phone:</span> {selectedContact.phone || "—"}</p>
                    </div>
                 </div>
                 <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Address</label>
                    <p className="text-sm mt-1">{selectedContact.physical_address || selectedContact.mailing_address || "No address provided"}</p>
                    <p className="text-sm">{selectedContact.city}, {selectedContact.state} {selectedContact.zip}</p>
                    {selectedContact.district && <p className="text-xs text-muted-foreground mt-1">District: {selectedContact.district}</p>}
                 </div>
              </div>
           </div>
        </div>
      )}

      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} remaining={0} />
    </div>
  )
}
