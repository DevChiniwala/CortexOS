import * as React from "react"
import { useSignals } from "@/lib/hooks"
import { SignalCard } from "@/components/signals/signal-card"
import { SignalHeatmap } from "@/components/signals/signal-heatmap"
import { IconFilter, IconRadar } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

export default function Signals() {
  const { signals } = useSignals()
  const [filterType, setFilterType] = React.useState<string>("all")

  const filteredSignals = React.useMemo(() => {
    if (filterType === "all") return signals
    return signals.filter(s => s.type === filterType)
  }, [signals, filterType])

  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full h-full">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <IconRadar className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-display font-semibold tracking-tight text-ink">Intelligence Signals</h1>
          </div>
          <p className="text-ink-3">Real-time buying signals detected across your target accounts</p>
        </div>
        <div className="flex items-center gap-3 bg-surface border border-line rounded-lg p-1">
          <Button 
            variant={filterType === "all" ? "default" : "ghost"} 
            size="sm"
            onClick={() => setFilterType("all")}
            className={filterType === "all" ? "bg-surface-hover text-ink shadow-sm" : ""}
          >
            All Signals
          </Button>
          <Button 
            variant={filterType === "funding_round" ? "default" : "ghost"} 
            size="sm"
            onClick={() => setFilterType("funding_round")}
            className={filterType === "funding_round" ? "bg-surface-hover text-ink shadow-sm" : ""}
          >
            Funding
          </Button>
          <Button 
            variant={filterType === "hiring_surge" ? "default" : "ghost"} 
            size="sm"
            onClick={() => setFilterType("hiring_surge")}
            className={filterType === "hiring_surge" ? "bg-surface-hover text-ink shadow-sm" : ""}
          >
            Hiring
          </Button>
          <Button 
            variant={filterType === "tech_adoption" ? "default" : "ghost"} 
            size="sm"
            onClick={() => setFilterType("tech_adoption")}
            className={filterType === "tech_adoption" ? "bg-surface-hover text-ink shadow-sm" : ""}
          >
            Tech Stack
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <SignalHeatmap signals={signals} />

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-line pb-2">
            <h3 className="text-lg font-medium text-ink">Live Signal Feed</h3>
            <span className="text-sm font-medium text-ink-3 bg-surface-hover px-2 py-0.5 rounded-full">
              {filteredSignals.length} detected
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredSignals.length > 0 ? (
              filteredSignals.map(signal => (
                <SignalCard key={signal.id} signal={signal} />
              ))
            ) : (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-line rounded-xl bg-surface/30">
                <IconFilter className="w-8 h-8 text-ink-3 mb-3 opacity-50" />
                <h3 className="text-base font-medium text-ink">No signals found</h3>
                <p className="text-sm text-ink-3 mt-1">Try adjusting your filters or expanding your tracked accounts.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
