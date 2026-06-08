import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/10 text-primary hover:bg-primary/20",
        secondary: "border-transparent bg-surface-hover text-ink-2 hover:bg-line",
        destructive: "border-transparent bg-danger/10 text-danger hover:bg-danger/20",
        outline: "text-ink-2 border-line",
        hot: "border-transparent bg-flame/10 text-flame border-flame/30 hover:bg-flame/20",
        warm: "border-transparent bg-flame-2/10 text-flame-2 border-flame-2/30 hover:bg-flame-2/20",
        nurture: "border-transparent bg-leaf/10 text-leaf border-leaf/30 hover:bg-leaf/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
