const express = require('express');
const router = express.Router();
//import config from '../config.js'; // <- import our central config

const { authenticate } = require('./auth');
const { campaigns, payments } = require('../mockData');

// Mock payment webhook
router.post('/webhook', (req, res) => {
  const { campaignId, creatorId, amount } = req.body;
  
  // Find campaign
  const campaign = campaigns.find(c => c.id === campaignId);
  
  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }
  
  // Verify creator is part of campaign
  if (!campaign.creators.includes(creatorId)) {
    return res.status(400).json({ error: 'Creator not in campaign' });
  }
  
  // Create payment record
  const payment = {
    id: payments.length + 1,
    campaignId,
    creatorId,
    amount,
    currency: 'USD',
    status: 'completed',
    processedAt: new Date().toISOString()
  };
  
  payments.push(payment);
  
  // Update campaign status
  campaign.payments.push(payment.id);
  if (campaign.status !== 'completed') {
    campaign.status = 'payment_processed';
  }
  
  res.json({
    success: true,
    message: 'Payment processed successfully',
    payment
  });
});

// Get payment status
router.get('/campaign/:campaignId', authenticate, (req, res) => {
  const campaignPayments = payments.filter(
    p => p.campaignId === parseInt(req.params.campaignId)
  );
  
  res.json(campaignPayments);
});

module.exports = router;