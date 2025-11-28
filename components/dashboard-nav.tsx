"use client"

import { UserButton, useAuth } from "@clerk/nextjs"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Building2, Users, BarChart3 } from "lucide-react"
import { useEffect, useState } from "react"

export default function DashboardNav() {
  const { userId } = useAuth()
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)

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

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-primary">
            <LayoutDashboard size={24} />
            Agency Dashboard
          </Link>

          <div className="flex gap-4">
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/dashboard") ? "bg-primary text-white" : "text-foreground hover:bg-background"
              }`}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>

            <Link
              href="/dashboard/agencies"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/dashboard/agencies") ? "bg-primary text-white" : "text-foreground hover:bg-background"
              }`}
            >
              <Building2 size={18} />
              Agencies
            </Link>

            <Link
              href="/dashboard/contacts"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/dashboard/contacts") ? "bg-primary text-white" : "text-foreground hover:bg-background"
              }`}
            >
              <Users size={18} />
              Contacts
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/admin") ? "bg-primary text-white" : "text-foreground hover:bg-background"
                }`}
              >
                <BarChart3 size={18} />
                Admin
              </Link>
            )}
          </div>
        </div>

        <UserButton afterSignOutUrl="/" />
      </div>
    </nav>
  )
}
