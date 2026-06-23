import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StreamTerminal } from "@/components/stream/stream-terminal"
import { useStream, useCompanies } from "@/lib/hooks"
import { IconBrain, IconSearch, IconTrendingUp, IconMessage2, IconPlayerPlay, IconChevronRight, IconCircleCheck, IconClock, IconSend, IconRadar, IconHierarchy, IconTarget } from "@tabler/icons-react"
import { motion, AnimatePresence } from "motion/react"

const AVAILABLE_AGENTS = [
  {
    id: "company_research",
    name: "Deep Researcher",
    description: "Performs exhaustive web & LinkedIn research on target accounts. Extracts tech stack, funding, pricing pages, and leadership changes.",
    detail: "8 specialist workers + 1 verifier agent. Covers firmographics, technology, financial health, and org intelligence.",
    icon: <IconSearch className="w-5 h-5" />,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
    workers: 8,
  },
  {
    id: "scoring",
    name: "Signal Scorer",
    description: "Evaluates raw research data against ICP heuristics. Calculates confidence scores and ranks accounts into tiers.",
    detail: "Checks required characteristics, then scores 4 demand signifiers on a 0-10 scale with weighted totals.",
    icon: <IconTrendingUp className="w-5 h-5" />,
    color: "text-flame",
    bgColor: "bg-flame/10",
    borderColor: "border-flame/30",
    workers: 1,
  },
  {
    id: "conversation",
    name: "Conversation Engine",
    description: "Synthesizes company and personal data into ultra-personalized outreach sequences based on recent signals.",
    detail: "Generates icebreakers, value props, and soft CTAs anchored to real-time events for each contact.",
    icon: <IconMessage2 className="w-5 h-5" />,
    color: "text-leaf",
    bgColor: "bg-leaf/10",
    borderColor: "border-leaf/30",
    workers: 3,
  },
  {
    id: "outreach",
    name: "Outreach Execution",
    description: "Autonomously sends emails, tracks opens, classifies replies, and books meetings on your calendar.",
    detail: "3 specialist workers: SMTP dispatcher, Reply intent classifier (LLM), and Calendar coordinator.",
    icon: <IconSend className="w-5 h-5" />,
    color: "text-info",
    bgColor: "bg-info/10",
    borderColor: "border-info/30",
    workers: 3,
  },
  {
    id: "signals",
    name: "Intent Radar",
    description: "Continuously monitors target accounts for hiring surges, funding events, and tech stack changes.",
    detail: "4 concurrent spiders scraping LinkedIn, Crunchbase, BuiltWith, and Bombora Intent data.",
    icon: <IconRadar className="w-5 h-5" />,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    workers: 4,
  },
  {
    id: "persona",
    name: "Persona Mapper",
    description: "Builds out the buying committee, assigns buying roles, and calculates relationship strength.",
    detail: "Cross-references career history to identify past customers and shared connections.",
    icon: <IconHierarchy className="w-5 h-5" />,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/30",
    workers: 2,
  },
  {
    id: "icp",
    name: "ICP Optimizer",
    description: "Autonomously tunes your scoring algorithm by feeding back closed-won/lost deal data.",
    detail: "Statistical regression over 30-day cohorts to identify true conversion indicators.",
    icon: <IconTarget className="w-5 h-5" />,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    workers: 1,
  }
]

export default function Agents() {
  const { isStreaming, logs, startStream, stopStream, jobId } = useStream()
  const { companies } = useCompanies()
  
  const [selectedAgent, setSelectedAgent] = React.useState<string | null>(null)
  const [selectedCompany, setSelectedCompany] = React.useState<number | null>(null)
  const [recentRuns, setRecentRuns] = React.useState<{ agent: string; company: string; timestamp: number; status: "completed" | "error" }[]>([])

  const handleRunAgent = () => {
    if (!selectedAgent || !selectedCompany) return
    const company = companies.find(c => c.id === selectedCompany)
    if (!company) return
    startStream(selectedAgent, company.id, company.companyName)
  }

  // Track completed runs
  React.useEffect(() => {
    if (!isStreaming && jobId && logs.length > 0) {
      const agentName = AVAILABLE_AGENTS.find(a => a.id === selectedAgent)?.name || selectedAgent || "Agent"
      const companyName = companies.find(c => c.id === selectedCompany)?.companyName || "Unknown"
      const hasError = logs.some(l => l.type === "error")
      setRecentRuns(prev => [
        { agent: agentName, company: companyName, timestamp: Date.now(), status: hasError ? "error" : "completed" },
        ...prev.slice(0, 9)
      ])
    }
  }, [isStreaming])

  const selectedAgentDef = AVAILABLE_AGENTS.find(a => a.id === selectedAgent)

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-line bg-surface/30 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2 text-ink-3 text-sm font-medium tracking-wide uppercase mb-4">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          System Core — Agents
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-display font-medium text-ink tracking-tight">Agent Swarm</h1>
            <p className="text-ink-2 mt-1">Monitor and orchestrate your autonomous workforce</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2 text-ink-3">
              <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-primary animate-pulse' : 'bg-ink-3'}`} />
              {isStreaming ? "SYS_ACTIVE" : "SYS_ONLINE"}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Trigger + Agent Roster */}
          <div className="flex flex-col gap-8">
            {/* Manual Trigger Card */}
            <div className="border border-line rounded-xl overflow-hidden bg-surface">
              <div className="px-5 py-4 border-b border-line/50 bg-surface-hover/30">
                <h3 className="font-medium text-ink">Manual Trigger</h3>
                <p className="text-xs text-ink-3 mt-0.5">Dispatch an agent directly</p>
              </div>
              <div className="p-5 space-y-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-ink-2 tracking-wide">1. Select Agent</label>
                  <select 
                    className="flex h-10 w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none font-medium"
                    value={selectedAgent || ""}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    disabled={isStreaming}
                  >
                    <option value="" disabled>Select an agent...</option>
                    {AVAILABLE_AGENTS.map(agent => (
                      <option key={agent.id} value={agent.id}>{agent.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-ink-2 tracking-wide">2. Target Company</label>
                  <select 
                    className="flex h-10 w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none font-medium"
                    value={selectedCompany || ""}
                    onChange={(e) => setSelectedCompany(Number(e.target.value))}
                    disabled={isStreaming || companies.length === 0}
                  >
                    <option value="" disabled>Select a target...</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.companyName}</option>
                    ))}
                  </select>
                </div>

                <Button 
                  className="w-full mt-2 h-11 text-sm font-semibold" 
                  disabled={!selectedAgent || !selectedCompany || isStreaming}
                  onClick={handleRunAgent}
                >
                  <IconPlayerPlay className="w-4 h-4 mr-2" />
                  {isStreaming ? "Agent Running..." : "Dispatch Agent"}
                </Button>
              </div>
            </div>

            {/* Agent Roster */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold tracking-widest text-ink-3 uppercase px-1">Agent Roster</h3>
              {AVAILABLE_AGENTS.map(agent => (
                <button
                  key={agent.id}
                  onClick={() => !isStreaming && setSelectedAgent(agent.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedAgent === agent.id 
                      ? `${agent.borderColor} ${agent.bgColor} shadow-sm` 
                      : "border-line bg-surface/50 hover:bg-surface hover:border-line"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`shrink-0 w-10 h-10 rounded-lg ${agent.bgColor} ${agent.color} flex items-center justify-center`}>
                      {agent.icon}
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-ink">{agent.name}</span>
                        <span className="text-[10px] font-mono text-ink-3 bg-bg px-1.5 py-0.5 rounded border border-line">{agent.workers}w</span>
                      </div>
                      <span className="text-xs text-ink-3 leading-relaxed">{agent.description}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Recent Runs */}
            {recentRuns.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold tracking-widest text-ink-3 uppercase px-1">Recent Runs</h3>
                <div className="border border-line rounded-xl overflow-hidden divide-y divide-line/50 bg-surface/50">
                  {recentRuns.slice(0, 5).map((run, i) => (
                    <div key={i} className="px-4 py-3 flex items-center gap-3 text-sm">
                      {run.status === "completed" ? (
                        <IconCircleCheck className="w-4 h-4 text-leaf shrink-0" />
                      ) : (
                        <IconCircleCheck className="w-4 h-4 text-danger shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-ink font-medium truncate block">{run.agent}</span>
                        <span className="text-ink-3 text-xs">{run.company}</span>
                      </div>
                      <span className="text-[10px] text-ink-3 font-mono shrink-0">
                        {new Date(run.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Terminal */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <AnimatePresence mode="wait">
              {isStreaming || logs.length > 0 ? (
                <motion.div 
                  key="terminal"
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  className="h-[640px]"
                >
                  <StreamTerminal 
                    logs={logs} 
                    isStreaming={isStreaming} 
                    title={`Active Job: ${jobId || "Dispatching..."}`}
                    onKill={stopStream}
                    className="h-full"
                  />
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="h-[640px] flex flex-col items-center justify-center border border-dashed border-line rounded-xl bg-surface/20"
                >
                  <div className="w-16 h-16 rounded-2xl bg-surface border border-line flex items-center justify-center mb-6">
                    <IconBrain className="w-8 h-8 text-ink-3" />
                  </div>
                  <h3 className="text-lg font-medium text-ink">No Active Jobs</h3>
                  <p className="text-sm text-ink-3 max-w-md text-center mt-2 leading-relaxed">
                    The agent swarm is currently idle. Select an agent and a target company, then click <strong>Dispatch Agent</strong> to begin autonomous research.
                  </p>
                  <div className="flex items-center gap-6 mt-8 text-xs text-ink-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      Deep Researcher
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-flame" />
                      Signal Scorer
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-leaf" />
                      Conversation Engine
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Agent Detail Card — shown when an agent is selected */}
            {selectedAgentDef && !isStreaming && logs.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="border border-line rounded-xl bg-surface p-6"
              >
                <div className="flex items-start gap-4">
                  <div className={`shrink-0 w-12 h-12 rounded-xl ${selectedAgentDef.bgColor} ${selectedAgentDef.color} flex items-center justify-center`}>
                    {selectedAgentDef.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-ink">{selectedAgentDef.name}</h3>
                    <p className="text-sm text-ink-2 mt-1">{selectedAgentDef.detail}</p>
                    <div className="flex items-center gap-4 mt-4 text-xs text-ink-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-ink-2">{selectedAgentDef.workers}</span> parallel workers
                      </div>
                      <div className="flex items-center gap-1.5">
                        <IconClock className="w-3.5 h-3.5" />
                        ~15-30s simulated
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
