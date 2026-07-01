import { IconShieldCheck, IconShieldHalf, IconShieldQuestion, IconPencil } from "@tabler/icons-react"

type MatchType = "exact" | "normalized" | "fuzzy" | "unverified" | "manual"

interface TrustBadgeProps {
  matchType: MatchType
  confidence?: number
  size?: "sm" | "md"
  showLabel?: boolean
}

const config: Record<MatchType, { icon: typeof IconShieldCheck; label: string; color: string; bg: string }> = {
  exact: {
    icon: IconShieldCheck,
    label: "Verified",
    color: "text-leaf",
    bg: "bg-leaf/10 border-leaf/20",
  },
  normalized: {
    icon: IconShieldCheck,
    label: "Near Match",
    color: "text-info",
    bg: "bg-info/10 border-info/20",
  },
  fuzzy: {
    icon: IconShieldHalf,
    label: "Likely Match",
    color: "text-warning",
    bg: "bg-warning/10 border-warning/20",
  },
  unverified: {
    icon: IconShieldQuestion,
    label: "AI-Inferred",
    color: "text-ink-3",
    bg: "bg-surface-hover border-line",
  },
  manual: {
    icon: IconPencil,
    label: "Manual Entry",
    color: "text-ink-3",
    bg: "bg-surface-hover border-line",
  },
}

export function TrustBadge({ matchType, confidence, size = "sm", showLabel = true }: TrustBadgeProps) {
  const { icon: Icon, label, color, bg } = config[matchType] || config.unverified

  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4"
  const textSize = size === "sm" ? "text-[10px]" : "text-xs"
  const padding = size === "sm" ? "px-1.5 py-0.5" : "px-2 py-1"

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-semibold tracking-wide uppercase ${bg} ${color} ${textSize} ${padding}`}>
      <Icon className={iconSize} />
      {showLabel && <span>{label}</span>}
      {confidence !== undefined && confidence < 1.0 && (
        <span className="opacity-70">{Math.round(confidence * 100)}%</span>
      )}
    </span>
  )
}

export function CorroborationPill({ sourceCount }: { sourceCount: number }) {
  if (sourceCount <= 1) return null
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-purple-500/10 border border-purple-500/20 text-purple-400">
      <IconShieldCheck className="w-3 h-3" />
      Confirmed by {sourceCount} sources
    </span>
  )
}
