// services/stubData.js

/**
 * In-memory stub data for demonstration purposes.
 * – deliverables: internal map { [deliverableId]: { … } }
 * – metricDefinitions: array of metric metadata (no values)
 * – getDeliverablesArray: helper to return array of deliverable objects
 */

import { v4 as uuidv4 } from 'uuid'; // if needed for internal stubbing

// ---- BEGIN existing stub structures ----

// Example initial creators (unchanged)
// const creators = [
//   {
//     creatorId: 'cA1',
//     name: 'Alice Johnson',
//     profileImage: 'https://example.com/alice.jpg',
//     bio: 'Fitness coach & YouTuber.',
//     platformIds: { instagram: '178914123', youtube: 'UCAlice', tiktok: 'tiktokAlice' },
//     followers: { instagram: 230000, youtube: 150000 },
//     engagementRate: 0.067,
//     categories: ['fitness', 'wellness'],
//     fitScore: 0.82,
//   },
//   {
//     creatorId: 'cB2',
//     name: 'Bob Martinez',
//     profileImage: 'https://example.com/bob.jpg',
//     bio: 'Tech reviewer and gamer.',
//     platformIds: { instagram: '178914456', youtube: 'UCBob', tiktok: 'tiktokBob' },
//     followers: { instagram: 180000, youtube: 200000 },
//     engagementRate: 0.054,
//     categories: ['tech', 'gaming'],
//     fitScore: 0.75,
//   },
//   {
//     creatorId: 'cC3',
//     name: 'Carol Singh',
//     profileImage: 'https://example.com/carol.jpg',
//     bio: 'Beauty influencer and makeup artist.',
//     platformIds: { instagram: '178914789', youtube: 'UCCarol', tiktok: 'tiktokCarol' },
//     followers: { instagram: 210000, youtube: 50000 },
//     engagementRate: 0.062,
//     categories: ['beauty', 'makeup'],
//     fitScore: 0.80,
//   },
// ];
export const mockCreators = [
  {
    id: 'creator1',
    name: 'Emma Johnson',
    profilePic:
      'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    platform: 'Instagram',
    handle: '@emmajfit',
    audienceSize: 125000,
    demographics: {
      ageRange: [18, 34],
      gender: { female: 0.75, male: 0.23, other: 0.02 },
      location: 'United States',
    },
    engagement: {
      avgLikes: 5200,
      avgComments: 320,
    },
    pastCollaborations: ['Nike', 'Gymshark', 'Protein World'],
    isAuthentic: true,
    authenticityScore: 0.92,
  },
  {
    id: 'creator2',
    name: 'Alex Chen',
    profilePic:
      'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    platform: 'YouTube',
    handle: '@alexchentech',
    audienceSize: 450000,
    demographics: {
      ageRange: [24, 45],
      gender: { female: 0.35, male: 0.63, other: 0.02 },
      location: 'Global',
    },
    engagement: {
      avgLikes: 18500,
      avgComments: 1200,
      avgViews: 120000,
    },
    pastCollaborations: ['Samsung', 'Logitech', 'Squarespace'],
    isAuthentic: true,
    authenticityScore: 0.89,
  },
  {
    id: 'creator3',
    name: 'Sophia Martinez',
    profilePic:
      'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    platform: 'TikTok',
    handle: '@sophiastyle',
    audienceSize: 780000,
    demographics: {
      ageRange: [16, 28],
      gender: { female: 0.68, male: 0.30, other: 0.02 },
      location: 'United States, Europe',
    },
    engagement: {
      avgLikes: 85000,
      avgComments: 3200,
    },
    pastCollaborations: ['Fashion Nova', 'Sephora', 'Revolve'],
    isAuthentic: true,
    authenticityScore: 0.95,
  },
  {
    id: 'creator4',
    name: 'James Wilson',
    profilePic:
      'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    platform: 'Twitter',
    handle: '@jameswtech',
    audienceSize: 210000,
    demographics: {
      ageRange: [25, 45],
      gender: { female: 0.42, male: 0.56, other: 0.02 },
      location: 'United Kingdom, United States',
    },
    engagement: {
      avgLikes: 1800,
      avgComments: 420,
    },
    pastCollaborations: ['Microsoft', 'Dell', 'Adobe'],
    isAuthentic: false,
    authenticityScore: 0.65,
  },
  {
    id: 'creator5',
    name: 'Olivia Kim',
    profilePic:
      'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    platform: 'Instagram',
    handle: '@oliviakbeauty',
    audienceSize: 320000,
    demographics: {
      ageRange: [18, 35],
      gender: { female: 0.82, male: 0.17, other: 0.01 },
      location: 'South Korea, United States, Canada',
    },
    engagement: {
      avgLikes: 15000,
      avgComments: 850,
    },
    pastCollaborations: ['Fenty Beauty', 'Tatcha', 'Glossier'],
    isAuthentic: true,
    authenticityScore: 0.91,
  },
];

/** Creators stub **/
export function getCreatorsFromStub({ q, minFollowers, engagementGt, limit = 10 }) {
  let result = creators;
  if (q) {
    const lower = q.toLowerCase();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        c.bio.toLowerCase().includes(lower) ||
        c.categories.some((cat) => cat.toLowerCase().includes(lower))
    );
  }
  if (minFollowers != null) {
    result = result.filter((c) => {
      const totalFollowers =
        (c.followers.instagram || 0) + (c.followers.youtube || 0) + (c.followers.tiktok || 0);
      return totalFollowers >= minFollowers;
    });
  }
  if (engagementGt != null) {
    result = result.filter((c) => c.engagementRate >= engagementGt);
  }
  return result.slice(0, limit);
}

export function getCreatorByIdStub(creatorId) {
  return creators.find((c) => c.creatorId === creatorId) || null;
}

// ---- Outreach stubs (unchanged) ----
const outreachThreads = {}; // { threadId: { … } }
export function createOutreachThreadStub(thread) {
  outreachThreads[thread.threadId] = thread;
  return thread;
}
export function getOutreachHistoryStub(campaignId) {
  return Object.values(outreachThreads).filter((t) => t.campaignId === campaignId);
}
export function recordReplyStub(threadId, message) {
  const thread = outreachThreads[threadId];
  if (!thread) throw new Error('Thread not found');
  thread.status = 'replied';
  thread.messages.push(message);
  return message;
}

// ---- Negotiation stubs (unchanged) ----
const negotiations = {}; // { negotiationId: { … } }
export function createNegotiationStub(neg) {
  negotiations[neg.negotiationId] = neg;
  return neg;
}
export function getNegotiationByIdStub(id) {
  return negotiations[id] || null;
}
export function updateNegotiationStub(id, updates) {
  const n = negotiations[id];
  if (!n) throw new Error('Negotiation not found');
  Object.assign(n, updates);
  return n;
}

// ---- Contract stubs (unchanged) ----
const contracts = {}; // { contractId: { … } }
export function createContractStub(contract) {
  contracts[contract.contractId] = contract;
  return contract;
}
export function getContractByIdStub(id) {
  return contracts[id] || null;
}
export function updateContractStub(id, updates) {
  const c = contracts[id];
  if (!c) throw new Error('Contract not found');
  Object.assign(c, updates);
  return c;
}

// ---- Finance stubs (unchanged) ----
const invoices = {}; // { invoiceId: { … } }
export function createInvoiceStub(invoice) {
  invoices[invoice.invoiceId] = invoice;
  return invoice;
}
export function getInvoiceByIdStub(id) {
  return invoices[id] || null;
}
export function updateInvoiceStub(id, updates) {
  const inv = invoices[id];
  if (!inv) throw new Error('Invoice not found');
  Object.assign(inv, updates);
  return inv;
}

// ---- Tracking stubs (deliverables, metrics) ----
const deliverables = {};    // { deliverableId: { … } }
const metricSnapshots = {}; // { deliverableId: [ { … }, … ] }

export function registerDeliverableStub(deliv) {
  // deliv = { deliverableId, campaignId, creatorId, platform, platformPostId, postedUrl, postedAt, … }
  deliverables[deliv.deliverableId] = deliv;
  metricSnapshots[deliv.deliverableId] = [];
  return deliv;
}

export function fetchLatestMetricsStub(deliverableId) {
  if (!deliverables[deliverableId]) throw new Error('Deliverable not found');
  const snapshot = {
    timestamp: new Date().toISOString(),
    views: Math.floor(Math.random() * 50000) + 1000,
    likes: Math.floor(Math.random() * 5000) + 100,
    comments: Math.floor(Math.random() * 500) + 10,
    engagementRate: parseFloat((Math.random() * 0.1).toFixed(3)),
  };
  metricSnapshots[deliverableId].push(snapshot);
  deliverables[deliverableId].latestMetrics = snapshot;
  return snapshot;
}

export function getDeliverablesForCampaignStub(campaignId) {
  return Object.values(deliverables).filter((d) => d.campaignId === campaignId);
}

export function getMetricsForDeliverableStub(deliverableId, since) {
  const all = metricSnapshots[deliverableId] || [];
  if (since) {
    return all.filter((s) => new Date(s.timestamp) >= new Date(since));
  }
  return all;
}

// ---- Insights stubs (reports) ----
const reports = {}; // { reportId: { … } }
export function createReportStub(report) {
  reports[report.reportId] = report;
  return report;
}
export function getReportStub(reportId) {
  return reports[reportId] || null;
}

// ---- Translation stubs (voice/text) ----
const translationJobs = {}; // { jobId: { … } }
export function createTranslationJobStub(job) {
  translationJobs[job.jobId] = job;
  return job;
}
export function getTranslationJobStub(jobId) {
  return translationJobs[jobId] || null;
}
export function updateTranslationJobStub(jobId, updates) {
  const job = translationJobs[jobId];
  if (!job) throw new Error('Translation job not found');
  Object.assign(job, updates);
  return job;
}

// ---- NEW EXPORTS BELOW ----

/**
 * Returns the internal map of all deliverables:
 *   {
 *     "deliv-001": { deliverableId: "deliv-001", campaignId: "...", … },
 *     "deliv-002": { … },
 *     …
 *   }
 */
export function _getAllDeliverables() {
  return deliverables;
}

/**
 * Returns an array of all deliverable objects, e.g.
 *   [
 *     { deliverableId: "deliv-001", campaignId: "...", … },
 *     { deliverableId: "deliv-002", … },
 *     …
 *   ]
 */
export function getDeliverablesArray() {
  return Object.values(deliverables);
}
export function getCampaignsList()
{
  return Object.values(mockCampaigns);
}

/**
 * Metric definitions (metadata only). The /metrics/read endpoint will import this.
 * Each object contains:
 *   - key: unique string identifier
 *   - label: human-readable label
 *   - icon: emoji or icon name
 *   - fontSize: CSS class (e.g. Tailwind)
 *   - description: short tooltip/explanation
 *   - format: one of 'integer'|'currency'|'percentage'
 */
// ─── 1. Mock “Campaigns” Array ───────────────────────────────────
// src/mockData.ts

// routes/campaigns.js
import { Router } from 'express';
const router = Router();

// ─── Mock data (each campaign now includes `brief` and full `metrics`) ───
// services/stubData.js
export const mockCampaigns = [
  {
    id: 1,
    name: 'Spring Sale',
    status: 'active',
    budget: 1500,
    startDate: '2025-03-01',
    endDate: '2025-04-30',
    objective: 'engagement',
    creators: ['creator1', 'creator5'],
    brief: {
      description:
        'Spring Sale campaign focused on increasing engagement through targeted influencer posts.',
      contentGuidelines:
        'Use pastel backgrounds, include the hashtag #SpringSale2025, and tag @OurBrand in every post.',
      deliverables: [
        { type: 'Instagram Story', quantity: 5 },
        { type: 'TikTok Video', quantity: 2 },
      ],
    },
    metrics: {
      views: 120000,
      engagement: 0.15,
      conversions: 3500,
      roi: 2.3,
    },
  },
  {
    id: 2,
    name: 'Holiday Promo',
    status: 'draft',
    budget: 0,
    startDate: '2025-11-01',
    endDate: '2025-12-31',
    objective: 'awareness',
    creators: [],
    brief: {
      description: 'In-planning phase. No brief yet.',
      contentGuidelines: '',
      deliverables: [],
    },
    metrics: {
      views: 0,
      engagement: 0,
      conversions: 0,
      roi: 0,
    },
  },
  {
    id: 3,
    name: 'New Product Push',
    status: 'awaiting',
    budget: 500,
    startDate: '2025-06-01',
    endDate: '2025-07-15',
    objective: 'conversion',
    creators: ['creator2'],
    brief: {
      description:
        'Launch of new widget aimed at tech-savvy audiences. Focus on conversion CTA.',
      contentGuidelines:
        'Highlight features, include unboxing, call-to-action link in bio.',
      deliverables: [{ type: 'YouTube Review', quantity: 1 }],
    },
    metrics: {
      views: 45000,
      engagement: 0.08,
      conversions: 1200,
      roi: 1.7,
    },
  },
  {
    id: 4,
    name: 'Flash Sale',
    status: 'active',
    budget: 2000,
    startDate: '2025-05-15',
    endDate: '2025-05-31',
    objective: 'engagement',
    creators: ['creator3', 'creator4', 'creator5'],
    brief: {
      description: '48-hour flash sale. Drive urgency with countdown stickers.',
      contentGuidelines:
        'Use high-contrast visuals, mention sale end time in every post, include swipe-up link.',
      deliverables: [
        { type: 'Instagram Post', quantity: 3 },
        { type: 'Instagram Story', quantity: 4 },
      ],
    },
    metrics: {
      views: 98000,
      engagement: 0.22,
      conversions: 5200,
      roi: 3.1,
    },
  },
  {
    id: 5,
    name: 'Email Test Campaign',
    status: 'draft',
    budget: 100,
    startDate: '2025-07-01',
    endDate: '2025-07-07',
    objective: 'awareness',
    creators: ['creator1'],
    brief: {
      description: 'Test email-list promotion; not fully fleshed out yet.',
      contentGuidelines: '',
      deliverables: [],
    },
    metrics: {
      views: 12000,
      engagement: 0.05,
      conversions: 300,
      roi: 1.2,
    },
  },
  {
    id: 6,
    name: 'Summer Teaser',
    status: 'awaiting',
    budget: 750,
    startDate: '2025-06-10',
    endDate: '2025-06-20',
    objective: 'engagement',
    creators: ['creator2', 'creator3'],
    brief: {
      description:
        'Short teaser videos to drum up excitement. Focus on behind-the-scenes shots.',
      contentGuidelines:
        'Use vertical video format, add behind-the-scenes commentary, keep under 30 seconds.',
      deliverables: [
        { type: 'TikTok Video', quantity: 2 },
        { type: 'Instagram Reel', quantity: 2 },
      ],
    },
    metrics: {
      views: 33000,
      engagement: 0.12,
      conversions: 900,
      roi: 1.5,
    },
  },
];


// GET /api/v1/campaigns
router.get('/', (req, res) => {
  res.json({
    totalCount: mockCampaigns.length,
    campaigns: mockCampaigns,
  });
});

// GET /api/v1/campaigns/:id
router.get('/:id', (req, res) => {
  const requestedId = parseInt(req.params.id, 10);
  const found = mockCampaigns.find((c) => c.id === requestedId);

  if (!found) {
    return res.status(404).json({ message: 'Campaign not found' });
  }

  res.json({ campaign: found });
});

export default router;


export const metricDefinitions = [
  {
    key: 'totalSpend',
    label: 'Total Spend',
    icon: 'DollarSign',
    fontSize: 'text-xl',
    description: 'Number of campaigns with at least one deliverable',
    format: 'integer',
    value:'75,000',
    trend:{value:'12',isPositive: true}
  },
  // {
  //   key: 'totalBudget',
  //   label: 'Total Budget',
  //   icon: '💰',
  //   fontSize: 'text-xl',
  //   description: 'Combined budget for all campaigns',
  //   format: 'currency',
  //   value:'20000',
  //   trend:{value:'30000',isPositive: true}

  // },
  {
    key: 'completionRate',
    label: 'Creators Engaged',
    icon: 'Users',
    fontSize: 'text-xl',
    description: 'Percentage of deliverables that have been fetched/processed',
    format: 'percentage',
    value:'48',
    trend:{value:'12',isPositive: true}

  },
  {
    key: 'roiEstimate',
    label: 'ROI Estimate',
    icon: 'TrendingUp',
    fontSize: 'text-xl',
    description: "Projected return on investment (in percentage): the ratio of expected profit to total marketing spend.",
    format: 'percentage',
    value:'22',
    trend:{value:'10',isPositive: true}

  }
];
export const mockInsights = [
    {
      key: 'performance',
      title: 'Performance Insights',
      points: [
        'Overall engagement rate is up by 23%',
        'Video content is generating 2.8× more interactions',
        'Peak posting times: 12pm–2pm weekdays'
      ]
    },
    {
      key: 'creator',
      title: 'Creator Analysis',
      points: [
        'Emma Johnson: 156% above avg. engagement',
        'Mike Chen: Highest conversion rate (4.2%)',
        'Consider adding 3 micro-influencers for niche targeting'
      ]
    },
    {
      key: 'recommendations',
      title: 'Recommendations',
      points: [
        'Increase video content budget by 20%',
        'Add performance bonuses for high CTR',
        'Focus on Instagram Reels (42% higher ROI)'
      ]
    }
  ];

  export const mockLandingPageInsights = [
    {
      key: 'performance',
      title: 'Performance Insights',
      points: [
        'Overall engagement rate is up by 233%',
        'Video content is generating 2.8× more interactions',
        'Peak posting times: 12pm–2pm weekdays'
      ]
    },
    {
      key: 'creator',
      title: 'Creator Analysis',
      points: [
        'Emma Johnson: 156% above avg. engagement',
        'Mike Chen: Highest conversion rate (4.2%)',
        'Consider adding 3 micro-influencers for niche targeting'
      ]
    },
    {
      key: 'recommendations',
      title: 'Recommendations',
      points: [
        'Increase video content budget by 20%',
        'Add performance bonuses for high CTR',
        'Focus on Instagram Reels (42% higher ROI)'
      ]
    }
  ];
  export const mocAiAndCampaignLevelInsights = {
    1: {
      summary:
        'This campaign reached 450K views, with an average engagement rate of 5.8%. Your top performing creator delivered 250K views in the first week.',
      recommendations: [
        'Consider adding 2 micro-influencers with 50K-100K followers to boost niche engagement.',
        'Publish posts on weekdays at 12pm-2pm based on engagement data.',
        'Increase video content which is showing 2.3x higher engagement than static posts.',
      ],
    },
    3: {
      summary:
        'New Product Push saw 45K views, 8% engagement. Conversions are trending at 1.7x ROI so far.',
      recommendations: [
        'Add unboxing content from micro-creators to highlight new features.',
        'Run a special discount code in Stories to boost conversions.',
      ],
    },
  };