import * as React from "react"
import { ReactFlow, Background, Controls, MiniMap, Panel } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { useFlowStore } from "@/lib/store/flow-store"
import { CortexNode } from "./flow-node"

const nodeTypes = {
  cortexNode: CortexNode,
}

export function FlowCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useFlowStore()

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden border border-line bg-surface/30">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-black/50"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#333" gap={16} size={1} />
        <Controls className="fill-ink text-ink bg-surface border border-line rounded-lg overflow-hidden flex flex-col shadow-sm" />
        <MiniMap 
          nodeColor={(n) => {
            if (n.type === 'cortexNode') return '#FF5500'
            return '#333'
          }}
          maskColor="rgba(0,0,0,0.7)"
          className="bg-surface border border-line rounded-lg shadow-sm !w-48 !h-32 !bottom-4 !right-4"
        />
        <Panel position="top-right" className="bg-surface/80 backdrop-blur border border-line p-3 rounded-lg flex flex-col gap-3 shadow-sm min-w-[200px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-3">Flow Status</span>
            <span className="text-xs font-mono text-ink-2">Ready</span>
          </div>
          <button 
            onClick={() => {
              import("@/lib/ipc/commands").then(({ executeFlow }) => {
                executeFlow({
                  nodes: nodes.map(n => ({ id: n.id, label: n.data.label as string })),
                  edges: edges.map(e => ({ source: e.source, target: e.target }))
                })
              })
            }}
            className="w-full py-2 bg-primary text-white text-sm font-medium rounded shadow hover:bg-primary-hover transition-colors"
          >
            ▶ Run Flow
          </button>
        </Panel>
      </ReactFlow>
    </div>
  )
}
