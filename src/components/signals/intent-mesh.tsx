import * as React from "react"
import { motion } from "motion/react"
import { IconRadar, IconBuilding, IconTrendingUp } from "@tabler/icons-react"
import type { Signal } from "@/lib/types"

interface IntentMeshProps {
  signals: Signal[]
}

export function IntentMesh({ signals }: IntentMeshProps) {
  // Extract unique companies that have signals
  const companies = React.useMemo(() => {
    const map = new Map<number, { name: string; score: number; signalCount: number }>()
    signals.forEach(s => {
      const existing = map.get(s.companyId) || { name: s.companyName, score: 0, signalCount: 0 }
      existing.score += s.confidence
      existing.signalCount += 1
      map.set(s.companyId, existing)
    })
    return Array.from(map.values()).sort((a, b) => b.score - a.score)
  }, [signals])

  return (
    <div className="relative w-full h-[400px] bg-bg border border-line rounded-xl overflow-hidden flex items-center justify-center p-8">
      {/* Grid Background */}
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />

      {/* Radar Center */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 2, 3], opacity: [0.5, 0.2, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute w-32 h-32 rounded-full border border-primary/50"
        />
        <motion.div
          animate={{ scale: [1, 2, 3], opacity: [0.5, 0.2, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1.3 }}
          className="absolute w-32 h-32 rounded-full border border-primary/50"
        />
        <motion.div
          animate={{ scale: [1, 2, 3], opacity: [0.5, 0.2, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 2.6 }}
          className="absolute w-32 h-32 rounded-full border border-primary/50"
        />
        <div className="w-16 h-16 rounded-full bg-surface border border-primary flex items-center justify-center relative z-10 shadow-[0_0_20px_rgba(255,85,0,0.3)]">
          <IconRadar className="w-8 h-8 text-primary" />
        </div>
      </div>

      {/* Nodes */}
      {companies.map((company, i) => {
        // Distribute nodes in a circle
        const angle = (i / companies.length) * Math.PI * 2
        // Distance based on score (higher score = closer to center)
        const maxDist = 180
        const minDist = 80
        const distance = Math.max(minDist, maxDist - (company.score / 2))
        
        const x = Math.cos(angle) * distance
        const y = Math.sin(angle) * distance
        
        // Heat color based on signal count
        const heatClass = company.signalCount >= 2 
          ? "border-primary bg-primary/20 text-primary shadow-[0_0_15px_rgba(255,85,0,0.4)]" 
          : "border-info bg-info/10 text-info"

        return (
          <motion.div
            key={company.name}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="absolute z-20 flex flex-col items-center gap-2"
            style={{ 
              left: `calc(50% + ${x}px)`, 
              top: `calc(50% + ${y}px)`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center backdrop-blur-sm ${heatClass}`}>
              {company.signalCount >= 2 ? <IconTrendingUp className="w-5 h-5" /> : <IconBuilding className="w-5 h-5" />}
            </div>
            <div className="bg-surface/80 backdrop-blur border border-line px-2 py-1 rounded text-[10px] font-medium text-ink whitespace-nowrap">
              {company.name}
            </div>
          </motion.div>
        )
      })}

      {/* Stats Overlay */}
      <div className="absolute top-4 left-4 flex gap-4">
        <div className="flex flex-col">
          <span className="text-2xl font-display font-medium text-ink">{signals.length}</span>
          <span className="text-xs text-ink-3 uppercase tracking-wider">Active Signals</span>
        </div>
        <div className="w-px h-10 bg-line" />
        <div className="flex flex-col">
          <span className="text-2xl font-display font-medium text-ink">{companies.length}</span>
          <span className="text-xs text-ink-3 uppercase tracking-wider">Accounts Surging</span>
        </div>
      </div>
    </div>
  )
}
