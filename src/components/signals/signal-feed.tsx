import * as React from "react"
import type { Signal } from "@/lib/types"
import { IconRadar, IconBuilding, IconTrendingUp, IconBriefcase, IconUsers, IconBrain, IconArrowRight, IconSword } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SignalFeedProps {
  signals: Signal[]
  onAction?: (signal: Signal) => void
  onBattlecard?: (signalId: number) => void
}

export function SignalFeed({ signals, onAction, onBattlecard }: SignalFeedProps) {
  const getSignalIcon = (type: Signal["type"]) => {
    switch (type) {
      case "funding_round": return <IconTrendingUp className="w-4 h-4" />
      case "hiring_surge": return <IconUsers className="w-4 h-4" />
      case "leadership_change": return <IconBriefcase className="w-4 h-4" />
      case "tech_adoption": return <IconBrain className="w-4 h-4" />
      case "competitor_detected": return <IconSword className="w-4 h-4" />
      default: return <IconRadar className="w-4 h-4" />
    }
  }

  const getSignalColor = (type: Signal["type"]) => {
    switch (type) {
      case "funding_round": return "bg-success/20 text-success border-success/30"
      case "hiring_surge": return "bg-primary/20 text-primary border-primary/30"
      case "leadership_change": return "bg-info/20 text-info border-info/30"
      case "tech_adoption": return "bg-warning/20 text-warning border-warning/30"
      case "competitor_detected": return "bg-danger/20 text-danger border-danger/30"
      default: return "bg-surface-hover text-ink-3 border-line"
    }
  }

  const formatTimeAgo = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 1) return "Just now"
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <div className="flex flex-col border border-line bg-surface/50 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-line bg-surface flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink uppercase tracking-wide">Live Feed</h3>
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Listening
        </span>
      </div>

      <div className="flex flex-col divide-y divide-line/50 max-h-[600px] overflow-y-auto">
        {signals.length === 0 ? (
          <div className="p-8 text-center text-ink-3 text-sm">No signals detected yet.</div>
        ) : (
          signals.map(signal => (
            <div key={signal.id} className="p-4 flex gap-4 hover:bg-surface transition-colors group">
              <div className="shrink-0 mt-1">
                <div className={cn("w-8 h-8 rounded-full border flex items-center justify-center", getSignalColor(signal.type))}>
                  {getSignalIcon(signal.type)}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-ink">{signal.companyName}</span>
                    <span className="text-[10px] font-mono text-ink-3 bg-bg px-1.5 py-0.5 rounded border border-line">
                      Conf: {signal.confidence}%
                    </span>
                  </div>
                  <span className="text-xs text-ink-3">{formatTimeAgo(signal.detectedAt)}</span>
                </div>
                
                <h4 className="text-sm font-medium text-ink mb-1">{signal.title}</h4>
                <p className="text-xs text-ink-2 leading-relaxed line-clamp-2 mb-3">{signal.description}</p>
                
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-ink-3">Source: {signal.source}</span>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {signal.type === "competitor_detected" && onBattlecard && (
                      <Button variant="outline" size="sm" className="h-7 text-xs border-amber-500/50 text-amber-500 hover:bg-amber-500/10" onClick={() => onBattlecard(signal.id as any)}>
                        <IconSword className="w-3.5 h-3.5 mr-1" /> Battlecard
                      </Button>
                    )}
                    <Button size="sm" className="h-7 text-xs" onClick={() => onAction && onAction(signal)}>
                      Trigger Flow <IconArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
