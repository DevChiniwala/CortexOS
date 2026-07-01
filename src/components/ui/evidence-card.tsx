import * as React from "react"
import { TrustBadge, CorroborationPill } from "./trust-badge"
import { IconChevronDown, IconExternalLink } from "@tabler/icons-react"
import { motion, AnimatePresence } from "motion/react"

interface EvidenceCardProps {
  claim: string
  quote: string
  sourceUrl: string
  matchType: "exact" | "normalized" | "fuzzy" | "unverified"
  confidence: number
  sourceCount?: number
  agentName?: string
}

export function EvidenceCard({ 
  claim, 
  quote, 
  sourceUrl, 
  matchType, 
  confidence, 
  sourceCount = 1,
  agentName 
}: EvidenceCardProps) {
  const [expanded, setExpanded] = React.useState(false)

  return (
    <div className="group rounded-lg border border-line bg-surface/50 hover:bg-surface-hover/30 transition-all">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 py-3 flex items-start gap-3"
      >
        <IconChevronDown 
          className={`w-4 h-4 text-ink-3 shrink-0 mt-0.5 transition-transform ${expanded ? "rotate-0" : "-rotate-90"}`} 
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-ink leading-relaxed">{claim}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <TrustBadge matchType={matchType} confidence={confidence} />
            {sourceCount > 1 && <CorroborationPill sourceCount={sourceCount} />}
            {agentName && (
              <span className="text-[10px] font-medium text-ink-3 uppercase tracking-wider">{agentName}</span>
            )}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pl-11 space-y-3">
              <div className="rounded-md bg-bg/50 border border-line/50 p-3">
                <div className="text-[10px] font-semibold tracking-widest text-ink-3 uppercase mb-1.5">Verbatim Quote</div>
                <p className="text-xs text-ink-2 leading-relaxed italic">"{quote}"</p>
              </div>
              <a 
                href={sourceUrl} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-info hover:text-info/80 transition-colors"
              >
                <IconExternalLink className="w-3.5 h-3.5" />
                {sourceUrl.replace(/^https?:\/\//, '').split('/')[0]}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
