"use client"

import { useAuth } from "@clerk/nextjs"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SignInButton, SignUpButton } from "@clerk/nextjs"
import { ArrowRight, BarChart3, Lock, Users } from "lucide-react"

export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard")
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 bg-surface">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">Agency Dashboard</div>
          <div className="flex gap-4">
            <SignInButton mode="modal">
              <button className="btn-secondary">Sign In</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="btn-primary">Sign Up</button>
            </SignUpButton>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Manage Agencies and Contacts Efficiently
          </h1>
          <p className="text-xl text-muted mb-8 text-balance max-w-2xl mx-auto">
            A professional dashboard for viewing and managing agencies and their contacts with role-based access
            control.
          </p>
          <div className="flex gap-4 justify-center">
            <SignUpButton mode="modal">
              <button className="btn-primary flex items-center gap-2">
                Get Started <ArrowRight size={18} />
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="btn-secondary">Sign In</button>
            </SignInButton>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary bg-opacity-10 rounded-lg">
                <Users size={24} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Browse Contacts</h3>
            </div>
            <p className="text-muted">Access thousands of contacts from verified agencies across the country.</p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary bg-opacity-10 rounded-lg">
                <Lock size={24} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Secure Access</h3>
            </div>
            <p className="text-muted">Role-based access control ensures your data stays secure and private.</p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary bg-opacity-10 rounded-lg">
                <BarChart3 size={24} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Analytics</h3>
            </div>
            <p className="text-muted">Track your usage and get insights into your daily activity.</p>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-2">Simple, Transparent Pricing</h2>
          <p className="text-muted text-lg mb-12">Choose the plan that fits your needs</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card border border-border">
              <h3 className="text-xl font-bold text-foreground mb-2">Free</h3>
              <p className="text-muted text-sm mb-4">Perfect for getting started</p>
              <p className="text-3xl font-bold text-primary mb-6">
                $0<span className="text-sm text-muted">/month</span>
              </p>
              <ul className="space-y-3 text-muted text-sm mb-6">
                <li>✓ 50 contacts per day</li>
                <li>✓ Basic search & filter</li>
                <li>✓ Read-only access</li>
              </ul>
              <SignUpButton mode="modal">
                <button className="btn-secondary w-full">Get Started</button>
              </SignUpButton>
            </div>

            <div className="card border-2 border-primary">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Professional</h3>
              <p className="text-muted text-sm mb-4">For power users</p>
              <p className="text-3xl font-bold text-primary mb-6">
                $29<span className="text-sm text-muted">/month</span>
              </p>
              <ul className="space-y-3 text-muted text-sm mb-6">
                <li>✓ Unlimited contacts</li>
                <li>✓ Advanced filters</li>
                <li>✓ Priority support</li>
              </ul>
              <SignUpButton mode="modal">
                <button className="btn-primary w-full">Upgrade Now</button>
              </SignUpButton>
            </div>

            <div className="card border border-border">
              <h3 className="text-xl font-bold text-foreground mb-2">Enterprise</h3>
              <p className="text-muted text-sm mb-4">For teams and organizations</p>
              <p className="text-3xl font-bold text-primary mb-6">
                $99<span className="text-sm text-muted">/month</span>
              </p>
              <ul className="space-y-3 text-muted text-sm mb-6">
                <li>✓ Unlimited everything</li>
                <li>✓ Team collaboration</li>
                <li>✓ Dedicated support</li>
              </ul>
              <button className="btn-secondary w-full">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center text-muted">
          <p>Agency Dashboard © 2025. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
