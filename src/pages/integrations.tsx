import * as React from "react"
import { motion } from "motion/react"
import { IconPlugConnected, IconRefresh, IconCheck, IconX, IconArrowsExchange, IconCloudUpload, IconCloudDownload, IconClock } from "@tabler/icons-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const CRM_CONNECTORS = [
  {
    id: "hubspot",
    name: "HubSpot",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/HubSpot_Logo.svg",
    fallbackColor: "bg-orange-500",
    fallbackLetter: "H",
    connected: true,
    lastSync: "12 min ago",
    objectsSynced: 1204,
    syncDirection: "bi-directional" as const,
  },
  {
    id: "salesforce",
    name: "Salesforce",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg",
    fallbackColor: "bg-blue-500",
    fallbackLetter: "SF",
    connected: false,
    lastSync: null,
    objectsSynced: 0,
    syncDirection: "push" as const,
  },
  {
    id: "pipedrive",
    name: "Pipedrive",
    logo: "",
    fallbackColor: "bg-green-600",
    fallbackLetter: "PD",
    connected: false,
    lastSync: null,
    objectsSynced: 0,
    syncDirection: "push" as const,
  },
]

const FIELD_MAPPINGS = [
  { cortexField: "Company Name", crmField: "Account Name", synced: true, direction: "bi-directional" },
  { cortexField: "Company Score", crmField: "Lead Score (Custom)", synced: true, direction: "push" },
  { cortexField: "Scoring Tier", crmField: "Lead Temperature", synced: true, direction: "push" },
  { cortexField: "Contact Email", crmField: "Email", synced: true, direction: "bi-directional" },
  { cortexField: "Buying Role", crmField: "Contact Role (Custom)", synced: true, direction: "push" },
  { cortexField: "Signal Data", crmField: "Intent Notes (Custom)", synced: true, direction: "push" },
  { cortexField: "Outreach Status", crmField: "Engagement Status", synced: false, direction: "push" },
  { cortexField: "Deal Stage", crmField: "Pipeline Stage", synced: true, direction: "pull" },
]

const SYNC_HISTORY = [
  { id: "s1", timestamp: "2 min ago", type: "push", objects: 24, status: "success", detail: "Pushed 24 scored companies to HubSpot" },
  { id: "s2", timestamp: "12 min ago", type: "pull", objects: 8, status: "success", detail: "Pulled 8 deal stage updates from HubSpot" },
  { id: "s3", timestamp: "1 hour ago", type: "push", objects: 156, status: "success", detail: "Full sync: pushed all contacts with buying roles" },
  { id: "s4", timestamp: "3 hours ago", type: "push", objects: 3, status: "error", detail: "Failed to push 3 contacts: duplicate email conflict" },
]

export default function Integrations() {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-display font-semibold tracking-tight text-ink flex items-center gap-3">
            <IconPlugConnected className="w-8 h-8 text-info" />
            Integrations
          </h1>
          <p className="text-ink-3">Bi-directional sync with your CRM and GTM ecosystem</p>
        </div>
        <Button className="bg-info hover:bg-info/90 text-white" onClick={() => toast.success("Integration requested")}>
          <IconRefresh className="w-4 h-4 mr-2" />
          Force Full Sync
        </Button>
      </div>

      {/* CRM Connectors */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {CRM_CONNECTORS.map((crm) => (
          <div key={crm.id} className={cn(
            "p-5 rounded-xl border flex flex-col gap-4 transition-colors",
            crm.connected ? "border-success/30 bg-success/5" : "border-line bg-surface hover:border-line-hover"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm", crm.fallbackColor)}>
                  {crm.fallbackLetter}
                </div>
                <div>
                  <h3 className="font-semibold text-ink">{crm.name}</h3>
                  <span className="text-xs text-ink-3">
                    {crm.connected ? `${crm.objectsSynced.toLocaleString()} objects synced` : "Not connected"}
                  </span>
                </div>
              </div>
              {crm.connected ? (
                <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-success/10 text-success text-xs font-medium">
                  <IconCheck className="w-3.5 h-3.5" /> Connected
                </span>
              ) : (
                <Button size="sm" variant="outline" onClick={() => toast.success("Connecting integration...")}>Connect</Button>
              )}
            </div>

            {crm.connected && (
              <div className="flex items-center justify-between text-xs text-ink-3 pt-2 border-t border-line/50">
                <span className="flex items-center gap-1"><IconClock className="w-3 h-3" /> Last sync: {crm.lastSync}</span>
                <span className="flex items-center gap-1"><IconArrowsExchange className="w-3 h-3" /> {crm.syncDirection}</span>
              </div>
            )}
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Field Mapping */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <IconArrowsExchange className="w-5 h-5 text-info" />
              Field Mapping
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-line overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-surface-hover text-ink-3 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 font-medium">CortexOS</th>
                    <th className="px-4 py-3 font-medium">CRM Field</th>
                    <th className="px-4 py-3 font-medium text-center">Dir</th>
                    <th className="px-4 py-3 font-medium text-center">Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-ink">
                  {FIELD_MAPPINGS.map((fm) => (
                    <tr key={fm.cortexField} className="hover:bg-surface-hover/30">
                      <td className="px-4 py-2.5 font-medium text-xs">{fm.cortexField}</td>
                      <td className="px-4 py-2.5 text-ink-2 text-xs font-mono">{fm.crmField}</td>
                      <td className="px-4 py-2.5 text-center">
                        {fm.direction === "bi-directional" ? (
                          <IconArrowsExchange className="w-4 h-4 text-info mx-auto" />
                        ) : fm.direction === "push" ? (
                          <IconCloudUpload className="w-4 h-4 text-primary mx-auto" />
                        ) : (
                          <IconCloudDownload className="w-4 h-4 text-success mx-auto" />
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {fm.synced ? (
                          <IconCheck className="w-4 h-4 text-success mx-auto" />
                        ) : (
                          <IconX className="w-4 h-4 text-ink-3 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Sync History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <IconClock className="w-5 h-5 text-info" />
              Sync History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {SYNC_HISTORY.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg border border-line bg-surface/50">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    entry.status === "success" ? "bg-success/10" : "bg-danger/10"
                  )}>
                    {entry.type === "push" ? (
                      <IconCloudUpload className={cn("w-4 h-4", entry.status === "success" ? "text-success" : "text-danger")} />
                    ) : (
                      <IconCloudDownload className={cn("w-4 h-4", entry.status === "success" ? "text-success" : "text-danger")} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink leading-snug">{entry.detail}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-ink-3 font-mono">{entry.timestamp}</span>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider",
                        entry.status === "success" ? "text-success" : "text-danger"
                      )}>{entry.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
