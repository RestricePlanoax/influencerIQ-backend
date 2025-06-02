// routes/outreach.js

/**
 * OutreachAgent
 * - Role: Personalized email/voice outreach, follow-ups
 * - AI/LLM: GPT for message generation, Whisper + ElevenLabs for voice (stubbed)
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
//import config from '../config.js';
import {
  createOutreachThreadStub,
  getOutreachHistoryStub,
  recordReplyStub,
} from '../services/stubData.js';
import { generateText } from '../services/openaiClient.js';

const router = express.Router();

/**
 * POST /api/v1/outreach/campaigns
 * Body: {
 *   campaignId,
 *   brandId,
 *   creatorIds: [ ... ],
 *   templateId,
 *   variables: { ... },
 *   channels: [...],          // e.g. ["email","sms","voice"]
 *   schedule: "2025-06-05T09:00:00Z"
 * }
 *
 * For each creator, we generate a personalized message via GPT (if USE_REAL_APIS=true).
 * Otherwise, we use a simple stub.
 */
router.post('/campaigns', async (req, res) => {
  const { campaignId, brandId, creatorIds, templateId, variables, channels, schedule } =
    req.body;
  if (!campaignId || !brandId || !Array.isArray(creatorIds) || creatorIds.length === 0) {
    return res
      .status(400)
      .json({ error: 'campaignId, brandId, and at least one creatorId are required' });
  }

  const threads = [];

  for (const creatorId of creatorIds) {
    const threadId = uuidv4();

    let firstMessageContent = '';
    let status = 'stubbed';

//     if (config.useRealApis && config.openaiApiKey) {
//       try {
//         // Build a personalization prompt for GPT
//         const prompt = `
// You are a brand outreach agent. Write a personalized, friendly email inviting influencer ${creatorId} to collaborate on brand "${variables.brandName}" with a budget range of "${variables.budget}". 
// Use a one-paragraph tone. Sign off with the brand name.
// `;
//         const { text: gptContent } = await generateText(prompt, {
//           model: 'gpt-3.5-turbo',
//           max_tokens: 150,
//           temperature: 0.7,
//         });
//         firstMessageContent = gptContent;
//         status = 'delivered';
//       } catch (err) {
//         console.error('OutreachAgent GPT error:', err);
//         firstMessageContent = `Hello ${creatorId}, we'd love to partner with you on ${variables.brandName} (budget: ${variables.budget}).`;
//         status = 'stubbed';
//       }
//     } else {
//       // Stub content
//       firstMessageContent = `Hello ${creatorId}, [STUB] we'd love to partner with ${variables.brandName} (budget: ${variables.budget}).`;
//     }

    const firstMessage = {
      messageId: uuidv4(),
      sender: 'brand',
      content: firstMessageContent,
      sentAt: new Date().toISOString(),
      status,
      channel: channels[0] || 'email',
      variablesUsed: variables,
    };

    const thread = {
      threadId,
      campaignId,
      creatorId,
      channel: channels[0] || 'email',
      status: 'in_progress',
      nextScheduledAt: schedule || new Date().toISOString(),
      messages: [firstMessage],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    createOutreachThreadStub(thread);
    threads.push(thread);
  }

  res.status(201).json({
    outreachCampaignId: campaignId,
    status: 'scheduled',
    threads,
  });
});

/**
 * GET /api/v1/outreach/campaigns/:campaignId/history
 * Returns all threads & messages (stub).
 */
router.get('/campaigns/:campaignId/history', (req, res) => {
  const { campaignId } = req.params;
  const history = getOutreachHistoryStub(campaignId);
  res.json({ outreachCampaignId: campaignId, threads: history });
});

/**
 * POST /api/v1/outreach/reply
 * Body: { threadId, creatorId, channel, content, timestamp }
 * We record the creator’s reply and (if it looks like a negotiation) pass it to NegotiationAgent.
 */
router.post('/reply', (req, res) => {
  const { threadId, creatorId, channel, content, timestamp } = req.body;
  if (!threadId || !creatorId || !content) {
    return res.status(400).json({ error: 'threadId, creatorId, and content are required' });
  }

  const message = {
    messageId: uuidv4(),
    sender: 'creator',
    content,
    sentAt: timestamp || new Date().toISOString(),
    channel,
    status: 'received',
  };

  try {
    recordReplyStub(threadId, message);
  } catch (err) {
    return res.status(404).json({ error: err.message });
  }

  // In a real system, here we would push a "NEGOTIATION.START" event to a queue if content contains a dollar amount.
  res.json({ status: 'recorded', message });
});

export default router;
