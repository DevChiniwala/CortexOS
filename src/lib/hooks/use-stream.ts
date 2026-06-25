import { useState, useEffect, useCallback, useRef } from "react";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { invoke } from "@/lib/ipc/commands";
import { isTauriRuntime } from "@/lib/ipc/commands";
import type { LogEntry } from "@/lib/types";

export interface StreamState {
  isStreaming: boolean;
  logs: LogEntry[];
  jobId: string | null;
  error: string | null;
}

// ============================================================================
// Deep Research Simulation Scripts
// Each agent type has a unique, multi-step simulation sequence.
// ============================================================================

type SimStep = { type: LogEntry["type"]; content: string; delay: number; toolName?: string };

function getResearchSteps(targetName: string): SimStep[] {
  return [
    { type: "system", delay: 300, content: `[CORTEX] Initializing deep_research agent for ${targetName}...` },
    { type: "system", delay: 600, content: `[CORTEX] Research depth: DEEP (8 specialists + verifier)` },
    { type: "system", delay: 400, content: `[CORTEX] Spawning agent pool... 8/8 workers online.` },
    { type: "thinking", delay: 1200, content: `Planning multi-source research strategy for ${targetName}. Will search corporate filings, LinkedIn company page, Crunchbase profile, tech blog posts, and recent press releases. Decomposing into 4 parallel tracks: (1) Firmographic profile, (2) Technology stack, (3) Financial health & funding, (4) Leadership & org changes.` },
    { type: "tool_use", delay: 800, content: `Calling search_web: "site:linkedin.com/company ${targetName}"`, toolName: "search_web" },
    { type: "tool_result", delay: 1500, content: `Found LinkedIn company page. Extracting employee count, headquarters, recent posts, and key hires from last 90 days.` },
    { type: "tool_use", delay: 600, content: `Calling search_web: "${targetName} funding round 2025 2026 crunchbase"`, toolName: "search_web" },
    { type: "tool_result", delay: 1800, content: `Found 8 results. Crunchbase shows most recent funding: identified latest round details, lead investors, and post-money valuation estimate.` },
    { type: "thinking", delay: 1000, content: `Analyzing funding trajectory. Company has raised across multiple rounds. Growth rate suggests strong investor confidence. Will now investigate technology stack for product-market fit assessment.` },
    { type: "tool_use", delay: 500, content: `Calling browse_page: "https://${targetName.toLowerCase().replace(/\s+/g, '')}.com/careers"`, toolName: "browse_page" },
    { type: "tool_result", delay: 2000, content: `Careers page parsed. Found 23 open roles. Dominant stack signals: React, TypeScript, Python, Kubernetes, AWS. 6 AI/ML positions open — indicates heavy investment in AI capabilities.` },
    { type: "info", delay: 400, content: `[Worker 3/8] Tech Stack Specialist completed. Confidence: 94%` },
    { type: "tool_use", delay: 600, content: `Calling search_web: "${targetName} pricing page OR plans OR enterprise"`, toolName: "search_web" },
    { type: "tool_result", delay: 1200, content: `Pricing page found. Freemium model with enterprise tier starting at $49/seat/mo. Enterprise plan is "Contact Sales" — indicates ACV flexibility above $50K.` },
    { type: "info", delay: 300, content: `[Worker 5/8] Pricing Analyst completed. Confidence: 88%` },
    { type: "tool_use", delay: 700, content: `Calling search_web: "${targetName} CEO CTO leadership changes 2025 2026"`, toolName: "search_web" },
    { type: "tool_result", delay: 1500, content: `Detected leadership change: New CRO appointed in Q1 2026. Former CRO moved to advisory. New CRO previously scaled revenue at a major competitor from $40M to $150M ARR.` },
    { type: "info", delay: 300, content: `[Worker 7/8] Org Intelligence completed. Confidence: 91%` },
    { type: "thinking", delay: 1200, content: `Cross-referencing all 8 specialist outputs. Building unified company intelligence profile. Key synthesis: ${targetName} is in aggressive growth mode with recent leadership injection, strong AI investment signals, and enterprise-ready pricing. Total research confidence: 92%.` },
    { type: "info", delay: 400, content: `[Verifier Agent] Cross-checking financial data against SEC filings...` },
    { type: "info", delay: 800, content: `[Verifier Agent] Validating employee count against LinkedIn data...` },
    { type: "info", delay: 600, content: `[Verifier Agent] All 8 specialist reports verified. 0 conflicts detected.` },
    { type: "assistant", delay: 1000, content: `Research complete for ${targetName}. Generated comprehensive intelligence profile covering: company overview, technology stack (React/Python/K8s/AWS), funding history, pricing model ($49/seat freemium + enterprise), leadership changes (new CRO Q1 2026), competitive positioning, and 23 open roles analysis. Overall research confidence: 92%.` },
    { type: "system", delay: 500, content: `[CORTEX] deep_research agent completed successfully. Profile saved.` },
  ];
}

function getScoringSteps(targetName: string): SimStep[] {
  return [
    { type: "system", delay: 300, content: `[CORTEX] Initializing scoring agent for ${targetName}...` },
    { type: "system", delay: 500, content: `[CORTEX] Loading active scoring config: "Default ICP v2"` },
    { type: "thinking", delay: 1000, content: `Evaluating ${targetName} against 2 required characteristics and 4 demand signifiers. Will score each dimension independently then compute weighted total.` },
    { type: "info", delay: 800, content: `[Requirement 1/2] Minimum Company Size: Checking employee count and org structure...` },
    { type: "info", delay: 600, content: `[Requirement 1/2] ✓ PASSED — Estimated 500+ employees, full C-suite, multi-regional presence.` },
    { type: "info", delay: 800, content: `[Requirement 2/2] Target Industry: Checking against B2B SaaS / Enterprise Tech criteria...` },
    { type: "info", delay: 600, content: `[Requirement 2/2] ✓ PASSED — Confirmed B2B SaaS vendor in the sales intelligence vertical.` },
    { type: "thinking", delay: 1000, content: `Both required characteristics passed. Now scoring 4 demand signifiers on a 0-10 scale with detailed justification for each.` },
    { type: "info", delay: 1200, content: `[Signifier 1/4] Growth Signals: x8/10 — Strong revenue growth (~30% YoY), new executive hires, major product launches.` },
    { type: "info", delay: 1200, content: `[Signifier 2/4] Technology Adoption: x7/10 — Modern stack, multi-LLM integration, ISO 27001 certified.` },
    { type: "info", delay: 1200, content: `[Signifier 3/4] Budget Authority: x9/10 — Clear decision-making structure, identified economic buyers.` },
    { type: "info", delay: 1200, content: `[Signifier 4/4] Pain Point Alignment: x10/10 — Direct product-market fit for autonomous data enrichment.` },
    { type: "thinking", delay: 800, content: `Computing weighted score: (8 + 7 + 9 + 10) * 2.38 = 81. Tier classification: HOT (threshold: 75+).` },
    { type: "assistant", delay: 800, content: `Scoring complete for ${targetName}. Final score: 81 (HOT tier). All 2/2 requirements passed. Strongest signal: Pain Point Alignment (10/10). Weakest: Technology Adoption (7/10).` },
    { type: "system", delay: 400, content: `[CORTEX] scoring agent completed. Score saved to database.` },
  ];
}

function getConversationSteps(targetName: string): SimStep[] {
  return [
    { type: "system", delay: 300, content: `[CORTEX] Initializing conversation_engine for ${targetName}...` },
    { type: "system", delay: 500, content: `[CORTEX] Loading contact profiles and recent signals...` },
    { type: "thinking", delay: 1200, content: `Analyzing 3 contacts at ${targetName}. Will generate personalized icebreakers based on recent company signals (new CRO hire, product launch, AI investment), individual LinkedIn activity, and mutual connections.` },
    { type: "info", delay: 800, content: `[Contact 1/3] VP Sales — Identified recent LinkedIn post about "scaling outbound with AI agents"` },
    { type: "info", delay: 600, content: `[Contact 1/3] Generated 3 icebreaker sequences anchored on their AI outbound interest.` },
    { type: "info", delay: 800, content: `[Contact 2/3] CRO — New hire, previously at competitor. Identified mutual connection through YC network.` },
    { type: "info", delay: 600, content: `[Contact 2/3] Generated welcome sequence + competitive displacement angle.` },
    { type: "info", delay: 800, content: `[Contact 3/3] Head of RevOps — Published blog post on "data quality challenges in enterprise GTM"` },
    { type: "info", delay: 600, content: `[Contact 3/3] Generated thought-leadership engagement sequence.` },
    { type: "assistant", delay: 1000, content: `Conversation generation complete. Created 9 personalized outreach sequences across 3 contacts. Each sequence includes: subject line, opening icebreaker, value proposition hook, and soft CTA. All anchored on real-time signals.` },
    { type: "system", delay: 400, content: `[CORTEX] conversation_engine completed. Topics saved.` },
  ];
}

function getOutreachSteps(targetName: string): SimStep[] {
  return [
    { type: "system", delay: 300, content: `[CORTEX] Initializing outreach_agent for ${targetName}...` },
    { type: "thinking", delay: 1000, content: `Executing autonomous omnichannel loop for ${targetName}. Loading conversation drafts, channel connections, and calendar availability.` },
    { type: "tool_use", delay: 800, content: `Calling linkedin_stealth: Send connection request with personalized note to Contact #1.`, toolName: "linkedin_stealth" },
    { type: "info", delay: 1500, content: `[LinkedIn Worker] Connection request sent. Awaiting acceptance.` },
    { type: "tool_result", delay: 1000, content: `Connection accepted 2 hours later.` },
    { type: "tool_use", delay: 800, content: `Calling linkedin_stealth: Send voice note to Contact #1.`, toolName: "linkedin_stealth" },
    { type: "info", delay: 2000, content: `[Tracking Worker] LinkedIn message read by Contact #1. No immediate reply.` },
    { type: "thinking", delay: 1500, content: `Escalating to Email channel based on sequence rules.` },
    { type: "tool_use", delay: 1000, content: `Calling email_api: Send personalized value-add email.`, toolName: "email_api" },
    { type: "tool_result", delay: 800, content: `Email delivered to inbox.` },
    { type: "info", delay: 2000, content: `[Tracking Worker] Email opened. Link clicked. Still no reply.` },
    { type: "thinking", delay: 1000, content: `High engagement detected. Initiating WhatsApp direct message sequence.` },
    { type: "tool_use", delay: 600, content: `Calling whatsapp_api: Send direct message to Contact #1.`, toolName: "whatsapp_api" },
    { type: "tool_result", delay: 1000, content: `WhatsApp message delivered and read.` },
    { type: "info", delay: 2000, content: `[Tracking Worker] WhatsApp reply received: "Hey, the autonomous SDR concept is interesting. Can you send over a deck + do a live demo? I'm open Thursday afternoon GMT."` },
    { type: "info", delay: 800, content: `[Classifier Worker] Intent: INTERESTED. Confidence: 95%. Ask: Demo & Deck. Timeframe: Thu GMT.` },
    { type: "tool_use", delay: 1000, content: `Calling calendar_api: Find available slots for Thu afternoon GMT.`, toolName: "calendar_api" },
    { type: "tool_result", delay: 800, content: `Found 3 available slots.` },
    { type: "thinking", delay: 1000, content: `Drafting WhatsApp reply to book meeting and include requested deck link.` },
    { type: "tool_use", delay: 600, content: `Calling whatsapp_api: Send reply to Contact #1.`, toolName: "whatsapp_api" },
    { type: "info", delay: 2000, content: `[Tracking Worker] Meeting booked via scheduling link.` },
    { type: "assistant", delay: 1000, content: `Omnichannel outreach execution complete for ${targetName}. Dispatched sequence across LinkedIn, Email, and WhatsApp. Handled 1 high-intent reply on WhatsApp and successfully booked 1 meeting for Thursday at 2pm GMT. Meeting details synced to CRM.` },
    { type: "system", delay: 500, content: `[CORTEX] outreach_agent completed.` },
  ];
}

function getSignalMonitorSteps(targetName: string): SimStep[] {
  return [
    { type: "system", delay: 300, content: `[CORTEX] Initializing signal_monitor for ${targetName}...` },
    { type: "thinking", delay: 1000, content: `Starting continuous intent monitoring for ${targetName}. Deploying headless browser spiders to track real-time changes.` },
    { type: "tool_use", delay: 800, content: `Calling scraper: Scan Greenhouse/Lever boards for new GTM role postings.`, toolName: "scraper" },
    { type: "info", delay: 1500, content: `[Spider Worker] Found 12 new roles opened in the last 48 hours across Sales and RevOps.` },
    { type: "tool_result", delay: 1000, content: `Hiring surge detected. Confidence: 94%.` },
    { type: "tool_use", delay: 800, content: `Calling intent_api: Query Bombora for topic surges related to 'Autonomous Pipeline'.`, toolName: "intent_api" },
    { type: "tool_result", delay: 1500, content: `Intent score for 'Autonomous Pipeline' increased by 45% week-over-week.` },
    { type: "tool_use", delay: 1000, content: `Calling linkedin_api: Check for leadership changes in the buying committee.`, toolName: "linkedin_api" },
    { type: "tool_result", delay: 1200, content: `New CRO appointed 5 days ago.` },
    { type: "thinking", delay: 1500, content: `Aggregating signals. Found 3 distinct buying signals (Hiring Surge, Intent Spike, Leadership Change). Overlapping signals increase conversion probability by 3.4x.` },
    { type: "info", delay: 800, content: `[Mesh Router] Moving ${targetName} to center of Intent Mesh. Triggering Conversation Engine.` },
    { type: "assistant", delay: 1000, content: `Signal monitoring complete. Detected high-intent cluster for ${targetName}. Signals persisted to Event Stream and pushed to Intent Mesh UI.` },
    { type: "system", delay: 500, content: `[CORTEX] signal_monitor sleeping...` },
  ];
}

function getPersonaMapperSteps(targetName: string): SimStep[] {
  return [
    { type: "system", delay: 300, content: `[CORTEX] Initializing persona_mapper for ${targetName}...` },
    { type: "thinking", delay: 1000, content: `Starting deep relationship mapping for ${targetName}. Identifying buying committee members and extracting persona metadata.` },
    { type: "tool_use", delay: 800, content: `Calling linkedin_api: Scan ${targetName} employee directory for VP and C-level executives.`, toolName: "linkedin_api" },
    { type: "tool_result", delay: 1500, content: `Found 3 key contacts: CEO, VP of Sales, and Director of RevOps.` },
    { type: "info", delay: 800, content: `[Classification Worker] Assigning Buying Roles: CEO -> Economic Buyer, VP of Sales -> Champion, RevOps -> Influencer.` },
    { type: "tool_use", delay: 1000, content: `Calling web_scraper: Cross-reference contact history for relationship strength indicators (past employers, shared connections, previous software stack).`, toolName: "web_scraper" },
    { type: "tool_result", delay: 1200, content: `VP of Sales was an early adopter of your platform at their previous company. Relationship strength increased to 85/100.` },
    { type: "thinking", delay: 1500, content: `Generating persona tags for each contact based on recent posts, job descriptions, and career history.` },
    { type: "info", delay: 800, content: `[Graph Engine] Mapped buying committee structure. Identified Champion as optimal entry point.` },
    { type: "assistant", delay: 1000, content: `Persona mapping complete. Grouped contacts into Buying Committee with assigned roles and relationship paths. Data saved to Contacts.` },
    { type: "system", delay: 500, content: `[CORTEX] persona_mapper completed.` },
  ];
}

function getIcpOptimizerSteps(_targetName: string): SimStep[] {
  return [
    { type: "system", delay: 300, content: `[CORTEX] Initializing icp_optimizer for global learning loop...` },
    { type: "thinking", delay: 1000, content: `Pulling last 30 days of Outreach & CRM telemetry data. Looking for statistical correlations between signifier weights and Won/Lost outcomes.` },
    { type: "tool_use", delay: 800, content: `Calling crm_api: Query Closed Won deals in Q2.`, toolName: "crm_api" },
    { type: "tool_result", delay: 1500, content: `Fetched 42 Closed Won deals.` },
    { type: "tool_use", delay: 1000, content: `Calling outreach_api: Query Rejected / No-show sequences.`, toolName: "outreach_api" },
    { type: "tool_result", delay: 1200, content: `Fetched 84 negative outcomes.` },
    { type: "thinking", delay: 1500, content: `Running multivariable regression on scoring criteria. Discovered anomaly: 'Pain Point Alignment' weight is 1.0, but negatively correlates (-0.24) with short-term wins for Engineering personas.` },
    { type: "info", delay: 800, content: `[Optimization Engine] Adjusting weight for 'Pain Point Alignment' down to 0.8.` },
    { type: "thinking", delay: 1500, content: `Discovered positive correlation (+0.42): 'Growth Signals' (Specifically new C-Suite) heavily precedes conversion.` },
    { type: "info", delay: 800, content: `[Optimization Engine] Adjusting weight for 'Growth Signals' up to 1.8.` },
    { type: "assistant", delay: 1000, content: `ICP weights optimized. Confidence increased to 84.2%. Rerunning global lead scoring against pipeline.` },
    { type: "system", delay: 500, content: `[CORTEX] icp_optimizer completed. Sleeping.` },
  ];
}

function getCrmSyncSteps(targetName: string): SimStep[] {
  return [
    { type: "system", delay: 300, content: `[CORTEX] Initializing crm_sync for ${targetName}...` },
    { type: "thinking", delay: 1000, content: `Connecting to HubSpot API. Authenticating with OAuth2 token.` },
    { type: "tool_use", delay: 800, content: `Calling hubspot_api: Push scored companies with tier >= warm.`, toolName: "hubspot_api" },
    { type: "tool_result", delay: 1500, content: `Pushed 24 company records. Created 3 new accounts, updated 21 existing.` },
    { type: "tool_use", delay: 1000, content: `Calling hubspot_api: Push contacts with buying roles and persona tags.`, toolName: "hubspot_api" },
    { type: "tool_result", delay: 1200, content: `Synced 18 contacts. Mapped buying_role to custom CRM property.` },
    { type: "tool_use", delay: 800, content: `Calling hubspot_api: Pull deal stage updates from CRM pipeline.`, toolName: "hubspot_api" },
    { type: "tool_result", delay: 1500, content: `Pulled 8 deal stage changes. 2 moved to Closed Won, 1 to Closed Lost.` },
    { type: "thinking", delay: 1000, content: `Forwarding deal outcomes to ICP Optimizer for weight adjustment. Closed Won companies will reinforce current scoring weights.` },
    { type: "assistant", delay: 1000, content: `CRM sync complete. 24 companies pushed, 18 contacts synced, 8 deal updates pulled. Next sync in 15 minutes.` },
    { type: "system", delay: 500, content: `[CORTEX] crm_sync sleeping for 15m.` },
  ];
}

function getSimulationSteps(jobType: string, targetName: string): SimStep[] {
  switch (jobType) {
    case "scoring": return getScoringSteps(targetName);
    case "conversation": return getConversationSteps(targetName);
    case "outreach": return getOutreachSteps(targetName);
    case "signals": return getSignalMonitorSteps(targetName);
    case "persona": return getPersonaMapperSteps(targetName);
    case "icp": return getIcpOptimizerSteps(targetName);
    case "crm": return getCrmSyncSteps(targetName);
    default: return getResearchSteps(targetName);
  }
}

export function useStream() {
  const [state, setState] = useState<StreamState>({
    isStreaming: false,
    logs: [],
    jobId: null,
    error: null,
  });

  const unlistenRef = useRef<UnlistenFn | null>(null);
  const logsRef = useRef<LogEntry[]>([]);
  const cancelledRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      if (unlistenRef.current) {
        unlistenRef.current();
      }
    };
  }, []);

  const clearStream = useCallback(() => {
    setState((prev) => ({ ...prev, logs: [], error: null }));
    logsRef.current = [];
  }, []);

  // Deep Simulation Engine
  const startSimulatedStream = useCallback(async (jobType: string, targetName: string) => {
    cancelledRef.current = false;
    const jobId = "sim-" + Date.now();
    setState({ isStreaming: true, logs: [], jobId, error: null });
    logsRef.current = [];

    const addLog = (type: LogEntry["type"], content: string, toolName?: string) => {
      const entry: LogEntry = { type, content, timestamp: Date.now(), toolName };

      logsRef.current = [...logsRef.current, entry];
      setState((prev) => ({ ...prev, logs: logsRef.current }));
    };

    const steps = getSimulationSteps(jobType, targetName);

    for (const step of steps) {
      if (cancelledRef.current) break;
      await new Promise((r) => setTimeout(r, step.delay));
      if (cancelledRef.current) break;
      addLog(step.type, step.content, step.toolName);
    }

    if (!cancelledRef.current) {
      setState((prev) => ({ ...prev, isStreaming: false }));
    }
  }, []);

  const startStream = useCallback(async (jobType: string, targetId: number, targetName: string) => {
    if (!isTauriRuntime()) {
      return startSimulatedStream(jobType, targetName);
    }

    try {
      clearStream();
      setState((prev) => ({ ...prev, isStreaming: true, error: null }));
      
      if (unlistenRef.current) unlistenRef.current();
      
      unlistenRef.current = await listen<LogEntry>("stream_event", (event) => {
        logsRef.current = [...logsRef.current, event.payload];
        setState((prev) => ({ ...prev, logs: logsRef.current }));
      });

      const response = await invoke<Record<string, unknown>>("start_research_job", { jobType, targetId });
      setState((prev) => ({ ...prev, jobId: response.jobId || "native-job" }));

    } catch (err) {
      setState((prev) => ({ 
        ...prev, 
        isStreaming: false, 
        error: err instanceof Error ? err.message : "Failed to start stream" 
      }));
    }
  }, [clearStream, startSimulatedStream]);

  const stopStream = useCallback(async () => {
    cancelledRef.current = true;
    if (state.jobId && isTauriRuntime() && !state.jobId.startsWith("sim-")) {
       try {
         await invoke("cancel_job", { jobId: state.jobId });
       } catch (e) {
         console.error("Failed to cancel job", e);
       }
    }
    setState((prev) => ({ ...prev, isStreaming: false }));
    if (unlistenRef.current) {
      unlistenRef.current();
      unlistenRef.current = null;
    }
  }, [state.jobId]);

  return {
    ...state,
    startStream,
    stopStream,
    clearStream,
  };
}
