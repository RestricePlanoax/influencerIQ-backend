// index.js

import express from 'express';
import cors from 'cors';
import config from './config.js';

// 1) Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// 2) Health check
app.get("/", (req, res) => res.send("Express on Vercel"));
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 3) Mount existing routers (assuming these exist and export a default router)
import creatorsRouter from '../routes/creators.js';
import outreachRouter from '../routes/outreach.js';
import negotiationsRouter from '../routes/negotiations.js';
import contractsRouter from '../routes/contracts.js';
import financeRouter from '../routes/finance.js';
import trackingRouter from '../routes/tracking.js';
import insightsRouter from '../routes/insights.js';

import langRouter from '../routes/lang.js';

// ← Correctly import the default export from metricsConfig.js (no braces)
import metricsRoutes from '../routes/metricsConfig.js';
import aiInsightsRouter from '../routes/aiInsights.js';

// Mount paths
app.use('/v1/creators', creatorsRouter);
app.use('/v1/outreach', outreachRouter);
app.use('/v1/negotiations', negotiationsRouter);
app.use('/v1/contracts', contractsRouter);
app.use('/v1/finance', financeRouter);
app.use('/v1/campaigns', trackingRouter);
app.use('/v1/insights', insightsRouter);
app.use('/api/v1/lang', langRouter);


// ← Mount the new metrics routes under /api/v1/metrics
app.use('/v1/metrics', metricsRoutes);
app.use('/v1/ai-insights', aiInsightsRouter);

// if (process.argv[1].endsWith('index.js')) {
//   const PORT = config.port || 5000;
//   app.listen(PORT, () => {
//     console.log(`🚀 InfluencerFlow backend listening on port ${PORT}`);
//   });
//}
//app.listen(3000, () => console.log("Server ready on port 3000."));

// 5) Export `app` for testing
export default app;