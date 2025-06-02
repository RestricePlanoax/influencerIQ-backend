// routes/finance.js

/**
 * FinanceAgent
 * - Role: Generates invoices, tracks payouts
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  createInvoiceStub,
  getInvoiceByIdStub,
  updateInvoiceStub,
} from '../services/stubData.js';

const router = express.Router();

/**
 * POST /api/v1/finance/invoices
 */
router.post('/invoices', (req, res) => {
  const { contractId, creatorId, brandId, deliverableMilestones, currency, notes } = req.body;
  if (!contractId || !creatorId || !brandId || !Array.isArray(deliverableMilestones) || deliverableMilestones.length === 0) {
    return res
      .status(400)
      .json({ error: 'contractId, creatorId, brandId, and at least one deliverableMilestone are required' });
  }

  const invoiceId = uuidv4();
  const totalAmount = deliverableMilestones.reduce((sum, m) => sum + parseFloat(m.amount), 0);
  const invoicePdfUrl = `https://example.com/invoices/${invoiceId}/invoice.pdf`;
  const createdAt = new Date().toISOString();

  const invoice = {
    invoiceId,
    contractId,
    creatorId,
    brandId,
    totalAmount,
    currency,
    status: 'pending',
    invoicePdfUrl,
    createdAt,
    updatedAt: createdAt,
    deliverableMilestones,
    notes,
  };

  createInvoiceStub(invoice);
  res.status(201).json(invoice);
});

/**
 * POST /api/v1/finance/invoices/:invoiceId/payment
 */
router.post('/invoices/:invoiceId/payment', (req, res) => {
  const { invoiceId } = req.params;
  const { paymentProvider, transactionId, paidAt, amountPaid } = req.body;
  const invoice = getInvoiceByIdStub(invoiceId);
  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  if (parseFloat(amountPaid) >= parseFloat(invoice.totalAmount)) {
    invoice.status = 'fully_paid';
  } else {
    invoice.status = 'partially_paid';
  }
  invoice.updatedAt = new Date().toISOString();
  updateInvoiceStub(invoiceId, invoice);

  res.json({ invoiceId: invoice.invoiceId, status: invoice.status, transactionId });
});

/**
 * GET /api/v1/finance/payouts
 */
router.get('/payouts', (req, res) => {
  const { creatorId, startDate, endDate } = req.query;
  const payouts = [
    {
      payoutId: 'payout-001',
      invoiceId: 'inv-001',
      amount: 1200.0,
      currency: 'USD',
      paidAt: '2025-06-10T12:30:00Z',
      method: 'Stripe',
    },
    {
      payoutId: 'payout-002',
      invoiceId: 'inv-002',
      amount: 600.0,
      currency: 'USD',
      paidAt: '2025-06-16T15:00:00Z',
      method: 'Stripe',
    },
  ].filter((p) => (!creatorId || p.payoutId.includes(creatorId)));

  res.json({ creatorId: creatorId || null, payouts });
});

export default router;
