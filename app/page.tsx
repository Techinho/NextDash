"use client"

import { useAuth } from "@clerk/nextjs"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SignInButton, SignUpButton } from "@clerk/nextjs"
import { ArrowRight, Check, Database, Shield, Zap, Search, BarChart3, Filter, Building2, Users } from "lucide-react"

export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard")
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded) return null

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-foreground">
            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
               <Database size={20} />
            </div>
            Agency<span className="text-primary">DB</span>
          </div>
          <div className="flex items-center gap-4">
            <SignInButton mode="modal">
              <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="btn-primary px-4 py-2 text-sm">
                Get Started
              </button>
            </SignUpButton>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-sm font-medium text-muted-foreground mb-8">
            <span className="flex h-2 w-2 rounded-full bg-green-500 relative">
              <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
            </span>
            New: Agency Directory Live
          </div>
          
          {/* Headline with Gradient */}
          <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
            The professional database for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">government contacts</span>
          </h1>
          
          {/* Subhead */}
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Access thousands of verified decision-makers across federal, state, and local agencies. 
            Built for professionals who need reliable data.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <SignUpButton mode="modal">
              <button className="btn-primary h-12 px-8 text-lg flex items-center gap-2 shadow-lg shadow-primary/20 hover:-translate-y-1 transition-transform">
                Browse Data Free <ArrowRight size={18} />
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="btn-secondary h-12 px-8 text-lg">
                View Pricing
              </button>
            </SignInButton>
          </div>
                    {/* Dashboard Preview with Blurred Data */}
          <div className="relative max-w-5xl mx-auto mt-16">
            {/* Soft glow */}
            <div className="absolute -inset-4 bg-primary/10 blur-3xl -z-10 rounded-[32px]" />

            <div className="rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden">
              {/* Preview Navbar */}
              <div className="border-b border-border bg-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <div className="p-1 bg-primary/10 rounded text-primary">
                    <Database size={16} />
                  </div>
                  <span>Agency</span>
                  <span className="text-primary">Dashboard</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-background border border-border text-muted-foreground">
                    <Search size={12} />
                    Search…
                  </div>
                  <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                    AD
                  </div>
                </div>
              </div>

              {/* Tabs row */}
              <div className="border-b border-border bg-surface px-4 py-2 flex items-center gap-2 text-xs font-medium">
                <div className="px-3 py-1 rounded-md bg-primary text-white flex items-center gap-1">
                  <BarChart3 size={12} /> Dashboard
                </div>
                <div className="px-3 py-1 rounded-md bg-background text-foreground flex items-center gap-1">
                  <Building2 size={12} /> Agencies
                </div>
                <div className="px-3 py-1 rounded-md bg-background text-foreground flex items-center gap-1">
                  <Users size={12} /> Contacts
                </div>
              </div>

              {/* Split preview: Agencies (left) / Contacts (right) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-surface relative">
                
                {/* Overlay "Sign In to View" Badge (Optional Polish) */}
                {/* <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                   <div className="bg-background/80 backdrop-blur-sm border border-border px-4 py-2 rounded-full shadow-lg text-xs font-bold text-foreground flex items-center gap-2">
                      <Lock size={12} /> Sign in to view data
                   </div>
                </div> */}

                {/* Agencies preview */}
                <div className="border-r border-border/60">
                  <div className="px-4 py-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                      Agencies
                    </span>
                    <span className="text-[10px] text-primary font-medium cursor-pointer hover:underline">
                      View all →
                    </span>
                  </div>
                  <div className="px-4 pb-4">
                    <div className="grid grid-cols-3 text-[11px] text-muted-foreground border-b border-border pb-1 mb-2">
                      <span>Name</span>
                      <span>Type</span>
                      <span>State</span>
                    </div>
                    {/* BLURRED DATA ROWS */}
                    {["City of Everett","Harris County","Miami County", "Polk County", "City of Reno"].map((name, i) => (
                      <div
                        key={name}
                        className="grid grid-cols-3 items-center text-[11px] py-1.5 border-b border-border/40 last:border-0"
                      >
                        <span className={`font-medium text-foreground truncate ${i > 0 ? 'blur-[2px] select-none opacity-70' : ''}`}>
                          {name}
                        </span>
                        <span className={`text-muted-foreground ${i > 0 ? 'blur-[2px] select-none opacity-70' : ''}`}>
                          {i === 0 ? "City" : "County"}
                        </span>
                        <span className={`text-muted-foreground ${i > 0 ? 'blur-[2px] select-none opacity-70' : ''}`}>
                          {i === 0 ? "WA" : i === 1 ? "TX" : "OH"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contacts preview */}
                <div>
                  <div className="px-4 py-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                      Contacts
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      50 views / day
                    </span>
                  </div>
                  <div className="px-4 pb-4">
                    <div className="grid grid-cols-4 text-[11px] text-muted-foreground border-b border-border pb-1 mb-2">
                      <span>Name</span>
                      <span className="col-span-2">Title</span>
                      <span className="text-right">Status</span>
                    </div>
                    {/* BLURRED DATA ROWS */}
                    {[
                      { init: "JT", title: "IT Director" },
                      { init: "AM", title: "Procurement Lead" },
                      { init: "CS", title: "City Manager" },
                      { init: "RK", title: "Chief of Police" },
                      { init: "SL", title: "Director of Finance" },
                    ].map((row, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-4 items-center text-[11px] py-1.5 border-b border-border/40 last:border-0"
                      >
                        <div className={`flex items-center gap-2 ${i > 0 ? 'blur-[2px] select-none opacity-60' : ''}`}>
                          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[9px] flex items-center justify-center font-semibold">
                            {row.init}
                          </div>
                          <span className="font-medium text-foreground">Name</span>
                        </div>
                        <span className={`col-span-2 text-muted-foreground truncate ${i > 0 ? 'blur-[2px] select-none opacity-60' : ''}`}>
                          {row.title}
                        </span>
                        <div className="flex justify-end">
                           {i === 0 ? (
                             <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100 text-[10px] font-semibold">
                               Verified
                             </span>
                           ) : (
                             <span className="blur-[2px] select-none opacity-60 text-[10px] bg-gray-100 px-2 rounded">Locked</span>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>


      </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-background">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
               <h2 className="text-3xl font-bold text-foreground mb-4">Simple pricing</h2>
               <p className="text-lg text-muted-foreground">Start for free. Upgrade for unlimited access.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
               {/* Free Plan */}
               <div className="rounded-2xl p-8 border border-border bg-surface">
                  <h3 className="text-lg font-bold text-foreground mb-2">Free</h3>
                  <div className="text-4xl font-bold text-foreground mb-6">$0<span className="text-base font-normal text-muted-foreground">/mo</span></div>
                  <ul className="space-y-4 mb-8">
                     <li className="flex items-center gap-3 text-muted-foreground text-sm"><Check size={16} className="text-primary" /> 50 daily views</li>
                     <li className="flex items-center gap-3 text-muted-foreground text-sm"><Check size={16} className="text-primary" /> Basic search</li>
                     <li className="flex items-center gap-3 text-muted-foreground text-sm"><Check size={16} className="text-primary" /> Read-only access</li>
                  </ul>
                  <SignUpButton mode="modal">
                     <button className="btn-secondary w-full">Get Started</button>
                  </SignUpButton>
               </div>

               {/* Pro Plan */}
               <div className="rounded-2xl p-8 border-2 border-primary bg-surface relative shadow-xl shadow-primary/5">
                  <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-sm">POPULAR</div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Professional</h3>
                  <div className="text-4xl font-bold text-foreground mb-6">$49<span className="text-base font-normal text-muted-foreground">/mo</span></div>
                  <ul className="space-y-4 mb-8">
                     <li className="flex items-center gap-3 text-foreground text-sm"><Check size={16} className="text-primary" /> Unlimited views</li>
                     <li className="flex items-center gap-3 text-foreground text-sm"><Check size={16} className="text-primary" /> CSV Export</li>
                     <li className="flex items-center gap-3 text-foreground text-sm"><Check size={16} className="text-primary" /> Priority Support</li>
                  </ul>
                  <SignUpButton mode="modal">
                     <button className="btn-primary w-full">Start Free Trial</button>
                  </SignUpButton>
               </div>

               {/* Enterprise Plan */}
               <div className="rounded-2xl p-8 border border-border bg-surface">
                  <h3 className="text-lg font-bold text-foreground mb-2">Enterprise</h3>
                  <div className="text-4xl font-bold text-foreground mb-6">$199<span className="text-base font-normal text-muted-foreground">/mo</span></div>
                  <ul className="space-y-4 mb-8">
                     <li className="flex items-center gap-3 text-muted-foreground text-sm"><Check size={16} className="text-primary" /> API Access</li>
                     <li className="flex items-center gap-3 text-muted-foreground text-sm"><Check size={16} className="text-primary" /> SSO / SAML</li>
                     <li className="flex items-center gap-3 text-muted-foreground text-sm"><Check size={16} className="text-primary" /> Custom Integration</li>
                  </ul>
                  <button className="btn-secondary w-full">Contact Sales</button>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface border-t border-border py-12">
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 font-bold text-lg text-foreground">
               <div className="p-1 bg-primary/10 rounded text-primary">
                  <Database size={16} />
               </div>
               AgencyDB
            </div>
            <div className="text-muted-foreground text-sm">
               © 2025 AgencyDB Inc. All rights reserved.
            </div>
         </div>
      </footer>

    </div>
  )
}
