import * as React from "react"
import type { MeetingBooking } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { IconCalendarEvent, IconVideo, IconUsers, IconNotes } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MeetingCardProps {
  meeting: MeetingBooking
  className?: string
}

export function MeetingCard({ meeting, className }: MeetingCardProps) {
  // eslint-disable-next-line react-hooks/purity
  const isPast = meeting.scheduledAt < Date.now()

  return (
    <Card className={cn("overflow-hidden border-success/30 shadow-sm", className)}>
      <div className="px-4 py-3 border-b border-line bg-success/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-success/20 text-success flex items-center justify-center shrink-0">
            <IconCalendarEvent className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-ink">Meeting Booked Autonomously</span>
            <span className="text-xs text-ink-3">via CortexOS Scheduling Agent</span>
          </div>
        </div>
        <div className="px-2.5 py-1 rounded-full border border-success/30 bg-success/10 text-success text-xs font-semibold uppercase tracking-widest">
          {meeting.status}
        </div>
      </div>
      
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-ink-3 uppercase tracking-wider">Date & Time</span>
            <span className={cn("text-sm font-medium", isPast ? "text-ink-3" : "text-ink")}>
              {new Date(meeting.scheduledAt).toLocaleString(undefined, { 
                weekday: 'short', month: 'short', day: 'numeric', 
                hour: 'numeric', minute: '2-digit', timeZoneName: 'short' 
              })}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-ink-3 uppercase tracking-wider">Attendees</span>
            <div className="flex items-center gap-1.5 text-sm font-medium text-ink">
              <IconUsers className="w-4 h-4 text-ink-3" />
              {meeting.contactName} ({meeting.companyName})
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 p-3 bg-surface border border-line rounded-lg">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-2 uppercase tracking-widest">
            <IconNotes className="w-4 h-4" /> Meeting Context
          </div>
          <p className="text-sm text-ink leading-relaxed">{meeting.notes}</p>
        </div>

        {meeting.meetingLink && !isPast && (
          <Button className="w-full bg-success text-success-foreground hover:bg-success/90">
            <IconVideo className="w-4 h-4 mr-2" />
            Join Meeting
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
