import * as React from "react"
import { useNavigate } from "react-router-dom"
import { useCompanies, useCompanyMutations } from "@/lib/hooks"
import { EmptyState } from "@/components/ui/empty-state"
import { IconBuilding, IconPlus, IconLayoutList, IconLayoutKanban, IconSearch, IconChevronRight } from "@tabler/icons-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

import { KanbanBoard } from "@/components/pipeline/kanban-board"
import { motion } from "motion/react"
import {  ScoringTier } from "@/lib/types"
import { AddCompanyModal } from "@/components/modals/add-company-modal"
import { ImportApolloModal } from "@/components/modals/import-apollo-modal"
import { IconCloudDownload } from "@tabler/icons-react"

export default function Companies() {
  const navigate = useNavigate()
  const { companies, isLoading } = useCompanies()
  const { updateCompanyStatus } = useCompanyMutations()
  const [view, setView] = React.useState<"list" | "board">("list")
  const [activeTier, setActiveTier] = React.useState<ScoringTier | "all">("all")
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [isApolloModalOpen, setIsApolloModalOpen] = React.useState(false)

  const handleStatusChange = async (companyId: number, status: string) => {
    try {
      await updateCompanyStatus(companyId, status)
    } catch (err) {
      console.error("Failed to update status", err)
    }
  }

  // Calculate tier counts
  const counts = {
    hot: companies.filter(c => c.score?.tier === "hot").length,
    warm: companies.filter(c => c.score?.tier === "warm").length,
    nurture: companies.filter(c => c.score?.tier === "nurture").length,
    filtered: companies.filter(c => c.score?.tier === "filtered").length,
    unscored: companies.filter(c => !c.score).length,
    all: companies.length
  }

  const filteredCompanies = companies.filter(c => {
    if (activeTier === "all") return true;
    if (activeTier === "unscored") return !c.score;
    return c.score?.tier === activeTier;
  })

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* Header Area */}
      <div className="px-8 pt-8 pb-4 border-b border-line flex flex-col gap-6 shrink-0 bg-surface/30 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-ink-3 text-sm font-medium tracking-wide uppercase">
          <span className="w-2 h-2 rounded-full bg-flame"></span>
          01 — Companies
        </div>
        
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-display font-medium text-ink tracking-tight flex items-baseline gap-2">
              Your <span className="text-flame italic pr-1">pipeline</span> at a glance.
            </h1>
            <p className="text-ink-2">Every account CortexOS has surfaced — grouped, scored, and ready to action.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="bg-bg text-ink-2" onClick={() => toast.info("Search focused")}>
              <IconSearch className="w-4 h-4 mr-2" />
              Find Leads
            </Button>
            <Button variant="outline" className="border-flame/30 text-flame hover:bg-flame/10" onClick={() => setIsApolloModalOpen(true)}>
              <IconCloudDownload className="w-4 h-4 mr-2" />
              Apollo Import
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <IconPlus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
            <div className="flex bg-surface p-1 rounded-lg border border-line ml-2">
              <button
                onClick={() => setView("list")}
                className={`p-1.5 rounded-md flex items-center justify-center transition-colors ${
                  view === "list" ? "bg-surface-hover text-ink shadow-sm" : "text-ink-3 hover:text-ink-2"
                }`}
              >
                <IconLayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("board")}
                className={`p-1.5 rounded-md flex items-center justify-center transition-colors ${
                  view === "board" ? "bg-surface-hover text-ink shadow-sm" : "text-ink-3 hover:text-ink-2"
                }`}
              >
                <IconLayoutKanban className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tiers Navigation */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-ink-3 uppercase tracking-wider mr-2">Tiers</span>
            {(['hot', 'warm', 'nurture', 'filtered', 'unscored'] as const).map(tier => (
              <button
                key={tier}
                onClick={() => setActiveTier(activeTier === tier ? "all" : tier)}
                className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border flex items-center gap-2 transition-all ${
                  activeTier === tier 
                    ? tier === 'hot' ? 'bg-flame text-white border-flame' 
                      : tier === 'warm' ? 'bg-flame-2 text-white border-flame-2'
                      : tier === 'nurture' ? 'bg-leaf text-white border-leaf'
                      : 'bg-ink-2 text-bg border-ink-2'
                    : 'bg-surface hover:bg-surface-hover text-ink-2 border-line'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  tier === 'hot' ? 'bg-flame' : tier === 'warm' ? 'bg-flame-2' : tier === 'nurture' ? 'bg-leaf' : 'bg-ink-3'
                } ${activeTier === tier ? 'bg-white/50' : ''}`} />
                {tier} <span className="opacity-70">{counts[tier]}</span>
              </button>
            ))}
          </div>
          <div className="text-2xl font-display font-medium text-ink-2">
            {counts.all} <span className="text-sm uppercase tracking-wider text-ink-3 font-sans">Total</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 overflow-y-auto min-h-0 bg-bg p-8"
      >
        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-ink-3">Loading companies...</div>
        ) : companies.length === 0 ? (
          <EmptyState
            icon={<IconBuilding size={32} />}
            title="No pipeline data"
            description="Add your first company to begin the research and scoring process."
            action={<Button variant="outline" onClick={() => setIsAddModalOpen(true)}>Add Lead</Button>}
          />
        ) : view === "board" ? (
          <KanbanBoard companies={filteredCompanies} onStatusChange={handleStatusChange} />
        ) : (
          <div className="max-w-7xl mx-auto flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-4 text-ink-2 text-sm font-medium pl-2">
              <IconChevronRight className="w-4 h-4 text-ink-3" />
              {activeTier === "all" ? "All Accounts" : activeTier.charAt(0).toUpperCase() + activeTier.slice(1)} 
              <span className="text-ink-3 ml-1">{filteredCompanies.length}</span>
            </div>
            
            <div className="border border-line rounded-xl overflow-hidden bg-surface/50 divide-y divide-line/50">
              {filteredCompanies.map(company => (
                <div 
                  key={company.id} 
                  onClick={() => navigate(`/companies/${company.id}`)}
                  className="flex items-center gap-4 p-4 hover:bg-surface transition-colors cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded bg-bg border border-line flex items-center justify-center shrink-0 overflow-hidden">
                    <IconBuilding className="w-4 h-4 text-ink-3 group-hover:text-flame transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <span className="font-medium text-ink truncate">{company.companyName}</span>
                    <IconChevronRight className="w-3 h-3 text-ink-3 shrink-0" />
                    <span className="text-sm text-ink-2 truncate">
                      {company.city && company.state ? `${company.city}, ${company.state} - ` : ""}
                      {company.website}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 shrink-0">
                    {company.industry && (
                      <span className="text-xs text-ink-3 font-medium bg-bg border border-line px-2 py-1 rounded">
                        {company.industry}
                      </span>
                    )}
                    
                    {/* Visual Mini Scorecard */}
                    <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                      {[...Array(5)].map((_, i) => {
                        // Mock progress dots based on score
                        const isFilled = company.score ? i < Math.ceil((company.score.totalScore / 100) * 5) : false;
                        const colorClass = company.score?.tier === "hot" ? "bg-flame" : 
                                           company.score?.tier === "warm" ? "bg-flame-2" : 
                                           company.score?.tier === "nurture" ? "bg-leaf" : "bg-ink-3";
                        return (
                          <div 
                            key={i} 
                            className={`w-1.5 h-3 rounded-full ${isFilled ? colorClass : 'bg-line'}`} 
                          />
                        )
                      })}
                      <div className={`w-3 h-3 rounded-full border-2 ml-1 ${company.score?.passesRequirements ? 'border-leaf' : 'border-line'}`} />
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredCompanies.length === 0 && (
                <div className="p-12 text-center text-ink-3 flex items-center justify-center">
                  No accounts found in this tier.
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      <AddCompanyModal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <ImportApolloModal open={isApolloModalOpen} onClose={() => setIsApolloModalOpen(false)} />
    </div>
  )
}
