import * as React from "react"
import { IconWaveSine } from "@tabler/icons-react"
import { EmptyState } from "@/components/ui/empty-state"

export default function Signals() {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full h-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-semibold tracking-tight text-ink">Buying Signals</h1>
        <p className="text-ink-3">Real-time intent and hiring indicators</p>
      </div>

      <div className="flex-1 min-h-[500px]">
        <EmptyState
          icon={<IconWaveSine size={32} />}
          title="No signals detected yet"
          description="Signals will appear here when the scoring agent detects high-intent indicators from your target accounts."
        />
      </div>
    </div>
  )
}
