import * as React from "react"
import { IconBrain, IconPlayerPlay } from "@tabler/icons-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const AGENTS = [
  { id: "researcher", name: "Deep Researcher", description: "Crawls web and LinkedIn for comprehensive company and contact intelligence.", status: "Active" },
  { id: "scorer", name: "Signal Scorer", description: "Evaluates raw research against your ICP heuristics and demand signifiers.", status: "Idle" },
  { id: "writer", name: "Conversation Engine", description: "Drafts hyper-personalized outreach based on Memory Graph insights.", status: "Idle" },
  { id: "finder", name: "Lead Finder", description: "Autonomously searches for new companies matching your target criteria.", status: "Offline" },
]

export default function Agents() {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-semibold tracking-tight text-ink">Cortex Agents</h1>
        <p className="text-ink-3">Manage autonomous intelligence workers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {AGENTS.map(agent => (
          <Card key={agent.id}>
            <CardHeader className="flex flex-row items-start justify-between pb-4">
              <div className="flex flex-col gap-1.5">
                <CardTitle className="flex items-center gap-2">
                  <IconBrain className="text-primary w-5 h-5" />
                  {agent.name}
                </CardTitle>
                <CardDescription>{agent.description}</CardDescription>
              </div>
              <Badge variant={agent.status === "Active" ? "hot" : agent.status === "Idle" ? "secondary" : "outline"}>
                {agent.status}
              </Badge>
            </CardHeader>
            <CardFooter className="pt-2 border-t border-line/50">
              <Button variant="outline" size="sm" className="w-full">
                <IconPlayerPlay className="w-4 h-4 mr-2" />
                Trigger Manually
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
