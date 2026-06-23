import * as React from "react"
import { motion } from "motion/react"
import { IconCurrencyDollar, IconChartBar, IconArrowUpRight, IconTrophy } from "@tabler/icons-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts"

const REVENUE_DATA = [
  { month: "Jan", revenue: 12000, pipeline: 45000 },
  { month: "Feb", revenue: 18000, pipeline: 52000 },
  { month: "Mar", revenue: 24000, pipeline: 61000 },
  { month: "Apr", revenue: 35000, pipeline: 78000 },
  { month: "May", revenue: 48000, pipeline: 92000 },
  { month: "Jun", revenue: 64000, pipeline: 120000 },
  { month: "Jul", revenue: 82000, pipeline: 154000 },
]

const AGENT_LEADERBOARD = [
  { agent: "Outreach Engine", revenue: 345000, deals: 42, color: "#FF5500" },
  { agent: "Intent Radar", revenue: 182000, deals: 18, color: "#00AEEF" },
  { agent: "Persona Mapper", revenue: 95000, deals: 12, color: "#00D084" },
  { agent: "ICP Optimizer", revenue: 64000, deals: 8, color: "#A855F7" },
]

const COST_DATA = [
  { name: "LLM Tokens", cost: 450, color: "#FF5500" },
  { name: "Scraping Proxies", cost: 120, color: "#00AEEF" },
  { name: "API Enrichments", cost: 340, color: "#A855F7" },
]

export default function Revenue() {
  const totalRevenue = REVENUE_DATA.reduce((acc, curr) => acc + curr.revenue, 0)
  const totalPipeline = REVENUE_DATA.reduce((acc, curr) => acc + curr.pipeline, 0)
  const totalCost = COST_DATA.reduce((acc, curr) => acc + curr.cost, 0)
  const roi = Math.round((totalRevenue / totalCost) * 100)

  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-display font-semibold tracking-tight text-ink flex items-center gap-3">
            Revenue Attribution
            <span className="text-xs font-mono font-medium tracking-widest px-2 py-0.5 rounded-full border border-primary/30 bg-primary/10 text-primary">
              BILLION DOLLAR DASHBOARD
            </span>
          </h1>
          <p className="text-ink-3">Track closed-won revenue directly attributed to CortexOS agents.</p>
        </div>
      </div>

      {/* Top Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-ink-3">Total Closed Won</span>
                  <span className="text-5xl font-display font-bold tracking-tight text-primary">
                    ${(totalRevenue / 1000).toFixed(1)}k
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <IconCurrencyDollar className="w-8 h-8" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-leaf">
                <IconArrowUpRight className="w-4 h-4" />
                <span className="font-medium">+42.8%</span>
                <span className="text-ink-3">vs last quarter</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-ink-3">Agent Pipeline Generated</span>
                  <span className="text-4xl font-display font-semibold tracking-tight text-ink">
                    ${(totalPipeline / 1000).toFixed(1)}k
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-surface-hover text-ink-3">
                  <IconChartBar className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-ink-3">System ROI</span>
                  <span className="text-4xl font-display font-semibold tracking-tight text-leaf">
                    {roi}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-leaf/10 text-leaf">
                  <IconArrowUpRight className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 text-sm text-ink-3">
                Based on ${totalCost} operational costs
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Waterfall</CardTitle>
            <CardDescription>Pipeline creation and closed won deals over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF5500" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF5500" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPipeline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00AEEF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00AEEF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="month" stroke="#ffffff40" tick={{ fill: '#ffffff80', fontSize: 12 }} />
                <YAxis stroke="#ffffff40" tick={{ fill: '#ffffff80', fontSize: 12 }} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1A2E', borderColor: '#ffffff20', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
                />
                <Area type="monotone" dataKey="pipeline" stroke="#00AEEF" fillOpacity={1} fill="url(#colorPipeline)" name="Pipeline" />
                <Area type="monotone" dataKey="revenue" stroke="#FF5500" fillOpacity={1} fill="url(#colorRevenue)" name="Closed Won" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Side Panels */}
        <div className="flex flex-col gap-6">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconTrophy className="w-5 h-5 text-warning" />
                Agent Leaderboard
              </CardTitle>
              <CardDescription>Attributed revenue by agent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                {AGENT_LEADERBOARD.map((agent, i) => (
                  <div key={agent.agent} className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-ink">{agent.agent}</span>
                      <span className="font-mono text-ink-3">${(agent.revenue / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="h-2 w-full bg-surface-hover rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(agent.revenue / AGENT_LEADERBOARD[0].revenue) * 100}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="h-full rounded-full" 
                        style={{ backgroundColor: agent.color }} 
                      />
                    </div>
                    <span className="text-xs text-ink-3 text-right">{agent.deals} deals closed</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cost of Acquisition</CardTitle>
              <CardDescription>System operational costs</CardDescription>
            </CardHeader>
            <CardContent>
               <ResponsiveContainer width="100%" height={150}>
                <BarChart data={COST_DATA} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#ffffff80', fontSize: 11 }} width={100} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ backgroundColor: '#1A1A2E', borderColor: '#ffffff20', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value: number) => [`$${value}`, "Cost"]}
                  />
                  <Bar dataKey="cost" radius={[0, 4, 4, 0]} barSize={12}>
                    {COST_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-line/50">
                <span className="text-sm font-medium text-ink-3">Total Cost</span>
                <span className="font-mono text-lg text-danger">${totalCost}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
