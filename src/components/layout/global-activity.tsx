import * as React from "react"
import { localGetActivity, type ActivityItem } from "@/lib/local-store"
import { formatDistanceToNow } from "date-fns"
import { IconBuilding, IconUser, IconRadar, IconPlayerPlay, IconCircleCheck, IconRobot, IconX, IconActivity } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "motion/react"

interface GlobalActivityProps {
  isOpen: boolean
  onClose: () => void
}

export function GlobalActivity({ isOpen, onClose }: GlobalActivityProps) {
  const [activities, setActivities] = React.useState<ActivityItem[]>([])

  React.useEffect(() => {
    const fetch = () => setActivities(localGetActivity())
    fetch()
    const interval = setInterval(fetch, 1500)
    return () => clearInterval(interval)
  }, [])

  const getIcon = (type: string) => {
    if (type.includes("company")) return <IconBuilding className="w-3.5 h-3.5 text-primary" />
    if (type.includes("contact") || type.includes("person")) return <IconUser className="w-3.5 h-3.5 text-info" />
    if (type.includes("signal")) return <IconRadar className="w-3.5 h-3.5 text-success" />
    if (type.includes("job") || type.includes("agent")) return <IconPlayerPlay className="w-3.5 h-3.5 text-warning" />
    return <IconCircleCheck className="w-3.5 h-3.5 text-ink-3" />
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[420px] bg-surface border-l border-line z-50 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-line">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <IconActivity className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-ink">Global Activity</h2>
                  <p className="text-xs text-ink-3">Real-time workspace feed</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-hover transition-colors text-ink-3 hover:text-ink">
                <IconX className="w-5 h-5" />
              </button>
            </div>

            {/* Online Team Members */}
            <div className="px-6 py-4 border-b border-line flex items-center gap-3">
              <span className="text-xs font-semibold text-ink-3 uppercase tracking-wider mr-1">Online</span>
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-[10px] font-bold border-2 border-surface ring-2 ring-success ring-offset-1 ring-offset-surface">D</div>
                <div className="w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center text-white text-[10px] font-bold border-2 border-surface ring-2 ring-success ring-offset-1 ring-offset-surface">M</div>
              </div>
              <div className="flex -space-x-2 ml-2">
                <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold border-2 border-surface opacity-40">S</div>
              </div>
              <span className="text-[10px] text-ink-3 ml-auto">2 online • 1 offline</span>
            </div>

            {/* Activity Stream */}
            <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
              {activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <IconActivity className="w-10 h-10 text-ink-3 mb-3 opacity-30" />
                  <p className="text-sm text-ink-3">No activity yet. Start researching companies to populate the feed.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {activities.map((activity, i) => (
                    <motion.div
                      key={activity.id}
                      initial={i === 0 ? { opacity: 0, y: -5 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-hover/50 transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full border border-line bg-bg flex items-center justify-center shrink-0 mt-0.5">
                        {getIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        {activity.actor && (
                          <div className="flex items-center gap-1.5 mb-0.5">
                            {activity.actor.type === "agent" ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-purple-400">
                                <IconRobot className="w-3 h-3" />
                                {activity.actor.name}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] font-semibold text-ink-2">
                                <span className={cn(
                                  "w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold text-white",
                                  activity.actor.avatar === "D" ? "bg-primary" : activity.actor.avatar === "S" ? "bg-emerald-500" : "bg-rose-500"
                                )}>
                                  {activity.actor.avatar}
                                </span>
                                {activity.actor.name}
                              </span>
                            )}
                          </div>
                        )}
                        <p className="text-sm text-ink leading-snug truncate">{activity.message}</p>
                        <span className="text-[10px] text-ink-3 font-mono">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
