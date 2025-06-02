const express = require('express');
const router = express.Router();
const { authenticate } = require('./auth');
//import config from '../config.js'; // <- import our central config
const {mockCampaigns}  = require('../services/stubData.js')
let campaignIdCounter = 1;

// Create new campaign
router.post('/', authenticate, (req, res) => {
  const { name, brief } = req.body;
  
  if (!name || !brief) {
    return res.status(400).json({ error: 'Name and brief are required' });
  }
  
  const newCampaign = {
    id: campaignIdCounter++,
    name,
    brief,
    brandId: req.user.id,
    status: 'draft',
    createdAt: new Date().toISOString(),
    creators: [],
    payments: []
  };
  
  mockCampaigns.push(newCampaign);
  res.status(201).json(newCampaign);
});

// Add creators to campaign
router.post('/:id/creators', authenticate, (req, res) => {
  const campaign = mockCampaigns.find(c => c.id === parseInt(req.params.id));
  
  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }
  
  const { creatorIds } = req.body;
  
  if (!creatorIds || !Array.isArray(creatorIds)) {
    return res.status(400).json({ error: 'Invalid creator IDs' });
  }
  
  // Verify creator IDs
  const validCreators = creatorIds.every(id => 
    creators.some(c => c.id === id)
  );
  
  if (!validCreators) {
    return res.status(400).json({ error: 'Invalid creator IDs provided' });
  }
  
  campaign.creators = [...new Set([...campaign.creators, ...creatorIds])];
  campaign.status = 'outreach';
  
  res.json(campaign);
});

// Get campaign details
// ─── GET /api/v1/campaigns/:id ───────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const requestedId = parseInt(req.params.id, 10);
  const found = mockCampaigns.find((c) => c.id === requestedId);

  if (!found) {
    return res.status(404).json({ message: 'Campaign not found' });
  }

  // Return exactly one campaign
  return res.json({ campaign: found });
});

module.exports = router;