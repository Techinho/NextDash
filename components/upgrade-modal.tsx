"use client"

import { X } from "lucide-react"

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  remaining: number
}

export default function UpgradeModal({ isOpen, onClose, remaining }: UpgradeModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg p-8 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Daily Limit Reached</h2>
          <button onClick={onClose} className="text-muted hover:text-foreground transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-foreground mb-4">
            You've viewed <span className="font-bold text-primary">50 contacts</span> today. Your daily limit will reset
            at <span className="font-bold">midnight UTC</span>.
          </p>
          <p className="text-muted text-sm">Upgrade to access unlimited contacts and advanced features.</p>
        </div>

        {/* Plans */}
        <div className="space-y-4 mb-8">
          <div className="border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
            <h3 className="font-semibold text-foreground mb-1">Professional</h3>
            <p className="text-sm text-muted mb-2">Unlimited contacts, priority support</p>
            <p className="text-lg font-bold text-primary">
              $29<span className="text-sm text-muted">/month</span>
            </p>
          </div>

          <div className="border border-primary border-2 rounded-lg p-4 relative">
            <div className="absolute -top-3 left-4 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
              POPULAR
            </div>
            <h3 className="font-semibold text-foreground mb-1">Enterprise</h3>
            <p className="text-sm text-muted mb-2">Custom limits, advanced analytics, dedicated support</p>
            <p className="text-lg font-bold text-primary">
              $99<span className="text-sm text-muted">/month</span>
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">
            Continue Today
          </button>
          <button className="btn-primary flex-1">Upgrade Now</button>
        </div>

        <p className="text-xs text-muted text-center mt-4">
          Your daily limit will reset at midnight UTC. Contact support for custom plans.
        </p>
      </div>
    </div>
  )
}
