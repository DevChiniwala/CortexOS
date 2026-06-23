// ============================================================================
// LocalStore — Browser-mode persistence layer
// Allows the app to function fully without the Tauri/Rust backend.
// Uses localStorage so data persists across page reloads.
// ============================================================================

import type { CompanyWithScore, ContactWithCompany, NewCompany, NewContact } from "@/lib/types"
import { MOCK_COMPANIES, MOCK_CONTACTS } from "./mock-data"

const KEYS = {
  companies: "cortexos:companies",
  contacts: "cortexos:contacts",
  signals: "cortexos:signals",
  activity: "cortexos:activity",
} as const

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data))
}

// ============================================================================
// Companies
// ============================================================================

let companyIdCounter = read<number>("cortexos:companyIdCounter", 100)

export function localGetCompanies(): CompanyWithScore[] {
  const data = read<CompanyWithScore[]>(KEYS.companies, [])
  if (data.length === 0) {
    write(KEYS.companies, MOCK_COMPANIES)
    return MOCK_COMPANIES
  }
  return data
}

export function localInsertCompany(data: NewCompany): number {
  const companies = localGetCompanies()
  const id = ++companyIdCounter
  localStorage.setItem("cortexos:companyIdCounter", String(companyIdCounter))

  const now = Date.now()
  const company: CompanyWithScore = {
    id,
    companyName: data.companyName,
    website: data.website ?? null,
    industry: null,
    subIndustry: null,
    employees: null,
    employeeRange: null,
    revenue: null,
    revenueRange: null,
    companyLinkedinUrl: null,
    city: data.city ?? null,
    state: data.state ?? null,
    country: data.country ?? null,
    researchStatus: "pending",
    researchedAt: null,
    userStatus: "new",
    createdAt: now,
    companyProfile: null,
    score: null,
  }

  companies.push(company)
  write(KEYS.companies, companies)
  localAddActivity("company_added", `Added company: ${data.companyName}`)
  return id
}

export function localUpdateCompanyStatus(companyId: number, status: string): void {
  const companies = localGetCompanies()
  const idx = companies.findIndex(c => c.id === companyId)
  if (idx >= 0) {
    companies[idx].researchStatus = status as CompanyWithScore["researchStatus"]
    write(KEYS.companies, companies)
  }
}

export function localDeleteCompanies(ids: number[]): number {
  const companies = localGetCompanies()
  const filtered = companies.filter(c => !ids.includes(c.id as number))
  write(KEYS.companies, filtered)
  return ids.length
}

// ============================================================================
// Contacts
// ============================================================================

let contactIdCounter = read<number>("cortexos:contactIdCounter", 200)

export function localGetContacts(): ContactWithCompany[] {
  const data = read<ContactWithCompany[]>(KEYS.contacts, [])
  if (data.length === 0) {
    write(KEYS.contacts, MOCK_CONTACTS)
    return MOCK_CONTACTS as ContactWithCompany[]
  }
  return data
}

export function localInsertContact(data: NewContact): number {
  const contacts = localGetContacts()
  const companies = localGetCompanies()
  const id = ++contactIdCounter
  localStorage.setItem("cortexos:contactIdCounter", String(contactIdCounter))

  const parentCompany = companies.find(c => c.id === data.companyId)
  const now = Date.now()

  const contact: ContactWithCompany = {
    id,
    companyId: data.companyId ?? null,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email ?? null,
    emailSource: null,
    emailStatus: null,
    apolloPersonId: null,
    phone: null,
    title: data.title ?? null,
    managementLevel: null,
    linkedinUrl: data.linkedinUrl ?? null,
    yearJoined: null,
    personProfile: null,
    researchStatus: "pending",
    researchedAt: null,
    userStatus: "new",
    conversationTopics: null,
    conversationGeneratedAt: null,
    createdAt: now,
    companyName: parentCompany?.companyName ?? null,
    companyWebsite: parentCompany?.website ?? null,
    companyIndustry: parentCompany?.industry ?? null,
  }

  contacts.push(contact)
  write(KEYS.contacts, contacts)
  localAddActivity("contact_added", `Added contact: ${data.firstName} ${data.lastName}`)
  return id
}

export function localDeleteContacts(ids: number[]): number {
  const contacts = localGetContacts()
  const filtered = contacts.filter(c => !ids.includes(c.id as number))
  write(KEYS.contacts, filtered)
  return ids.length
}

// ============================================================================
// Activity Feed
// ============================================================================

export interface ActivityItem {
  id: string
  type: string
  message: string
  timestamp: string
  actor?: {
    name: string
    type: "user" | "agent"
    avatar?: string
  }
}

export function localGetActivity(): ActivityItem[] {
  return read<ActivityItem[]>(KEYS.activity, [])
}

const MOCK_ACTORS = [
  { name: "Dev", type: "user" as const, avatar: "D" },
  { name: "Sarah", type: "user" as const, avatar: "S" },
  { name: "Mike", type: "user" as const, avatar: "M" },
  { name: "Cortex Orchestrator", type: "agent" as const },
]

export function localAddActivity(type: string, message: string, actorOverride?: ActivityItem["actor"]): void {
  const activity = localGetActivity()
  
  // Randomly assign a team member if no actor is provided (to simulate multi-user)
  const randomActor = MOCK_ACTORS[Math.floor(Math.random() * MOCK_ACTORS.length)]
  const actor = actorOverride || randomActor

  activity.unshift({
    id: crypto.randomUUID(),
    type,
    message,
    timestamp: new Date().toISOString(),
    actor,
  })
  write(KEYS.activity, activity.slice(0, 100))
}

// ============================================================================
// Signals (mock)
// ============================================================================

import type { Signal } from "@/lib/types"

export function localGetSignals(): Signal[] {
  return read<Signal[]>(KEYS.signals, [])
}

export function localAddSignal(signal: Omit<Signal, "id" | "detectedAt">): void {
  const signals = localGetSignals()
  signals.unshift({
    ...signal,
    id: crypto.randomUUID(),
    detectedAt: new Date().toISOString(),
  })
  write(KEYS.signals, signals)
}
