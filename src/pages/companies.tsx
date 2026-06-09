import * as React from "react"
import { useCompanies, useCompanyMutations } from "@/lib/hooks"
import { EmptyState } from "@/components/ui/empty-state"
import { IconBuilding, IconPlus, IconLayoutList, IconLayoutKanban } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { KanbanBoard } from "@/components/pipeline/kanban-board"
import { DataTable } from "@/components/ui/data-table"
import { motion } from "motion/react"
import { CompanyWithScore } from "@/lib/types"

export default function Companies() {
  const { companies, isLoading } = useCompanies()
  const { updateCompanyStatus } = useCompanyMutations()
  const [view, setView] = React.useState<"list" | "board">("list")

  const handleStatusChange = async (companyId: number, status: string) => {
    try {
      await updateCompanyStatus(companyId, status)
    } catch (err) {
      console.error("Failed to update status", err)
    }
  }

  const columns = [
    {
      header: "Company",
      accessorKey: "companyName" as keyof CompanyWithScore,
      className: "font-medium"
    },
    {
      header: "Industry",
      cell: (company: CompanyWithScore) => <span className="text-ink-2">{company.industry || "-"}</span>
    },
    {
      header: "Score",
      cell: (company: CompanyWithScore) => {
        const score = company.score?.totalScore
        if (!score) return <span className="text-ink-3">-</span>
        return (
          <Badge variant={score > 80 ? "hot" : score > 50 ? "warm" : "default"}>
            {score}
          </Badge>
        )
      }
    },
    {
      header: "Status",
      cell: (company: CompanyWithScore) => (
        <span className="text-ink-3 capitalize">{company.researchStatus.replace('_', ' ')}</span>
      )
    }
  ]

  return (
    <div className="flex flex-col gap-6 p-8 max-w-7xl mx-auto w-full h-full">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-display font-semibold tracking-tight text-ink">Companies</h1>
          <p className="text-ink-3">Manage and research target accounts</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-surface p-1 rounded-lg border border-line">
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
          <Button>
            <IconPlus className="w-4 h-4 mr-2" />
            Add Company
          </Button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 min-h-0"
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
        ) : view === "board" ? (
          <KanbanBoard companies={companies} onStatusChange={handleStatusChange} />
        ) : (
          <DataTable data={companies} columns={columns} />
        )}
      </motion.div>
    </div>
  )
}
