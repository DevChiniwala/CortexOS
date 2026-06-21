// ============================================================================
// CortexOS Type System — Strict TypeScript types for the entire application.
// All IPC boundaries, stores, and hooks reference these canonical types.
// ============================================================================

// ============================================================================
// Company (Lead) Types
// ============================================================================

export interface Company {
  id: number;
  companyName: string;
  website: string | null;
  industry: string | null;
  subIndustry: string | null;
  employees: number | null;
  employeeRange: string | null;
  revenue: number | null;
  revenueRange: string | null;
  companyLinkedinUrl: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  researchStatus: ResearchStatus;
  researchedAt: number | null;
  userStatus: string;
  createdAt: number;
  companyProfile: string | null;
}

export interface NewCompany {
  companyName: string;
  website?: string;
  city?: string;
  state?: string;
  country?: string;
}

export type ResearchStatus = "pending" | "in_progress" | "completed" | "failed";

// ============================================================================
// Person / Contact Types
// ============================================================================

export interface Contact {
  id: number;
  companyId: number | null;
  firstName: string;
  lastName: string;
  email: string | null;
  emailSource: string | null;
  emailStatus: string | null;
  apolloPersonId: string | null;
  phone: string | null;
  title: string | null;
  managementLevel: string | null;
  linkedinUrl: string | null;
  yearJoined: number | null;
  personProfile: string | null;
  researchStatus: ResearchStatus;
  researchedAt: number | null;
  userStatus: string;
  conversationTopics: string | null;
  conversationGeneratedAt: number | null;
  createdAt: number;
}

export interface ContactWithCompany extends Contact {
  companyName: string | null;
  companyWebsite: string | null;
  companyIndustry: string | null;
}

export interface NewContact {
  firstName: string;
  lastName: string;
  email?: string;
  title?: string;
  linkedinUrl?: string;
  companyId?: number;
}

// ============================================================================
// Scoring Types
// ============================================================================

export type ScoringTier = "hot" | "warm" | "nurture" | "filtered" | "unscored";

export interface RequiredCharacteristic {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface DemandSignifier {
  id: string;
  name: string;
  description: string;
  weight: number;
  enabled: boolean;
}

export interface RequirementResult {
  id: string;
  name: string;
  passed: boolean;
  reason: string;
}

export interface SignifierScore {
  id: string;
  name: string;
  weight: number;
  score: number;
  weightedScore: number;
  reason: string;
}

export interface ScoringConfig {
  id: number;
  name: string;
  isActive: boolean;
  requiredCharacteristics: RequiredCharacteristic[];
  demandSignifiers: DemandSignifier[];
  tierHotMin: number;
  tierWarmMin: number;
  tierNurtureMin: number;
  createdAt: number;
  updatedAt: number;
}

export interface CompanyScore {
  id: number;
  companyId: number;
  configId: number;
  passesRequirements: boolean;
  requirementResults: RequirementResult[];
  totalScore: number;
  scoreBreakdown: SignifierScore[];
  tier: ScoringTier;
  scoringNotes: string | null;
  scoredAt: number | null;
  createdAt: number;
}

export interface CompanyWithScore extends Company {
  score: CompanyScore | null;
}

// ============================================================================
// Prompt Types
// ============================================================================

export interface Prompt {
  id: number;
  type: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export type PromptType = "company" | "person" | "company_overview" | "conversation_topics";

// ============================================================================
// Job Types
// ============================================================================

export type JobType =
  | "company_research"
  | "person_research"
  | "scoring"
  | "conversation"
  | "lead_finder";

export type JobStatus = "queued" | "running" | "completed" | "error" | "timeout" | "cancelled";

export interface Job {
  id: string;
  jobType: JobType;
  entityId: number;
  entityLabel: string;
  status: JobStatus;
  prompt: string;
  model: string | null;
  workingDir: string;
  outputPath: string | null;
  exitCode: number | null;
  errorMessage: string | null;
  createdAt: number;
  startedAt: number | null;
  completedAt: number | null;
  pid: number | null;
}

export interface JobLog {
  id: number;
  jobId: string;
  logType: string;
  content: string;
  toolName: string | null;
  timestamp: number;
  sequence: number;
  source: "stdout" | "stderr" | "internal";
}

// ============================================================================
// Stream / Agent Event Types
// ============================================================================

export type LogEntryType =
  | "system"
  | "assistant"
  | "thinking"
  | "tool_use"
  | "tool_result"
  | "error"
  | "info"
  | "progress"
  | "browser"
  | "redirect";

export interface LogEntry {
  type: LogEntryType;
  content: string;
  toolName?: string;
  timestamp: number;
}

export interface ClientLogEntry extends Omit<LogEntry, "timestamp"> {
  id: string;
  timestamp: Date;
}

export interface StreamEvent {
  jobId: string;
  eventType: string;
  content: string;
  timestamp: number;
}

export interface ResearchResult {
  jobId: string;
  status: string;
}

// ============================================================================
// Navigation
// ============================================================================

export interface AdjacentResult {
  prevLead: number | null;
  nextLead: number | null;
  currentIndex: number;
  total: number;
}

// ============================================================================
// Settings Types
// ============================================================================

export type ResearchDepth = "light" | "standard" | "deep";

export interface Settings {
  useChrome: boolean;
  orchestrationEnabled: boolean;
  defaultResearchDepth: ResearchDepth;
  apolloEnabled: boolean;
  apolloMaxContacts: number;
  deepJobConcurrency: number;
  dailyBudgetUsdCents: number | null;
  updatedAt: number;
}

export interface ApolloKeyStatus {
  configured: boolean;
  source: "env" | "keychain" | "none" | string;
  last4: string | null;
  keyLength: number | null;
}

// ============================================================================
// Signal Types
// ============================================================================

export type SignalType = "hiring_surge" | "funding_round" | "tech_adoption" | "leadership_change" | "expansion" | "partnership" | "intent_data" | "competitor_detected"

export interface Signal {
  id: string
  companyName: string
  companyId: number
  type: SignalType
  title: string
  description: string
  confidence: number
  source: string
  detectedAt: string
}

// ============================================================================
// Onboarding
// ============================================================================

export interface OnboardingStatus {
  hasCompanyOverview: boolean;
  hasLead: boolean;
  hasResearchedLead: boolean;
  hasScoredLead: boolean;
  hasResearchedPerson: boolean;
  hasConversationTopics: boolean;
}

// ============================================================================
// Outreach Types
// ============================================================================

export type OutreachStatus = "drafting" | "scheduled" | "sending" | "awaiting_reply" | "replied" | "meeting_booked" | "completed" | "bounced" | "opted_out";
export type ReplyIntent = "interested" | "not_now" | "objection" | "wrong_person" | "unsubscribe" | "auto_reply" | "meeting_request";
export type EmailProvider = "gmail" | "outlook" | "none";

export interface OutreachSequence {
  id: string;
  companyId: number;
  companyName: string;
  contactId: number;
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  status: OutreachStatus;
  steps: OutreachStep[];
  signalTrigger: string | null;
  createdAt: number;
  completedAt: number | null;
}

export interface OutreachStep {
  id: string;
  stepNumber: number;
  subject: string;
  body: string;
  status: "draft" | "sent" | "opened" | "replied" | "bounced" | "skipped";
  sentAt: number | null;
  openedAt: number | null;
  repliedAt: number | null;
  scheduledFor: number | null;
}

export interface EmailReply {
  id: string;
  sequenceId: string;
  stepId: string;
  contactName: string;
  contactEmail: string;
  companyName: string;
  subject: string;
  body: string;
  intent: ReplyIntent;
  confidence: number;
  suggestedAction: string;
  receivedAt: number;
  handled: boolean;
}

export interface MeetingBooking {
  id: string;
  sequenceId: string;
  contactName: string;
  contactTitle: string;
  companyName: string;
  scheduledAt: number;
  durationMinutes: number;
  meetingLink: string | null;
  notes: string;
  status: "confirmed" | "pending" | "cancelled" | "completed";
}

export interface OutreachStats {
  totalSequences: number;
  emailsSent: number;
  emailsOpened: number;
  repliesReceived: number;
  meetingsBooked: number;
  openRate: number;
  replyRate: number;
  meetingRate: number;
}

