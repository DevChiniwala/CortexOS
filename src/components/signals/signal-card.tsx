import { Signal } from "@/lib/local-store"
import { Badge } from "@/components/ui/badge"
import { IconTrendingUp, IconBriefcase, IconCode, IconUsers, IconRocket, IconBuilding, IconExternalLink } from "@tabler/icons-react"
import { formatDistanceToNow } from "date-fns"

interface SignalCardProps {
  signal: Signal
  onClick?: () => void
}

export function SignalCard({ signal, onClick }: SignalCardProps) {
  const getSignalConfig = (type: string) => {
    switch (type) {
      case "hiring_surge": return { icon: <IconUsers className="w-4 h-4" />, color: "text-info", bg: "bg-info/10", label: "Hiring" }
      case "funding_round": return { icon: <IconTrendingUp className="w-4 h-4" />, color: "text-success", bg: "bg-success/10", label: "Funding" }
      case "tech_adoption": return { icon: <IconCode className="w-4 h-4" />, color: "text-primary", bg: "bg-primary/10", label: "Tech Stack" }
      case "leadership_change": return { icon: <IconBriefcase className="w-4 h-4" />, color: "text-warning", bg: "bg-warning/10", label: "Leadership" }
      case "expansion": return { icon: <IconRocket className="w-4 h-4" />, color: "text-primary", bg: "bg-primary/10", label: "Expansion" }
      case "partnership": return { icon: <IconBuilding className="w-4 h-4" />, color: "text-info", bg: "bg-info/10", label: "Partnership" }
      default: return { icon: <IconTrendingUp className="w-4 h-4" />, color: "text-ink-2", bg: "bg-surface-hover", label: "General" }
    }
  }

  const config = getSignalConfig(signal.type)
  const timeAgo = formatDistanceToNow(new Date(signal.detectedAt), { addSuffix: true })

  return (
    <div 
      className="group relative p-4 rounded-xl border border-line bg-surface/50 hover:bg-surface transition-all cursor-pointer overflow-hidden flex flex-col gap-3"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${config.bg} ${config.color}`}>
            {config.icon}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-ink">{signal.companyName}</span>
            <span className="text-xs text-ink-3">{timeAgo} &bull; via {signal.source}</span>
          </div>
        </div>
        <Badge variant="outline" className={`border-transparent ${config.bg} ${config.color} text-xs font-medium px-2 py-0.5`}>
          {config.label}
        </Badge>
      </div>

      <div className="flex flex-col gap-1">
        <h4 className="text-sm font-medium text-ink-2 group-hover:text-ink transition-colors">{signal.title}</h4>
        <p className="text-xs text-ink-3 leading-relaxed line-clamp-2">{signal.description}</p>
      </div>

      <div className="flex items-center justify-between pt-2 mt-auto border-t border-line/50">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium tracking-wide uppercase text-ink-3">Confidence</span>
          <div className="flex items-center gap-1">
            <div className="w-16 h-1.5 bg-surface-hover rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${signal.confidence > 90 ? 'bg-success' : signal.confidence > 70 ? 'bg-primary' : 'bg-warning'}`}
                style={{ width: `${signal.confidence}%` }}
              />
            </div>
            <span className="text-xs font-mono text-ink-2">{signal.confidence}%</span>
          </div>
        </div>
        <IconExternalLink className="w-3.5 h-3.5 text-ink-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
      </div>
    </div>
  )
}
