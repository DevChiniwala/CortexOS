import * as React from "react"
import { motion } from "motion/react"
import { IconBrain, IconPlayerPlay, IconSettings } from "@tabler/icons-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ICPLearningLoop } from "@/components/scoring/icp-learning-loop"
import type { LearningLoopLog } from "@/lib/types"

const MOCK_LEARNING_LOGS: LearningLoopLog[] = [
  {
    id: "log_1",
    timestamp: "2 hours ago",
    triggerEvent: "meeting_booked",
    companyName: "Clay",
    impactDescription: "Meeting booked with Champion (Early Adopter). System identified strong correlation between 'High velocity outbound motion' and conversion rate.",
    adjustments: [
      {
        signifierId: "sig_4",
        signifierName: "ICP Fit (Outbound Motion)",
        previousWeight: 1.0,
        newWeight: 1.4,
        reason: "Positive signal: 3rd meeting booked this week where outbound motion was high.",
        confidenceDelta: 0.15
      }
    ]
  },
  {
    id: "log_2",
    timestamp: "1 day ago",
    triggerEvent: "outreach_rejected",
    companyName: "Ramp",
    impactDescription: "Outreach rejected by Economic Buyer ('Currently building internally'). Building vs Buy persona negatively correlates with short-term conversion.",
    adjustments: [
      {
        signifierId: "sig_2",
        signifierName: "Pain Point Alignment",
        previousWeight: 1.0,
        newWeight: 0.8,
        reason: "Negative signal: Engineering-heavy teams tend to resist agentic orchestration initially.",
        confidenceDelta: -0.05
      }
    ]
  },
  {
    id: "log_3",
    timestamp: "3 days ago",
    triggerEvent: "deal_won",
    companyName: "Cognism",
    impactDescription: "Closed won deal ($120k ARR). Significant growth signals pre-sale confirmed as high-value predictors.",
    adjustments: [
      {
        signifierId: "sig_1",
        signifierName: "Growth Signals",
        previousWeight: 1.0,
        newWeight: 1.8,
        reason: "Strong correlation: 'New C-suite hire' precedes closed-won deals 65% of the time.",
        confidenceDelta: 0.25
      }
    ]
  }
]

export default function ICP() {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between border-b border-line pb-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-display font-semibold tracking-tight text-ink flex items-center gap-3">
            <IconBrain className="w-8 h-8 text-purple-500" />
            ICP Optimizer
          </h1>
          <p className="text-ink-3">Neural feedback loop dynamically adjusting your scoring algorithm.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => toast.success("CSV import started")}>
            <IconSettings className="w-4 h-4 mr-2" />
            Manual Config
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => toast.success("ICP generation triggered")}>
            <IconPlayerPlay className="w-4 h-4 mr-2" />
            Run Optimizer Batch
          </Button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <div className="lg:col-span-2">
          <ICPLearningLoop logs={MOCK_LEARNING_LOGS} />
        </div>
        
        <div className="flex flex-col gap-6">
          <div className="p-5 rounded-xl border border-line bg-surface flex flex-col gap-4">
            <h3 className="font-semibold text-ink">Optimization Status</h3>
            
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-ink-3">Learning Status</span>
                <span className="flex items-center gap-1.5 text-success font-medium">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  Active
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-ink-3">Events Processed</span>
                <span className="font-mono text-ink">1,204</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-ink-3">Last Adjustment</span>
                <span className="text-ink">2 hours ago</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-ink-3">Model Confidence</span>
                <span className="font-mono text-primary font-medium">84.2%</span>
              </div>
            </div>

            <div className="mt-2 pt-4 border-t border-line">
              <p className="text-xs text-ink-3 leading-relaxed">
                The ICP Optimizer runs in the background, analyzing CRM outcomes (Won/Lost) and Outreach data (Replies/Meetings) to adjust the weights of your Demand Signifiers.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-purple-500/30 bg-gradient-to-b from-purple-500/10 to-transparent flex flex-col gap-3">
            <h3 className="font-semibold text-purple-400">Emergent Insights</h3>
            <ul className="space-y-3 text-sm text-ink-2">
              <li className="flex gap-2">
                <span className="text-purple-500">•</span>
                <span>Companies with <strong>"Build vs Buy"</strong> personas require 2x longer nurture sequences.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-500">•</span>
                <span><strong>New CRO hires</strong> result in a 34% higher meeting conversion rate within 90 days.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-500">•</span>
                <span>The signifier <strong>"Pain Point Alignment"</strong> is currently underweighted.</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
