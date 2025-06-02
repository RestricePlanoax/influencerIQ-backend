// routes/negotiations.js

/**
 * NegotiationAgent
 * - Role: Handles basic rate/deliverable negotiation
 * - AI/LLM: GPT-powered counter proposals
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
//import config from '../config.js';
import {
  createNegotiationStub,
  getNegotiationByIdStub,
  updateNegotiationStub,
} from '../services/stubData.js';
import { generateText } from '../services/openaiClient.js';

const router = express.Router();

/**
 * POST /api/v1/negotiations
 * Body: {
 *   threadId,
 *   creatorId,
 *   brandId,
 *   initialOffer: { amount, currency, deliverables: [] },
 *   brandBudget: { min, max, currency },
 *   campaignBrief
 * }
 */
router.post('/', async (req, res) => {
  const { threadId, creatorId, brandId, initialOffer, brandBudget, campaignBrief } = req.body;
  if (!threadId || !creatorId || !brandId || !initialOffer || !brandBudget) {
    return res
      .status(400)
      .json({ error: 'threadId, creatorId, brandId, initialOffer, and brandBudget are required' });
  }

  const negotiationId = uuidv4();
  const createdAt = new Date().toISOString();

  const negotiation = {
    negotiationId,
    threadId,
    creatorId,
    brandId,
    status: 'pending_agent',
    thread: [
      {
        sender: 'creator',
        amount: initialOffer.amount,
        currency: initialOffer.currency,
        deliverables: initialOffer.deliverables,
        timestamp: createdAt,
      },
    ],
    lastUpdated: createdAt,
  };
  createNegotiationStub(negotiation);

  // === If USE_REAL_APIS ===
//   if (config.useRealApis && config.openaiApiKey) {
//     // Build a GPT prompt for a polite counter-offer
//     const prompt = `
// Creator (ID: ${creatorId}) requests $${initialOffer.amount} ${initialOffer.currency} 
// for deliverables: ${initialOffer.deliverables.join(', ')}.
// Our budget is $${brandBudget.min}–$${brandBudget.max} ${brandBudget.currency}.
// Campaign brief: "${campaignBrief}".
// Provide a polite counter-offer in JSON format:
// {"amount": <number>, "currency": "${brandBudget.currency}", "messageText": "<full counter text>"}
//     `;

//     try {
//       const { text: agentOutput } = await generateText(prompt, {
//         model: 'gpt-3.5-turbo',
//         max_tokens: 256,
//         temperature: 0.6,
//       });

//       // Attempt to parse as JSON
//       let parsed = {};
//       try {
//         parsed = JSON.parse(agentOutput);
//         if (!parsed.amount || !parsed.messageText) throw new Error('Invalid JSON');
//       } catch {
//         // Fallback if parsing fails: pick brandBudget.max
//         parsed = {
//           amount: brandBudget.max,
//           currency: brandBudget.currency,
//           messageText: `We can offer ${brandBudget.max} ${brandBudget.currency} for these deliverables.`,
//         };
//       }

//       negotiation.thread.push({
//         sender: 'agent',
//         amount: parsed.amount,
//         currency: parsed.currency,
//         deliverables: initialOffer.deliverables,
//         messageText: parsed.messageText,
//         timestamp: new Date().toISOString(),
//       });
//       negotiation.status = 'counter_sent';
//       negotiation.lastUpdated = new Date().toISOString();
//       updateNegotiationStub(negotiationId, negotiation);

//       return res.status(201).json(negotiation);
//     } catch (err) {
//       console.error('NegotiationAgent GPT error:', err);
//       // Fallback stub
//       negotiation.thread.push({
//         sender: 'agent',
//         amount: brandBudget.max,
//         currency: brandBudget.currency,
//         deliverables: initialOffer.deliverables,
//         messageText: `We can offer ${brandBudget.max} ${brandBudget.currency} for these deliverables.`,
//         timestamp: new Date().toISOString(),
//       });
//       negotiation.status = 'counter_sent';
//       negotiation.lastUpdated = new Date().toISOString();
//       updateNegotiationStub(negotiationId, negotiation);

//       return res.status(201).json(negotiation);
//     }
//   }

  // === Stub Mode ===
  negotiation.thread.push({
    sender: 'agent',
    amount: brandBudget.max,
    currency: brandBudget.currency,
    deliverables: initialOffer.deliverables,
    messageText: `We can offer ${brandBudget.max} ${brandBudget.currency} for these deliverables.`,
    timestamp: new Date().toISOString(),
  });
  negotiation.status = 'counter_sent';
  negotiation.lastUpdated = new Date().toISOString();
  updateNegotiationStub(negotiationId, negotiation);

  return res.status(201).json(negotiation);
});

/**
 * GET /api/v1/negotiations/:negotiationId
 */
router.get('/:negotiationId', (req, res) => {
  const { negotiationId } = req.params;
  const negotiation = getNegotiationByIdStub(negotiationId);
  if (!negotiation) {
    return res.status(404).json({ error: 'Negotiation not found' });
  }
  res.json(negotiation);
});

/**
 * POST /api/v1/negotiations/:negotiationId/respond
 * Body: { responder: "creator"|"brand", action: "accept"|"decline"|"counter", counterOffer: { amount, currency, deliverables, messageText } }
 */
router.post('/:negotiationId/respond', async (req, res) => {
  const { negotiationId } = req.params;
  const { responder, action, counterOffer } = req.body;
  const negotiation = getNegotiationByIdStub(negotiationId);
  if (!negotiation) {
    return res.status(404).json({ error: 'Negotiation not found' });
  }

  if (action === 'accept') {
    negotiation.thread.push({
      sender: responder,
      amount: negotiation.thread[negotiation.thread.length - 1].amount,
      currency: negotiation.thread[negotiation.thread.length - 1].currency,
      deliverables: negotiation.thread[negotiation.thread.length - 1].deliverables,
      messageText: 'Accepted',
      timestamp: new Date().toISOString(),
    });
    negotiation.status = 'accepted';
    negotiation.lastUpdated = new Date().toISOString();
    updateNegotiationStub(negotiationId, negotiation);
    return res.json(negotiation);
  }

  if (action === 'decline') {
    negotiation.thread.push({
      sender: responder,
      amount: 0,
      currency: negotiation.thread[negotiation.thread.length - 1].currency,
      deliverables: negotiation.thread[negotiation.thread.length - 1].deliverables,
      messageText: 'Declined',
      timestamp: new Date().toISOString(),
    });
    negotiation.status = 'declined';
    negotiation.lastUpdated = new Date().toISOString();
    updateNegotiationStub(negotiationId, negotiation);
    return res.json(negotiation);
  }

  if (action === 'counter') {
    if (!counterOffer || !counterOffer.amount) {
      return res
        .status(400)
        .json({ error: 'counterOffer with amount is required when action="counter"' });
    }
    negotiation.thread.push({
      sender: responder,
      amount: counterOffer.amount,
      currency: counterOffer.currency || 'USD',
      deliverables: counterOffer.deliverables || negotiation.thread.slice(-1)[0].deliverables,
      messageText: counterOffer.messageText || `Counter: $${counterOffer.amount}`,
      timestamp: new Date().toISOString(),
    });
    negotiation.status = responder === 'brand' ? 'counter_sent' : 'counter_from_creator';
    negotiation.lastUpdated = new Date().toISOString();
    updateNegotiationStub(negotiationId, negotiation);
    return res.json(negotiation);
  }

  return res.status(400).json({ error: 'Invalid action' });
});

export default router;
