import * as React from "react"
import { useCompanies } from "@/lib/hooks"

export function FunnelChart() {
  const { companies } = useCompanies()

  // Calculate funnel stages based on CRM statuses
  const stages = React.useMemo(() => {
    const total = companies.length || 1 // prevent div by zero
    
    // Example mapping of statuses to generic pipeline stages
    const newCount = companies.filter(c => c.userStatus === 'new' || !c.userStatus).length
    const engagedCount = companies.filter(c => c.userStatus === 'engaged').length
    const qualifiedCount = companies.filter(c => c.userStatus === 'qualified').length
    const closedCount = companies.filter(c => c.userStatus === 'closed').length

    return [
      { id: 'new', label: 'Discovered', count: newCount, color: '#FF5500' },
      { id: 'engaged', label: 'Researching', count: engagedCount, color: '#FF8800' },
      { id: 'qualified', label: 'Qualified ICP', count: qualifiedCount, color: '#00AEEF' },
      { id: 'closed', label: 'Converted', count: closedCount, color: '#00D084' }
    ]
  }, [companies])

  const maxCount = Math.max(...stages.map(s => s.count)) || 1

  return (
    <div className="flex flex-col gap-3 w-full h-full justify-center">
      {stages.map((stage, i) => {
        // Calculate a visual width that creates a funnel shape, but ensures text is readable
        // Base width on percentage of max, but enforce a minimum width taper
        const minTaperWidth = 100 - (i * 15) // 100%, 85%, 70%, 55%
        const dataWidth = (stage.count / maxCount) * 100
        // Use the visual taper to look nice even if data is 0, but show real numbers
        const visualWidth = Math.max(dataWidth, minTaperWidth, 20) 
        
        return (
          <div key={stage.id} className="flex items-center gap-4 w-full group cursor-pointer">
            <div className="w-24 text-right shrink-0">
              <span className="text-sm font-medium text-ink-2 group-hover:text-ink transition-colors">{stage.label}</span>
            </div>
            
            <div className="flex-1 flex justify-center h-10">
              <div 
                className="h-full rounded-md flex items-center justify-center transition-all duration-500 shadow-sm overflow-hidden relative"
                style={{ 
                  width: `${visualWidth}%`, 
                  backgroundColor: `${stage.color}15`,
                  border: `1px solid ${stage.color}30`,
                }}
              >
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent to-white/10" 
                  style={{ width: `${(stage.count / maxCount) * 100}%`, backgroundColor: stage.color }}
                />
                <span className="relative z-10 font-mono text-sm font-bold tracking-wide mix-blend-difference text-white">
                  {stage.count}
                </span>
              </div>
            </div>
            
            <div className="w-16 shrink-0">
              <span className="text-xs font-mono text-ink-3">
                {companies.length > 0 ? Math.round((stage.count / companies.length) * 100) : 0}%
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
