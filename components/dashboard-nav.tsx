"use client"

import { UserButton, useAuth } from "@clerk/nextjs"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Building2, Users, BarChart3, Menu, X } from "lucide-react"
import { useEffect, useState } from "react"

export default function DashboardNav() {
  const { userId } = useAuth()
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!userId) return
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/user/is-admin")
        const data = await res.json()
        setIsAdmin(data.isAdmin)
      } catch (error) {
        console.error("Error checking admin status:", error)
      }
    }
    checkAdmin()
  }, [userId])

  const isActive = (path: string) => pathname === path

  // Common Link Component
  const NavLink = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => (
    <Link
      href={href}
      onClick={() => setIsMobileMenuOpen(false)}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive(href) ? "bg-primary text-white" : "text-foreground hover:bg-gray-100"
      }`}
    >
      <Icon size={18} />
      {label}
    </Link>
  )

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          
          {/* Left Side: Logo */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-foreground hover:bg-gray-100 rounded-md"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-primary">
              <LayoutDashboard size={24} />
              <span className="hidden sm:inline">Agency Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </Link>
          </div>

          {/* Middle: Desktop Links (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-2">
            <NavLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavLink href="/dashboard/agencies" icon={Building2} label="Agencies" />
            <NavLink href="/dashboard/contacts" icon={Users} label="Contacts" />
            {isAdmin && <NavLink href="/admin" icon={BarChart3} label="Admin" />}
          </div>

          {/* Right Side: User Button */}
          <div className="flex items-center gap-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 space-y-2 border-t border-gray-100 mt-4 animate-in slide-in-from-top-5">
            <NavLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavLink href="/dashboard/agencies" icon={Building2} label="Agencies" />
            <NavLink href="/dashboard/contacts" icon={Users} label="Contacts" />
            {isAdmin && <NavLink href="/admin" icon={BarChart3} label="Admin" />}
          </div>
        )}
      </div>
    </nav>
  )
}
