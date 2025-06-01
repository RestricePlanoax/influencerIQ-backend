// config.js
import dotenv from 'dotenv';
dotenv.config();

export default {
  port: process.env.PORT || 3000,

  // ---- OpenAI ----
  openaiApiKey: process.env.OPENAI_API_KEY || null,

  // ---- Instagram Graph API ----
  instagramUserId: process.env.INSTAGRAM_USER_ID || null,
  instagramToken: process.env.INSTAGRAM_TOKEN || null,

  // ---- YouTube Data API ----
  youtubeApiKey: process.env.YOUTUBE_API_KEY || null,

  // ---- Translation APIs ----
  deeplApiKey: process.env.DEEPL_API_KEY || null,
  googleTranslateApiKey: process.env.GOOGLE_TRANSLATE_API_KEY || null,

  // ---- TTS ----
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY || null,

  // ---- E-Sign (DocuSign/HelloSign) ----
  docusignAccountId: process.env.DOCUSIGN_ACCOUNT_ID || null,
  docusignAccessToken: process.env.DOCUSIGN_ACCESS_TOKEN || null,

  // ---- Payments (Stripe / Razorpay) ----
  stripeApiKey: process.env.STRIPE_API_KEY || null,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || null,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || null,

  // ---- AWS / S3 ----
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || null,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || null,
  awsRegion: process.env.AWS_REGION || null,

  // Stub‐toggle: call real external APIs if true, else return stubs
  useRealApis: process.env.USE_REAL_APIS === 'true',
};
