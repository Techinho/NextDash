"use client"

import { X, Check, Lock, Zap, Download, Headphones } from "lucide-react"

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  remaining?: number
}

export default function UpgradeModal({ isOpen, onClose, remaining }: UpgradeModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-background rounded-2xl shadow-2xl overflow-hidden border border-border animate-in zoom-in-95 duration-200 flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:bg-gray-100 rounded-full z-10 transition-colors"
        >
          <X size={20} />
        </button>

        {/* LEFT SIDE: Current Plan (Free) */}
        <div className="w-full md:w-2/5 bg-gray-50/50 p-8 flex flex-col border-r border-border">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-foreground">Current Plan</h3>
            <p className="text-sm text-muted-foreground mt-1">Starter Access</p>
          </div>
          
          <div className="text-4xl font-bold text-foreground mb-8">
            $0 <span className="text-base font-normal text-muted-foreground">/mo</span>
          </div>

          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-sm text-foreground">
              <div className="p-1 rounded-full bg-gray-200 text-gray-600"><Check size={12} /></div>
              <span>50 Contacts / Day</span>
            </li>
            <li className="flex items-center gap-3 text-sm text-foreground">
              <div className="p-1 rounded-full bg-gray-200 text-gray-600"><Check size={12} /></div>
              <span>Basic Search</span>
            </li>
            <li className="flex items-center gap-3 text-sm text-muted-foreground/60">
              <div className="p-1 rounded-full bg-gray-100 text-gray-300"><X size={12} /></div>
              <span>Export to CSV</span>
            </li>
            <li className="flex items-center gap-3 text-sm text-muted-foreground/60">
              <div className="p-1 rounded-full bg-gray-100 text-gray-300"><X size={12} /></div>
              <span>API Access</span>
            </li>
          </ul>

          <div className="mt-auto">
             <p className="text-xs text-center text-muted-foreground font-medium">Your plan is active</p>
          </div>
        </div>

        {/* RIGHT SIDE: Pro Plan (Upgrade) */}
        <div className="w-full md:w-3/5 p-8 bg-background flex flex-col relative">
          {/* Badge */}
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-xl">
             RECOMMENDED
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold text-primary flex items-center gap-2">
               <Zap className="fill-primary text-primary" size={20} /> 
               Unlimited Pro
            </h3>
            <p className="text-sm text-muted-foreground mt-1">For power users and agencies.</p>
          </div>

          <div className="text-5xl font-bold text-foreground mb-8">
            $49 <span className="text-lg font-normal text-muted-foreground">/mo</span>
          </div>

          <div className="space-y-4 mb-8 flex-1">
             {/* Feature 1 */}
             <div className="flex items-start gap-3">
                <div className="mt-1 p-1 rounded-full bg-primary/10 text-primary"><Check size={14} /></div>
                <div>
                   <p className="text-sm font-bold text-foreground">Unlimited Daily Views</p>
                   <p className="text-xs text-muted-foreground">No more daily caps. View as many contacts as you need.</p>
                </div>
             </div>

             {/* Feature 2 */}
             <div className="flex items-start gap-3">
                <div className="mt-1 p-1 rounded-full bg-primary/10 text-primary"><Download size={14} /></div>
                <div>
                   <p className="text-sm font-bold text-foreground">Export Data</p>
                   <p className="text-xs text-muted-foreground">Download lists to CSV/Excel for your CRM.</p>
                </div>
             </div>

             {/* Feature 3 */}
             <div className="flex items-start gap-3">
                <div className="mt-1 p-1 rounded-full bg-primary/10 text-primary"><Headphones size={14} /></div>
                <div>
                   <p className="text-sm font-bold text-foreground">Priority Support</p>
                   <p className="text-xs text-muted-foreground">Direct access to our data team.</p>
                </div>
             </div>
          </div>

          <button className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2">
             Upgrade to Unlimited
          </button>
          
          <p className="text-xs text-center text-muted-foreground mt-4">
             Secure payment via Stripe. Cancel anytime.
          </p>
        </div>

      </div>
    </div>
  )
}
