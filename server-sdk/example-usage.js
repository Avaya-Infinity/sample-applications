/**
 * This example demonstrates how to use the Avaya Infinity Server SDK.
 * It provides examples for both CommonJS and ES Module usage.
 * To run this example: node example-usage.js
 */

// CommonJS import
//const { AvayaInfinity } = require('./dist/avaya-infinity-server-sdk.cjs');

// ES Module import
import { AvayaInfinity } from './dist/avaya-infinity-server-sdk.js';


// Initialize the SDK with your Avaya Infinity credentials
const client = AvayaInfinity.init({
  host: 'core.avaya1984com-inf71.ec.avayacloud.com',
  clientId: 'messaging-api-3ce73cfb-4266-468d-88ba-7900a59da5e0',
  clientSecret: 'eGYIEptLqlcMgqCpUIVk1Y1SG638w6HY',
  webhookSecret: 'your-webhook-secret',
  eagerInitialization: false // Set to true for eager initialization
});

// Define a message to send
const message = {
  from: '1234567890',
  to: '0987654321',
  text: 'Hello from Avaya Infinity SDK!',
  contextParameters: {
    'customer-interest': 'insurance'
  },
  providerMetaData: {
    messageId: 'local-message-id',
    messageTimestamp: new Date().toISOString()
  }
};

// Send a message using the SDK
async function sendMessage() {
  try {
    console.log('Sending message to Avaya Infinity...');
    const response = await client.sendMessage(message);
    console.log('Message sent successfully!');
    console.log('Response:', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
}

// Example of verifying an Avaya webhook signature
function verifyWebhookExample() {
  // This simulates an incoming webhook request from Avaya Infinity
  const mockRequest = {
    body: { 
      eventType: 'MESSAGES',
      messageId: '123456',
      headers: { from: '0987654321', to: ['1234567890'] },
      body: { text: 'Hello, this is a test message' }
    },
    headers: {
      'x-avaya-event-signature': 'sha256=abc123' // This would be the actual signature in a real scenario
    }
  };

  const isValid = AvayaInfinity.verifyEventSignature(mockRequest, 'your-webhook-secret');
  console.log('Is webhook signature valid?', isValid);
}

// Uncomment the following line to send a real message
sendMessage();

// Example of validating a webhook signature (this won't actually make a network call)
//verifyWebhookExample();

console.log('\nTo send an actual message, update the credentials in this file and uncomment the sendMessage() call.');
