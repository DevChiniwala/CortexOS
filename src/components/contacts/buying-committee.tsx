import * as React from "react"
import type { ContactWithCompany } from "@/lib/types"
import { IconBuilding, IconCrown, IconCash, IconShieldX, IconUser,  IconTrendingUp } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

interface BuyingCommitteeProps {
  companyName: string
  contacts: ContactWithCompany[]
}

export function BuyingCommittee({ companyName, contacts }: BuyingCommitteeProps) {
  const getRoleIcon = (role?: string | null) => {
    switch (role) {
      case "Champion": return <IconCrown className="w-4 h-4" />
      case "Economic Buyer": return <IconCash className="w-4 h-4" />
      case "Blocker": return <IconShieldX className="w-4 h-4" />
      default: return <IconUser className="w-4 h-4" />
    }
  }

  const getRoleStyle = (role?: string | null) => {
    switch (role) {
      case "Champion": return "bg-primary/20 text-primary border-primary/30 shadow-[0_0_10px_rgba(255,85,0,0.2)]"
      case "Economic Buyer": return "bg-success/20 text-success border-success/30"
      case "Blocker": return "bg-danger/20 text-danger border-danger/30"
      default: return "bg-surface-hover text-ink-3 border-line"
    }
  }

  // Find max relationship strength to scale the bar
  const _maxStrength = Math.max(...contacts.map(c => c.relationshipStrength || 0), 1)

  return (
    <div className="flex flex-col border border-line bg-surface/30 rounded-xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-line bg-surface/80 backdrop-blur-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-bg border border-line flex items-center justify-center">
            <IconBuilding className="w-5 h-5 text-ink-3" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-ink">{companyName}</h3>
            <p className="text-xs text-ink-3 font-medium">{contacts.length} Identified Contacts</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-hover text-ink-3">
            <IconCrown className="w-3.5 h-3.5 text-primary" />
            {contacts.filter(c => c.buyingRole === "Champion").length} Champions
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-hover text-ink-3">
            <IconCash className="w-3.5 h-3.5 text-success" />
            {contacts.filter(c => c.buyingRole === "Economic Buyer").length} EB
          </div>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative">
        {/* Background SVG for mapping connections (optional stylistic touch) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <path d="M100,100 Q150,50 200,100 T300,100" stroke="currentColor" fill="none" className="text-primary stroke-[1.5]" strokeDasharray="4 4" />
            <path d="M200,100 Q250,150 300,200" stroke="currentColor" fill="none" className="text-line stroke-[1]" />
          </svg>
        </div>

        {contacts.map(contact => (
          <div key={contact.id} className="relative z-10 flex flex-col p-4 rounded-xl border border-line bg-surface hover:border-line-hover transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-ink leading-tight">{contact.firstName} {contact.lastName}</span>
                <span className="text-xs text-ink-2">{contact.title}</span>
              </div>
              <div className={cn("px-2 py-1 flex items-center gap-1 rounded text-[10px] uppercase tracking-wider font-bold border", getRoleStyle(contact.buyingRole))}>
                {getRoleIcon(contact.buyingRole)}
                {contact.buyingRole || "Unknown Role"}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {contact.personaTags?.map(tag => (
                <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] bg-bg border border-line text-ink-3">
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-auto pt-3 border-t border-line/50 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-semibold">
                <span className="text-ink-3 flex items-center gap-1"><IconTrendingUp className="w-3 h-3" /> Relationship Strength</span>
                <span className={cn(
                  "font-mono", 
                  (contact.relationshipStrength || 0) > 70 ? "text-primary" : "text-ink-2"
                )}>{contact.relationshipStrength || 0}/100</span>
              </div>
              <div className="w-full h-1.5 bg-bg rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all duration-1000", (contact.relationshipStrength || 0) > 70 ? "bg-primary shadow-[0_0_8px_rgba(255,85,0,0.5)]" : "bg-ink-3")}
                  style={{ width: `${((contact.relationshipStrength || 0) / 100) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
