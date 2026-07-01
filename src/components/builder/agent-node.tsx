import * as React from "react"
import { Handle, Position } from "@xyflow/react"
import { IconBolt, IconBrain, IconApi, IconMessage, IconDatabase } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

interface AgentNodeProps {
  data: {
    label: string;
    type: "trigger" | "llm" | "action" | "output";
    description?: string;
  }
}

export function AgentNode({ data }: AgentNodeProps) {
  const getIcon = () => {
    switch (data.type) {
      case "trigger": return <IconBolt className="w-5 h-5 text-warning" />
      case "llm": return <IconBrain className="w-5 h-5 text-primary" />
      case "action": return <IconApi className="w-5 h-5 text-info" />
      case "output": return <IconMessage className="w-5 h-5 text-leaf" />
      default: return <IconDatabase className="w-5 h-5 text-ink-3" />
    }
  }

  const getBorderColor = () => {
    switch (data.type) {
      case "trigger": return "border-warning/50"
      case "llm": return "border-primary/50"
      case "action": return "border-info/50"
      case "output": return "border-leaf/50"
      default: return "border-line"
    }
  }

  const getBgColor = () => {
    switch (data.type) {
      case "trigger": return "bg-warning/10"
      case "llm": return "bg-primary/10"
      case "action": return "bg-info/10"
      case "output": return "bg-leaf/10"
      default: return "bg-surface-hover"
    }
  }

  return (
    <div className={cn(
      "px-4 py-3 shadow-xl rounded-xl border bg-surface/90 backdrop-blur-sm min-w-[200px] transition-all hover:shadow-2xl hover:-translate-y-0.5",
      getBorderColor()
    )}>
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 bg-surface border-2 border-line" />
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className={cn("p-1.5 rounded-lg", getBgColor())}>
            {getIcon()}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-ink">{data.label}</span>
            <span className="text-[10px] font-mono text-ink-3 uppercase tracking-wider">{data.type}</span>
          </div>
        </div>
        {data.description && (
          <p className="text-xs text-ink-3 leading-snug">
            {data.description}
          </p>
        )}
      </div>

      <Handle type="source" position={Position.Right} className={cn("!w-3 !h-3 border-2 border-surface", getBgColor())} />
    </div>
  )
}
