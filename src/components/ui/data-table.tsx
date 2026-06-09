import * as React from "react"
import { cn } from "@/lib/utils"

interface DataTableProps<T> {
  data: T[]
  columns: {
    header: string
    accessorKey?: keyof T
    cell?: (item: T) => React.ReactNode
    className?: string
  }[]
  onRowClick?: (item: T) => void
  emptyMessage?: string
}

export function DataTable<T extends { id: number | string }>({ 
  data, 
  columns, 
  onRowClick,
  emptyMessage = "No data found."
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center border border-dashed border-line rounded-xl bg-surface/30 text-ink-3 text-sm">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-line bg-surface overflow-hidden w-full">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-surface-hover text-ink-2 border-b border-line">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className={cn("px-6 py-4 font-medium", col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-ink">
            {data.map((row) => (
              <tr 
                key={row.id} 
                onClick={() => onRowClick && onRowClick(row)}
                className={cn(
                  "transition-colors",
                  onRowClick ? "cursor-pointer hover:bg-surface-hover/50" : "hover:bg-surface-hover/30"
                )}
              >
                {columns.map((col, i) => (
                  <td key={i} className={cn("px-6 py-4", col.className)}>
                    {col.cell 
                      ? col.cell(row) 
                      : col.accessorKey 
                        ? (row[col.accessorKey] as React.ReactNode) 
                        : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
