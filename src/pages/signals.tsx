import * as React from "react"
import { useSignals } from "@/lib/hooks"
import { SignalCard } from "@/components/signals/signal-card"
import { SignalHeatmap } from "@/components/signals/signal-heatmap"
import { IconFilter, IconRadar, IconSword, IconX, IconTarget, IconShield, IconMessageCircle, IconBulb } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

interface Battlecard {
  id: number
  competitorName: string
  overview: string
  strengths: string[]
  weaknesses: string[]
  talkTracks: { objection: string; response: string }[]
  killCriteria: string[]
  recommendedApproach: string
  createdAt: number
}

// Mock battlecard data for UI demonstration
const MOCK_BATTLECARDS: Record<number, Battlecard> = {
  1: {
    id: 1,
    competitorName: "CompetitorX",
    overview: "CompetitorX is a well-funded Series C startup focusing on outbound automation. Strong in email sequencing but weak in signal intelligence.",
    strengths: ["Strong email deliverability", "Large existing user base", "Lower entry price point"],
    weaknesses: ["No real-time signal detection", "Manual data entry required", "Limited AI capabilities"],
    talkTracks: [
      { objection: "CompetitorX is cheaper.", response: "While their list price is lower, CortexOS eliminates the need for 3-4 other tools they require you to buy separately." },
      { objection: "They have more integrations.", response: "We focus on depth over breadth. Our AI agents do the work, not just pass data between tools." }
    ],
    killCriteria: [
      "If they value autonomous research, we win — CompetitorX requires manual input.",
      "If they only need basic email sequences, this is a risk — CompetitorX is mature here."
    ],
    recommendedApproach: "Lead with our autonomous signal detection and buying committee identification. Position CortexOS as the AI-native platform vs their workflow tool.",
    createdAt: Date.now(),
  }
}

export default function Signals() {
  const { signals } = useSignals()
  const [filterType, setFilterType] = React.useState<string>("all")
  const [selectedBattlecard, setSelectedBattlecard] = React.useState<Battlecard | null>(null)

  const filteredSignals = React.useMemo(() => {
    if (filterType === "all") return signals
    if (filterType === "competitive") return signals.filter(s => s.type === "competitor_detected" || s.type === "tech_adoption")
    return signals.filter(s => s.type === filterType)
  }, [signals, filterType])

  const handleViewBattlecard = (signalId: number) => {
    // In production this would call the backend; for now use mock
    const card = MOCK_BATTLECARDS[1]
    if (card) setSelectedBattlecard(card)
  }

  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full h-full relative">
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
          <Button 
            variant={filterType === "competitive" ? "default" : "ghost"} 
            size="sm"
            onClick={() => setFilterType("competitive")}
            className={filterType === "competitive" ? "bg-surface-hover text-ink shadow-sm" : ""}
          >
            <IconSword className="w-4 h-4 mr-1" />
            Competitive
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
                <div key={signal.id} className="relative group">
                  <SignalCard signal={signal} />
                  <button
                    onClick={() => handleViewBattlecard(signal.id)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-amber-500/90 hover:bg-amber-500 text-white text-xs font-medium px-2.5 py-1 rounded-md flex items-center gap-1 shadow-lg"
                  >
                    <IconSword className="w-3.5 h-3.5" />
                    Battlecard
                  </button>
                </div>
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

      {/* Battlecard Drawer */}
      {selectedBattlecard && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedBattlecard(null)} />
          <div className="relative w-full max-w-xl bg-surface border-l border-line shadow-2xl overflow-y-auto animate-in slide-in-from-right">
            <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-md border-b border-line px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <IconSword className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-ink">Battlecard</h2>
                  <p className="text-sm text-ink-3">vs. {selectedBattlecard.competitorName}</p>
                </div>
              </div>
              <button onClick={() => setSelectedBattlecard(null)} className="p-1.5 rounded-md hover:bg-surface-hover text-ink-3 hover:text-ink transition-colors">
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6">
              {/* Overview */}
              <div className="p-4 rounded-xl bg-surface-hover/50 border border-line">
                <p className="text-sm text-ink leading-relaxed">{selectedBattlecard.overview}</p>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-red-400">
                    <IconTarget className="w-4 h-4" />
                    Their Strengths
                  </div>
                  <ul className="space-y-1.5">
                    {selectedBattlecard.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-ink-3 flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-400">
                    <IconShield className="w-4 h-4" />
                    Their Weaknesses
                  </div>
                  <ul className="space-y-1.5">
                    {selectedBattlecard.weaknesses.map((w, i) => (
                      <li key={i} className="text-sm text-ink-3 flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Talk Tracks */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-1.5 text-sm font-medium text-blue-400">
                  <IconMessageCircle className="w-4 h-4" />
                  Talk Tracks
                </div>
                {selectedBattlecard.talkTracks.map((tt, i) => (
                  <div key={i} className="p-4 rounded-xl border border-line bg-surface-hover/30 space-y-2">
                    <p className="text-sm font-medium text-ink">"{tt.objection}"</p>
                    <p className="text-sm text-ink-3 italic">→ {tt.response}</p>
                  </div>
                ))}
              </div>

              {/* Kill Criteria */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-sm font-medium text-amber-400">
                  <IconBulb className="w-4 h-4" />
                  Kill Criteria
                </div>
                <ul className="space-y-2">
                  {selectedBattlecard.killCriteria.map((kc, i) => (
                    <li key={i} className="text-sm text-ink-3 p-3 rounded-lg border border-line bg-surface-hover/20">{kc}</li>
                  ))}
                </ul>
              </div>

              {/* Recommended Approach */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Recommended Approach</p>
                <p className="text-sm text-ink leading-relaxed">{selectedBattlecard.recommendedApproach}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
