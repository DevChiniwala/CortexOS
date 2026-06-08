import * as React from "react"
import { useCompanies } from "@/lib/hooks"
import { EmptyState } from "@/components/ui/empty-state"
import { IconBuilding, IconPlus } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { motion } from "motion/react"

export default function Companies() {
  const { companies, isLoading } = useCompanies()

  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-display font-semibold tracking-tight text-ink">Companies</h1>
          <p className="text-ink-3">Manage and research target accounts</p>
        </div>
        <Button>
          <IconPlus className="w-4 h-4 mr-2" />
          Add Company
        </Button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1"
      >
        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-ink-3">Loading companies...</div>
        ) : companies.length === 0 ? (
          <EmptyState
            icon={<IconBuilding size={32} />}
            title="No companies found"
            description="Add your first company to begin the research and scoring process."
            action={<Button variant="outline">Import CSV</Button>}
          />
        ) : (
          <div className="rounded-xl border border-line bg-surface overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-hover text-ink-2 border-b border-line">
                <tr>
                  <th className="px-6 py-4 font-medium">Company</th>
                  <th className="px-6 py-4 font-medium">Industry</th>
                  <th className="px-6 py-4 font-medium">Score</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-ink">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-surface-hover/50 transition-colors cursor-pointer">
                    <td className="px-6 py-4 font-medium">{company.companyName}</td>
                    <td className="px-6 py-4 text-ink-2">{company.industry || "-"}</td>
                    <td className="px-6 py-4">{company.score?.totalScore || "-"}</td>
                    <td className="px-6 py-4 text-ink-3 capitalize">{company.researchStatus.replace('_', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}
