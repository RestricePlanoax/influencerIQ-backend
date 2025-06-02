// routes/tracking.js

import express from 'express';
import {
  registerDeliverableStub,
  fetchLatestMetricsStub,
  getDeliverablesForCampaignStub,
  getMetricsForDeliverableStub,
  mockCampaigns,
} from '../services/stubData.js';

const router = express.Router();

/**
 * Compute overview counts (active/draft/awaiting)
 */
function computeCampaignOverview() {
  const overview = { active: 0, draft: 0, awaiting: 0 };
  for (const c of mockCampaigns) {
    if (overview[c.status] !== undefined) {
      overview[c.status]++;
    }
  }
  return {
    totalCount: mockCampaigns.length,
    overview,
  };
}

/**
 * POST /api/v1/campaigns
 * Accept full wizard payload and insert into `mockCampaigns`.
 */
router.post('/', (req, res) => {
  const {
    name,
    description,
    targetAudience,
    budget: budgetStr,
    budgetType,
    startDate,
    endDate,
    objectives,
    brief,
    selectedCreators,
  } = req.body;

  // 1) Basic validation
  if (
    typeof name !== 'string' ||
    typeof description !== 'string' ||
    typeof targetAudience !== 'string' ||
    typeof budgetStr !== 'string' ||
    typeof budgetType !== 'string' ||
    typeof startDate !== 'string' ||
    typeof endDate !== 'string' ||
    !Array.isArray(objectives) ||
    typeof brief !== 'object' ||
    !Array.isArray(selectedCreators)
  ) {
    return res.status(400).json({
      error:
        'Invalid payload. Required: name(string), description(string), targetAudience(string), budget(string), budgetType(string), startDate(string), endDate(string), objectives(array), brief(object), selectedCreators(array).',
    });
  }

  // 2) Convert budget → number
  const budgetNum = parseFloat(budgetStr);
  if (isNaN(budgetNum)) {
    return res.status(400).json({ error: 'Budget must be a valid number string.' });
  }

  // 3) Destructure & validate brief subfields
  const {
    description: briefDesc,
    contentGuidelines,
    deliverables,
  } = brief;
  if (
    typeof briefDesc !== 'string' ||
    typeof contentGuidelines !== 'string' ||
    !Array.isArray(deliverables)
  ) {
    return res.status(400).json({
      error:
        'Invalid `brief` subobject. Must have: description(string), contentGuidelines(string), deliverables(array).',
    });
  }
  // Each deliverable must have { type: string, quantity: number }
  for (const d of deliverables) {
    if (
      typeof d.type !== 'string' ||
      typeof d.quantity !== 'number'
    ) {
      return res.status(400).json({
        error: 'Each deliverable must be { type: string, quantity: number }',
      });
    }
  }

  // 4) Generate new numeric ID
  const maxId = mockCampaigns.reduce((max, c) => (c.id > max ? c.id : max), 0);
  const newId = maxId + 1;

  // 5) Construct new campaign object
  const newCampaign = {
    id: newId,
    name,
    status: 'draft', // default new campaigns to “draft”
    budget: budgetNum,
    startDate,
    endDate,
    objective: objectives[0] || 'awareness', // pick first objective or default
    creators: selectedCreators.slice(),
    brief: {
      description: briefDesc,
      contentGuidelines,
      deliverables: deliverables.map((d) => ({
        type: d.type,
        quantity: d.quantity,
      })),
    },
    metrics: {
      views: 0,
      engagement: 0,
      conversions: 0,
      roi: 0,
    },
    // Store extra wizard fields if you need them
    description,
    targetAudience,
    budgetType,
    objectives,
    selectedCreators,
  };

  // 6) Append to in‐memory array
  mockCampaigns.push(newCampaign);

  // 7) Return 201 with newly created campaign
  return res.status(201).json({ campaign: newCampaign });
});

/**
 * GET /api/v1/campaigns?status=<…>
 * → Return all or filtered by status.
 */
router.get('/', (req, res) => {
  const { status } = req.query;
  const allowed = ['active', 'draft', 'awaiting'];
  if (!status || !allowed.includes(String(status))) {
    return res.json({ totalCount: mockCampaigns.length, campaigns: mockCampaigns });
  }
  const filtered = mockCampaigns.filter((c) => c.status === String(status));
  return res.json({ totalCount: filtered.length, campaigns: filtered });
});

/**
 * GET /api/v1/campaigns/overview
 */
router.get('/overview', (req, res) => {
  const result = computeCampaignOverview();
  return res.json(result);
});

/**
 * GET /api/v1/campaigns/:id
 */
router.get('/:id', (req, res) => {
  const requestedId = parseInt(req.params.id, 10);
  const found = mockCampaigns.find((c) => c.id === requestedId);
  if (!found) {
    return res.status(404).json({ message: 'Campaign not found' });
  }
  return res.json({ campaign: found });
});

/**
 * PATCH /api/v1/campaigns/:id/status
 * → Update only the `status` field.
 */
router.patch('/:id/status', (req, res) => {
  const requestedId = parseInt(req.params.id, 10);
  const { status } = req.body;
  const allowedStatuses = ['active', 'draft', 'awaiting', 'completed', 'paused'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }
  const idx = mockCampaigns.findIndex((c) => c.id === requestedId);
  if (idx === -1) {
    return res.status(404).json({ message: 'Campaign not found' });
  }
  mockCampaigns[idx].status = status;
  return res.json({ campaign: mockCampaigns[idx] });
});

/**
 * Deliverable endpoints (unchanged) …
 */
router.post('/:campaignId/deliverables', (req, res) => {
  const { campaignId } = req.params;
  const {
    deliverableId,
    creatorId,
    platform,
    platformPostId,
    postedUrl,
    postedAt,
  } = req.body;
  if (!deliverableId || !creatorId || !platform || !platformPostId || !postedUrl) {
    return res.status(400).json({
      error:
        'deliverableId, creatorId, platform, platformPostId, and postedUrl are all required',
    });
  }
  const registeredAt = new Date().toISOString();
  const deliverable = {
    deliverableId,
    campaignId,
    creatorId,
    platform,
    platformPostId,
    postedUrl,
    postedAt: postedAt || registeredAt,
    status: 'registered',
    latestMetrics: null,
    createdAt: registeredAt,
    updatedAt: registeredAt,
  };
  registerDeliverableStub(deliverable);
  const snapshot = fetchLatestMetricsStub(deliverableId);
  deliverable.latestMetrics = snapshot;
  deliverable.status = 'metrics_fetched';
  deliverable.updatedAt = new Date().toISOString();
  return res.status(201).json(deliverable);
});

router.post('/:campaignId/deliverables/:deliverableId/metrics', (req, res) => {
  const { deliverableId } = req.params;
  try {
    const snapshot = fetchLatestMetricsStub(deliverableId);
    return res.json({
      deliverableId,
      metrics: snapshot,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(404).json({ error: 'Deliverable not found' });
  }
});

router.get('/:campaignId/deliverables', (req, res) => {
  const { campaignId } = req.params;
  const delivs = getDeliverablesForCampaignStub(campaignId);
  return res.json({ campaignId, deliverables: delivs });
});

router.get('/:campaignId/deliverables/:deliverableId/metrics', (req, res) => {
  const { deliverableId } = req.params;
  const { since } = req.query;
  try {
    const series = getMetricsForDeliverableStub(deliverableId, since);
    return res.json({ deliverableId, metrics: series });
  } catch (err) {
    return res.status(404).json({ error: 'Deliverable not found' });
  }
});

export default router;
