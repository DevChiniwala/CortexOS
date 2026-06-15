import * as React from "react"
import { localGetSignals, localAddSignal, type Signal } from "../local-store"

// Generate some seed data if empty
function ensureSeedData() {
  const existing = localGetSignals()
  if (existing.length === 0) {
    const seedSignals: Omit<Signal, "id" | "detectedAt">[] = [
      {
        companyName: "Acme Corp",
        companyId: 101,
        type: "hiring_surge",
        title: "Engineering Hiring Surge",
        description: "Opened 15 new engineering roles in the last 7 days, indicating expansion.",
        confidence: 92,
        source: "LinkedIn Jobs"
      },
      {
        companyName: "Globex",
        companyId: 102,
        type: "funding_round",
        title: "Series B Funding ($25M)",
        description: "Just announced a $25M Series B led by Sequoia.",
        confidence: 100,
        source: "TechCrunch"
      },
      {
        companyName: "Initech",
        companyId: 103,
        type: "tech_adoption",
        title: "Adopted Snowflake",
        description: "Job descriptions now require Snowflake experience, replacing Redshift.",
        confidence: 85,
        source: "Job Postings"
      },
      {
        companyName: "Soylent",
        companyId: 104,
        type: "leadership_change",
        title: "New VP of Sales",
        description: "Hired John Smith as VP of Sales from Salesforce.",
        confidence: 95,
        source: "LinkedIn Changes"
      }
    ]
    
    // Add in reverse order so they appear chronologically correct in the unshift
    for (const s of seedSignals.reverse()) {
      localAddSignal(s)
      // Sleep tiny bit to offset timestamps
      const start = Date.now()
      while (Date.now() - start < 10) {}
    }
  }
}

export function useSignals() {
  const [signals, setSignals] = React.useState<Signal[]>([])
  
  React.useEffect(() => {
    ensureSeedData()
    setSignals(localGetSignals())
  }, [])

  return { signals }
}
