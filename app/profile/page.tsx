"use client"

import { useAuth, UserButton } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import DashboardNav from "@/components/dashboard-nav"

interface UserProfile {
  email: string
  isAdmin: boolean
  contactsViewedToday: number
  contactsViewedThisMonth: number
  remainingContactsToday: number
}

export default function ProfilePage() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/")
    }
  }, [isLoaded, userId, router])

  useEffect(() => {
    if (!userId) return

    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile")
        const data = await res.json()
        setProfile(data)
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="max-w-2xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Profile</h1>
          <p className="text-muted">Manage your account settings and view your activity</p>
        </div>

        {loading ? (
          <div className="card text-center py-12">
            <p className="text-foreground">Loading...</p>
          </div>
        ) : profile ? (
          <>
            {/* Account Section */}
            <div className="card mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">Account</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted font-medium mb-1">Email</p>
                  <p className="text-foreground">{profile.email}</p>
                </div>

                <div>
                  <p className="text-sm text-muted font-medium mb-1">Role</p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        profile.isAdmin ? "bg-primary text-white" : "bg-secondary text-foreground border border-border"
                      }`}
                    >
                      {profile.isAdmin ? "Admin" : "User"}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>
            </div>

            {/* Usage Section */}
            {!profile.isAdmin && (
              <div className="card mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-6">Your Usage</h2>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Today's Contacts</span>
                      <span className="text-sm font-semibold text-primary">{profile.contactsViewedToday} / 50</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-primary transition-all"
                        style={{ width: `${(profile.contactsViewedToday / 50) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted font-medium mb-1">This Month</p>
                    <p className="text-2xl font-bold text-foreground">{profile.contactsViewedThisMonth} contacts</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted font-medium mb-1">Remaining Today</p>
                    <p className="text-2xl font-bold text-primary">{profile.remainingContactsToday}</p>
                  </div>
                </div>
              </div>
            )}

            {profile.isAdmin && (
              <div className="card">
                <h2 className="text-2xl font-bold text-foreground mb-4">Admin Privileges</h2>
                <p className="text-muted">
                  As an admin, you have unlimited access to all contacts and viewing privileges.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="card text-center py-12">
            <p className="text-foreground">Failed to load profile</p>
          </div>
        )}
      </main>
    </div>
  )
}
