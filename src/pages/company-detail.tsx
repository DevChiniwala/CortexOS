import * as React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useCompanies, useContacts, useCompanyMutations, useStream } from "@/lib/hooks"
import { Button } from "@/components/ui/button"

import { StreamTerminal } from "@/components/stream/stream-terminal"
import { IconArrowLeft, IconCheck, IconX, IconBrandLinkedin, IconWorld, IconMapPin, IconChartBar } from "@tabler/icons-react"
import { motion } from "motion/react"

export default function CompanyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { companies, isLoading: companiesLoading } = useCompanies()
  const { contacts } = useContacts()
  const { updateCompanyStatus } = useCompanyMutations()
  const { isStreaming, logs, startStream, stopStream } = useStream()

  const [activeTab, setActiveTab] = React.useState<"company" | "people" | "score">("score")
  const [researchDepth, setResearchDepth] = React.useState<"light" | "standard" | "deep">("deep")

  const company = companies.find(c => c.id === Number(id))
  const companyContacts = contacts.filter(c => c.companyId === Number(id))

  if (companiesLoading) {
    return <div className="p-8 text-ink-3">Loading company details...</div>
  }

  if (!company) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-medium text-ink">Company not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/companies")}>
          Back to Companies
        </Button>
      </div>
    )
  }

  const score = company.score?.totalScore
  const tier = company.score?.tier
  const requirements = company.score?.requirementResults || []
  const signifiers = company.score?.scoreBreakdown || []

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* Header */}
      <div className="px-8 py-6 border-b border-line flex items-center gap-4 bg-surface/30 backdrop-blur-sm shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate("/companies")} className="shrink-0">
          <IconArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex flex-col gap-1">
          <div className="text-ink-3 text-xs font-semibold tracking-widest uppercase">Workspace / Companies</div>
          <h1 className="text-2xl font-display font-medium text-ink tracking-tight">{company.companyName}</h1>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          <div className="max-w-4xl mx-auto space-y-10">
            
            {(isStreaming || logs.length > 0) && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                <StreamTerminal 
                  logs={logs} 
                  isStreaming={isStreaming} 
                  title={`Deep Researcher: ${company.companyName}`}
                  onKill={stopStream}
                />
              </motion.div>
            )}

            {/* Research Depth Card */}
            <div className="border border-line rounded-xl overflow-hidden bg-surface p-1">
              <div className="px-4 py-3 border-b border-line/50 flex items-center justify-between">
                <span className="text-xs font-semibold tracking-widest text-ink-3 uppercase">Research Depth</span>
                <span className="text-xs text-ink-3">per-run</span>
              </div>
              <div className="grid grid-cols-3 gap-2 p-2">
                {[
                  { id: "light", name: "Light", agents: "1 Agent", desc: "Single Opus pass — fast snapshot of the company." },
                  { id: "standard", name: "Standard", agents: "5 + Verifier", desc: "Parallel specialists for pain, triggers, tech & buyer map." },
                  { id: "deep", name: "Deep", agents: "8 + Verifier", desc: "Full swarm — adds business model, competitive, growth." }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setResearchDepth(mode.id as "light" | "standard" | "deep")}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      researchDepth === mode.id 
                        ? "border-flame bg-flame/5 shadow-sm" 
                        : "border-transparent hover:bg-surface-hover hover:border-line"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${researchDepth === mode.id ? "bg-flame" : "bg-line"}`} />
                        <span className={`font-medium ${researchDepth === mode.id ? "text-flame" : "text-ink"}`}>{mode.name}</span>
                      </div>
                      <span className="text-[10px] uppercase tracking-widest text-ink-3 font-semibold">{mode.agents}</span>
                    </div>
                    <p className="text-xs text-ink-2 leading-relaxed">{mode.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-line">
              {[
                { id: "company", label: "Company" },
                { id: "people", label: `People (${companyContacts.length})` },
                { id: "score", label: `Score (${score || '-'})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "company" | "people" | "score")}
                  className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
                    activeTab === tab.id 
                      ? "border-ink text-ink" 
                      : "border-transparent text-ink-3 hover:text-ink-2 hover:border-line"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <div className="ml-auto pb-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    updateCompanyStatus(company.id, "in_progress");
                    startStream("company_research", company.id, company.companyName);
                  }}
                  disabled={isStreaming}
                >
                  <IconBrandLinkedin className="w-4 h-4 mr-2" /> Score
                </Button>
              </div>
            </div>

            {/* Tab Content: Score */}
            {activeTab === "score" && company.score && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                {/* Score Header */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-baseline gap-3">
                    <span className={`text-5xl font-display font-medium ${
                      tier === "hot" ? "text-flame" : 
                      tier === "warm" ? "text-flame-2" : 
                      tier === "nurture" ? "text-leaf" : "text-ink-3"
                    }`}>
                      {score}
                    </span>
                    <span className="text-2xl font-display capitalize" style={{ color: 
                      tier === "hot" ? "var(--color-flame)" : 
                      tier === "warm" ? "var(--color-flame-2)" : 
                      tier === "nurture" ? "var(--color-leaf)" : "var(--color-ink-3)"
                    }}>
                      {tier}
                    </span>
                  </div>
                  <div className="flex gap-1 h-3">
                    {/* Visual bar chart out of 10 blocks */}
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className={`flex-1 rounded-sm ${
                        i < Math.round((score || 0) / 10) 
                          ? tier === "hot" ? "bg-flame" : tier === "warm" ? "bg-flame-2" : "bg-leaf"
                          : "bg-line"
                      }`} />
                    ))}
                  </div>
                  <div className="text-sm text-ink-2 font-medium flex items-center justify-between">
                    {/* eslint-disable-next-line react-hooks/purity */}
                    <span>{company.score.passesRequirements ? "All requirements passed" : "Requirements failed"} - Scored {new Date(company.score.scoredAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Required Characteristics */}
                <div className="space-y-6">
                  <h3 className="text-sm font-semibold tracking-widest text-ink-3 uppercase border-b border-line pb-2">Required Characteristics</h3>
                  <div className="grid gap-6">
                    {requirements.map(req => (
                      <div key={req.id} className="flex gap-4 items-start">
                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${req.passed ? "bg-leaf/20 text-leaf" : "bg-danger/20 text-danger"}`}>
                          {req.passed ? <IconCheck className="w-3.5 h-3.5" /> : <IconX className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex flex-col gap-1">
                          <h4 className="font-medium text-ink">{req.name}</h4>
                          <p className="text-sm text-ink-2 leading-relaxed">{req.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Demand Signifiers */}
                <div className="space-y-6">
                  <h3 className="text-sm font-semibold tracking-widest text-ink-3 uppercase border-b border-line pb-2">Demand Signifiers</h3>
                  <div className="grid gap-8">
                    {signifiers.map(sig => (
                      <div key={sig.id} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-ink">{sig.name}</h4>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-ink-3 font-mono">x{sig.score}</span>
                            <div className="flex gap-0.5 h-3 w-24">
                              {[...Array(10)].map((_, i) => (
                                <div key={i} className={`flex-1 rounded-sm ${i < sig.score ? "bg-flame" : "bg-line"}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-ink-2 leading-relaxed">{sig.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {!company.score && activeTab === "score" && (
              <div className="py-20 text-center">
                <IconChartBar className="w-12 h-12 text-line mx-auto mb-4" />
                <h3 className="text-lg font-medium text-ink">No Score Data</h3>
                <p className="text-ink-3 mt-2">Run the Deep Researcher agent to generate a score.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 border-l border-line bg-surface/30 p-8 flex flex-col gap-8 shrink-0 overflow-y-auto">
          {/* Top Score Summary */}
          <div className="space-y-3">
            <div className="text-xs font-semibold tracking-widest text-ink-3 uppercase">Score</div>
            {score ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-display font-medium ${
                      tier === "hot" ? "text-flame" : 
                      tier === "warm" ? "text-flame-2" : 
                      tier === "nurture" ? "text-leaf" : "text-ink-3"
                    }`}>
                    {score}
                  </span>
                  <span className={`text-sm font-bold uppercase ${
                      tier === "hot" ? "text-flame" : 
                      tier === "warm" ? "text-flame-2" : 
                      tier === "nurture" ? "text-leaf" : "text-ink-3"
                    }`}>
                    {tier}
                  </span>
                </div>
                <div className="flex gap-1 h-2">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className={`flex-1 rounded-sm ${
                      i < Math.round((score || 0) / 10) 
                        ? tier === "hot" ? "bg-flame" : tier === "warm" ? "bg-flame-2" : "bg-leaf"
                        : "bg-line"
                    }`} />
                  ))}
                </div>
                <div className="text-xs text-ink-3 font-medium">
                  {company.score?.passesRequirements ? "2/2 requirements" : "Failed requirements"}
                </div>
              </>
            ) : (
              <div className="text-ink-3 text-sm">Not scored</div>
            )}
          </div>

          <div className="space-y-6">
            <div className="text-xs font-semibold tracking-widest text-ink-3 uppercase">Company</div>
            
            <div className="space-y-1">
              <div className="text-xs text-ink-3">Research</div>
              <div className="flex items-center gap-2 text-sm text-ink-2">
                <IconCheck className="w-4 h-4 text-leaf" /> Completed
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-ink-3">Industry</div>
              <div className="text-sm text-ink-2 font-medium">{company.industry || "Unknown"}</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-ink-3">Location</div>
              <div className="flex gap-2 text-sm text-ink-2 mt-1">
                <IconMapPin className="w-4 h-4 text-ink-3 shrink-0" />
                <span>{[company.city, company.state, company.country].filter(Boolean).join(", ") || "Unknown"}</span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-line">
              <div className="text-xs font-semibold tracking-widest text-ink-3 uppercase">Links</div>
              {company.website && (
                <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-ink-2 hover:text-ink transition-colors">
                  <IconWorld className="w-4 h-4 text-ink-3" /> {company.website.replace(/^https?:\/\//, '')}
                </a>
              )}
              {company.companyLinkedinUrl && (
                <a href={company.companyLinkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-ink-2 hover:text-ink transition-colors">
                  <IconBrandLinkedin className="w-4 h-4 text-ink-3" /> LinkedIn
                </a>
              )}
            </div>

            <div className="pt-4 border-t border-line">
              <div className="flex items-center gap-2 text-xs text-ink-3">
                <IconCheck className="w-3.5 h-3.5" /> 
                {/* eslint-disable-next-line react-hooks/purity */}
                Researched {new Date(company.researchedAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
