import * as React from "react"
import { ReactFlow, Background, Controls, MiniMap, Panel, useNodesState, useEdgesState, Connection, addEdge, Edge } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { AgentNode } from "./agent-node"
import { IconPlayerPlay, IconDeviceFloppy } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

const nodeTypes = {
  agentNode: AgentNode,
}

const initialNodes = [
  {
    id: "trigger-1",
    type: "agentNode",
    position: { x: 50, y: 150 },
    data: { 
      label: "Signal Detected", 
      type: "trigger",
      description: "Listens for 'Hiring Surge' on LinkedIn."
    },
  },
  {
    id: "action-1",
    type: "agentNode",
    position: { x: 350, y: 50 },
    data: { 
      label: "Scrape Crunchbase", 
      type: "action",
      description: "Extract funding history and key investors."
    },
  },
  {
    id: "action-2",
    type: "agentNode",
    position: { x: 350, y: 250 },
    data: { 
      label: "Find Contacts", 
      type: "action",
      description: "Query Apollo for 'VP Engineering'."
    },
  },
  {
    id: "llm-1",
    type: "agentNode",
    position: { x: 650, y: 150 },
    data: { 
      label: "Personalize Pitch", 
      type: "llm",
      description: "Synthesize data into a hyper-personalized email hook."
    },
  },
  {
    id: "output-1",
    type: "agentNode",
    position: { x: 950, y: 150 },
    data: { 
      label: "Send Email", 
      type: "output",
      description: "Dispatch via SMTP sequence."
    },
  },
]

const initialEdges: Edge[] = [
  { id: "e1-2", source: "trigger-1", target: "action-1", animated: true, style: { stroke: '#FF5500' } },
  { id: "e1-3", source: "trigger-1", target: "action-2", animated: true, style: { stroke: '#FF5500' } },
  { id: "e2-4", source: "action-1", target: "llm-1", animated: true, style: { stroke: '#00AEEF' } },
  { id: "e3-4", source: "action-2", target: "llm-1", animated: true, style: { stroke: '#00AEEF' } },
  { id: "e4-5", source: "llm-1", target: "output-1", animated: true, style: { stroke: '#00D084' } },
]

export function AgentCanvas() {
  const [nodes, _setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [isRunning, setIsRunning] = React.useState(false)

  const onConnect = React.useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const handleTestRun = () => {
    setIsRunning(true)
    setTimeout(() => setIsRunning(false), 3000)
  }

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden border border-line bg-surface/30 shadow-inner">
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
        <Background color="#333" gap={20} size={1} />
        <Controls className="fill-ink text-ink bg-surface border border-line rounded-lg overflow-hidden flex flex-col shadow-sm" />
        <MiniMap 
          nodeColor={(n) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data = n.data as { type: string };
            if (data.type === 'trigger') return '#FFB020'
            if (data.type === 'llm') return '#FF5500'
            if (data.type === 'action') return '#00AEEF'
            if (data.type === 'output') return '#00D084'
            return '#333'
          }}
          maskColor="rgba(0,0,0,0.7)"
          className="bg-surface border border-line rounded-lg shadow-sm"
        />
        
        <Panel position="top-right" className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 bg-surface/80 backdrop-blur">
            <IconDeviceFloppy className="w-4 h-4" /> Save Graph
          </Button>
          <Button 
            size="sm" 
            className="gap-2 shadow-lg shadow-primary/20"
            onClick={handleTestRun}
            disabled={isRunning}
          >
            {isRunning ? (
              <><span className="w-4 h-4 rounded-full border-2 border-surface-hover border-t-ink animate-spin" /> Compiling...</>
            ) : (
              <><IconPlayerPlay className="w-4 h-4" /> Test Run</>
            )}
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  )
}
