// routes/aiInsights.js
import { Router } from 'express';
import { mockLandingPageInsights,mockInsights } from '../services/stubData.js';
const router = Router();

/**
 * GET /api/v1/ai-insights
 * Returns a mock list of AI-generated insights.
 */
router.get('/', (req, res) => {


  return res.json({ insights: mockInsights });
});

export default router;
