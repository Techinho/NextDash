"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import DashboardNav from "@/components/dashboard-nav"
import { ChevronLeft, ChevronRight, Loader2, Eye, X, Building2, MapPin, Globe, Users, School } from "lucide-react"

// Full Interface based on your Schema/CSV
interface Agency {
  id: string
  name: string
  type: string
  state: string
  state_code: string
  county: string
  population: number
  website: string
  phone: string
  physical_address: string
  mailing_address: string
  total_schools: number
  total_students: number
  status: string
  locale: string
}

export default function AgenciesPage() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()
  
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [loading, setLoading] = useState(true)
  
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Modal State
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null)

  useEffect(() => {
    if (isLoaded && !userId) router.push("/")
  }, [isLoaded, userId, router])

  const fetchAgencies = useCallback(async () => {
    if (!userId) return
    setLoading(true)

    try {
      const endpoint = `/api/agencies?page=${currentPage}&search=${encodeURIComponent(searchTerm)}`
      const res = await fetch(endpoint)

      if (!res.ok) throw new Error("Failed to fetch")

      const data = await res.json()
      setAgencies(data.agencies)
      setTotalPages(data.totalPages)
      setTotalCount(data.totalCount)

    } catch (error) {
      console.error("Error loading agencies:", error)
    } finally {
      setLoading(false)
    }
  }, [userId, currentPage, searchTerm])

  useEffect(() => {
    fetchAgencies()
  }, [fetchAgencies])

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
               <h1 className="text-3xl font-bold text-foreground">Agencies Directory</h1>
               <p className="text-muted-foreground">Browse government agencies and schools.</p>
            </div>
            <div className="hidden md:block text-sm text-muted-foreground bg-surface px-3 py-1 rounded-full border border-border">
               {totalCount} Total Agencies
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, state, or county..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              className="w-full pl-4 pr-4 py-3 border border-border rounded-xl bg-surface text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Agency Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Population</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center"><Loader2 className="animate-spin inline w-5 h-5" /> Loading...</td></tr>
                ) : agencies.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">No agencies found.</td></tr>
                ) : (
                  agencies.map((agency) => (
                    <tr key={agency.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{agency.name}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                           {agency.website ? (
                             <a href={agency.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                               {agency.website.replace(/^https?:\/\//, '')}
                             </a>
                           ) : "No website"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                           ${agency.type === 'County' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'}
                        `}>
                           {agency.type || "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                         {agency.county}, {agency.state_code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-mono">
                        {agency.population ? agency.population.toLocaleString() : "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button 
                           onClick={() => setSelectedAgency(agency)}
                           className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-primary transition-colors"
                           title="View Details"
                         >
                           <Eye size={18} />
                         </button>
                      </td>
                    </tr>
                  ))
                )}
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
      </main>

      {/* Agency Detail Drawer */}
      {selectedAgency && (
        <div className="fixed inset-0 z-50 flex items-end justify-end sm:items-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
           <div className="w-full max-w-xl bg-background rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between p-6 border-b border-border bg-gray-50/50">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                       <Building2 size={24} />
                    </div>
                    <div>
                       <h2 className="text-lg font-bold">{selectedAgency.name}</h2>
                       <p className="text-xs text-muted-foreground">{selectedAgency.type} in {selectedAgency.state}</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedAgency(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
              </div>
              
              <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                 
                 {/* Key Stats */}
                 <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-surface border border-border rounded-lg text-center">
                       <Users className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                       <p className="text-xs text-muted-foreground uppercase font-semibold">Population</p>
                       <p className="font-bold">{selectedAgency.population?.toLocaleString() || "—"}</p>
                    </div>
                    <div className="p-3 bg-surface border border-border rounded-lg text-center">
                       <School className="w-5 h-5 mx-auto text-purple-500 mb-1" />
                       <p className="text-xs text-muted-foreground uppercase font-semibold">Schools</p>
                       <p className="font-bold">{selectedAgency.total_schools || "—"}</p>
                    </div>
                    <div className="p-3 bg-surface border border-border rounded-lg text-center">
                       <Users className="w-5 h-5 mx-auto text-green-500 mb-1" />
                       <p className="text-xs text-muted-foreground uppercase font-semibold">Students</p>
                       <p className="font-bold">{selectedAgency.total_students?.toLocaleString() || "—"}</p>
                    </div>
                 </div>

                 {/* Contact & Location */}
                 <div className="space-y-4">
                    <div>
                       <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                          <MapPin size={16} /> Location
                       </h3>
                       <div className="bg-surface p-3 rounded-lg border border-border text-sm space-y-1">
                          <p>{selectedAgency.physical_address || selectedAgency.mailing_address || "No address available"}</p>
                          <p>{selectedAgency.county}, {selectedAgency.state} {selectedAgency.state_code}</p>
                       </div>
                    </div>

                    <div>
                       <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                          <Globe size={16} /> Contact
                       </h3>
                       <div className="bg-surface p-3 rounded-lg border border-border text-sm space-y-2">
                          {selectedAgency.website && (
                             <p className="flex items-center justify-between">
                                <span className="text-muted-foreground">Website:</span>
                                <a href={selectedAgency.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-[250px]">
                                   {selectedAgency.website}
                                </a>
                             </p>
                          )}
                          <p className="flex items-center justify-between">
                             <span className="text-muted-foreground">Phone:</span>
                             <span className="font-medium">{selectedAgency.phone || "—"}</span>
                          </p>
                          <p className="flex items-center justify-between">
                             <span className="text-muted-foreground">Status:</span>
                             <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                {selectedAgency.status || "Active"}
                             </span>
                          </p>
                       </div>
                    </div>
                 </div>
              </div>
              
              <div className="p-4 border-t border-border bg-gray-50/50 text-right">
                 <button onClick={() => setSelectedAgency(null)} className="btn-secondary">Close</button>
              </div>
           </div>
        </div>
      )}

    </div>
  )
}
