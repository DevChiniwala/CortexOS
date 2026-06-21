import * as React from "react"
import type { EmailReply } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { IconMessageCircle, IconBrain, IconCheck, IconX, IconCalendarEvent, IconClock } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

interface ReplyCardProps {
  reply: EmailReply
  className?: string
}

export function ReplyCard({ reply, className }: ReplyCardProps) {
  const getIntentColor = (intent: EmailReply["intent"]) => {
    switch (intent) {
      case "interested": return "bg-leaf/20 text-leaf border-leaf/30"
      case "meeting_request": return "bg-flame/20 text-flame border-flame/30"
      case "not_now": return "bg-warning/20 text-warning border-warning/30"
      case "objection": return "bg-warning/20 text-warning border-warning/30"
      case "unsubscribe": return "bg-danger/20 text-danger border-danger/30"
      case "wrong_person": return "bg-info/20 text-info border-info/30"
      case "auto_reply": return "bg-surface-hover text-ink-3 border-line"
      default: return "bg-surface-hover text-ink-3 border-line"
    }
  }

  const getIntentIcon = (intent: EmailReply["intent"]) => {
    switch (intent) {
      case "interested": return <IconCheck className="w-4 h-4" />
      case "meeting_request": return <IconCalendarEvent className="w-4 h-4" />
      case "not_now": return <IconClock className="w-4 h-4" />
      case "objection": return <IconBrain className="w-4 h-4" />
      case "unsubscribe": return <IconX className="w-4 h-4" />
      default: return <IconMessageCircle className="w-4 h-4" />
    }
  }

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
  }

  return (
    <Card className={cn("overflow-hidden border-primary/30 shadow-sm", className)}>
      <div className="px-4 py-3 border-b border-line bg-surface/50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-ink">{reply.contactName} ({reply.companyName})</span>
          <span className="text-xs text-ink-3">{formatDate(reply.receivedAt)}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-ink-3 font-mono">Confidence: {Math.round(reply.confidence * 100)}%</span>
          <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold uppercase tracking-widest", getIntentColor(reply.intent))}>
            {getIntentIcon(reply.intent)}
            {reply.intent.replace("_", " ")}
          </div>
        </div>
      </div>
      <CardContent className="p-4 space-y-4">
        <div className="bg-bg border border-line rounded-lg p-3">
          <h4 className="text-sm font-medium text-ink mb-2">Subject: {reply.subject}</h4>
          <p className="text-sm text-ink-2 whitespace-pre-wrap font-serif leading-relaxed">{reply.body}</p>
        </div>
        
        <div className="flex items-start gap-3 bg-primary/5 rounded-lg p-3 border border-primary/20">
          <IconBrain className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">AI Suggested Action</span>
            <p className="text-sm text-ink">{reply.suggestedAction}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
