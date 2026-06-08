import * as React from "react"
import { IconHierarchy } from "@tabler/icons-react"
import { EmptyState } from "@/components/ui/empty-state"

export default function Flow() {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full h-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-semibold tracking-tight text-ink">Cortex Flow</h1>
        <p className="text-ink-3">Build autonomous intelligence pipelines</p>
      </div>

      <div className="flex-1 min-h-[500px]">
        <EmptyState
          icon={<IconHierarchy size={32} />}
          title="Workflow Builder"
          description="Visual pipeline construction is coming soon to CortexOS."
        />
      </div>
    </div>
  )
}
