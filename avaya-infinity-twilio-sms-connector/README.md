# Avaya Infinity - Twilio SMS Connector

A Node.js application that connects Twilio SMS services with Avaya Infinity, enabling seamless two-way SMS communication between customers and contact center agents.

## What This App Does

This connector acts as a bridge between two communication platforms:

- **Twilio**: Handles SMS messaging with customers
- **Avaya Infinity**: Manages contact center communications with agents

When a customer sends an SMS to your Twilio number, it automatically forwards to Avaya Infinity where agents can respond. When agents reply through Avaya Infinity, the message is sent back to the customer via SMS.

## Key Features

- **Bi-directional SMS forwarding** between Twilio and Avaya Infinity
- **Real-time webhook processing** for instant message delivery
- **Secure signature validation** to verify authentic requests
- **Dynamic configuration management** via REST API
- **Mock mode support** for testing without actual services
- **Health monitoring** endpoints for deployment monitoring
- **Colorful logging** for better debugging experience

## Quick Start

### Prerequisites

- Node.js 18+ installed on your system
- Twilio account with SMS capabilities
- Avaya Infinity platform access
- Basic understanding of webhooks

### Installation

1. **Clone and install:**

   ```bash
   git clone <repository-url>
   cd avaya-infinity-twilio-sms-connector
   npm install
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env.dev
   ```

3. **Edit your environment file** (.env.dev) with your credentials:

   ```env
   # Server Configuration
   PORT=8081
   ENV=development
   
   # Twilio Configuration
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   
   # Avaya Infinity Configuration
   AVAYA_INFINITY_HOST=your-avaya-host.com
   AVAYA_INFINITY_CLIENT_ID=your_client_id
   AVAYA_INFINITY_CLIENT_SECRET=your_client_secret
   AVAYA_INFINITY_CONNECTOR_ID=your_connector_id
   AVAYA_INFINITY_WEBHOOK_SECRET=your_webhook_secret
   ```

4. **Start the application:**

   ```bash
   npm run dev
   ```

5. **Verify it's running:**
   Open `http://localhost:8081/api/health` in your browser

## API Reference

### Health & Monitoring

#### Health Check

```http
GET /api/health
```

Returns server status and timestamp.

### Configuration Management

#### Get Current Configuration

```http
GET /api/configs
```

Returns current configuration with sensitive values masked.

#### Update Configuration

```http
POST /api/configs
Content-Type: application/json

{
  "twilio": {
    "account": {
      "sid": "your_twilio_account_sid"
    },
    "apiKey": {
      "sid": "your_api_key_sid",
      "secret": "your_api_key_secret"
    },
    "isMockMode": false
  },
  "avaya": {
    "host": "your-new-host.com",
    "accountId": "your_account_id",
    "connectorId": "your_connector_id",
    "clientId": "your_client_id",
    "clientSecret": "your_client_secret",
    "webhookSecret": "your_webhook_secret"
  }
}
```

### Webhook Endpoints

#### Twilio SMS Webhook

```http
POST /callbacks/twilio/sms
Content-Type: application/x-www-form-urlencoded

From=+1234567890&Body=Hello&MessageSid=SM123...
```

#### Avaya Infinity Webhook

```http
POST /callbacks/avaya/infinity/sms
Content-Type: application/json
x-avaya-event-signature: sha256=...

{
  "eventType": "MESSAGES"
  "messageId": "004e0708206c0d3db4807g6bj7",
  "accountId": "001d010540de0d3db4302f5fa8",
  "conversationSessionId": "005e0708206c0d3db4807g6bj7",
  "connectorId": "591c2529-c3a3-4062-a213-b239c18f543b",
  "channel": "TEXT",
  "headers": {
    "from": 1234567890,
    "to": [
      1234567890
    ]
  },
  "body": {
    "text": "Hi, how can I help you?"
  },
  "sender" : {
    "type": "AGENT"
  }
}
```

## Testing & Development

### Mock Mode

For testing without actual Twilio services, set environment variables:

```env
ENV=mock_twilio        # Mock only Twilio
```

## Deployment

### Local Deployment

```bash
npm start
```

### Azure Web App Deployment

The application can be deployed to Azure App Service:

1. **Configure App Settings** in Azure Portal with your environment variables
2. **Deploy** using GitHub Actions, Azure CLI, or VS Code
3. **Set webhook URLs** in Twilio and Avaya Infinity to point to your Azure app

## Architecture Overview

```text
Incoming SMS: Customer SMS → Twilio → Connector → Avaya Infinity → Agent
Outgoing SMS: Customer SMS ← Twilio ← Connector ← Avaya Infinity ← Agent
```

### Key Components

- **Controllers**: Handle incoming webhook requests
- **Services**: Manage communication with external APIs
- **Middleware**: Handle logging and Avaya Infinity webhook event signature validation
- **Configuration**: Manage dynamic settings and credentials

## Security Features

- **HMAC signature validation** for Avaya Infinity webhooks
- **Credential masking** in API responses
- **Environment-based configuration** (no hardcoded secrets)
- **Secure token management** with automatic refresh

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3000) |
| `ENV` | No | Environment mode (development, mock_twilio, etc.) |
| `TWILIO_ACCOUNT_SID` | Yes* | Twilio Account SID (starts with AC) |
| `TWILIO_AUTH_TOKEN` | No | Twilio authentication token. This is required if Twilio API Key is not available |
| `TWILIO_API_KEY_SID` | No | Twilio API Key SID (Recommended over using account credentials) |
| `TWILIO_API_KEY_SECRET` | No | Twilio API Key secret. Required if using API Key |
| `AVAYA_INFINITY_HOST` | Yes | Avaya Infinity platform hostname |
| `AVAYA_INFINITY_CLIENT_ID` | Yes | Avaya Infinity OAuth client ID |
| `AVAYA_INFINITY_CLIENT_SECRET` | Yes | Avaya Infinity OAuth client secret |
| `AVAYA_INFINITY_CONNECTOR_ID` | Yes | Avaya Infinity connector identifier |
| `AVAYA_INFINITY_WEBHOOK_SECRET` | No | Secret for webhook signature validation |

*Required unless running in mock mode

## Troubleshooting

### Common Issues

#### "Cannot GET /health"

- Check if the server is running on the correct port
- Verify no other application is using the same port
- Use `lsof -i :8081` to check port usage

#### "Invalid signature" errors

- Verify webhook secret matches Avaya Infinity configuration
- Check webhook URL is correctly configured in Avaya Infinity

#### "Access token expired" errors"

- Token refresh happens automatically
- Check Avaya Infinity client credentials are correct

### Debug Mode

Enable detailed logging by setting:

```env
DEBUG=express:*
```

## Support

For issues and questions:

- Check the logs for detailed error messages
- Verify environment configuration
- Test in mock mode to isolate issues
- Review webhook configurations in Twilio and Avaya Infinity

## License

See the LICENSE file for details.
