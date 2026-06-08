import * as React from "react"
import { IconNetwork } from "@tabler/icons-react"
import { EmptyState } from "@/components/ui/empty-state"

export default function MemoryGraph() {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full h-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-semibold tracking-tight text-ink">Memory Graph</h1>
        <p className="text-ink-3">Visual representation of cross-entity intelligence</p>
      </div>

      <div className="flex-1 min-h-[500px]">
        <EmptyState
          icon={<IconNetwork size={32} />}
          title="Memory Graph Visualizer"
          description="The graph visualization engine is currently initializing. Add more companies to populate nodes."
        />
      </div>
    </div>
  )
}
