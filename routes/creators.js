
/**
 * CreatorScoutAgent
 * - Role: Discover, filter, and rank creators
 * - AI/LLM: Semantic search (via GPT), persona-based ranking
 */

import express from 'express';
//import config from '../config.js';
import { getCreatorsFromStub, getCreatorByIdStub,mockCreators } from '../services/stubData.js';
import { computeFitScore } from '../utils/formatHelpers.js';
import { generateText } from '../services/openaiClient.js';

const router = express.Router();

/**
 * GET /api/v1/creators/search
 * Query Params:
 *   - q (string): free-text query
 *   - minFollowers (int)
 *   - engagementGt (float)
 *   - limit (int)
 *
 * If USE_REAL_APIS=true and OPENAI_API_KEY is present, we call GPT with a persona‐based prompt to rank/stub creators.
 * Otherwise, we fall back to our stubbed “in-memory” filter.
 */
router.get('/', (req, res) => {
  // Always return exactly one response
  return res.json({ creators: mockCreators });
});
router.get('/search', (req, res) => {
  const q = (req.query.q || '').trim().toLowerCase();
  if (!q) {
    return res.json({ creators: mockCreators });
  }
  const filtered = mockCreators.filter((c) => {
    return (
      c.name.toLowerCase().includes(q) ||
      c.handle.toLowerCase().includes(q)
      // optionally match niche or other fields here
    );
  });
  return res.json({ creators: filtered });
});

/**
 * GET /api/v1/creators/:creatorId
 * Returns a full stubbed profile.
 * In real life: fetch from DB/ES.
 */
router.get('/:creatorId', (req, res) => {
  const { creatorId } = req.params;
  const creator = getCreatorByIdStub(creatorId);
  if (!creator) {
    return res.status(404).json({ error: 'Creator not found' });
  }
  res.json(creator);
});
// POST /api/v1/creators/ai-search
router.post('/ai-search', (req, res) => {
  const { prompt } = req.body;
  console.log(`Received AI prompt: ${prompt}`);

  // Hardcoded demo logic:
  // If prompt mentions “fitness”, return only fitness-related creators (e.g., Emma Johnson, Sophia Martinez).
  // If prompt mentions “tech”, return tech-related creators (e.g., Alex Chen, James Wilson).
  // Otherwise, return all creators as fallback.

  const lowerPrompt = (prompt || '').toLowerCase();

  if (lowerPrompt.includes('fitness')) {
    // Emma Johnson (fitness) and Sophia Martinez (lifestyle/fitness)
    const fitnessCreators = mockCreators.filter((c) =>
      ['creator1', 'creator3'].includes(c.id)
    );
    return res.json({ creators: fitnessCreators });
  } else if (lowerPrompt.includes('tech')) {
    // Alex Chen (tech reviews) and James Wilson (tech commentary)
    const techCreators = mockCreators.filter((c) =>
      ['creator2', 'creator4'].includes(c.id)
    );
    return res.json({ creators: techCreators });
  } else {
    // Fallback: return everyone
    return res.json({ creators: mockCreators });
  }
});
// POST /api/v1/creators/ai-search
router.post('/ai-search', (req, res) => {
  const { prompt } = req.body;
  console.log(`Received AI prompt: ${prompt}`);
  const lowerPrompt = (prompt || '').toLowerCase();

  if (lowerPrompt.includes('fitness')) {
    // Return only Emma Johnson and Sophia Martinez
    const fitnessCreators = mockCreators.filter((c) =>
      ['creator1', 'creator3'].includes(c.id)
    );
    return res.json({ creators: fitnessCreators });
  } else if (lowerPrompt.includes('tech')) {
    // Return only Alex Chen and James Wilson
    const techCreators = mockCreators.filter((c) =>
      ['creator2', 'creator4'].includes(c.id)
    );
    return res.json({ creators: techCreators });
  } else {
    // Fallback: return all
    return res.json({ creators: mockCreators });
  }
});

// ─── FILTER CREATORS ─────────────────────────────────────────────────────────
// POST /api/v1/creators/filter
// Body: { platforms: string[], location: string, gender: string, ageRange: [number,number], followerRange: [number,number] }
router.post('/filter', (req, res) => {
  const {
    platforms = [],
    location = '',
    gender = '',
    ageRange = [16, 45],
    followerRange = [0, 1000000],
  } = req.body;

  const [minAge, maxAge] = Array.isArray(ageRange) ? ageRange : [16, 45];
  const [minFollowers, maxFollowers] = Array.isArray(followerRange)
    ? followerRange
    : [0, 1000000];
  const locLower = (location || '').toLowerCase();
  const genderFilter = (gender || '').toLowerCase();

  const filtered = mockCreators.filter((c) => {
    // 1) Platform filter
    if (platforms.length > 0 && !platforms.includes(c.platform)) {
      return false;
    }

    // 2) Location filter (match if creator.demographics.location includes substring)
    if (locLower) {
      const creatorLoc = (c.demographics.location || '').toLowerCase();
      if (!creatorLoc.includes(locLower)) {
        return false;
      }
    }

    // 3) Gender filter: based on audience distribution
    if (genderFilter === 'female' && c.demographics.gender.female < c.demographics.gender.male) {
      return false;
    }
    if (genderFilter === 'male' && c.demographics.gender.male < c.demographics.gender.female) {
      return false;
    }
    if (
      genderFilter === 'balanced' &&
      Math.abs(c.demographics.gender.female - c.demographics.gender.male) > 0.2
    ) {
      return false;
    }

    // 4) Age range filter: require overlap between creator.ageRange and [minAge,maxAge]
    const [cMinAge, cMaxAge] = c.demographics.ageRange || [0, 999];
    if (cMaxAge < minAge || cMinAge > maxAge) {
      return false;
    }

    // 5) Follower range filter
    if (
      c.audienceSize < minFollowers ||
      c.audienceSize > maxFollowers
    ) {
      return false;
    }

    return true;
  });

  return res.json({ creators: filtered });
});
export default router;
