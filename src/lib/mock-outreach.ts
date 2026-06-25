import type { OutreachSequence, EmailReply, MeetingBooking, OutreachStats } from "./types";

const DAY = 86400000;
const HOUR = 3600000;
const now = Date.now();

export const MOCK_SEQUENCES: OutreachSequence[] = [
  {
    id: "seq-001",
    companyId: 1,
    companyName: "Cognism",
    contactId: 101,
    contactName: "James Isilay",
    contactTitle: "CRO",
    contactEmail: "j.isilay@cognism.com",
    status: "meeting_booked",
    signalTrigger: "New CRO appointed Q1 2026",
    createdAt: now - DAY * 8,
    completedAt: now - DAY * 2,
    steps: [
      {
        id: "step-001-1",
        stepNumber: 1,
        channel: "email",
        subject: "Congrats on the CRO role — quick thought on autonomous pipeline",
        body: "Hi James,\n\nSaw the news about your appointment as CRO at Cognism — congrats! Having previously scaled revenue at ZoomInfo from $40M to $150M, you clearly know what it takes.\n\nI'm curious: as you evaluate Cognism's outbound motion, have you considered what a fully autonomous SDR layer could do for pipeline velocity? We're seeing teams cut their cost-per-meeting by 60% while 3x-ing volume.\n\nWould love to share a 2-min demo recording if you're open to it.\n\nBest,\nDev",
        status: "opened",
        sentAt: now - DAY * 8,
        openedAt: now - DAY * 7.5,
        repliedAt: null,
        scheduledFor: null,
      },
      {
        id: "step-001-2",
        stepNumber: 2,
        channel: "email",
        subject: "Re: Congrats on the CRO role — quick thought on autonomous pipeline",
        body: "Hi James,\n\nFollowing up — I noticed Cognism just posted 5 new AI engineer roles. Sounds like the AI investment thesis is real.\n\nCurious if the autonomous GTM angle resonates. Happy to show how it maps to your Scala/Kafka stack specifically.\n\nBest,\nDev",
        status: "replied",
        sentAt: now - DAY * 5,
        openedAt: now - DAY * 5,
        repliedAt: now - DAY * 4,
        scheduledFor: null,
      },
      {
        id: "step-001-3",
        stepNumber: 3,
        channel: "email",
        subject: "CortexOS x Cognism — meeting confirmed",
        body: "Great — sent over a calendar invite for Thursday at 2pm GMT. Looking forward to it!",
        status: "sent",
        sentAt: now - DAY * 3,
        openedAt: now - DAY * 3,
        repliedAt: null,
        scheduledFor: null,
      }
    ]
  },
  {
    id: "seq-002",
    companyId: 2,
    companyName: "Apollo.io",
    contactId: 102,
    contactName: "Leandra Fishman",
    contactTitle: "Chief Revenue Officer",
    contactEmail: "leandra@apollo.io",
    status: "awaiting_reply",
    signalTrigger: "Series D at $1.6B valuation",
    createdAt: now - DAY * 3,
    completedAt: null,
    steps: [
      {
        id: "step-002-1",
        stepNumber: 1,
        channel: "email",
        subject: "The autonomous SDR layer Apollo is missing",
        body: "Hi Leandra,\n\nWith Apollo's recent $1.6B raise, you're clearly going all-in on being the GTM operating system. Impressive.\n\nOne gap I've noticed: Apollo is phenomenal at data + sequences, but the actual research-to-meeting workflow still requires human reps. What if that entire loop was autonomous?\n\nWe built CortexOS to do exactly that — AI agents that research, score, draft, send, and book meetings without human intervention. It's what Apollo would build internally in 18 months, available today.\n\nWorth a 15-min call?\n\nBest,\nDev",
        status: "opened",
        sentAt: now - DAY * 3,
        openedAt: now - DAY * 2.5,
        repliedAt: null,
        scheduledFor: null,
      },
      {
        id: "step-002-2",
        stepNumber: 2,
        channel: "email",
        subject: "Re: The autonomous SDR layer Apollo is missing",
        body: "Hi Leandra,\n\nQuick follow-up — I saw Apollo just launched their AI SDR feature in beta. We should compare notes. CortexOS takes a fundamentally different approach (multi-agent swarm vs single-prompt generation).\n\nHappy to do a technical deep-dive if your team is interested.\n\nBest,\nDev",
        status: "draft",
        sentAt: null,
        openedAt: null,
        repliedAt: null,
        scheduledFor: now + DAY * 1,
      }
    ]
  },
  {
    id: "seq-003",
    companyId: 6,
    companyName: "Clay",
    contactId: 106,
    contactName: "Varun Anand",
    contactTitle: "Head of Engineering",
    contactEmail: "varun@clay.com",
    status: "replied",
    signalTrigger: "Series B at $500M valuation",
    createdAt: now - DAY * 6,
    completedAt: null,
    steps: [
      {
        id: "step-003-1",
        stepNumber: 1,
        channel: "email",
        subject: "Clay's enrichment layer + our agent swarm = 🔥",
        body: "Hi Varun,\n\nBeen following Clay's trajectory since your Reforge days — the $46M Series B was well-deserved.\n\nHere's a thought: Clay is the best enrichment orchestrator in the market. But what if the enriched data could autonomously act on itself? CortexOS agents can consume Clay-enriched profiles and execute the entire research → score → outreach loop without human intervention.\n\nPotential integration partnership? Or even just a technical chat — I think there's a powerful combo here.\n\nBest,\nDev",
        status: "replied",
        sentAt: now - DAY * 6,
        openedAt: now - DAY * 5.5,
        repliedAt: now - DAY * 4,
        scheduledFor: null,
      }
    ]
  },
  {
    id: "seq-004",
    companyId: 5,
    companyName: "Apriora",
    contactId: 105,
    contactName: "Siddharth Bhansali",
    contactTitle: "Co-founder & CEO",
    contactEmail: "sid@apriora.ai",
    status: "sending",
    signalTrigger: "YC W26 batch",
    createdAt: now - DAY * 1,
    completedAt: null,
    steps: [
      {
        id: "step-004-1",
        stepNumber: 1,
        channel: "email",
        subject: "Fellow YC founder — autonomous pipeline for Apriora",
        body: "Hi Sid,\n\nCongrats on Apriora's YC batch! AI-powered interviewing is a brilliant wedge.\n\nAs you scale GTM post-batch, you'll need pipeline fast. Most YC companies hire 2-3 SDRs at $80K+ each. What if you could skip that entirely?\n\nCortexOS is an autonomous GTM engine — finds your ICP, researches them, writes personalized outreach, sends it, and books meetings. Zero SDR headcount.\n\nPerfect for a 25-person startup that needs enterprise pipeline without enterprise overhead.\n\n30 min call?\n\nBest,\nDev",
        status: "sent",
        sentAt: now - HOUR * 6,
        openedAt: null,
        repliedAt: null,
        scheduledFor: null,
      }
    ]
  },
  {
    id: "seq-005",
    companyId: 4,
    companyName: "AGS Health",
    contactId: 104,
    contactName: "Patrice Wolfe",
    contactTitle: "VP of Business Development",
    contactEmail: "p.wolfe@agshealth.com",
    status: "bounced",
    signalTrigger: null,
    createdAt: now - DAY * 4,
    completedAt: now - DAY * 4,
    steps: [
      {
        id: "step-005-1",
        stepNumber: 1,
        channel: "email",
        subject: "Revenue cycle automation at AGS Health",
        body: "Hi Patrice,\n\nAGS Health's position in revenue cycle management is impressive. With 12,000+ employees, the scale of your operations creates unique opportunities for AI-driven prospecting.\n\nWould love to explore how autonomous outreach could help your BD team surface new hospital partnerships faster.\n\nBest,\nDev",
        status: "bounced",
        sentAt: now - DAY * 4,
        openedAt: null,
        repliedAt: null,
        scheduledFor: null,
      }
    ]
  }
];

export const MOCK_REPLIES: EmailReply[] = [
  {
    id: "reply-001",
    sequenceId: "seq-001",
    stepId: "step-001-2",
    contactName: "James Isilay",
    contactEmail: "j.isilay@cognism.com",
    companyName: "Cognism",
    subject: "Re: Congrats on the CRO role — quick thought on autonomous pipeline",
    body: "Dev,\n\nThanks for reaching out. The timing is actually perfect — we're actively evaluating our outbound tech stack as part of my first 90-day plan.\n\nThe autonomous SDR concept is interesting. Can you send over a deck + do a live demo? I'd like to bring our Head of RevOps into the conversation.\n\nLet's find 30 min this week — I'm open Thursday or Friday afternoon GMT.\n\nJames",
    intent: "interested",
    confidence: 0.95,
    suggestedAction: "Book meeting immediately. High-intent reply with explicit ask for demo. Bring Head of RevOps = multi-threaded deal.",
    receivedAt: now - DAY * 4,
    handled: true,
  },
  {
    id: "reply-002",
    sequenceId: "seq-003",
    stepId: "step-003-1",
    contactName: "Varun Anand",
    contactEmail: "varun@clay.com",
    companyName: "Clay",
    subject: "Re: Clay's enrichment layer + our agent swarm",
    body: "Hey Dev,\n\nAppreciate the thoughtful outreach. We actually get a lot of partnership requests but this one is genuinely interesting.\n\nWe've been thinking about an \"actions\" layer on top of Clay's enrichment — your agent swarm approach is one way to do it. Not sure if partnership is the right frame vs. us building it ourselves, but I'd be curious to learn more about your architecture.\n\nLet's do a technical call. Share your calendar link?\n\nVarun",
    intent: "interested",
    confidence: 0.82,
    suggestedAction: "Book technical deep-dive. Note: Varun mentioned 'building it ourselves' — potential competitor risk. Position as complementary, not dependent.",
    receivedAt: now - DAY * 4,
    handled: false,
  },
];

export const MOCK_MEETINGS: MeetingBooking[] = [
  {
    id: "mtg-001",
    sequenceId: "seq-001",
    contactName: "James Isilay",
    contactTitle: "CRO",
    companyName: "Cognism",
    scheduledAt: now + DAY * 1 + HOUR * 6,
    durationMinutes: 30,
    meetingLink: "https://meet.google.com/abc-defg-hij",
    notes: "Demo CortexOS autonomous research + outreach flow. Bring Head of RevOps. Focus on cost-per-meeting reduction and pipeline velocity metrics.",
    status: "confirmed",
  },
];

export function getMockOutreachStats(): OutreachStats {
  return {
    totalSequences: MOCK_SEQUENCES.length,
    emailsSent: 7,
    emailsOpened: 5,
    repliesReceived: 2,
    meetingsBooked: 1,
    openRate: 71.4,
    replyRate: 28.6,
    meetingRate: 14.3,
  };
}
