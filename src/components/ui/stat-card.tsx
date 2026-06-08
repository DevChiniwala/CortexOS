import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { cn } from "@/lib/utils"

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
}

export function StatCard({ title, value, icon, trend, className, ...props }: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden group", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-ink-2">{title}</CardTitle>
        <div className="p-2 bg-surface rounded-lg text-ink-2 transition-colors group-hover:text-primary group-hover:bg-primary/10">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-display font-bold text-ink tracking-tight">{value}</div>
        {trend && (
          <p className="text-xs text-ink-3 mt-1 flex items-center gap-1">
            <span
              className={cn(
                "font-medium",
                trend.isPositive === true && "text-success",
                trend.isPositive === false && "text-danger"
              )}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>{" "}
            {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
