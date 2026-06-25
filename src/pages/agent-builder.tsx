import * as React from "react"
import { AgentCanvas } from "@/components/builder/agent-canvas"
import { IconBrain, IconBolt, IconApi, IconMessage } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

export default function AgentBuilder() {
  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Node Palette (Left Sidebar) */}
      <div className="w-64 border-r border-line bg-surface/30 p-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar shrink-0">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-display font-semibold text-ink">Node Palette</h2>
          <p className="text-xs text-ink-3">Drag nodes onto the canvas</p>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-2">Triggers</h3>
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="justify-start gap-2 h-auto py-2 px-3 bg-surface hover:bg-warning/10 hover:text-warning hover:border-warning/30">
                <IconBolt className="w-4 h-4 text-warning" />
                <div className="flex flex-col items-start">
                  <span className="text-sm">Signal Detected</span>
                  <span className="text-[10px] text-ink-3 font-normal">Webhook/Event listener</span>
                </div>
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-2">Actions</h3>
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="justify-start gap-2 h-auto py-2 px-3 bg-surface hover:bg-info/10 hover:text-info hover:border-info/30">
                <IconApi className="w-4 h-4 text-info" />
                <div className="flex flex-col items-start">
                  <span className="text-sm">Web Scraper</span>
                  <span className="text-[10px] text-ink-3 font-normal">Extract DOM content</span>
                </div>
              </Button>
              <Button variant="outline" className="justify-start gap-2 h-auto py-2 px-3 bg-surface hover:bg-info/10 hover:text-info hover:border-info/30">
                <IconApi className="w-4 h-4 text-info" />
                <div className="flex flex-col items-start">
                  <span className="text-sm">HTTP Request</span>
                  <span className="text-[10px] text-ink-3 font-normal">GET/POST any API</span>
                </div>
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-2">Intelligence</h3>
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="justify-start gap-2 h-auto py-2 px-3 bg-surface hover:bg-primary/10 hover:text-primary hover:border-primary/30">
                <IconBrain className="w-4 h-4 text-primary" />
                <div className="flex flex-col items-start">
                  <span className="text-sm">LLM Prompt</span>
                  <span className="text-[10px] text-ink-3 font-normal">Reasoning/Generation</span>
                </div>
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-2">Outputs</h3>
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="justify-start gap-2 h-auto py-2 px-3 bg-surface hover:bg-leaf/10 hover:text-leaf hover:border-leaf/30">
                <IconMessage className="w-4 h-4 text-leaf" />
                <div className="flex flex-col items-start">
                  <span className="text-sm">Send Email</span>
                  <span className="text-[10px] text-ink-3 font-normal">SMTP/API Dispatch</span>
                </div>
              </Button>
              <Button variant="outline" className="justify-start gap-2 h-auto py-2 px-3 bg-surface hover:bg-leaf/10 hover:text-leaf hover:border-leaf/30">
                <IconMessage className="w-4 h-4 text-leaf" />
                <div className="flex flex-col items-start">
                  <span className="text-sm">Slack Alert</span>
                  <span className="text-[10px] text-ink-3 font-normal">Post to #channel</span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col p-6 gap-4 bg-surface-hover/30 min-w-0">
        <div className="flex items-center justify-between shrink-0">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-display font-semibold tracking-tight text-ink flex items-center gap-2">
              Custom Agent Builder
              <span className="text-xs font-mono font-medium tracking-widest px-2 py-0.5 rounded-full border border-primary/30 bg-primary/10 text-primary">
                BETA
              </span>
            </h1>
            <p className="text-ink-3 text-sm">Design autonomous workflows using visual node programming.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-ink-3">Active Agent:</span>
              <span className="font-semibold text-ink border-b border-dashed border-ink/50 pb-0.5">Custom Outbound Sequence</span>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 border-t border-line/50 pt-4">
          <AgentCanvas />
        </div>
      </div>
    </div>
  )
}
