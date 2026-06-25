import * as React from "react"
import type { Signal } from "@/lib/types"
import { cn } from "@/lib/utils"

interface SignalHeatmapProps {
  signals: Signal[]
}

export function SignalHeatmap({ signals }: SignalHeatmapProps) {
  // Aggregate signals by company
  const companyScores = React.useMemo(() => {
    const map = new Map<string, { totalConfidence: number, count: number, name: string }>()
    
    signals.forEach(s => {
      const existing = map.get(String(s.companyId)) || { totalConfidence: 0, count: 0, name: s.companyName }
      existing.totalConfidence += s.confidence
      existing.count += 1
      map.set(String(s.companyId), existing)
    })

    return Array.from(map.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      score: data.totalConfidence / data.count,
      count: data.count
    })).sort((a, b) => b.score - a.score)
  }, [signals])

  const getHeatmapColor = (score: number) => {
    if (score >= 90) return "bg-primary text-white border-primary-hover shadow-[0_0_15px_rgba(255,85,0,0.3)]"
    if (score >= 75) return "bg-primary/40 text-primary-hover border-primary/50"
    if (score >= 50) return "bg-primary/20 text-primary-hover border-primary/30"
    return "bg-surface text-ink-3 border-line"
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-ink-2">Account Signal Heatmap</h3>
        <div className="flex items-center gap-2 text-xs text-ink-3">
          <span>Cold</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-surface border border-line" />
            <div className="w-3 h-3 rounded-sm bg-primary/20 border border-primary/30" />
            <div className="w-3 h-3 rounded-sm bg-primary/40 border border-primary/50" />
            <div className="w-3 h-3 rounded-sm bg-primary border border-primary-hover" />
          </div>
          <span>Hot</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {companyScores.map(company => (
          <div 
            key={company.id}
            className={cn(
              "flex flex-col p-3 rounded-xl border transition-all cursor-pointer hover:scale-105",
              getHeatmapColor(company.score)
            )}
            title={`${company.name}: ${company.count} signals, avg confidence ${Math.round(company.score)}%`}
          >
            <span className="font-semibold text-sm truncate">{company.name}</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] font-medium tracking-widest uppercase opacity-70">Signals</span>
              <span className="font-mono text-xs font-bold">{company.count}</span>
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-[10px] font-medium tracking-widest uppercase opacity-70">Intensity</span>
              <span className="font-mono text-xs font-bold">{Math.round(company.score)}</span>
            </div>
          </div>
        ))}
        {companyScores.length === 0 && (
          <div className="col-span-full py-8 text-center text-ink-3 text-sm border-2 border-dashed border-line rounded-xl">
            No signal data available for heatmap
          </div>
        )}
      </div>
    </div>
  )
}
