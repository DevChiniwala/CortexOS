import * as React from "react"
import { useCompanies, useContacts, useSignals } from "@/lib/hooks"
import { InteractiveGraph, GraphNode, GraphLink } from "@/components/memory/force-graph"
import { IconNetwork, IconX, IconBuilding, IconUser, IconRadar } from "@tabler/icons-react"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "@/components/ui/button"

export default function MemoryGraph() {
  const { companies } = useCompanies()
  const { contacts } = useContacts()
  const { signals } = useSignals()

  const [selectedNode, setSelectedNode] = React.useState<GraphNode | null>(null)

  // Construct graph data from stores
  const graphData = React.useMemo(() => {
    const nodes: GraphNode[] = []
    const links: GraphLink[] = []

    // 1. Add Companies
    companies.forEach(company => {
      nodes.push({
        id: `c-${company.id}`,
        label: company.companyName,
        group: "company",
        val: 12,
        data: company
      })
    })

    const companyIds = new Set(companies.map(c => `c-${c.id}`))

    // 2. Add Contacts and link to Companies
    contacts.forEach(contact => {
      const contactId = `p-${contact.id}`
      nodes.push({
        id: contactId,
        label: `${contact.firstName} ${contact.lastName}`,
        group: "person",
        val: 6,
        data: contact
      })

      if (contact.companyId && companyIds.has(`c-${contact.companyId}`)) {
        links.push({
          source: contactId,
          target: `c-${contact.companyId}`,
          label: "works_at"
        })
      }
    })

    // 3. Add Signals and link to Companies
    signals.forEach(signal => {
      const signalId = `s-${signal.id}`
      nodes.push({
        id: signalId,
        label: signal.title,
        group: "signal",
        val: 8,
        data: signal
      })

      if (companyIds.has(`c-${signal.companyId}`)) {
        links.push({
          source: signalId,
          target: `c-${signal.companyId}`,
          label: "detected_for"
        })
      }
    })

    return { nodes, links }
  }, [companies, contacts, signals])

  return (
    <div className="flex flex-col gap-4 p-8 max-w-[1600px] mx-auto w-full h-[calc(100vh-2rem)]">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <IconNetwork className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-display font-semibold tracking-tight text-ink">Memory Graph</h1>
          </div>
          <p className="text-ink-3">Interactive ontology of your target accounts, personnel, and intelligence signals</p>
        </div>
        
        <div className="flex gap-4 text-xs font-medium text-ink-3">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#FF5500]" /> Companies</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#00AEEF]" /> People</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#00D084]" /> Signals</div>
        </div>
      </div>

      <div className="flex-1 relative rounded-xl overflow-hidden border border-line bg-surface/50 flex gap-4 p-4">
        
        {/* Main Canvas */}
        <div className="flex-1 relative rounded-xl overflow-hidden shadow-inner">
          <InteractiveGraph 
            nodes={graphData.nodes} 
            links={graphData.links} 
            onNodeClick={setSelectedNode}
          />
        </div>

        {/* Side Panel for Node Details */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div 
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 350 }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              className="shrink-0 h-full bg-surface border border-line rounded-xl shadow-lg flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-line flex items-center justify-between bg-surface-hover/50">
                <div className="flex items-center gap-2">
                  {selectedNode.group === "company" && <IconBuilding className="w-5 h-5 text-[#FF5500]" />}
                  {selectedNode.group === "person" && <IconUser className="w-5 h-5 text-[#00AEEF]" />}
                  {selectedNode.group === "signal" && <IconRadar className="w-5 h-5 text-[#00D084]" />}
                  <span className="font-semibold text-ink capitalize">{selectedNode.group}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedNode(null)} className="w-6 h-6">
                  <IconX className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-5 flex-1 overflow-y-auto space-y-4 text-sm">
                <h3 className="text-lg font-display font-semibold text-ink">{selectedNode.label}</h3>
                
                {selectedNode.group === "company" && (
                  <>
                    {selectedNode.data.industry && (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-ink-3 uppercase tracking-wider">Industry</span>
                        <span className="text-ink-2">{selectedNode.data.industry}</span>
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-ink-3 uppercase tracking-wider">Status</span>
                      <span className="text-ink-2 capitalize">{selectedNode.data.researchStatus.replace('_', ' ')}</span>
                    </div>
                  </>
                )}

                {selectedNode.group === "person" && (
                  <>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-ink-3 uppercase tracking-wider">Title</span>
                      <span className="text-ink-2">{selectedNode.data.title || "Unknown"}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-ink-3 uppercase tracking-wider">Email</span>
                      <span className="text-ink-2">{selectedNode.data.email || "Unknown"}</span>
                    </div>
                  </>
                )}

                {selectedNode.group === "signal" && (
                  <>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-ink-3 uppercase tracking-wider">Description</span>
                      <span className="text-ink-2">{selectedNode.data.description}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-ink-3 uppercase tracking-wider">Confidence</span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-surface-hover rounded-full overflow-hidden">
                          <div className="h-full bg-success rounded-full" style={{ width: `${selectedNode.data.confidence}%` }} />
                        </div>
                        <span className="font-mono text-ink-2 text-xs">{selectedNode.data.confidence}%</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
