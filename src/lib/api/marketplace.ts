export interface CommunityAgent {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: Record<string, any>;
  name: string;
  creator: string;
  creatorAvatar?: string;
  description: string;
  category: "Lead Enrichment" | "Vertical-Specific Outreach" | "Competitor Intel" | "Other";
  downloads: number;
  rating: number;
  price: number; // 0 for free
  nodes: any[]; // The graph logic
}

const MOCK_MARKETPLACE: CommunityAgent[] = [
  {
    id: "mkt-1",
    name: "Y-Combinator Scraper",
    creator: "GrowthHackers",
    description: "Automatically scrape new YC batches, enrich with Apollo, and find CEO emails.",
    category: "Lead Enrichment",
    downloads: 12450,
    rating: 4.9,
    price: 0,
    nodes: [],
  },
  {
    id: "mkt-2",
    name: "Healthcare SaaS Outreach",
    creator: "MedTechSales",
    description: "HIPAA-aware email sequence tailored for hospital administrators and IT directors.",
    category: "Vertical-Specific Outreach",
    downloads: 8300,
    rating: 4.7,
    price: 0,
    nodes: [],
  },
  {
    id: "mkt-3",
    name: "G2 Competitor Interceptor",
    creator: "SaaSOps",
    description: "Monitors G2 for 3-star reviews on your competitors and immediately triggers a LinkedIn connection request.",
    category: "Competitor Intel",
    downloads: 21500,
    rating: 5.0,
    price: 49,
    nodes: [],
  },
  {
    id: "mkt-4",
    name: "Local Business Maps Scraper",
    creator: "LocalLeads",
    description: "Find local businesses on Google Maps and extract public phone numbers for SMS outreach.",
    category: "Lead Enrichment",
    downloads: 5420,
    rating: 4.6,
    price: 0,
    nodes: [],
  }
];

export async function fetchCommunityAgents(): Promise<CommunityAgent[]> {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_MARKETPLACE);
    }, 800);
  });
}

export async function installAgent(agentId: string): Promise<boolean> {
  // Simulate installation
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Agent ${agentId} installed successfully into local swarm.`);
      resolve(true);
    }, 1200);
  });
}
