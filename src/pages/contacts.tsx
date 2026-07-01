import * as React from "react"
import { useNavigate } from "react-router-dom"
import { useContacts } from "@/lib/hooks"
import { EmptyState } from "@/components/ui/empty-state"
import { IconUsers, IconPlus, IconList, IconHierarchy } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { motion } from "motion/react"
import { AddContactModal } from "@/components/modals/add-contact-modal"
import { BuyingCommittee } from "@/components/contacts/buying-committee"
import { TrustBadge } from "@/components/ui/trust-badge"
import type { ContactWithCompany } from "@/lib/types"

export default function Contacts() {
  const navigate = useNavigate()
  const { contacts, isLoading } = useContacts()
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<"list" | "committee">("committee")

  // Group contacts by company for the committee view
  const committees = React.useMemo(() => {
    const map = new Map<number, { companyName: string, contacts: ContactWithCompany[] }>()
    contacts.forEach(c => {
      if (!c.companyId) return
      const existing = map.get(c.companyId) || { companyName: c.companyName || "Unknown Company", contacts: [] }
      existing.contacts.push(c)
      map.set(c.companyId, existing)
    })
    return Array.from(map.values())
  }, [contacts])

  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-display font-semibold tracking-tight text-ink">Contacts & Buying Committees</h1>
          <p className="text-ink-3">Map relationships and identify key decision makers</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-surface border border-line rounded-lg p-1">
            <Button 
              variant={viewMode === "committee" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setViewMode("committee")}
              className={viewMode === "committee" ? "bg-surface-hover text-ink shadow-sm" : ""}
            >
              <IconHierarchy className="w-4 h-4 mr-1.5" />
              Committees
            </Button>
            <Button 
              variant={viewMode === "list" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-surface-hover text-ink shadow-sm" : ""}
            >
              <IconList className="w-4 h-4 mr-1.5" />
              List
            </Button>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <IconPlus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1"
      >
        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-ink-3">Loading contacts...</div>
        ) : contacts.length === 0 ? (
          <EmptyState
            icon={<IconUsers size={32} />}
            title="No contacts found"
            description="Add your first contact to begin mapping relationships."
          />
        ) : viewMode === "list" ? (
          <div className="rounded-xl border border-line bg-surface overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-hover text-ink-2 border-b border-line">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Verification</th>
                  <th className="px-6 py-4 font-medium">Company</th>
                  <th className="px-6 py-4 font-medium">Title</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-ink">
                {contacts.map((contact) => (
                  <tr 
                    key={contact.id} 
                    className="hover:bg-surface-hover/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/contacts/${contact.id}`)}
                  >
                    <td className="px-6 py-4 font-medium">{contact.firstName} {contact.lastName}</td>
                    <td className="px-6 py-4">
                      {contact.researchStatus === 'completed' ? (
                        <TrustBadge matchType="exact" size="sm" showLabel={false} />
                      ) : (
                        <TrustBadge matchType="manual" size="sm" showLabel={false} />
                      )}
                    </td>
                    <td className="px-6 py-4 text-ink-2">{contact.companyName || "-"}</td>
                    <td className="px-6 py-4 text-ink-2">{contact.title || "-"}</td>
                    <td className="px-6 py-4 text-ink-2">
                      {contact.buyingRole ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface border border-line">
                          {contact.buyingRole}
                        </span>
                      ) : "-"}
                    </td>
                    <td className="px-6 py-4 text-ink-2">{contact.email || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {committees.map((committee) => (
              <BuyingCommittee 
                key={committee.companyName}
                companyName={committee.companyName}
                contacts={committee.contacts}
              />
            ))}
          </div>
        )}
      </motion.div>

      <AddContactModal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  )
}
