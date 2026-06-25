import * as React from "react"
import { IconBrain, IconTrendingUp, IconTrendingDown, IconTarget,  IconX, IconArrowRight, IconCalendarEvent } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { motion } from "motion/react"
import type { LearningLoopLog } from "@/lib/types"

interface ICPLearningLoopProps {
  logs: LearningLoopLog[]
}

export function ICPLearningLoop({ logs }: ICPLearningLoopProps) {
  const getEventIcon = (event: LearningLoopLog["triggerEvent"]) => {
    switch (event) {
      case "meeting_booked": return <IconCalendarEvent className="w-5 h-5 text-success" />
      case "deal_won": return <IconTarget className="w-5 h-5 text-primary" />
      case "outreach_rejected": return <IconX className="w-5 h-5 text-danger" />
      case "deal_lost": return <IconTrendingDown className="w-5 h-5 text-danger" />
    }
  }

  const getEventLabel = (event: LearningLoopLog["triggerEvent"]) => {
    switch (event) {
      case "meeting_booked": return "Meeting Booked"
      case "deal_won": return "Deal Won"
      case "outreach_rejected": return "Outreach Rejected"
      case "deal_lost": return "Deal Lost"
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 pb-4 border-b border-line">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
          <IconBrain className="w-5 h-5 text-purple-500" />
        </div>
        <div>
          <h2 className="text-xl font-display font-semibold text-ink">Autonomous ICP Tuning</h2>
          <p className="text-sm text-ink-3">System automatically adjusts scoring weights based on GTM outcomes.</p>
        </div>
      </div>

      <div className="relative border-l border-line/50 ml-5 space-y-8 pb-4">
        {logs.map((log, i) => (
          <motion.div 
            key={log.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative pl-8"
          >
            {/* Timeline dot */}
            <div className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-surface border-2 border-line flex items-center justify-center">
              {getEventIcon(log.triggerEvent)}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink">{getEventLabel(log.triggerEvent)}</span>
                    <span className="text-sm text-ink-3">with</span>
                    <span className="text-sm font-medium text-ink bg-surface-hover px-2 py-0.5 rounded border border-line">{log.companyName}</span>
                  </div>
                  <span className="text-xs text-ink-3 mt-0.5">{log.timestamp}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5">
                <p className="text-sm text-ink-2 mb-4 leading-relaxed">
                  <strong className="text-purple-400 font-medium">Neural Feedback:</strong> {log.impactDescription}
                </p>

                <div className="flex flex-col gap-3">
                  <div className="text-xs font-mono uppercase tracking-wider text-ink-3 mb-1">Weight Adjustments</div>
                  
                  {log.adjustments.map(adj => (
                    <div key={adj.signifierId} className="flex items-center justify-between p-3 rounded-lg bg-surface border border-line">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-ink">{adj.signifierName}</span>
                        <span className="text-xs text-ink-3">{adj.reason}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm font-mono">
                          <span className="text-ink-3">{adj.previousWeight.toFixed(1)}</span>
                          <IconArrowRight className="w-3.5 h-3.5 text-ink-3" />
                          <span className={cn(
                            "font-medium",
                            adj.newWeight > adj.previousWeight ? "text-success" : "text-danger"
                          )}>{adj.newWeight.toFixed(1)}</span>
                        </div>
                        <div className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded text-xs font-bold",
                          adj.newWeight > adj.previousWeight ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                        )}>
                          {adj.newWeight > adj.previousWeight ? <IconTrendingUp className="w-3 h-3" /> : <IconTrendingDown className="w-3 h-3" />}
                          {adj.confidenceDelta > 0 ? "+" : ""}{(adj.confidenceDelta * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
