# Sample SMS Connector: Twilio SMS Connector

## Overview

Avaya Infinity™ provides **Custom Messaging** capabilities that enable contact centers to connect with any third-party messaging platform for sending and receiving SMS messages. 

To bridge these platforms, you need a small **connector** application. The connector serves as a two-way bridge:

- Connects to the third-party messaging platform to handle customer messages
- Integrates with Avaya Infinity™ using the Send Message API and webhook callbacks

This sample application demonstrates how to build such a connector, specifically integrating Avaya Infinity™ with [Twilio SMS Messaging](https://www.twilio.com/en-us/messaging/channels/sms).

> [!TIP] Find detailed Custom Messaging documentation in the [Avaya Developer Portal](https://developer.avaya.com/en/docs/infinity-platform/custom-messaging/tbd).

## What This App Does

### Handle Incoming SMS from (End User → Contact Center)

The flow of incoming SMS from the end user to the contact center is as follows:

[ End User ] → [ Twilio ] → [ Connector ] → [ Avaya Infinity™ ]

To handle the incoming SMS the Connector will:

1. Expose a webhook endpoint to receive SMS from Twilio and configure the webhook URL in Twilio Console against the Twilio Number
2. When an end user sends an SMS to the Twilio number, the connector will receive it as a Webhook event on the above webhook endpoint, process it and forward it to Avaya Infinity™ using the `Send Message` API.

### Handle Outgoing SMS to (Contact Center → End User)

The flow of outgoing SMS from the contact center to the end user is as follows:

[ Avaya Infinity™ ] → [ Connector ] → [ Twilio ] → [ End User ]

To handle the outgoing SMS the Connector will:

1. Expose a webhook endpoint to receive SMS from Avaya Infinity™ and configure the webhook URL in Avaya Infinity™ Admin Console in the Connector Configuration
2. When the contact center sends an SMS for the end user using the Twilio number, the connector will receive the SMS as a Webhook event on the above webhook endpoint, process it and forward it to Twilio using Twilio APIs for sending SMS.

### Additional Features

- **Secure signature validation** to verify authentic callback requests from Avaya Infinity™
- **Dynamic configuration management** of Twilio and Avaya Infinity™ credentials via REST API
- **Mock mode support** for testing without actual Twilio Services
- **Token management** with automatic refresh of Avaya Infinity™ API Tokens

## Quick Start

### Prerequisites

- Node.js 18+ installed on your system
- Avaya Infinity™ platform access
- Twilio account with SMS capabilities

### Installation

1. **Clone and install:**

   ```bash
   # Clone the sample-applications repository
   git clone https://github.com/Avaya-Infinity/sample-applications.git

   # Navigate to the sample connector directory
   cd avaya-infinity-twilio-sms-connector

   # Install dependencies
   npm install
   ```

2. **Edit your environment file** (.env.dev) with your credentials (optional):

    Provide details about your Avaya Infinity™ Connector and Twilio account. See the details of each field in the [Environment Variables](#environment-variables) section. 

    >[!Note] This step is optional. You can set the configuration details at runtime (after starting the service) using the [Configuration API](#update-configuration)

3. **Start the application:**

    To start the application:

    ```bash
    npm start
    ```

    Or, to run the application in development mode with auto-reload:

    ```bash
    npm run dev
    ```

4. **Verify the application is running locally:**

   Open `http://localhost:8081/api/health` in your browser. You should see the following response:

    ```json
    {
        "status": "healthy",
        "timestamp": "2025-09-22T04:17:44.168Z",
        "service": "avaya-infinity-twilio-sms-connector"
    }
    ```

5. **Deploy the application:**

    For both Avaya Infinity™ and Twilio to be able call this connector application's endpoints to send message events, you need to deploy the application to a publically accessible URL.

    Alternatively, you can use a tool like [ngrok](https://ngrok.com/) to create a public URL for your local server.

    Once you have deployed the application, you can note down the Callback URLs for both Avaya Infinity™ and Twilio.

    For example, if you have deployed the application to `https://my-connector.com`, the Callback URLs for Avaya Infinity™ and Twilio should be:
    - Avaya Infinity™: `https://my-connector.com/callbacks/avaya/infinity/sms`
    - Twilio: `https://my-connector.com/callbacks/twilio/sms`

6. **Configure Twilio**

    In Twilio Console, set the `Webhook URL` for your Twilio SMS numberto the Callback URL for Twilio noted above. (For example: `https://my-connector.com/callbacks/twilio/sms`)

    Note down the follwoing details from Twilio Console:
    - `Twilio Number`
    - `Twilio Account SID`
    - `Twilio Auth Token` (optional: if Twilio API Key is not created)
    - `Twilio API Key SID` (optional: if Twilio API Key is created)
    - `Twilio API Key Secret` (optional: if Twilio API Key is created)

    >[!TIP] You can skip the above steps if you are using the Twilio Mock Mode.

7. **Create New Connector in Avaya Infinity™**

   In Avaya Infinity™ Admin Console, create a new connector and provide the Avaya Infinity™ Callback URL noted above as the `Webhook Callback URL`. (For example: `https://my-connector.com/callbacks/avaya/infinity/sms`)

   If secured webhook is desired, you can provide the `Webhook Secret` as well.

   Also create client credentials for the connector.

   Note down the following details once the connector and client credentials are created:
   - `Connector Id`
   - `Client Id`
   - `Client Secret`
   - `Webhook Secret` (optional: if secured webhook is desired)
   - `Account Id`

    See the [Admin Console documentation](https://developer.avaya.com/en/docs/infinity-platform/custom-messaging/tbd) for more details.

8. **Configure Twilio number in Avaya Infinity™** Admin Console

    In Avaya Infinity™ Admin Console, add the Twilio number in the 'Numbers' section, associate it with the connector, and set the desired routing treatment. Ensure the workflow, queue, and agents are configured to handle the SMS messages appropriately.

    If your are using the Twilio Mock Mode, you can still follow the above steps. Just add a dummy number instead of the Twilio number.

    See the [Admin Console documentation](https://developer.avaya.com/en/docs/infinity-platform/custom-messaging/tbd) for more details.

9. **Update Connector Configuration**

    Update the Connector Configuration with the Twilio and Avaya Infinity™ credentials noted above using the [Update Configuration](#update-configuration) API.

    If you are using the Twilio Mock Mode, ensure the `twilio.isMockMode` is set to `true` in the Connector Configuration. Rest of the Twilio configurations can be set to empty values or any dummy values.

10. **Test SMS flow**

    **Testing with Twilio SMS**

    Send an SMS to your Twilio number and verify it is treated as per your Avaya Infinity™ Number configuration. If it is routed to an agent, the agent should be able to view the message sent by the customer and reply back.

    **Testing with Mock Twilio Mode**

    Invoke the [Twilio Callback URL](#twilio-sms-webhook) to simulate incoming SMS from the end user. Make sure the `to` field is set to the dummy number configured in Avaya Infinity™ Admin Console. Verify if the message is sent to Avaya Infinity™ and if it is routed to the desired workflow, queue, and agent as per the `Numbers` configuration.

## API Reference

The Sample Connector Application exposes the following APIs:

| API | Method | Endpoint | Description |
|-----|--------|----------|-------------|
| [Health Check](#health-check) | GET | /api/health | Check if the application is running |
| [Get Current Configuration](#get-current-configuration) | GET | /api/configs | Get the current configuration |
| [Update Configuration](#update-configuration) | POST | /api/configs | Update the configuration |
| [Twilio SMS Webhook](#twilio-sms-webhook) | POST | /callbacks/twilio/sms | Receive incoming SMS Event from Twilio. Twilio will invoke this endpoint when an end user sends an SMS to the Twilio number and this endpoint is configured in Twilio Console against the Twilio number. In Twilio Mock Mode, you can invoke this endpoint to simulate incoming SMS from the end user.|
| [Avaya Infinity™ Webhook](#avaya-infinity-webhook) | POST | /callbacks/avaya/infinity/sms | Receive incoming SMS Event from Avaya Infinity™. Avaya Infinity™ will invoke this endpoint when the contact center sends an SMS for the end user using the Twilio number configured in Avaya Infinity™ Admin Console.|

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
      "sid": "your_twilio_account_sid",
      "authToken": ""
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

#### Avaya Infinity™ Webhook

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
3. **Set webhook URLs** in Twilio and Avaya Infinity™ to point to your Azure app

## Security Features

- **HMAC signature validation** for Avaya Infinity™ webhooks
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
| `AVAYA_INFINITY_HOST` | Yes | Avaya Infinity™ platform hostname |
| `AVAYA_INFINITY_CLIENT_ID` | Yes | Avaya Infinity™ OAuth client ID |
| `AVAYA_INFINITY_CLIENT_SECRET` | Yes | Avaya Infinity™ OAuth client secret |
| `AVAYA_INFINITY_CONNECTOR_ID` | Yes | Avaya Infinity™ connector identifier |
| `AVAYA_INFINITY_WEBHOOK_SECRET` | No | Secret for webhook signature validation |

*Required unless running in mock mode

## Code Structure

- **Controllers**: Handle incoming webhook requests
- **Services**: Manage communication with external APIs
- **Middleware**: Handle logging and Avaya Infinity™ webhook event signature validation
- **Configuration**: Manage dynamic settings and credentials

## Troubleshooting

### Common Issues

For troubleshooting common issues:

- Check the logs for detailed error messages
- Verify environment configuration
- Test in mock mode to isolate issues
- Review webhook configurations in Twilio and Avaya Infinity™

Few common issues and their solutions:

#### "Cannot GET /health"

- Check if the server is running on the correct port
- Verify no other application is using the same port
- Use `lsof -i :8081` to check port usage

#### "Invalid signature" errors

- Verify webhook secret matches Avaya Infinity™ configuration
- Check webhook URL is correctly configured in Avaya Infinity™

#### "Access token expired" errors"

- Token refresh happens automatically
- Check Avaya Infinity™ client credentials are correct

### Debug Mode

Enable detailed logging by setting:

```env
DEBUG=express:*
```

## License

See the [LICENSE](LICENSE) file for details.
