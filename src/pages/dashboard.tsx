import * as React from "react"
import { IconBuilding, IconUsers, IconBrain, IconWaveSine } from "@tabler/icons-react"
import { StatCard } from "@/components/ui/stat-card"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useCompanies, useContacts, useJobs } from "@/lib/hooks"
import { motion } from "motion/react"

export default function Dashboard() {
  const { companies } = useCompanies()
  const { contacts } = useContacts()
  const { activeJobs } = useJobs()

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-semibold tracking-tight text-ink">Dashboard</h1>
        <p className="text-ink-3">CortexOS Intelligence Overview</p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={item}>
          <StatCard
            title="Total Companies"
            value={companies.length}
            icon={<IconBuilding size={20} />}
            trend={{ value: 12, label: "from last week", isPositive: true }}
          />
        </motion.div>
        
        <motion.div variants={item}>
          <StatCard
            title="Total Contacts"
            value={contacts.length}
            icon={<IconUsers size={20} />}
            trend={{ value: 4, label: "from last week", isPositive: true }}
          />
        </motion.div>

        <motion.div variants={item}>
          <StatCard
            title="Active Agents"
            value={activeJobs.length}
            icon={<IconBrain size={20} />}
          />
        </motion.div>

        <motion.div variants={item}>
          <StatCard
            title="Strong Signals"
            value={34}
            icon={<IconWaveSine size={20} />}
            trend={{ value: 2, label: "from yesterday", isPositive: false }}
          />
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 24 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Intelligence Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Activity feed placeholder */}
              <div className="text-sm text-ink-3">No recent activity found. Connect an agent to begin.</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-ink-2">Cortex Nexus</span>
                <span className="text-success flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-success animate-pulse"/> Online</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-ink-2">Job Queue</span>
                <span className="text-ink">Idle</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-ink-2">Memory Graph</span>
                <span className="text-ink">Syncing</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
