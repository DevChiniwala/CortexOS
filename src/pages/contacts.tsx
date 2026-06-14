import * as React from "react"
import { useNavigate } from "react-router-dom"
import { useContacts } from "@/lib/hooks"
import { EmptyState } from "@/components/ui/empty-state"
import { IconUsers, IconPlus } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { motion } from "motion/react"
import { AddContactModal } from "@/components/modals/add-contact-modal"

export default function Contacts() {
  const navigate = useNavigate()
  const { contacts, isLoading } = useContacts()
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)

  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-display font-semibold tracking-tight text-ink">Contacts</h1>
          <p className="text-ink-3">Manage people and champions</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <IconPlus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
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
            description="Add your first contact to begin conversation generation."
          />
        ) : (
          <div className="rounded-xl border border-line bg-surface overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-hover text-ink-2 border-b border-line">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Company</th>
                  <th className="px-6 py-4 font-medium">Title</th>
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
                    <td className="px-6 py-4 text-ink-2">{contact.companyName || "-"}</td>
                    <td className="px-6 py-4 text-ink-2">{contact.title || "-"}</td>
                    <td className="px-6 py-4 text-ink-3">{contact.email || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <AddContactModal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  )
}
