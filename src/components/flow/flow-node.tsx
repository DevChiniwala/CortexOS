import * as React from "react"
import { Handle, Position, NodeProps } from "@xyflow/react"
import { IconSearch, IconTrendingUp, IconMessage2, IconUsers, IconBrain, IconMail } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

import { Node } from "@xyflow/react"

export type CortexNodeData = Node<{
  label: string
  icon: string
  color: string
  description?: string
}, "cortexNode">

export function CortexNode({ data, selected }: NodeProps<CortexNodeData>) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "search": return <IconSearch className="w-5 h-5" />
      case "trending-up": return <IconTrendingUp className="w-5 h-5" />
      case "message": return <IconMessage2 className="w-5 h-5" />
      case "users": return <IconUsers className="w-5 h-5" />
      case "brain": return <IconBrain className="w-5 h-5" />
      case "mail": return <IconMail className="w-5 h-5" />
      default: return <IconBrain className="w-5 h-5" />
    }
  }

  const getColorClasses = (colorName: string) => {
    switch (colorName) {
      case "blue": return "text-[#00AEEF] bg-[#00AEEF]/10 border-[#00AEEF]/30"
      case "orange": return "text-[#FF5500] bg-[#FF5500]/10 border-[#FF5500]/30"
      case "yellow": return "text-[#FFB020] bg-[#FFB020]/10 border-[#FFB020]/30"
      case "green": return "text-[#00D084] bg-[#00D084]/10 border-[#00D084]/30"
      default: return "text-ink bg-surface-hover border-line"
    }
  }

  const colorClasses = getColorClasses(data.color)

  return (
    <div className={cn(
      "relative flex items-start gap-3 p-4 rounded-xl border bg-surface/90 backdrop-blur-sm min-w-[250px] shadow-sm transition-all hover:shadow-xl hover:-translate-y-0.5",
      selected ? "border-primary ring-2 ring-primary/20" : "border-line hover:border-line-hover"
    )}>
      {/* Input Handle */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-3 !h-3 bg-surface border-2 border-line rounded-full !top-[-6px]" 
      />

      <div className={cn("shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border", colorClasses)}>
        {getIcon(data.icon)}
      </div>
      
      <div className="flex flex-col gap-1 pr-2">
        <span className="text-sm font-semibold text-ink">{data.label}</span>
        {data.description && (
          <span className="text-xs text-ink-3 leading-snug">{data.description}</span>
        )}
      </div>

      {/* Output Handle */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-3 !h-3 bg-surface border-2 border-primary rounded-full !bottom-[-6px]" 
      />
    </div>
  )
}
