import * as React from "react"
import { CompanyWithScore } from "@/lib/types"
import { Card,   CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconBuilding, IconGripVertical } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

interface KanbanCardProps {
  company: CompanyWithScore
  onDragStart: (e: React.DragEvent, companyId: number) => void
}

export function KanbanCard({ company, onDragStart }: KanbanCardProps) {
  return (
    <Card 
      draggable
      onDragStart={(e) => onDragStart(e, company.id)}
      className="cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors bg-surface"
    >
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <IconBuilding className="w-4 h-4 text-ink-3" />
            <span className="font-medium text-sm text-ink">{company.companyName}</span>
          </div>
          <IconGripVertical className="w-4 h-4 text-line-hover" />
        </div>
        
        <div className="flex flex-wrap gap-2 mt-1">
          {company.score?.totalScore !== undefined && (
            <Badge variant="secondary">
              Score: {company.score.totalScore}
            </Badge>
          )}
          {company.industry && (
            <Badge variant="outline" className="truncate max-w-[120px]">
              {company.industry}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface KanbanColumnProps {
  title: string
  status: string
  companies: CompanyWithScore[]
  onDrop: (companyId: number, status: string) => void
}

export function KanbanColumn({ title, status, companies, onDrop }: KanbanColumnProps) {
  const [isOver, setIsOver] = React.useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsOver(true)
  }

  const handleDragLeave = () => {
    setIsOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsOver(false)
    const companyId = parseInt(e.dataTransfer.getData("companyId"), 10)
    if (!isNaN(companyId)) {
      onDrop(companyId, status)
    }
  }

  return (
    <div 
      className={cn(
        "flex flex-col gap-3 min-w-[300px] w-[300px] bg-bg rounded-xl border border-line p-3 transition-colors",
        isOver && "bg-surface-hover/50 border-primary/50"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between px-2 mb-2">
        <h3 className="font-semibold text-sm text-ink-2 uppercase tracking-wider">{title}</h3>
        <Badge variant="secondary" className="px-1.5 py-0 min-w-[20px] justify-center">
          {companies.length}
        </Badge>
      </div>
      
      <div className="flex flex-col gap-3 flex-1 overflow-y-auto min-h-[150px]">
        {companies.map(company => (
          <KanbanCard 
            key={company.id} 
            company={company} 
            onDragStart={(e, id) => {
              e.dataTransfer.setData("companyId", id.toString())
            }} 
          />
        ))}
        {companies.length === 0 && (
          <div className="flex-1 border-2 border-dashed border-line rounded-lg flex items-center justify-center text-ink-3 text-sm p-4 text-center">
            Drop companies here
          </div>
        )}
      </div>
    </div>
  )
}

interface KanbanBoardProps {
  companies: CompanyWithScore[]
  onStatusChange: (companyId: number, status: string) => void
}

const COLUMNS = [
  { id: "uncontacted", title: "Uncontacted" },
  { id: "researching", title: "Researching" },
  { id: "scored", title: "Scored & Ready" },
  { id: "contacted", title: "Contacted" },
]

export const KanbanBoard = React.memo(function KanbanBoard({ companies, onStatusChange }: KanbanBoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-full">
      {COLUMNS.map(column => (
        <KanbanColumn
          key={column.id}
          title={column.title}
          status={column.id}
          companies={companies.filter(c => c.researchStatus === column.id)}
          onDrop={onStatusChange}
        />
      ))}
    </div>
  )
})
