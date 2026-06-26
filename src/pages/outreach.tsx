import * as React from "react"
import { MOCK_SEQUENCES, MOCK_REPLIES, MOCK_MEETINGS, getMockOutreachStats } from "@/lib/mock-outreach"
import { OutreachSequence } from "@/lib/types"
import { SequenceTimeline } from "@/components/outreach/sequence-timeline"
import { ReplyCard } from "@/components/outreach/reply-card"
import { MeetingCard } from "@/components/outreach/meeting-card"
import { EmptyState } from "@/components/ui/empty-state"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { IconMail, IconMailOpened, IconMessageReply, IconCalendarEvent, IconSend, IconChevronRight, IconArrowLeft } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

export default function Outreach() {
  const [selectedSequenceId, setSelectedSequenceId] = React.useState<string | null>(null)
  const stats = getMockOutreachStats()

  const selectedSequence = MOCK_SEQUENCES.find(s => s.id === selectedSequenceId)

  const getStatusColor = (status: OutreachSequence["status"]) => {
    switch (status) {
      case "meeting_booked": return "bg-success/20 text-success border-success/30"
      case "replied": return "bg-leaf/20 text-leaf border-leaf/30"
      case "awaiting_reply": return "bg-primary/20 text-primary border-primary/30"
      case "sending": return "bg-info/20 text-info border-info/30"
      case "bounced": return "bg-danger/20 text-danger border-danger/30"
      default: return "bg-surface-hover text-ink-3 border-line"
    }
  }

  const getStatusIcon = (status: OutreachSequence["status"]) => {
    switch (status) {
      case "meeting_booked": return <IconCalendarEvent className="w-3.5 h-3.5" />
      case "replied": return <IconMessageReply className="w-3.5 h-3.5" />
      case "awaiting_reply": return <IconMailOpened className="w-3.5 h-3.5" />
      case "sending": return <IconSend className="w-3.5 h-3.5" />
      default: return <IconMail className="w-3.5 h-3.5" />
    }
  }

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-line bg-surface/30 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2 text-ink-3 text-sm font-medium tracking-wide uppercase mb-4">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          02 — Execution
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-display font-medium text-ink tracking-tight">Autonomous Outreach</h1>
            <p className="text-ink-2 mt-1">Review sequences, handle replies, and track booked meetings.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => toast.success("All sequences paused")}>Pause All</Button>
            <Button onClick={() => toast.success("Sequence launched")}>Launch Sequence</Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mt-8">
          {[
            { label: "Emails Sent", value: stats.emailsSent, rate: "", icon: IconSend, color: "text-info" },
            { label: "Open Rate", value: `${stats.openRate}%`, rate: `${stats.emailsOpened} opened`, icon: IconMailOpened, color: "text-primary" },
            { label: "Reply Rate", value: `${stats.replyRate}%`, rate: `${stats.repliesReceived} replies`, icon: IconMessageReply, color: "text-leaf" },
            { label: "Meetings Booked", value: stats.meetingsBooked, rate: `${stats.meetingRate}% conversion`, icon: IconCalendarEvent, color: "text-success" }
          ].map((stat, i) => (
            <div key={i} className="flex flex-col gap-1 p-4 rounded-xl border border-line bg-surface/50">
              <div className="flex items-center gap-2 text-sm font-medium text-ink-3">
                <stat.icon className={cn("w-4 h-4", stat.color)} />
                {stat.label}
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-display font-medium text-ink">{stat.value}</span>
                <span className="text-xs text-ink-3">{stat.rate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Left Column: Sequence List */}
        <div className={cn(
          "w-full lg:w-1/2 xl:w-2/5 flex flex-col border-r border-line bg-surface/10 transition-transform duration-300",
          selectedSequenceId ? "hidden lg:flex" : "flex"
        )}>
          <div className="p-4 border-b border-line shrink-0 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink-2 tracking-wide uppercase">Active Sequences</h3>
            <span className="text-xs text-ink-3 font-mono">{MOCK_SEQUENCES.length} Total</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {MOCK_SEQUENCES.map(seq => (
              <div 
                key={seq.id}
                onClick={() => setSelectedSequenceId(seq.id)}
                className={cn(
                  "p-4 rounded-xl border transition-all cursor-pointer group",
                  selectedSequenceId === seq.id 
                    ? "border-primary bg-primary/5 shadow-sm" 
                    : "border-line bg-surface hover:border-primary/30"
                )}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-ink">{seq.contactName}</span>
                    <span className="text-xs text-ink-3">{seq.contactTitle} @ {seq.companyName}</span>
                  </div>
                  <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-widest", getStatusColor(seq.status))}>
                    {getStatusIcon(seq.status)}
                    {seq.status.replace("_", " ")}
                  </div>
                </div>
                {seq.signalTrigger && (
                  <div className="text-xs text-ink-2 mb-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-flame shrink-0" />
                    Trigger: <span className="italic">{seq.signalTrigger}</span>
                  </div>
                )}
                <div className="flex items-center justify-between mt-2 pt-3 border-t border-line/50">
                  <span className="text-xs text-ink-3 font-mono">Step {seq.steps.filter(s => s.status !== "draft").length} of {seq.steps.length}</span>
                  <div className="flex items-center text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    View Thread <IconChevronRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Sequence Detail */}
        <div className={cn(
          "absolute inset-0 bg-bg lg:static lg:flex-1 flex flex-col overflow-y-auto z-10 transition-transform duration-300",
          selectedSequenceId ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}>
          {selectedSequence ? (
            <div className="max-w-3xl mx-auto w-full p-8 space-y-8">
              <div className="flex items-center gap-4 lg:hidden mb-4">
                <Button variant="ghost" size="icon" onClick={() => setSelectedSequenceId(null)}>
                  <IconArrowLeft className="w-5 h-5" />
                </Button>
                <span className="font-medium text-ink">Back to Sequences</span>
              </div>

              <div className="flex items-center justify-between border-b border-line pb-4">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-display font-medium text-ink">{selectedSequence.contactName}</h2>
                  <div className="flex items-center gap-2 text-sm text-ink-3">
                    <span>{selectedSequence.contactTitle}</span>
                    <span>•</span>
                    <span className="font-medium">{selectedSequence.companyName}</span>
                    <span>•</span>
                    <span className="font-mono text-xs">{selectedSequence.contactEmail}</span>
                  </div>
                </div>
              </div>

              {selectedSequence.status === "meeting_booked" && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold tracking-widest text-ink-3 uppercase">Outcome</h3>
                  {MOCK_MEETINGS.filter(m => m.sequenceId === selectedSequence.id).map(m => (
                    <MeetingCard key={m.id} meeting={m} />
                  ))}
                </div>
              )}

              {selectedSequence.status === "replied" && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold tracking-widest text-ink-3 uppercase">Latest Reply Classification</h3>
                  {MOCK_REPLIES.filter(r => r.sequenceId === selectedSequence.id).map(r => (
                    <ReplyCard key={r.id} reply={r} />
                  ))}
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-xs font-semibold tracking-widest text-ink-3 uppercase">Sequence Timeline</h3>
                <div className="bg-surface/30 border border-line rounded-xl p-6">
                  <SequenceTimeline steps={selectedSequence.steps} />
                </div>
              </div>

            </div>
          ) : (
            <div className="hidden lg:flex flex-col items-center justify-center h-full text-center p-8">
              <IconMail className="w-12 h-12 text-line mb-4" />
              <h3 className="text-lg font-medium text-ink">No Sequence Selected</h3>
              <p className="text-ink-3 mt-2 max-w-sm">Select a sequence from the list to view the full outreach timeline, AI classifications, and meeting outcomes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
