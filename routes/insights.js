// routes/insights.js

/**
 * InsightsAgent
 * - Role: Summarizes performance and gives optimization tips
 * - AI/LLM: GPT-generated performance recaps, bullet recommendations, chart suggestions
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
//import config from '../config.js';
import {
  getMetricsForDeliverableStub,
  getDeliverablesForCampaignStub,
  createReportStub,
  getReportStub,
  mocAiAndCampaignLevelInsights
} from '../services/stubData.js';
import { generateText } from '../services/openaiClient.js';

const router = express.Router();

/**
 * GET /api/v1/insights/campaigns/:campaignId/summary?sinceDate=&untilDate=
 * 1) Aggregate stubbed metrics
 * 2) If USE_REAL_APIS=true, call GPT to generate a summary + recommendations
 * 3) Return the assembled report
 */
router.get('/:campaignId/summary', async (req, res) => {
  const { campaignId } = req.params;
  const { sinceDate, untilDate } = req.query;

  // 1) Fetch all deliverables for this campaign
  const deliverables = getDeliverablesForCampaignStub(campaignId);
  if (!deliverables || deliverables.length === 0) {
    return res.status(404).json({ error: 'No deliverables found for this campaign' });
  }

  // 2) Sum up metrics
  let totalViews = 0;
  let totalLikes = 0;
  let totalComments = 0;
  deliverables.forEach((d) => {
    if (d.latestMetrics) {
      totalViews += d.latestMetrics.views;
      totalLikes += d.latestMetrics.likes;
      totalComments += d.latestMetrics.comments;
    }
  });
  const totalEngagements = totalLikes + totalComments;

  // 3) Stubbed total spend: assume $1000 per creator for demo
  const totalSpend = deliverables.length * 1000;

  // 4) Identify top/underperformers
  const topPerformers = [];
  const underperformers = [];
  for (const d of deliverables) {
    if (!d.latestMetrics) continue;
    const er = d.latestMetrics.engagementRate;
    if (er >= 0.05) {
      topPerformers.push({ creatorId: d.creatorId, engagementRate: er, earnings: 1000 });
    } else if (er <= 0.03) {
      underperformers.push({ creatorId: d.creatorId, engagementRate: er, earnings: 1000 });
    }
  }

  // 5) GPT summary + recommendations
  let summaryText = '';
  let recommendations = [];
//   if (config.useRealApis && config.openaiApiKey) {
//     const prompt = `
// Here are aggregated metrics for Campaign ${campaignId} from ${sinceDate || 'start'} to ${
//       untilDate || 'now'
//     }:
// • Total Spend: $${totalSpend}
// • Total Impressions (views): ${totalViews}
// • Total Engagements: ${totalEngagements}

// Top Performers:
// ${topPerformers.map((t) => `• ${t.creatorId}: ER=${t.engagementRate}, Earnings=$${t.earnings}`).join('\n')}

// Underperformers:
// ${underperformers
//   .map((u) => `• ${u.creatorId}: ER=${u.engagementRate}, Earnings=$${u.earnings}`)
//   .join('\n')}

// 1) Provide a concise performance summary in 2–3 sentences.
// 2) Provide three bullet-point recommendations to optimize future campaigns.
// `;

//     try {
//       const { text } = await generateText(prompt, {
//         model: 'gpt-3.5-turbo',
//         max_tokens: 256,
//         temperature: 0.6,
//       });
//       // Attempt to split summary vs. recommendations by newline
//       const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
//       // Assume first line(s) until a “1.” or “•” is summary
//       let splitIdx = lines.findIndex((l) => /^([0-9]+\.)|(^•)/.test(l));
//       if (splitIdx < 0) splitIdx = 2;
//       summaryText = lines.slice(0, splitIdx).join(' ');
//       recommendations = lines.slice(splitIdx).map((l) => l.replace(/^[0-9\.\-\s]+/, '').trim());
//     } catch (err) {
//       console.error('InsightsAgent GPT error:', err);
//       summaryText = `Campaign ${campaignId} had total spend $${totalSpend}, total engagements ${totalEngagements}, total views ${totalViews}.`;
//       recommendations = topPerformers.length
//         ? [`Focus more budget on ${topPerformers[0].creatorId}`]
//         : [];
//     }
//   } else {
//     // Stub summary
//     summaryText = `Campaign ${campaignId} had total spend $${totalSpend}, total engagements ${totalEngagements}, total views ${totalViews}.`;
//     recommendations = topPerformers.length
//       ? [`Focus more budget on ${topPerformers[0].creatorId}`]
//       : [];
//   }

  // 6) Stub chart URLs
  const charts = {
    engagementVsSpendUrl: `https://example.com/charts/${campaignId}/engagement_vs_spend.png`,
    timeSeriesUrl: `https://example.com/charts/${campaignId}/time_series.png`,
  };

  // 7) Save the report (stub)
  const reportId = uuidv4();
  const report = {
    reportId,
    campaignId,
    sinceDate,
    untilDate,
    metricsAggregated: {
      totalSpend,
      totalImpressions: totalViews,
      totalEngagements,
      perCreator: deliverables.map((d) => ({
        creatorId: d.creatorId,
        views: d.latestMetrics?.views || 0,
        likes: d.latestMetrics?.likes || 0,
        comments: d.latestMetrics?.comments || 0,
        spend: 1000,
        engagementRate: d.latestMetrics?.engagementRate || 0,
      })),
    },
    summaryText,
    recommendations,
    charts,
    createdAt: new Date().toISOString(),
    generatedBy: 'auto',
  };
  createReportStub(report);

  res.json(report);
});

/**
 * GET /api/v1/insights/campaigns/:campaignId/reports/:reportId
 */
router.get('/:campaignId/reports/:reportId', (req, res) => {
  const { campaignId, reportId } = req.params;
  const report = getReportStub(reportId);
  if (!report || report.campaignId !== campaignId) {
    return res.status(404).json({ error: 'Report not found' });
  }
  res.json(report);
});
// GET /api/v1/insights/:campaignId
router.get('/:campaignId', (req, res) => {
  const campaignId = req.params.campaignId;
  const insight = mocAiAndCampaignLevelInsights[campaignId];

  if (insight) {
    return res.json({ insights: insight });
  }

  // Default placeholder if no entry exists:
  return res.json({
    insights: {
      summary:
        'No AI insights available for this campaign yet. Come back after data has been processed.',
      recommendations: [
        'Ensure campaign brief is fully detailed for better insights.',
        'Run at least one post before requesting AI insights.',
      ],
    },
  });
});


export default router;
