import * as React from "react"
import { motion } from "motion/react"
import { IconMail, IconBrandLinkedin, IconBrandWhatsapp, IconMessage,  IconX, IconSettings, IconChartBar } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const CHANNELS = [
  {
    id: "email",
    name: "Email (SMTP/IMAP)",
    icon: <IconMail className="w-6 h-6" />,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/30",
    connected: true,
    status: "Healthy",
    limit: "400/day",
    usage: 142,
    health: 98,
  },
  {
    id: "linkedin",
    name: "LinkedIn (Stealth)",
    icon: <IconBrandLinkedin className="w-6 h-6" />,
    color: "text-blue-600",
    bgColor: "bg-blue-600/10",
    borderColor: "border-blue-600/30",
    connected: true,
    status: "Active Session",
    limit: "50/day",
    usage: 12,
    health: 100,
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    icon: <IconBrandWhatsapp className="w-6 h-6" />,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    connected: false,
    status: "Disconnected",
    limit: "-",
    usage: 0,
    health: 0,
  },
  {
    id: "sms",
    name: "SMS (Twilio)",
    icon: <IconMessage className="w-6 h-6" />,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    connected: false,
    status: "Disconnected",
    limit: "-",
    usage: 0,
    health: 0,
  }
]

export default function Channels() {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-display font-semibold tracking-tight text-ink">
            Omnichannel Hub
          </h1>
          <p className="text-ink-3">Manage outbound sending infrastructure and deliverability health.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {CHANNELS.map((channel, i) => (
          <motion.div
            key={channel.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={cn(
              "overflow-hidden transition-all duration-300",
              channel.connected ? "border-line" : "border-line/50 opacity-80"
            )}>
              <CardHeader className="flex flex-row items-start justify-between pb-4">
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border", channel.bgColor, channel.color, channel.borderColor)}>
                    {channel.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{channel.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {channel.connected ? (
                        <span className="flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-0.5 rounded-full font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                          {channel.status}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-ink-3 bg-surface-hover px-2 py-0.5 rounded-full font-medium">
                          <IconX className="w-3 h-3" />
                          {channel.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {channel.connected ? (
                  <Button variant="ghost" size="icon" className="text-ink-3">
                    <IconSettings className="w-5 h-5" />
                  </Button>
                ) : (
                  <Button variant="outline" size="sm">Connect</Button>
                )}
              </CardHeader>
              
              {channel.connected && (
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-line/50">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-ink-3">Daily Limit</span>
                      <span className="font-mono text-sm text-ink">{channel.limit}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-ink-3">Sent Today</span>
                      <span className="font-mono text-sm text-ink">{channel.usage}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-ink-3 flex items-center gap-1">
                        Health <IconChartBar className="w-3 h-3" />
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-success">{channel.health}%</span>
                        <div className="h-1.5 flex-1 bg-surface-hover rounded-full overflow-hidden">
                          <div className="h-full bg-success" style={{ width: `${channel.health}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-4 p-6 rounded-xl border border-warning/30 bg-warning/5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
          <IconBrandLinkedin className="w-5 h-5 text-warning" />
        </div>
        <div>
          <h3 className="text-warning font-semibold">LinkedIn Stealth Mode Warning</h3>
          <p className="text-sm text-warning/80 mt-1">
            LinkedIn automation requires a local session token. CortexOS bypasses IP bans by running headless Chromium locally on your machine. Keep your send volume under 50/day to prevent account suspension.
          </p>
        </div>
      </div>
    </div>
  )
}
