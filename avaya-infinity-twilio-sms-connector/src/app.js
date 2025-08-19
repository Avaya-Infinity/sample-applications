import express, { json, urlencoded } from 'express';
import { setupLogger } from './middleware/logger.js';
import { PORT } from './config/environment.js';
import { validateAvayaSignature } from './middleware/avayaSignatureValidation.js';
import { handleTwilioWebhook } from './controllers/twilioController.js';
import { handleAvayaWebhook } from './controllers/avayaInfinityController.js';
import { getConfig, setConfig } from './controllers/configController.js';
import avayaInfinityService from './services/avayaInfinityService.js';
import twilioService from './services/twilioService.js';

// Setup logging
setupLogger();

const app = express();

// Middleware
app.use(json());
app.use(urlencoded({ extended: true }));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.info(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.info('Health check endpoint hit');
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'avaya-infinity-twilio-sms-connector'
  });
});

// Config management endpoints
app.get('/api/configs', getConfig);
app.post('/api/configs', setConfig);

// Webhook endpoint to receive SMS from Twilio
app.post('/callbacks/twilio/sms', handleTwilioWebhook);

// Webhook endpoint to receive messages from Avaya Infinity (with signature validation)
app.post('/callbacks/avaya/infinity/sms', validateAvayaSignature, handleAvayaWebhook);

// Start server
app.listen(PORT, () => {
  console.info(`_____________________________________________________________________________`);
  console.info(`🚀 Avaya Infinity Twilio SMS Connector running on port ${PORT}`);
  console.info(`   ▷ Health                 [GET]       /api/health`);
  console.info(`   ▷ Config API             [POST|GET]  /api/configs`);
  console.info(`   ▷ Twilio webhook         [POST]      /callbacks/twilio/sms`);
  console.info(`   ▷ Avaya Infinity webhook [POST]      /callbacks/avaya/infinity/sms`);
  console.info(`_____________________________________________________________________________`);

  // Initialize Avaya Infinity service
  console.info('Initializing Avaya Infinity...');
  avayaInfinityService.initialize(
).then(() => {
    console.info('Avaya Infinity service initialized successfully');
  }).catch(error => {
    console.error('Failed to initialize Avaya Infinity service:', error);
  });

  // Initialize Twilio service
  console.info('Initializing Twilio service...');
  twilioService.initialize();
});
