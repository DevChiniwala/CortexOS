import { useCompanies, useContacts, useSignals } from "@/lib/hooks"
import { Sparkline } from "@/components/ui/sparkline"
import { FunnelChart } from "@/components/dashboard/funnel-chart"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { IconBuilding, IconUsers, IconRadar, IconChartBar } from "@tabler/icons-react"
import { motion } from "motion/react"

export default function Dashboard() {
  const { companies } = useCompanies()
  const { contacts } = useContacts()
  const { signals } = useSignals()

  // Generate some fake sparkline data that trends up
  const generateSparkData = (base: number, volatility: number = 0.2) => {
    let current = base
    return Array.from({ length: 20 }, () => {
      current = current + (Math.random() - 0.3) * base * volatility
      return Math.max(0, current)
    })
  }

  const stats = [
    { 
      label: "Total Accounts", 
      value: companies.length, 
      icon: <IconBuilding className="w-5 h-5" />, 
      color: "#FF5500", // Primary
      sparkline: generateSparkData(companies.length || 10, 0.1) 
    },
    { 
      label: "Discovered Contacts", 
      value: contacts.length, 
      icon: <IconUsers className="w-5 h-5" />, 
      color: "#00AEEF", // Info
      sparkline: generateSparkData(contacts.length || 20, 0.15) 
    },
    { 
      label: "Buying Signals", 
      value: signals.length, 
      icon: <IconRadar className="w-5 h-5" />, 
      color: "#00D084", // Success
      sparkline: generateSparkData(signals.length || 5, 0.3) 
    },
    { 
      label: "Qualified ICP", 
      value: companies.filter(c => c.userStatus === 'qualified').length, 
      icon: <IconChartBar className="w-5 h-5" />, 
      color: "#FFB020", // Warning
      sparkline: generateSparkData(3, 0.4) 
    },
  ]

  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-display font-semibold tracking-tight text-ink">Command Center</h1>
          <p className="text-ink-3">System status and intelligence overview</p>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="hover:border-primary/50 transition-colors h-full flex flex-col justify-between">
              <CardContent className="p-5 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-ink-3">{stat.label}</span>
                    <span className="text-3xl font-display font-semibold tracking-tight text-ink">
                      {stat.value}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-hover" style={{ color: stat.color }}>
                    {stat.icon}
                  </div>
                </div>
                
                <div className="h-10 mt-auto opacity-70">
                  <Sparkline 
                    data={stat.sparkline} 
                    color={stat.color} 
                    width={200} 
                    height={40} 
                    strokeWidth={2}
                    className="w-full h-full"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Funnel */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="h-[400px]">
            <CardHeader>
              <CardTitle>Pipeline Velocity</CardTitle>
              <CardDescription>Conversion rates through the orchestration flow</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <FunnelChart />
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Activity Feed */}
        <div className="flex flex-col gap-6">
          <Card className="h-[400px]">
            <CardHeader className="pb-4">
              <CardTitle>Live Activity</CardTitle>
              <CardDescription>System events and agent logs</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityFeed />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
