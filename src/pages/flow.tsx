import * as React from "react"
import { FlowCanvas } from "@/components/flow/flow-canvas"
import { toast } from "sonner"
import { IconGitBranch, IconPlus, IconPlayerPlay } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { useFlowStore } from "@/lib/store/flow-store"

const NODE_TYPES = [
  { id: "trigger-signal", label: "Signal Trigger", icon: "radar", color: "purple", description: "Trigger when a specific signal type is detected" },
  { id: "find-leads", label: "Find ICP Leads", icon: "users", color: "blue", description: "Search CRM/Apollo for specific personas" },
  { id: "research", label: "Deep Research", icon: "search", color: "orange", description: "Extract funding, tech stack, and news" },
  { id: "score", label: "Signal Scorer", icon: "trending-up", color: "yellow", description: "Evaluate against Tier 1 ICP heuristics" },
  { id: "generate", label: "Generate Draft", icon: "message", color: "green", description: "Write personalized email sequences" },
  { id: "send", label: "Send Outreach", icon: "mail", color: "blue", description: "Dispatch via email API" },
  { id: "custom", label: "Custom Prompt", icon: "brain", color: "orange", description: "Run an arbitrary LLM prompt" },
]

let nodeCounter = 0

export default function FlowBuilder() {
  const { addNode, nodes } = useFlowStore()

  const handleAddNode = (template: typeof NODE_TYPES[0]) => {
    // Determine spawn position (centerish, slightly offset based on node count)
    const offset = nodes.length * 20
    // eslint-disable-next-line react-hooks/globals
    nodeCounter += 1
    const newNode = {
      id: `${template.id}-${nodeCounter}`,
      type: "cortexNode",
      position: { x: 400 + offset, y: 150 + offset },
      data: {
        label: template.label,
        icon: template.icon,
        color: template.color,
        description: template.description
      }
    }
    addNode(newNode)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] w-full max-w-[1600px] mx-auto p-8 pb-0 gap-6">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <IconGitBranch className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-display font-semibold tracking-tight text-ink">Orchestration Flow</h1>
          </div>
          <p className="text-ink-3">Visually design and automate agent pipelines</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => toast.success("Pipeline saved")}>
            Save Pipeline
          </Button>
          <Button onClick={() => toast.success("Pipeline deployed and running")}>
            <IconPlayerPlay className="w-4 h-4 mr-2" /> Run Pipeline
          </Button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0 pb-8">
        
        {/* Left Sidebar Palette */}
        <div className="w-72 shrink-0 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-line pb-2">
            <h3 className="font-medium text-ink">Node Palette</h3>
            <span className="text-xs text-ink-3 font-mono">{NODE_TYPES.length} blocks</span>
          </div>
          
          <div className="flex flex-col gap-3 overflow-y-auto pr-2 pb-8">
            {NODE_TYPES.map(template => (
              <button
                key={template.id}
                onClick={() => handleAddNode(template)}
                className="group flex flex-col items-start gap-1 p-3 rounded-xl border border-line bg-surface/50 hover:bg-surface hover:border-primary/50 text-left transition-all"
              >
                <div className="flex items-center gap-2">
                  <IconPlus className="w-4 h-4 text-ink-3 group-hover:text-primary transition-colors" />
                  <span className="text-sm font-semibold text-ink">{template.label}</span>
                </div>
                <p className="text-xs text-ink-3 pl-6 line-clamp-2">{template.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 relative">
          <FlowCanvas />
        </div>

      </div>
    </div>
  )
}
