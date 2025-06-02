// routes/lang.js

/**
 * LangBridgeAgent
 * - Role: Multilingual communication & translation
 * - AI/LLM: DeepL / Google Translate (text), Whisper + ElevenLabs (voice) — stubbed
 */

import express from 'express';
// import config from '../config.js';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import {
  createTranslationJobStub,
  getTranslationJobStub,
  updateTranslationJobStub,
} from '../services/stubData.js';

const router = express.Router();

/**
 * POST /api/v1/lang/translate
 * Body: { sourceText, sourceLang, targetLang }
 * If USE_REAL_APIS=true and DEEPL_API_KEY is present, call DeepL. Else, return reversed text.
 */
router.post('/translate', async (req, res) => {
  const { sourceText, sourceLang, targetLang } = req.body;
  if (!sourceText || !sourceLang || !targetLang) {
    return res.status(400).json({ error: 'sourceText, sourceLang, targetLang are required' });
  }

  if (sourceLang === targetLang) {
    return res.json({ translatedText: sourceText, confidence: 1.0 });
  }

  // if (config.useRealApis && config.deeplApiKey) {
  //   try {
  //     const resp = await axios.post(
  //       'https://api-free.deepl.com/v2/translate',
  //       new URLSearchParams({
  //         auth_key: config.deeplApiKey,
  //         text: sourceText,
  //         source_lang: sourceLang.toUpperCase(),
  //         target_lang: targetLang.toUpperCase(),
  //       })
  //     );
  //     const translatedText = resp.data.translations[0].text;
  //     const confidence = 0.9; // DeepL doesn’t return a confidence, so assume 0.9
  //     return res.json({ translatedText, confidence });
  //   } catch (err) {
  //     console.error('DeepL API error:', err.response?.data || err.message);
  //     // Fallback below
  //   }
  // }

  // Stub: reverse the text
  const fake = sourceText.split('').reverse().join('');
  return res.json({ translatedText: fake, confidence: 0.5 });
});

/**
 * POST /api/v1/lang/translate/voice
 * Expects multipart/form-data with audioFile + sourceLang + targetLang.
 * Here we stub a synchronous “completed” job.
 */
router.post('/translate/voice', async (req, res) => {
  // In a real server, use `multer` to parse multipart. Here we skip the file entirely.
  const { sourceLang, targetLang } = req.body;
  const jobId = uuidv4();
  const createdAt = new Date().toISOString();

  const job = {
    jobId,
    userId: 'stubUser',
    type: 'voice',
    sourceLang,
    targetLang,
    status: 'processing',
    originalTranscript: null,
    translatedTranscript: null,
    translatedAudioUrl: null,
    errorMessage: null,
    createdAt,
    updatedAt: createdAt,
  };
  createTranslationJobStub(job);

  // Immediately “complete” the job with fake transcripts & URL
  const originalTranscript = 'Hello, this is a stubbed transcript for voice.';
  const translatedTranscript = originalTranscript.split('').reverse().join('');
  const translatedAudioUrl = `https://example.com/voice/${jobId}/translated.mp3`;

  const completedJob = {
    ...job,
    status: 'completed',
    originalTranscript,
    translatedTranscript,
    translatedAudioUrl,
    updatedAt: new Date().toISOString(),
  };
  updateTranslationJobStub(jobId, completedJob);

  return res.status(202).json({
    jobId,
    status: completedJob.status,
    statusUrl: `/api/v1/lang/translate/voice/${jobId}/status`,
  });
});

/**
 * GET /api/v1/lang/translate/voice/:jobId/status
 * Returns the final job if completed.
 */
router.get('/translate/voice/:jobId/status', (req, res) => {
  const { jobId } = req.params;
  const job = getTranslationJobStub(jobId);
  if (!job) {
    return res.status(404).json({ error: 'Translation job not found' });
  }
  if (job.status !== 'completed') {
    return res.status(200).json({ jobId, status: job.status });
  }
  return res.json({
    jobId,
    status: job.status,
    originalTranscript: job.originalTranscript,
    translatedTranscript: job.translatedTranscript,
    translatedAudioUrl: job.translatedAudioUrl,
  });
});

export default router;
