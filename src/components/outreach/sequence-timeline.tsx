import * as React from "react"
import type { OutreachStep } from "@/lib/types"
import { IconMail, IconMailOpened, IconMessageReply, IconAlertCircle, IconClock, IconCheck, IconBrandLinkedin, IconBrandWhatsapp, IconMessage } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

interface SequenceTimelineProps {
  steps: OutreachStep[]
  className?: string
}

export function SequenceTimeline({ steps, className }: SequenceTimelineProps) {
  const getStepIcon = (status: OutreachStep["status"], channel: OutreachStep["channel"]) => {
    switch (status) {
      case "sent": 
        if (channel === "linkedin") return <IconBrandLinkedin className="w-4 h-4" />
        if (channel === "whatsapp") return <IconBrandWhatsapp className="w-4 h-4" />
        if (channel === "sms") return <IconMessage className="w-4 h-4" />
        return <IconMail className="w-4 h-4" />
      case "opened": return <IconMailOpened className="w-4 h-4" />
      case "replied": return <IconMessageReply className="w-4 h-4" />
      case "bounced": return <IconAlertCircle className="w-4 h-4" />
      case "draft": return <IconClock className="w-4 h-4" />
      default: return <IconCheck className="w-4 h-4" />
    }
  }

  const getStepColor = (status: OutreachStep["status"]) => {
    switch (status) {
      case "replied": return "bg-leaf/20 text-leaf border-leaf/30"
      case "opened": return "bg-primary/20 text-primary border-primary/30"
      case "sent": return "bg-info/20 text-info border-info/30"
      case "bounced": return "bg-danger/20 text-danger border-danger/30"
      case "draft": return "bg-surface-hover text-ink-3 border-line"
      default: return "bg-surface-hover text-ink-3 border-line"
    }
  }

  const getLineColor = (status: OutreachStep["status"]) => {
    switch (status) {
      case "replied": return "bg-leaf/30"
      case "opened": return "bg-primary/30"
      case "sent": return "bg-info/30"
      case "bounced": return "bg-danger/30"
      default: return "bg-line"
    }
  }

  const formatDate = (ts: number | null) => {
    if (!ts) return null
    return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {steps.map((step, i) => (
        <div key={step.id} className="flex gap-4">
          {/* Timeline connector */}
          <div className="flex flex-col items-center shrink-0">
            <div className={cn("w-8 h-8 rounded-full border-2 flex items-center justify-center", getStepColor(step.status))}>
              {getStepIcon(step.status, step.channel)}
            </div>
            {i < steps.length - 1 && (
              <div className={cn("w-0.5 flex-1 min-h-8", getLineColor(step.status))} />
            )}
          </div>

          {/* Step Content */}
          <div className="flex-1 pb-6 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-ink-3 uppercase tracking-wider">Step {step.stepNumber}</span>
              <span className={cn(
                "text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border",
                getStepColor(step.status)
              )}>
                {step.status}
              </span>
            </div>
            <h4 className="text-sm font-medium text-ink mb-1 truncate flex items-center gap-2">
              {step.channel === "linkedin" && <IconBrandLinkedin className="w-3.5 h-3.5 text-blue-500" />}
              {step.channel === "whatsapp" && <IconBrandWhatsapp className="w-3.5 h-3.5 text-emerald-500" />}
              {step.channel === "sms" && <IconMessage className="w-3.5 h-3.5 text-purple-500" />}
              {step.channel === "email" && <IconMail className="w-3.5 h-3.5 text-ink-3" />}
              {step.subject || "No Subject"}
            </h4>
            <p className="text-xs text-ink-3 line-clamp-2 leading-relaxed">{step.body.substring(0, 150)}...</p>
            
            {/* Timestamps */}
            <div className="flex items-center gap-4 mt-2 text-[10px] text-ink-3">
              {step.sentAt && <span>Sent {formatDate(step.sentAt)}</span>}
              {step.openedAt && <span className="text-primary">Opened {formatDate(step.openedAt)}</span>}
              {step.repliedAt && <span className="text-leaf">Replied {formatDate(step.repliedAt)}</span>}
              {step.scheduledFor && !step.sentAt && <span className="text-flame">Scheduled {formatDate(step.scheduledFor)}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
