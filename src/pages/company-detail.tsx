import * as React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useCompanies, useContacts, useCompanyMutations, useStream } from "@/lib/hooks"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StreamTerminal } from "@/components/stream/stream-terminal"
import { IconArrowLeft, IconBuilding, IconWorld, IconMapPin, IconUsers, IconBrain, IconBrandLinkedin, IconChartBar, IconCheck, IconX } from "@tabler/icons-react"
import { motion } from "motion/react"

export default function CompanyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { companies, isLoading: companiesLoading } = useCompanies()
  const { contacts } = useContacts()
  const { updateCompanyStatus } = useCompanyMutations()
  const { isStreaming, logs, startStream, stopStream } = useStream()

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

  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full h-full">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/companies")}>
            <IconArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-display font-semibold tracking-tight text-ink">{company.companyName}</h1>
              {score && (
                <Badge variant={score > 80 ? "hot" : score > 50 ? "warm" : "default"} className="text-sm px-2 py-0.5">
                  Score: {score}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-ink-3 text-sm">
              {company.website && (
                <span className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer">
                  <IconWorld className="w-4 h-4" /> {company.website.replace(/^https?:\/\//, '')}
                </span>
              )}
              {company.industry && (
                <span className="flex items-center gap-1.5">
                  <IconBuilding className="w-4 h-4" /> {company.industry}
                </span>
              )}
              {(company.city || company.country) && (
                <span className="flex items-center gap-1.5">
                  <IconMapPin className="w-4 h-4" /> {[company.city, company.state, company.country].filter(Boolean).join(", ")}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => window.open(company.linkedinUrl || `https://linkedin.com/company/${company.companyName.toLowerCase().replace(/\s+/g, '-')}`)}>
            <IconBrandLinkedin className="w-4 h-4 mr-2" /> LinkedIn
          </Button>
          <Button 
            onClick={() => {
              updateCompanyStatus(company.id, "in_progress");
              startStream("company_research", company.id, company.companyName);
            }}
            disabled={isStreaming}
          >
            <IconBrain className="w-4 h-4 mr-2" /> {isStreaming ? "Researching..." : "Start Deep Research"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Intelligence */}
        <div className="lg:col-span-2 space-y-6">
          {(isStreaming || logs.length > 0) && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="h-80">
              <StreamTerminal 
                logs={logs} 
                isStreaming={isStreaming} 
                title={`Deep Researcher: ${company.companyName}`}
                onKill={stopStream}
                className="h-full"
              />
            </motion.div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Cortex Intelligence Summary</CardTitle>
              <CardDescription>Synthesized from web & LinkedIn research</CardDescription>
            </CardHeader>
            <CardContent>
              {company.companyProfile ? (
                <div className="prose prose-invert prose-sm max-w-none text-ink-2">
                  {company.companyProfile}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-line rounded-xl">
                  <IconBrain className="w-8 h-8 text-ink-3 mb-3 opacity-50" />
                  <h3 className="text-base font-medium text-ink">No Research Data</h3>
                  <p className="text-sm text-ink-3 mt-1 max-w-md">Run the Deep Researcher agent to automatically gather funding, tech stack, and strategic insights for this company.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={() => {
                      updateCompanyStatus(company.id, "in_progress");
                      startStream("company_research", company.id, company.companyName);
                    }}
                    disabled={isStreaming}
                  >
                    Run Agent Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle>Buying Signals & Scoring</CardTitle>
                <CardDescription>Evaluation against active ICP heuristics</CardDescription>
              </div>
              <IconChartBar className="w-5 h-5 text-ink-3" />
            </CardHeader>
            <CardContent>
              {company.score ? (
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    {company.score.scoreBreakdown.map((breakdown, i) => (
                      <div key={i} className="p-3 rounded-lg bg-surface-hover border border-line flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-ink">{breakdown.name}</span>
                          <span className="text-xs font-mono text-primary">+{breakdown.weightedScore}</span>
                        </div>
                        <p className="text-xs text-ink-3 line-clamp-2">{breakdown.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-ink-3 text-center py-8">
                  Company has not been scored yet. Run the Signal Scorer agent.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Contacts & Metadata */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Key Contacts</CardTitle>
              <Badge variant="secondary">{companyContacts.length}</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mt-4">
                {companyContacts.length > 0 ? (
                  companyContacts.map(contact => (
                    <div 
                      key={contact.id} 
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
                      onClick={() => navigate(`/contacts/${contact.id}`)}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-xs">
                        {contact.firstName[0]}{contact.lastName[0]}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium text-ink truncate">{contact.firstName} {contact.lastName}</span>
                        <span className="text-xs text-ink-3 truncate">{contact.title || "No title"}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-ink-3 text-center py-4">No contacts found.</div>
                )}
                <Button variant="outline" className="w-full mt-2 text-xs" onClick={() => navigate("/contacts")}>
                  <IconUsers className="w-4 h-4 mr-2" /> Find Contacts
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>CRM Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between items-center border-b border-line pb-2">
                <span className="text-ink-3">Status</span>
                <span className="capitalize text-ink-2">{company.researchStatus.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between items-center border-b border-line pb-2">
                <span className="text-ink-3">Pipeline Stage</span>
                <span className="capitalize text-ink-2">{company.userStatus || "New"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-line pb-2">
                <span className="text-ink-3">Added On</span>
                <span className="text-ink-2">{new Date(company.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
