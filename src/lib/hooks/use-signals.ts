import * as React from "react"
import { localGetSignals, localAddSignal } from "../local-store"
import type { Signal } from "@/lib/types"

// Generate some seed data if empty
function ensureSeedData() {
  const existing = localGetSignals()
  if (existing.length === 0) {
    const seedSignals: Omit<Signal, "id" | "detectedAt">[] = [
      {
        companyName: "Cognism",
        companyId: 1,
        type: "leadership_change",
        title: "New CRO Appointed",
        description: "James Isilay shifted roles. Focus on scaling outbound automation motion.",
        confidence: 100,
        source: "LinkedIn Changes"
      },
      {
        companyName: "Apollo.io",
        companyId: 2,
        type: "funding_round",
        title: "Series D ($1.6B Valuation)",
        description: "Raised new funding round to expand GTM intelligence platform.",
        confidence: 100,
        source: "Crunchbase API"
      },
      {
        companyName: "Clay",
        companyId: 6,
        type: "hiring_surge",
        title: "Go-to-Market Hiring Surge",
        description: "Opened 12 new roles across Sales, RevOps, and Marketing in the last 14 days.",
        confidence: 94,
        source: "Greenhouse"
      },
      {
        companyName: "Apriora",
        companyId: 5,
        type: "tech_adoption",
        title: "Adopted Gong",
        description: "Recent job postings for AE roles now require Gong experience.",
        confidence: 88,
        source: "Job Postings"
      },
      {
        companyName: "Zepto",
        companyId: 3,
        type: "intent_data",
        title: "Researching 'Autonomous Agents'",
        description: "Surge in intent topic consumption for 'AI Sales Agents' and 'Autonomous Pipeline'.",
        confidence: 82,
        source: "Bombora Intent"
      },
      {
        companyName: "AGS Health",
        companyId: 4,
        type: "competitor_detected",
        title: "Evaluating Outreach.io",
        description: "Contacts mapped to an active Outreach.io evaluation based on recent web traffic.",
        confidence: 76,
        source: "Clearbit Reveal"
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
