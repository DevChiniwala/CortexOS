import * as React from "react"
import { localGetActivity, type ActivityItem } from "@/lib/local-store"
import { formatDistanceToNow } from "date-fns"
import { IconBuilding, IconUser, IconRadar, IconPlayerPlay, IconCircleCheck } from "@tabler/icons-react"

export function ActivityFeed() {
  const [activities, setActivities] = React.useState<ActivityItem[]>([])

  React.useEffect(() => {
    // Poll local store occasionally since we don't have a strict listener for it
    const fetchActivities = () => setActivities(localGetActivity())
    fetchActivities()
    const interval = setInterval(fetchActivities, 2000)
    return () => clearInterval(interval)
  }, [])

  const getIcon = (type: string) => {
    if (type.includes("company")) return <IconBuilding className="w-4 h-4 text-primary" />
    if (type.includes("contact") || type.includes("person")) return <IconUser className="w-4 h-4 text-info" />
    if (type.includes("signal")) return <IconRadar className="w-4 h-4 text-success" />
    if (type.includes("job") || type.includes("agent")) return <IconPlayerPlay className="w-4 h-4 text-warning" />
    return <IconCircleCheck className="w-4 h-4 text-ink-3" />
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-8">
        <p className="text-sm text-ink-3 italic">No recent system activity.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 overflow-y-auto h-[400px] pr-2 custom-scrollbar">
      {activities.map((activity, i) => (
        <div key={activity.id} className="relative flex gap-4 pb-4">
          {/* Timeline Line */}
          {i !== activities.length - 1 && (
            <div className="absolute top-6 left-4 bottom-0 w-px bg-line" />
          )}
          
          <div className="relative z-10 w-8 h-8 rounded-full border border-line bg-surface flex items-center justify-center shrink-0">
            {getIcon(activity.type)}
          </div>
          
          <div className="flex flex-col pt-1.5">
            <span className="text-sm text-ink leading-snug">{activity.message}</span>
            <span className="text-xs text-ink-3 font-mono mt-0.5">
              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
