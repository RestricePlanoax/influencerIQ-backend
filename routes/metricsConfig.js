// routes/metricsConfig.js

/**
 * Two-Step Metrics API (CommonJS version):
 *
 * 1. GET /api/v1/metrics/read
 *    - Returns { totalCount, metrics: [ { key, label, icon, fontSize, description, format }, ... ] }
 *    - No “value” field here—purely metadata.
 *
 * 2. GET /api/v1/metrics/data?keys=key1,key2,...
 *    - Returns { metrics: { key1: value1, key2: value2, ... } }
 *    - Computed via stub logic from _getAllDeliverables().
 */

import express from 'express';
import {
    metricDefinitions, _getAllDeliverables 
  } from '../services/stubData.js';

const metricsRoutes = express.Router();

/**
 * GET /api/v1/metrics/read
 */
metricsRoutes.get('/read', (req, res) => {
  res.json({
    totalCount: metricDefinitions.length,
    metrics: metricDefinitions,
  });
});

/**
 * GET /api/v1/metrics/data?keys=key1,key2,...
 */
metricsRoutes.get('/data', (req, res) => {
  const keysParam = req.query.keys || '';
  const requestedKeys = keysParam.split(',').map((k) => k.trim()).filter(Boolean);

  // Fetch all deliverables from stub
  const allDeliverablesMap = _getAllDeliverables(); // { [deliverableId]: { ... } }

  let totalDeliverables = 0;
  let deliverablesWithMetrics = 0;
  const campaignIdSet = new Set();
  const creatorIdSet = new Set();

  Object.values(allDeliverablesMap).forEach((deliv) => {
    totalDeliverables += 1;
    if (deliv.campaignId) campaignIdSet.add(deliv.campaignId);
    if (deliv.creatorId) creatorIdSet.add(deliv.creatorId);
    if (deliv.latestMetrics && typeof deliv.latestMetrics === 'object') {
      deliverablesWithMetrics += 1;
    }
  });

  // Stub calculations
  const activeCampaigns = campaignIdSet.size;
  const creatorsEngaged = creatorIdSet.size;
  const totalBudget = totalDeliverables * 1000; // stub: $1k per deliverable
  const completionRate = totalDeliverables > 0
    ? parseFloat(((deliverablesWithMetrics / totalDeliverables) * 100).toFixed(2))
    : 0;

  const allComputed = {
    activeCampaigns,
    totalBudget,
    creatorsEngaged,
    completionRate,
  };

  // Build output only for requested keys
  const output = {};
  requestedKeys.forEach((key) => {
    output[key] = allComputed.hasOwnProperty(key) ? allComputed[key] : null;
  });

  res.json({ metrics: output });
});

export default metricsRoutes;
