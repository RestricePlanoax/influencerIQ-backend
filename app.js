// app.js

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// Middleware
app.use(bodyParser.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Import routes
const authRoutes = require('./routes/auth').router;        // e.g. exports.router = express.Router() in ./routes/auth.js
const creatorRoutes = require('./routes/creators');         // e.g. module.exports = express.Router() in ./routes/creators.js
const campaignRoutes = require('./routes/campaigns');       // e.g. module.exports = express.Router() in ./routes/campaigns.js
const outreachRoutes = require('./routes/outreach');        // e.g. module.exports = express.Router() in ./routes/outreach.js
const paymentRoutes = require('./routes/payments');         // e.g. module.exports = express.Router() in ./routes/payments.js

// ← Add this line to import the new metricsConfig router:
const metricsRoutes = require('./routes/metricsConfig');    // e.g. module.exports = express.Router() in ./routes/metricsConfig.js

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/creators', creatorRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/outreach', outreachRoutes);
app.use('/api/payments', paymentRoutes);

// ← Mount the metrics routes under /api/metrics
app.use('/api/metrics', metricsRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
