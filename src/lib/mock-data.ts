import type { CompanyWithScore } from "./types";

export const MOCK_COMPANIES: CompanyWithScore[] = [
  {
    id: 1,
    companyName: "Cognism",
    website: "cognism.com",
    industry: "Sales Intelligence / B2B Data",
    subIndustry: "Sales Software",
    employees: 600,
    employeeRange: "500-1000",
    revenue: 83000000,
    revenueRange: "$50M-$100M",
    companyLinkedinUrl: "https://linkedin.com/company/cognism",
    city: "London",
    state: "England",
    country: "United Kingdom",
    researchStatus: "completed",
    researchedAt: Date.now() - 86400000 * 2,
    userStatus: "new",
    createdAt: Date.now() - 86400000 * 10,
    companyProfile: "Cognism is a B2B sales intelligence and data platform offering compliant contact information and intent data globally.",
    score: {
      id: 1,
      companyId: 1,
      configId: 1,
      passesRequirements: true,
      requirementResults: [
        {
          id: "req_1",
          name: "Minimum Company Size",
          passed: true,
          reason: "Although exact headcount is not publicly disclosed, Cognism operates globally with a full C-suite, multiple VP layers, and offices across London and the US. Headcount is well above the 50-employee minimum (third-party trackers estimate 500-700+ employees)."
        },
        {
          id: "req_2",
          name: "Target Industry",
          passed: true,
          reason: "Cognism is a B2B SaaS / sales intelligence technology vendor (sales-led SaaS, AI/ML data platform, AWS-hosted microservices). Clearly within the technology sector."
        }
      ],
      totalScore: 81,
      scoreBreakdown: [
        {
          id: "sig_1",
          name: "Growth Signals",
          weight: 1,
          score: 8,
          weightedScore: 8,
          reason: "Strong growth signals: new CEO installed Sep 2025; CPTO hired Jan 2026; Sales Companion launched Mar 2025 (largest product launch in company history); ~30% YoY revenue growth ($64M -> $83M). Tempered by no new funding since Series C 2022."
        },
        {
          id: "sig_2",
          name: "Technology Adoption",
          weight: 1,
          score: 7,
          weightedScore: 7,
          reason: "Highly modern stack: Scala/Akka microservices, Python data pipelines, Kafka via Confluent Cloud, AWS. Uses proprietary multi-LLM prompt engine routing across GPT-4 and Claude. Clear willingness to adopt and integrate new tooling."
        },
        {
          id: "sig_3",
          name: "Budget Authority",
          weight: 1,
          score: 9,
          weightedScore: 9,
          reason: "Clear decision-making structure with identified economic buyers. Strong authority, moderate willingness to release budget without hard payback case."
        },
        {
          id: "sig_4",
          name: "Pain Point Alignment",
          weight: 1,
          score: 10,
          weightedScore: 10,
          reason: "Perfect alignment. Data vendors constantly need to verify intent signals and enrich leads efficiently, which maps directly to autonomous data enrichment."
        }
      ],
      tier: "hot",
      scoringNotes: "Highly attractive prospect with significant recent leadership changes and high intent.",
      scoredAt: Date.now() - 86400000 * 1,
      createdAt: Date.now() - 86400000 * 1,
    }
  },
  {
    id: 2,
    companyName: "Apollo.io",
    website: "apollo.io",
    industry: "Sales Intelligence / Sales Engagement",
    subIndustry: "Sales Software",
    employees: 1200,
    employeeRange: "1000-5000",
    revenue: 150000000,
    revenueRange: "$100M-$250M",
    companyLinkedinUrl: "https://linkedin.com/company/apolloio",
    city: "San Francisco",
    state: "California",
    country: "USA",
    researchStatus: "completed",
    researchedAt: Date.now() - 86400000 * 3,
    userStatus: "new",
    createdAt: Date.now() - 86400000 * 12,
    companyProfile: "Apollo.io is a data-first engagement platform that gives reps the ability to find, contact, and close their ideal buyers.",
    score: {
      id: 2,
      companyId: 2,
      configId: 1,
      passesRequirements: true,
      requirementResults: [
        {
          id: "req_1",
          name: "Minimum Company Size",
          passed: true,
          reason: "Apollo.io has over 1,000 employees globally, easily passing the 50 employee requirement."
        },
        {
          id: "req_2",
          name: "Target Industry",
          passed: true,
          reason: "Apollo operates primarily in the Sales Tech / B2B Data space."
        }
      ],
      totalScore: 92,
      scoreBreakdown: [
        {
          id: "sig_1",
          name: "Growth Signals",
          weight: 1,
          score: 9,
          weightedScore: 9,
          reason: "Recently raised a massive Series D at a $1.6B valuation. Rapid hiring across engineering and GTM teams."
        },
        {
          id: "sig_2",
          name: "Technology Adoption",
          weight: 1,
          score: 10,
          weightedScore: 10,
          reason: "Advanced AI features launched recently. Highly sophisticated engineering org."
        },
        {
          id: "sig_3",
          name: "Budget Authority",
          weight: 1,
          score: 8,
          weightedScore: 8,
          reason: "Large enterprise budgets available, though procurement processes are becoming stricter as they scale."
        },
        {
          id: "sig_4",
          name: "Pain Point Alignment",
          weight: 1,
          score: 9,
          weightedScore: 9,
          reason: "Competes directly on data quality and AI workflows. Would highly value an automated intelligence layer."
        }
      ],
      tier: "hot",
      scoringNotes: null,
      scoredAt: Date.now() - 86400000 * 2,
      createdAt: Date.now() - 86400000 * 2,
    }
  },
  {
    id: 3,
    companyName: "Zepto",
    website: "zeptonow.com",
    industry: "Quick Commerce",
    subIndustry: "E-Commerce",
    employees: 3500,
    employeeRange: "1000-5000",
    revenue: 400000000,
    revenueRange: "$250M-$500M",
    companyLinkedinUrl: "https://linkedin.com/company/zeptonow",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    researchStatus: "completed",
    researchedAt: Date.now() - 86400000 * 4,
    userStatus: "new",
    createdAt: Date.now() - 86400000 * 15,
    companyProfile: "Zepto is a quick commerce startup in India delivering groceries in 10 minutes.",
    score: {
      id: 3,
      companyId: 3,
      configId: 1,
      passesRequirements: false,
      requirementResults: [
        {
          id: "req_1",
          name: "Minimum Company Size",
          passed: true,
          reason: "Zepto has over 3,000 corporate employees and significantly more in logistics operations."
        },
        {
          id: "req_2",
          name: "Target Industry",
          passed: false,
          reason: "Zepto is a B2C quick-commerce application. We exclusively target B2B SaaS and Enterprise software vendors."
        }
      ],
      totalScore: 25,
      scoreBreakdown: [
        {
          id: "sig_1",
          name: "Growth Signals",
          weight: 1,
          score: 10,
          weightedScore: 10,
          reason: "Hyper-growth. Recently raised $300M+ at $5B valuation. Expanding to new cities aggressively."
        },
        {
          id: "sig_2",
          name: "Technology Adoption",
          weight: 1,
          score: 6,
          weightedScore: 6,
          reason: "Strong mobile engineering, but internally built supply chain tools. Not a heavy buyer of typical GTM SaaS."
        },
        {
          id: "sig_3",
          name: "Budget Authority",
          weight: 1,
          score: 5,
          weightedScore: 5,
          reason: "High cash burn limits experimental B2B software budgets."
        },
        {
          id: "sig_4",
          name: "Pain Point Alignment",
          weight: 1,
          score: 1,
          weightedScore: 1,
          reason: "Does not sell B2B, therefore does not need B2B sales intelligence orchestration."
        }
      ],
      tier: "filtered",
      scoringNotes: "Disqualified due to incorrect industry (B2C E-commerce).",
      scoredAt: Date.now() - 86400000 * 3,
      createdAt: Date.now() - 86400000 * 3,
    }
  },
  {
    id: 4,
    companyName: "AGS Health",
    website: "agshealth.com",
    industry: "Revenue Cycle Management",
    subIndustry: "Healthcare Tech",
    employees: 12000,
    employeeRange: "10000+",
    revenue: 350000000,
    revenueRange: "$250M-$500M",
    companyLinkedinUrl: "https://linkedin.com/company/ags-health",
    city: "Washington",
    state: "District of Columbia",
    country: "USA",
    researchStatus: "pending",
    researchedAt: null,
    userStatus: "new",
    createdAt: Date.now() - 86400000 * 5,
    companyProfile: null,
    score: null
  },
  {
    id: 5,
    companyName: "Apriora",
    website: "apriora.ai",
    industry: "HR Tech / AI Interviewing",
    subIndustry: "HR Tech",
    employees: 25,
    employeeRange: "11-50",
    revenue: 2000000,
    revenueRange: "$1M-$5M",
    companyLinkedinUrl: "https://linkedin.com/company/apriora",
    city: "San Francisco",
    state: "California",
    country: "USA",
    researchStatus: "completed",
    researchedAt: Date.now() - 86400000 * 1,
    userStatus: "new",
    createdAt: Date.now() - 86400000 * 2,
    companyProfile: "Apriora provides an AI-powered automated interviewing platform for fast-scaling teams.",
    score: {
      id: 5,
      companyId: 5,
      configId: 1,
      passesRequirements: true,
      requirementResults: [
        {
          id: "req_1",
          name: "Minimum Company Size",
          passed: false,
          reason: "Apriora is currently at ~25 employees, which falls below our ideal minimum threshold of 50."
        },
        {
          id: "req_2",
          name: "Target Industry",
          passed: true,
          reason: "Operates perfectly in the B2B AI SaaS space."
        }
      ],
      totalScore: 45,
      scoreBreakdown: [
        {
          id: "sig_1",
          name: "Growth Signals",
          weight: 1,
          score: 8,
          weightedScore: 8,
          reason: "Strong early traction, recently backed by YC. Active hiring."
        },
        {
          id: "sig_2",
          name: "Technology Adoption",
          weight: 1,
          score: 9,
          weightedScore: 9,
          reason: "Native AI company, highly experimental and early adopters."
        },
        {
          id: "sig_3",
          name: "Budget Authority",
          weight: 1,
          score: 4,
          weightedScore: 4,
          reason: "Early stage startup budgets are tight."
        },
        {
          id: "sig_4",
          name: "Pain Point Alignment",
          weight: 1,
          score: 7,
          weightedScore: 7,
          reason: "Needs fast pipeline generation to prove GTM motion."
        }
      ],
      tier: "nurture",
      scoringNotes: "Keep in nurture until they hit Series A or headcount crosses 50.",
      scoredAt: Date.now() - 86400000 * 1,
      createdAt: Date.now() - 86400000 * 1,
    }
  },
  {
    id: 6,
    companyName: "Clay",
    website: "clay.com",
    industry: "Sales Intelligence / GTM Platform",
    subIndustry: "Sales Software",
    employees: 150,
    employeeRange: "100-250",
    revenue: 30000000,
    revenueRange: "$10M-$50M",
    companyLinkedinUrl: "https://linkedin.com/company/clay",
    city: "New York",
    state: "New York",
    country: "USA",
    researchStatus: "completed",
    researchedAt: Date.now() - 86400000 * 5,
    userStatus: "new",
    createdAt: Date.now() - 86400000 * 6,
    companyProfile: "Clay is a data enrichment and GTM orchestration platform combining 50+ data providers.",
    score: {
      id: 6,
      companyId: 6,
      configId: 1,
      passesRequirements: true,
      requirementResults: [
        {
          id: "req_1",
          name: "Minimum Company Size",
          passed: true,
          reason: "Clay has significantly scaled past the 50 employee mark post Series B."
        },
        {
          id: "req_2",
          name: "Target Industry",
          passed: true,
          reason: "B2B SaaS GTM Infrastructure."
        }
      ],
      totalScore: 72,
      scoreBreakdown: [
        {
          id: "sig_1",
          name: "Growth Signals",
          weight: 1,
          score: 10,
          weightedScore: 10,
          reason: "Exceptional viral growth, $46M Series B at a $500M valuation."
        },
        {
          id: "sig_2",
          name: "Technology Adoption",
          weight: 1,
          score: 8,
          weightedScore: 8,
          reason: "They are an automation company; extremely technically sophisticated buyers."
        },
        {
          id: "sig_3",
          name: "Budget Authority",
          weight: 1,
          score: 7,
          weightedScore: 7,
          reason: "Well funded but likely to build vs buy given their own platform's capabilities."
        },
        {
          id: "sig_4",
          name: "Pain Point Alignment",
          weight: 1,
          score: 5,
          weightedScore: 5,
          reason: "They solve the same problem we do, making them a competitor rather than a strict ICP."
        }
      ],
      tier: "warm",
      scoringNotes: "Borderline competitor, but high growth. Score pulled down by pain point alignment (they build this internally).",
      scoredAt: Date.now() - 86400000 * 5,
      createdAt: Date.now() - 86400000 * 5,
    }
  }
];

export const MOCK_CONTACTS = [
  // Cognism (ID: 1)
  {
    id: 101,
    companyId: 1,
    firstName: "James",
    lastName: "Isilay",
    email: "james.isilay@cognism.com",
    title: "Chief Executive Officer",
    linkedinUrl: "https://linkedin.com/in/jamesisilay",
    buyingRole: "Economic Buyer",
    personaTags: ["Founder", "Data-Driven", "Aggressive Growth"],
    relationshipStrength: 20,
    companyName: "Cognism",
    companyWebsite: "cognism.com",
    researchStatus: "completed",
    userStatus: "new",
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 102,
    companyId: 1,
    firstName: "Alice",
    lastName: "Smith",
    email: "alice.smith@cognism.com",
    title: "VP of Sales",
    linkedinUrl: "https://linkedin.com/in/alicesmith",
    buyingRole: "Champion",
    personaTags: ["Sales Leader", "Outbound Focus", "Quota Carrier"],
    relationshipStrength: 85,
    companyName: "Cognism",
    companyWebsite: "cognism.com",
    researchStatus: "completed",
    userStatus: "contacted",
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 103,
    companyId: 1,
    firstName: "Robert",
    lastName: "Jones",
    email: "robert.jones@cognism.com",
    title: "Director of RevOps",
    linkedinUrl: "https://linkedin.com/in/robertjones",
    buyingRole: "Influencer",
    personaTags: ["Process Guru", "Tool Consolidator"],
    relationshipStrength: 40,
    companyName: "Cognism",
    companyWebsite: "cognism.com",
    researchStatus: "completed",
    userStatus: "new",
    createdAt: Date.now() - 86400000 * 2,
  },
  // Apollo.io (ID: 2)
  {
    id: 201,
    companyId: 2,
    firstName: "Tim",
    lastName: "Zheng",
    email: "tim@apollo.io",
    title: "CEO",
    linkedinUrl: "https://linkedin.com/in/timzheng",
    buyingRole: "Economic Buyer",
    personaTags: ["Visionary", "Product-Led"],
    relationshipStrength: 10,
    companyName: "Apollo.io",
    companyWebsite: "apollo.io",
    researchStatus: "completed",
    userStatus: "new",
    createdAt: Date.now() - 86400000 * 4,
  },
  {
    id: 202,
    companyId: 2,
    firstName: "Sarah",
    lastName: "Connor",
    email: "sarah.c@apollo.io",
    title: "Head of GTM Systems",
    linkedinUrl: "https://linkedin.com/in/sarahconnor",
    buyingRole: "Blocker",
    personaTags: ["Build vs Buy", "Engineering Background"],
    relationshipStrength: 60,
    companyName: "Apollo.io",
    companyWebsite: "apollo.io",
    researchStatus: "completed",
    userStatus: "contacted",
    createdAt: Date.now() - 86400000 * 2,
  },
  // Clay (ID: 6)
  {
    id: 601,
    companyId: 6,
    firstName: "Kareem",
    lastName: "Amin",
    email: "kareem@clay.com",
    title: "Co-Founder",
    linkedinUrl: "https://linkedin.com/in/kareemamin",
    buyingRole: "Champion",
    personaTags: ["Early Adopter", "AI Automation", "Community Builder"],
    relationshipStrength: 95,
    companyName: "Clay",
    companyWebsite: "clay.com",
    researchStatus: "completed",
    userStatus: "replied",
    createdAt: Date.now() - 86400000 * 1,
  }
];
