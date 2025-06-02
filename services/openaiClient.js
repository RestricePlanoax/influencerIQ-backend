// services/openaiClient.js

import OpenAI from 'openai';
//import config from '../config.js';

let openai = null;

// Initialize OpenAI client if key exists and USE_REAL_APIS is true
// if (config.openaiApiKey && config.useRealApis) {
//   openai = new OpenAI({ apiKey: config.openaiApiKey });
// } else {
//   if (!config.useRealApis) {
//     console.log('ℹ️  Skipping real OpenAI calls (USE_REAL_APIS=false).');
//   } else {
//     console.warn('⚠️  OPENAI_API_KEY not set. All calls to OpenAI will error or return stubs.');
//   }
// }

/**
 * generateText(prompt, options)
 * - prompt (string): the text prompt to send to GPT.
 * - options (object): { model, max_tokens, temperature, ... }
 * Returns: { text: string }
 */
export async function generateText(prompt, options = {}) {
  // if (!config.useRealApis) {
  //   throw new Error('generateText was called in stub mode (USE_REAL_APIS=false).');
  // }
  if (!openai) {
    throw new Error('OPENAI_API_KEY not configured.');
  }

  const defaultOpts = {
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    max_tokens: 512,
  };
  const { model, temperature, max_tokens } = { ...defaultOpts, ...options };

  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature,
    max_tokens,
  });

  // new OpenAI SDK returns choices as an array
  const completion = response.choices[0].message.content.trim();
  return { text: completion };
}
