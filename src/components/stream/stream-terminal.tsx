import * as React from "react"
import { IconTerminal2, IconPlayerStop, IconCircleDashed } from "@tabler/icons-react"
import { useStreamPanelStore } from "@/lib/store/stream-panel-store"
import { getJobLogs } from "@/lib/ipc"
import { JobLog } from "@/lib/types"

interface StreamTerminalProps {
  jobId: string
  isActive?: boolean
}

export function StreamTerminal({ jobId, isActive = false }: StreamTerminalProps) {
  const [logs, setLogs] = React.useState<JobLog[]>([])
  const [isPolling, setIsPolling] = React.useState(isActive)
  const bottomRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  // Poll for logs if active
  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    
    const fetchLogs = async () => {
      try {
        const newLogs = await getJobLogs(jobId)
        setLogs(newLogs)
      } catch (e) {
        console.error("Failed to fetch logs", e)
      }
    }

    fetchLogs()

    if (isPolling) {
      interval = setInterval(fetchLogs, 1000)
    }

    return () => clearInterval(interval)
  }, [jobId, isPolling])

  return (
    <div className="flex flex-col h-full bg-surface-hover rounded-xl border border-line overflow-hidden font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-line bg-surface/50">
        <div className="flex items-center gap-2 text-ink-2">
          <IconTerminal2 className="w-4 h-4" />
          <span>Agent Stream [Job: {jobId.split('-')[0]}]</span>
        </div>
        <div className="flex items-center gap-3">
          {isActive ? (
            <span className="flex items-center gap-1.5 text-primary">
              <IconCircleDashed className="w-3 h-3 animate-spin" />
              Running
            </span>
          ) : (
            <span className="text-ink-3">Completed</span>
          )}
          {isActive && (
            <button className="text-danger hover:text-danger/80 transition-colors">
              <IconPlayerStop className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Terminal Output */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 text-ink-2">
        {logs.length === 0 ? (
          <div className="opacity-50 italic">Initializing agent workspace...</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="flex gap-3 hover:bg-surface/50 px-2 py-0.5 rounded -mx-2 transition-colors">
              <span className="text-ink-3 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
              <span className={
                log.logType === "ERROR" || log.source === "stderr" ? "text-danger" : 
                log.logType === "WARN" ? "text-flame" : 
                log.logType === "INFO" && log.content.includes("success") ? "text-success" : ""
              }>
                {log.content}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
