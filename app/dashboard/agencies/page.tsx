"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import DashboardNav from "@/components/dashboard-nav"
import { ChevronLeft, ChevronRight, Loader2, Eye, X, Building2, MapPin, Globe, Users, School, Search, Filter } from "lucide-react"

// Interface
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
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25) // Default to 25 for better density
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null)

  useEffect(() => {
    if (isLoaded && !userId) router.push("/")
  }, [isLoaded, userId, router])

  const fetchAgencies = useCallback(async () => {
    if (!userId) return
    setLoading(true)

    try {
      // Pass dynamic limit
      const endpoint = `/api/agencies?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchTerm)}`
      const res = await fetch(endpoint)

      if (!res.ok) throw new Error("Failed to fetch")

      const data = await res.json()
      setAgencies(data.agencies)
      setTotalPages(data.totalPages)
      setTotalCount(data.totalCount || 0)

    } catch (error) {
      console.error("Error loading agencies:", error)
    } finally {
      setLoading(false)
    }
  }, [userId, currentPage, searchTerm, itemsPerPage])

  // Reset to page 1 if search or page-size changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, itemsPerPage])

  // Fetch when dependencies change (debounce search could be added here)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAgencies()
    }, 200)
    return () => clearTimeout(timer)
  }, [fetchAgencies])

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
             <h1 className="text-3xl font-bold text-foreground">Agencies Directory</h1>
             <p className="text-muted-foreground mt-1">
                Managing {totalCount.toLocaleString()} government records.
             </p>
          </div>

          <div className="flex gap-3">
             {/* Search */}
             <div className="relative w-full md:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                   type="text"
                   placeholder="Search agencies..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="block w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm bg-surface text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                />
             </div>
             
             {/* Page Size Picker */}
             <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <Filter className="h-4 w-4 text-muted-foreground" />
                </div>
                <select
                   value={itemsPerPage}
                   onChange={(e) => setItemsPerPage(Number(e.target.value))}
                   className="block w-full pl-9 pr-8 py-2 border border-border rounded-lg text-sm bg-surface text-foreground focus:ring-2 focus:ring-primary focus:outline-none appearance-none cursor-pointer"
                >
                   <option value={10}>10 rows</option>
                   <option value={25}>25 rows</option>
                   <option value={50}>50 rows</option>
                   <option value={100}>100 rows</option>
                </select>
             </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="bg-gray-50/50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Agency Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-20 text-center"><Loader2 className="animate-spin inline w-6 h-6 text-primary" /></td></tr>
                ) : agencies.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-20 text-center text-muted-foreground">No agencies match your search.</td></tr>
                ) : (
                  agencies.map((agency) => (
                    <tr key={agency.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-3">
                        <div className="font-medium text-foreground text-sm">{agency.name}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                           {agency.website ? new URL(agency.website).hostname : "—"}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border
                           ${agency.type === 'County' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'}
                        `}>
                           {agency.type || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-muted-foreground">
                         {agency.county}, {agency.state_code}
                      </td>
                      <td className="px-6 py-3 text-sm font-mono text-foreground">
                        {agency.population ? agency.population.toLocaleString() : "—"}
                      </td>
                      <td className="px-6 py-3 text-right">
                         <button 
                           onClick={() => setSelectedAgency(agency)}
                           className="p-1.5 hover:bg-gray-100 rounded-md text-muted-foreground hover:text-primary transition-colors"
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

          {/* Footer Pagination */}
          <div className="px-6 py-4 border-t border-border bg-gray-50/30 flex flex-col sm:flex-row items-center justify-between gap-4">
             <span className="text-sm text-muted-foreground">
                Showing page <span className="font-medium text-foreground">{currentPage}</span> of <span className="font-medium text-foreground">{totalPages}</span>
             </span>
             
             <div className="flex gap-2">
               <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1 || loading} 
                  className="px-3 py-1.5 border border-border rounded-md bg-surface text-sm font-medium text-foreground hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
               >
                  <ChevronLeft size={14} /> Prev
               </button>
               <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                  disabled={currentPage === totalPages || loading} 
                  className="px-3 py-1.5 border border-border rounded-md bg-surface text-sm font-medium text-foreground hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
               >
                  Next <ChevronRight size={14} />
               </button>
             </div>
          </div>
        </div>
      </main>

      {/* Agency Detail Drawer (Same as before) */}
      {selectedAgency && (
        <div className="fixed inset-0 z-50 flex items-end justify-end sm:items-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
           <div className="w-full max-w-xl bg-background rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300 border border-border">
              <div className="flex items-center justify-between p-6 border-b border-border bg-gray-50/50">
                 <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                       <Building2 size={24} />
                    </div>
                    <div>
                       <h2 className="text-lg font-bold text-foreground">{selectedAgency.name}</h2>
                       <p className="text-xs text-muted-foreground">{selectedAgency.type} • {selectedAgency.state}</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedAgency(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-muted-foreground"><X size={20} /></button>
              </div>
              
              <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                 <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-surface border border-border rounded-lg text-center">
                       <Users className="w-5 h-5 mx-auto text-blue-500 mb-2" />
                       <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Population</p>
                       <p className="font-bold text-foreground">{selectedAgency.population?.toLocaleString() || "—"}</p>
                    </div>
                    <div className="p-3 bg-surface border border-border rounded-lg text-center">
                       <School className="w-5 h-5 mx-auto text-purple-500 mb-2" />
                       <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Schools</p>
                       <p className="font-bold text-foreground">{selectedAgency.total_schools || "—"}</p>
                    </div>
                    <div className="p-3 bg-surface border border-border rounded-lg text-center">
                       <Users className="w-5 h-5 mx-auto text-green-500 mb-2" />
                       <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Students</p>
                       <p className="font-bold text-foreground">{selectedAgency.total_students?.toLocaleString() || "—"}</p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div>
                       <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                          <MapPin size={16} className="text-primary" /> Location Details
                       </h3>
                       <div className="bg-surface p-4 rounded-lg border border-border text-sm space-y-2 text-muted-foreground">
                          <p>{selectedAgency.physical_address || selectedAgency.mailing_address || "No address available"}</p>
                          <p>{selectedAgency.county}, {selectedAgency.state} {selectedAgency.state_code}</p>
                       </div>
                    </div>

                    <div>
                       <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                          <Globe size={16} className="text-primary" /> Contact Info
                       </h3>
                       <div className="bg-surface p-4 rounded-lg border border-border text-sm space-y-3">
                          {selectedAgency.website && (
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Website</span>
                                <a href={selectedAgency.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                                   Visit Site ↗
                                </a>
                             </div>
                          )}
                          <div className="flex justify-between items-center">
                             <span className="text-muted-foreground">Phone</span>
                             <span className="font-medium text-foreground">{selectedAgency.phone || "—"}</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
