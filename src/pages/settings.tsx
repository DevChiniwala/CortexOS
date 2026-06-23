import * as React from "react"
import { useSettingsStore } from "@/lib/store/settings-store"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconBrandChrome, IconBrain, IconShieldCheck, IconMail, IconUsers } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { motion } from "motion/react"

export default function Settings() {
  const {
    useChrome,
    orchestrationEnabled,
    defaultResearchDepth,
    isInitialized,
    loadSettings,
    setUseChrome,
    updateOrchestration,
  } = useSettingsStore()

  React.useEffect(() => {
    if (!isInitialized) loadSettings()
  }, [isInitialized, loadSettings])

  return (
    <div className="flex flex-col gap-8 p-8 max-w-4xl mx-auto w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-semibold tracking-tight text-ink">Settings</h1>
        <p className="text-ink-3">Configure CortexOS behavior and integrations</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconBrandChrome className="w-5 h-5 text-primary" />
              Browser Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink">Use Chrome for Research</p>
                <p className="text-xs text-ink-3 mt-1">Enable headless Chrome for deeper web scraping during research</p>
              </div>
              <button
                onClick={() => setUseChrome(!useChrome)}
                className={`relative w-11 h-6 rounded-full transition-colors ${useChrome ? "bg-primary" : "bg-line"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${useChrome ? "translate-x-5" : ""}`} />
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconBrain className="w-5 h-5 text-primary" />
              Agent Orchestration
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink">Enable Autonomous Orchestration</p>
                <p className="text-xs text-ink-3 mt-1">Allow CortexOS to automatically schedule and run research agents</p>
              </div>
              <button
                onClick={() => updateOrchestration({ orchestrationEnabled: !orchestrationEnabled })}
                className={`relative w-11 h-6 rounded-full transition-colors ${orchestrationEnabled ? "bg-primary" : "bg-line"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${orchestrationEnabled ? "translate-x-5" : ""}`} />
              </button>
            </div>

            <div>
              <p className="text-sm font-medium text-ink mb-3">Default Research Depth</p>
              <div className="flex gap-3">
                {(["light", "standard", "deep"] as const).map((depth) => (
                  <button
                    key={depth}
                    onClick={() => updateOrchestration({ defaultResearchDepth: depth })}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${
                      defaultResearchDepth === depth
                        ? "bg-primary/10 border-primary/40 text-primary"
                        : "border-line text-ink-3 hover:text-ink-2 hover:border-line-hover"
                    }`}
                  >
                    {depth}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconMail className="w-5 h-5 text-primary" />
              Email Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex items-center justify-between p-4 border border-line rounded-xl bg-surface/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-line shadow-sm">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-ink">Connected to Google Workspace</span>
                  <span className="text-xs text-ink-3">dev@cortexos.ai</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-xs">Disconnect</Button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">Daily Send Limit</label>
                <select className="flex h-10 w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none font-medium">
                  <option value="50">50 emails / day (Warmup)</option>
                  <option value="150" selected>150 emails / day (Standard)</option>
                  <option value="300">300 emails / day (Aggressive)</option>
                </select>
                <p className="text-xs text-ink-3 mt-1">Maximum autonomous emails sent per day to protect deliverability.</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">Follow-up Delay</label>
                <select className="flex h-10 w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none font-medium">
                  <option value="2">2 Days</option>
                  <option value="3" selected>3 Days</option>
                  <option value="5">5 Days</option>
                </select>
                <p className="text-xs text-ink-3 mt-1">Wait time before autonomous follow-up on unreplied emails.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUsers className="w-5 h-5 text-primary" />
              Team & Workspace
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-ink">Acme Corp GTM Workspace</p>
                <p className="text-xs text-ink-3">Enterprise Plan • 3/10 Seats Filled</p>
              </div>
              <Button size="sm">Invite Member</Button>
            </div>

            <div className="rounded-xl border border-line overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-surface-hover text-ink-2 border-b border-line">
                  <tr>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Agent Allocation</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-ink">
                  <tr>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">D</div>
                        <span className="font-medium">Dev</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-2">Admin</td>
                    <td className="px-4 py-3 text-ink-2">Unlimited</td>
                    <td className="px-4 py-3"><span className="w-2 h-2 rounded-full bg-success inline-block mr-2" />Online</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold text-[10px]">S</div>
                        <span className="font-medium">Sarah</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-2">Member</td>
                    <td className="px-4 py-3 text-ink-2">10 Agents / day</td>
                    <td className="px-4 py-3"><span className="w-2 h-2 rounded-full bg-ink-3 inline-block mr-2" />Offline</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-600 flex items-center justify-center font-bold text-[10px]">M</div>
                        <span className="font-medium">Mike</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-2">Viewer</td>
                    <td className="px-4 py-3 text-ink-2">Read-only</td>
                    <td className="px-4 py-3"><span className="w-2 h-2 rounded-full bg-success inline-block mr-2" />Online</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconShieldCheck className="w-5 h-5 text-primary" />
              System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-2">Version</span>
                <Badge variant="secondary">v0.2.1</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-2">Runtime</span>
                <span className="text-ink font-mono text-xs">Tauri 2 + React 19</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-2">Database</span>
                <span className="text-ink font-mono text-xs">SQLite (local)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
