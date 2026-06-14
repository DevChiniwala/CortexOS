import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StreamTerminal } from "@/components/stream/stream-terminal"
import { useStream, useCompanies } from "@/lib/hooks"
import { IconBrain, IconSearch, IconTrendingUp, IconMessage2, IconPlayerPlay } from "@tabler/icons-react"
import { motion } from "motion/react"

const AVAILABLE_AGENTS = [
  {
    id: "company_research",
    name: "Deep Researcher",
    description: "Performs exhaustive web & LinkedIn research on target accounts. Extracts tech stack, funding, pricing pages, and leadership changes.",
    icon: <IconSearch className="w-5 h-5" />,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "scoring",
    name: "Signal Scorer",
    description: "Evaluates raw research data against ICP heuristics. Calculates confidence scores and ranks accounts into Hot, Warm, or Nurture tiers.",
    icon: <IconTrendingUp className="w-5 h-5" />,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    id: "conversation",
    name: "Conversation Engine",
    description: "Synthesizes company and personal data into ultra-personalized outreach sequences. Drafts icebreakers based on recent signals.",
    icon: <IconMessage2 className="w-5 h-5" />,
    color: "text-success",
    bgColor: "bg-success/10",
  }
]

export default function Agents() {
  const { isStreaming, logs, startStream, stopStream, jobId } = useStream()
  const { companies } = useCompanies()
  
  const [selectedAgent, setSelectedAgent] = React.useState<string | null>(null)
  const [selectedCompany, setSelectedCompany] = React.useState<number | null>(null)

  const handleRunAgent = () => {
    if (!selectedAgent || !selectedCompany) return
    const company = companies.find(c => c.id === selectedCompany)
    if (!company) return
    startStream(selectedAgent, company.id, company.companyName)
  }

  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full h-full">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-display font-semibold tracking-tight text-ink">Agent Swarm</h1>
          <p className="text-ink-3">Monitor and orchestrate your autonomous workforce</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Available Agents & Trigger */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Manual Trigger</CardTitle>
              <CardDescription>Dispatch an agent directly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink-2">1. Select Agent</label>
                <select 
                  className="flex h-10 w-full rounded-lg border border-line bg-surface/50 px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none"
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
                <label className="text-sm font-medium text-ink-2">2. Target Company</label>
                <select 
                  className="flex h-10 w-full rounded-lg border border-line bg-surface/50 px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none"
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
                className="w-full mt-2" 
                disabled={!selectedAgent || !selectedCompany || isStreaming}
                onClick={handleRunAgent}
              >
                <IconPlayerPlay className="w-4 h-4 mr-2" />
                {isStreaming ? "Agent Running..." : "Dispatch Agent"}
              </Button>
            </CardContent>
          </Card>

          <h3 className="font-medium text-ink mt-2">Agent Roster</h3>
          <div className="flex flex-col gap-3">
            {AVAILABLE_AGENTS.map(agent => (
              <div key={agent.id} className="p-4 rounded-xl border border-line bg-surface/50 hover:bg-surface transition-colors flex gap-4">
                <div className={`shrink-0 w-10 h-10 rounded-lg ${agent.bgColor} ${agent.color} flex items-center justify-center`}>
                  {agent.icon}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-sm text-ink">{agent.name}</span>
                  <span className="text-xs text-ink-3 leading-relaxed">{agent.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Terminal */}
        <div className="lg:col-span-2">
          {isStreaming || logs.length > 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[600px]">
              <StreamTerminal 
                logs={logs} 
                isStreaming={isStreaming} 
                title={`Active Job: ${jobId || "Dispatching..."}`}
                onKill={stopStream}
                className="h-full"
              />
            </motion.div>
          ) : (
            <div className="h-[600px] flex flex-col items-center justify-center border-2 border-dashed border-line rounded-xl bg-surface/30">
              <IconBrain className="w-12 h-12 text-ink-3 mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-ink">No Active Jobs</h3>
              <p className="text-sm text-ink-3 max-w-sm text-center mt-2">
                The agent swarm is currently idle. Trigger a job manually or setup an orchestration flow to begin.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
