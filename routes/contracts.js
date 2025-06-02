// routes/contracts.js

/**
 * ContractAgent
 * - Role: Drafts and tracks contracts
 * - AI/LLM: GPT + contract templates (for drafting)
 * - E-Sign: DocuSign/HelloSign integration (stubbed)
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import config from '../config.js';
import { generateText } from '../services/openaiClient.js';
import {
  createContractStub,
  getContractByIdStub,
  updateContractStub,
} from '../services/stubData.js';

const router = express.Router();

/**
 * POST /api/v1/contracts/draft
 * Body: {
 *   negotiationId,
 *   creatorId,
 *   brandId,
 *   finalOffer: { amount, currency, deliverables: [] },
 *   campaignDates: { start, end },
 *   additionalClauses: []
 * }
 */
router.post('/draft', async (req, res) => {
  const { negotiationId, creatorId, brandId, finalOffer, campaignDates, additionalClauses } =
    req.body;
  if (!negotiationId || !creatorId || !brandId || !finalOffer || !campaignDates) {
    return res.status(400).json({
      error:
        'negotiationId, creatorId, brandId, finalOffer, and campaignDates are all required',
    });
  }

  const contractId = uuidv4();
  const createdAt = new Date().toISOString();

  // === If USE_REAL_APIS ===
  if (config.useRealApis && config.openaiApiKey) {
    // Build a GPT prompt to fill in a contract template
    const prompt = `
Fill in this influencer contract template with the provided variables. 
Provide a full, legally-sounding contract in plain English.

Template:
"""
INFLUENCER SPONSORSHIP AGREEMENT

This Sponsorship Agreement (“Agreement”) is made on {{DATE}} between {{BRAND_NAME}} (Brand) and {{CREATOR_NAME}} (Creator).
1. Deliverables: {{DELIVERABLES}}.
2. Compensation: {{CURRENCY}} {{AMOUNT}}, to be paid in two installments.
3. Campaign Period: from {{START_DATE}} to {{END_DATE}}.
4. Additional Clauses: {{CLAUSES}}.
5. Use of Content: Creator grants Brand a worldwide, royalty-free license for one year.
6. Confidentiality: Both parties agree to keep campaign details confidential.
7. Governing Law: This Agreement will be governed by [Jurisdiction].
8. Termination: Either party may terminate for material breach.
"""

Variables:
{
  "DATE": "${new Date().toLocaleDateString()}",
  "BRAND_NAME": "${brandId}",
  "CREATOR_NAME": "${creatorId}",
  "DELIVERABLES": "${finalOffer.deliverables.join(', ')}",
  "CURRENCY": "${finalOffer.currency}",
  "AMOUNT": "${finalOffer.amount}",
  "START_DATE": "${campaignDates.start}",
  "END_DATE": "${campaignDates.end}",
  "CLAUSES": "${additionalClauses.join('; ')}"
}
    `;

    try {
      const { text: contractText } = await generateText(prompt, {
        model: 'gpt-3.5-turbo',
        max_tokens: 1024,
        temperature: 0.3,
      });

      // In production: convert `contractText` → PDF (e.g. via Puppeteer), upload to S3, get a real URL.
      // Here we stub the PDF URL.
      const draftPdfUrl = `https://example.com/contracts/${contractId}/draft.pdf`;

      const contract = {
        contractId,
        negotiationId,
        creatorId,
        brandId,
        amount: finalOffer.amount,
        currency: finalOffer.currency,
        deliverables: finalOffer.deliverables,
        campaignDates,
        additionalClauses,
        contractText,
        draftPdfUrl,
        finalPdfUrl: null,
        status: 'pending_signature',
        esignRequestId: null,
        createdAt,
        updatedAt: new Date().toISOString(),
        signedAt: null,
      };
      createContractStub(contract);
      return res.status(200).json(contract);
    } catch (err) {
      console.error('ContractAgent GPT error:', err);
      // Fallback stub text
    }
  }

  // === Stub Mode ===
  const stubText = `
INFLUENCER SPONSORSHIP AGREEMENT

This Sponsorship Agreement (“Agreement”) is made on ${new Date().toLocaleDateString()} between Brand (ID: ${brandId}) and Creator (ID: ${creatorId}).

1. Deliverables: ${finalOffer.deliverables.join(', ')}.
2. Compensation: ${finalOffer.currency} ${finalOffer.amount}, to be paid in two installments.
3. Campaign Period: from ${campaignDates.start} to ${campaignDates.end}.
4. Additional Clauses: ${additionalClauses.join('; ')}.
5. Use of Content: Creator grants Brand a worldwide, royalty-free license for one year.
6. Confidentiality: Both parties agree to keep campaign details confidential.
7. Governing Law: This Agreement will be governed by [Jurisdiction].
8. Termination: Either party may terminate for material breach.
  `;

  const draftPdfUrl = `https://example.com/contracts/${contractId}/draft.pdf`;
  const contract = {
    contractId,
    negotiationId,
    creatorId,
    brandId,
    amount: finalOffer.amount,
    currency: finalOffer.currency,
    deliverables: finalOffer.deliverables,
    campaignDates,
    additionalClauses,
    contractText: stubText,
    draftPdfUrl,
    finalPdfUrl: null,
    status: 'pending_signature',
    esignRequestId: null,
    createdAt,
    updatedAt: new Date().toISOString(),
    signedAt: null,
  };
  createContractStub(contract);
  return res.status(200).json(contract);
});

/**
 * POST /api/v1/contracts/:contractId/send
 * Body: { signers: [ { role, email, name } ], redirectUrlOnComplete }
 * Stub: we simulate sending via DocuSign and return a fake envelope ID.
 */
router.post('/:contractId/send', (req, res) => {
  const { contractId } = req.params;
  const { signers, redirectUrlOnComplete } = req.body;
  const contract = getContractByIdStub(contractId);
  if (!contract) {
    return res.status(404).json({ error: 'Contract not found' });
  }
  // In real life: call DocuSign SDK to send envelope, etc.
  const esignRequestId = `docusign-${Math.floor(Math.random() * 1000000)}`;
  contract.esignRequestId = esignRequestId;
  contract.status = 'sent_for_signature';
  contract.updatedAt = new Date().toISOString();
  updateContractStub(contractId, contract);
  res.json({ contractId, esignRequestId, status: contract.status });
});

/**
 * GET /api/v1/contracts/:contractId/status
 * Return stubbed contract status + URLs.
 */
router.get('/:contractId/status', (req, res) => {
  const { contractId } = req.params;
  const contract = getContractByIdStub(contractId);
  if (!contract) {
    return res.status(404).json({ error: 'Contract not found' });
  }
  res.json({
    contractId: contract.contractId,
    status: contract.status,
    draftPdfUrl: contract.draftPdfUrl,
    finalPdfUrl: contract.finalPdfUrl,
    signedAt: contract.signedAt,
  });
});

export default router;
