# Sample SMS Connector: Twilio SMS Connector

## Overview

Avaya Infinity™ provides **Custom Messaging** capabilities that enable contact centers to connect with any third-party messaging platform for sending and receiving SMS messages.

To bridge these platforms, you need a small **connector** application. The connector serves as a two-way bridge:

- Connects to the third-party messaging platform to handle customer messages
- Integrates with Avaya Infinity™ using the Send Message API and webhook callbacks

This sample application demonstrates how to build such a connector, specifically integrating Avaya Infinity™ with [Twilio SMS Messaging](https://www.twilio.com/en-us/messaging/channels/sms).

> [!TIP] Find detailed Custom Messaging documentation in the [Avaya Developer Portal](https://developer.avaya.com/en/docs/infinity-platform/custom-messaging/tbd).

> [!IMPORTANT] This sample application is intended to be used as a reference for building your own connector application. It is not intended to be used in a production environment.

You can refer this application code for building your own connector application and connect to any other messaging platform. Refer the [Code Structure](#code-structure) section for more details.

## What This App Does

### Handle Incoming SMS from (End User → Contact Center)

The flow of incoming SMS from the end user to the contact center is as follows:

[ End User ] → [ Twilio ] → [ Connector ] → [ Avaya Infinity™ ]

To handle the incoming SMS the Connector will:

1. Expose a webhook endpoint to receive SMS from Twilio and configure the webhook URL in Twilio Console against the Twilio Number
2. When an end user sends an SMS to the Twilio number, the connector will receive it as a Webhook event on the above webhook endpoint, process it and forward it to Avaya Infinity™ using the [`Send Message`](https://developer.avaya.com/en/docs/infinity-platform/custom-messaging/tbd) API.

### Handle Outgoing SMS to (Contact Center → End User)

The flow of outgoing SMS from the contact center to the end user is as follows:

[ Avaya Infinity™ ] → [ Connector ] → [ Twilio ] → [ End User ]

To handle the outgoing SMS the Connector will:

1. Expose a webhook endpoint to receive SMS from Avaya Infinity™ and configure the webhook URL in Avaya Infinity™ Admin Console in the Connector Configuration
2. When the contact center sends an SMS for the end user using the Twilio number, the connector will receive the SMS as a Webhook event on the above webhook endpoint. Process the [`messages` event](https://developer.avaya.com/en/docs/infinity-platform/custom-messaging/tbd) it and forward it to Twilio using Twilio APIs for sending SMS.

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

2. **Start the application:**

    To start the application:

    ```bash
    npm start
    ```

    Or, to run the application in development mode with auto-reload:

    ```bash
    npm run dev
    ```

3. **Verify the application is running locally:**

   Open `http://localhost:8081/api/health` in your browser. You should see the following response:

    ```json
    {
        "status": "healthy",
        "timestamp": "2025-09-22T04:17:44.168Z",
        "service": "avaya-infinity-twilio-sms-connector"
    }
    ```

4. **Deploy the application:**

    For both Avaya Infinity™ and Twilio to be able call this connector application's endpoints to send message events, you need to deploy the application to a publically accessible URL.

    However, you can use a tool like [ngrok](https://ngrok.com/) to create a public URL for your local server to test the application locally.

    Once you have deployed the application, you can note down the Callback URLs for both Avaya Infinity™ and Twilio.

    For example, if you have deployed the application to `https://my-connector.com`, the Callback URLs for Avaya Infinity™ and Twilio should be:
    - Avaya Infinity™: `https://my-connector.com/callbacks/avaya/infinity/sms`
    - Twilio: `https://my-connector.com/callbacks/twilio/sms`

5. **Configure Twilio**

    In Twilio Console, set the `Webhook URL` for your Twilio SMS number to the Callback URL for Twilio hosted ny the connector application noted above. (For example: `https://my-connector.com/callbacks/twilio/sms`)

    Note down the following details from Twilio Console:
    - `Twilio Number`
    - `Twilio Account SID`
    - `Twilio Auth Token` (optional: if Twilio API Key is not created)
    - `Twilio API Key SID` (optional: if Twilio API Key is created)
    - `Twilio API Key Secret` (optional: if Twilio API Key is created)

    >[!TIP] You can skip the above steps if you are using the Twilio Mock Mode.

6. **Create New Connector in Avaya Infinity™**

    Perform the following steps in Avaya Infinity™ Admin Console:

    - In Avaya Infinity™ Admin Console, create a new connector and provide the Avaya Infinity™ Callback URL noted above as the `Webhook Callback URL`. (For example: `https://my-connector.com/callbacks/avaya/infinity/sms`)
    - If you want to secure the webhook, specify a `Webhook Secret`.
    - Create client credentials for the connector.

    Note down the following details once the connector and client credentials are created:
    - `Connector Id`
    - `Client Id`
    - `Client Secret`
    - `Webhook Secret` (optional: required if secured webhook is desired)
    - `Account Id`

    See the [Admin Console documentation](https://developer.avaya.com/en/docs/infinity-platform/custom-messaging/tbd) for more details.

7. **Configure Twilio number in Avaya Infinity™** Admin Console

    In Avaya Infinity™ Admin Console, add the Twilio number in the 'Numbers' section, associate it with the connector, and set the desired routing treatment. Ensure the workflow, queue, and agents are configured to handle the SMS messages appropriately.

    If your are using the Twilio Mock Mode, you can still follow the above steps. Just add a dummy number instead of the Twilio number.

    See the [Admin Console documentation](https://developer.avaya.com/en/docs/infinity-platform/custom-messaging/tbd) for more details.

8. **Update Connector Configuration**

    Update the Connector Configuration with the Twilio and Avaya Infinity™ credentials noted above using the [Update Configuration](#update-configuration) API.

    If you are using the Twilio Mock Mode, ensure the `twilio.isMockMode` is set to `true` in the Connector Configuration. Rest of the Twilio configurations can be set to empty values or any dummy values as they will be ignored.

9. **Test SMS flow**

    Once the connector is configured, you can test the SMS flow. 

    - Send an SMS to the Number configured in Avaya Infinity™ Admin Console.
    - Verify if the message is sent to Avaya Infinity™ and if it is routed to the desired workflow, queue, and agent as per the `Numbers` configuration.
    - If it is routed to an agent, the agent should be able to view the end user's message and reply back.

    **Testing with Twilio SMS**

    Send an SMS to your Twilio Number configured in Avaya Infinity™ Admin Console to test the SMS flow.

    **Testing with Mock Twilio Mode**

    Invoke the [Twilio Callback URL](#twilio-sms-webhook-endpoint) to simulate incoming SMS from the end user. Make sure the `to` field is set to the dummy number configured in Avaya Infinity™ Admin Console.

## API Reference

The Sample Connector Application exposes the following APIs:

| API | Method | Endpoint | Description |
|-----|--------|----------|-------------|
| [Health Check](#health-check) | GET | /api/health | Check if the application is running |
| [Get Current Configuration](#get-current-configuration) | GET | /api/configs | Get the current configuration |
| [Update Configuration](#update-configuration) | POST | /api/configs | Update the configuration |
| [Twilio SMS Webhook](#twilio-sms-webhook-endpoint) | POST | /callbacks/twilio/sms | Receive incoming SMS Event from Twilio. Twilio will invoke this endpoint when an end user sends an SMS to the Twilio number and this endpoint is configured in Twilio Console against the Twilio number. In Twilio Mock Mode, you can invoke this endpoint to simulate incoming SMS from the end user.|
| [Avaya Infinity™ Webhook](#avaya-infinity-webhook-endpoint) | POST | /callbacks/avaya/infinity/sms | Receive incoming SMS Event from Avaya Infinity™. Avaya Infinity™ will invoke this endpoint when the contact center sends an SMS for the end user using the Twilio number configured in Avaya Infinity™ Admin Console.|

### Health & Monitoring

#### Health Check

Check if the application is running.

```http
GET {{your-connector-hostname}}/api/health
```

cURL example:

```curl
curl -X GET {{your-connector-hostname}}/api/health
```

Response example:

```json
{
  "status": "healthy",
  "timestamp": "2025-09-22T04:17:44.168Z",
  "service": "avaya-infinity-twilio-sms-connector"
}
```

### Configuration Management

#### Get Current Configuration

Get the current Twilio and Avaya Infinity™ configurations set in the connector application.

```http
GET {{your-connector-hostname}}/api/configs
```

Response example:

```json
{
    "success": true,
    "config": {
        "twilio": {
            "account": {
                "sid": "you***id",
                "authToken": "you***en"
            },
            "apiKey": {
                "sid": "you***id",
                "secret": "you***et"
            },
            "isMockMode": true
        },
        "avaya": {
            "host": "https://avaya-infinity-hostname",
            "accountId": "your_avaya_infinity_account_id",
            "clientId": "ava***ck",
            "clientSecret": "ava***ck",
            "connectorId": "your_avaya_infinity_connector_id",
            "webhookSecret": "you***et",
            "isMockMode": false
        }
    }
}
```

#### Update Configuration

```http
POST {{your-connector-hostname}}/api/configs
Content-Type: application/json
```

cURL example:

```curl
curl -X POST {{your-connector-hostname}}/api/configs -H "Content-Type: application/json" -d '{
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

Response example:
Same as the [Get Current Configuration](#get-current-configuration) response example.

### Webhook Endpoints

#### Twilio SMS Webhook Endpoint

```http
POST /callbacks/twilio/sms
Content-Type: application/x-www-form-urlencoded
```

cURL example:

```curl
curl -X POST {{your-connector-hostname}}/callbacks/twilio/sms -H "Content-Type: application/x-www-form-urlencoded" -d 'Body=message from twilio&To=+912121212121&From=+18777777777'
```

In the above example, the number in `To` field (+912121212121) is the Twilio Number configured in Avaya Infinity™ Admin Console. The number in `From` field (+18777777777) is the end user's number who sent the SMS.

Response example:

```http
200 OK
```

#### Avaya Infinity™ Webhook Endpoint

```http
POST {{your-connector-hostname}}/callbacks/avaya/infinity/sms
Content-Type: application/json
```

Avaya Infinity™ will invoke this endpoint for two events

1. `health_check` event when the connector application is healthly and ready to receive events.
2. `messages` event when the contact center sends records a message for the conversation session.
   - `sender.type` is `agent` or `bot`: The connector will forward the message to Twilio.
   - `sender.type` is `customer`: The connector will skip the message and not forward it to Twilio.

cURL example of a messages event:

```curl
curl -X POST {{your-connector-hostname}}/callbacks/avaya/infinity/sms -H "Content-Type: application/json" -d '{
  "eventType": "messages",
  "eventId": "9a68394c-46ca-43b0-8d7a-c0511c7dbe84",
  "eventTimestamp": "2025-09-14T17:03:14.973161008Z",
  "messageId": "049d01091481a36c2dfd6f3f4e",
  "accountId": "001d0106666c6888cc999c111c",
  "conversationSessionId": "028d0109148d0c42be45266207",
  "connectorId": "a2a22a22-b66b-4444-a9a9-dd111d111d11",
  "channel": "text",
  "headers": {
    "from": "+912121212121",
    "to": [
      "+18777777777"
    ]
  },
  "body": {
    "text": "Hi, how can I help you?"
  },
  "sender": {
    "type": "agent"
  }
}'
```

In the above example, the key fields are:

- `eventType`: `messages` : Indicates the event type.
- `sender.type`: `agent` : Indicates the sender type.
- `headers.from`: `+912121212121` : The Twilio Number configured in Avaya Infinity™ Admin Console from which the message needs to be sent.
- `headers.to`: `+18777777777` : The end user's number to which the message needs to be sent.
- `body.text`: `Hi, how can I help you?` : The message text.

Details about the all the fields are available in the [Avaya Infinity™ Webhook Event](https://developer.avaya.com/en/docs/infinity-platform/custom-messaging/tbd).

Response example:

```http
200 OK
```

Details about the `health_check` event are available in the [Avaya Infinity™ Webhook Event](https://developer.avaya.com/en/docs/infinity-platform/custom-messaging/tbd).

## Testing & Development

### Twilio Mock Mode

The connector application can be run in Twilio Mock Mode to test the SMS flow without any real Twilio services. Here is how the mock mode can be used:

- **Incoming SMS**: You can invoke the [Twilio SMS Webhook Endpoint](#twilio-sms-webhook-endpoint) endpoint to simulate incoming SMS from the end user.
- **Outgoing SMS**: On receiving an SMS from Avaya Infinity™, the connector application will return a success without actually forwarding the message to Twilio.

This is useful for quickly testing the application.

To enable Twilio Mock Mode, update the `twilio.isMockMode` to `true` in the [Connector Configuration](#update-configuration).

Each step in the [Quick Start](#quick-start) section has information to enable Twilio Mock Mode.

### Running the Sample Application without Deploying it to a Publicly Accessible Location

The sample connector application needs to receive callback requests from Avaya Infinity™ and Twilio. If you want to run the sample application without deploying it to a publically accessible location, you can use tools like [ngrok](https://ngrok.com/) to create a public URL for your local server.

## Environment Variables

You can start the connector application with desired Avaya Infinity™ and Twilio configurations by setting the environment variables in the `.env.dev` file. This way you need not call the [Update Configuration](#update-configuration) API to update the configurations everytime the application is started.

The following environment variables are available:

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port |
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
- Use commands like `lsof -i :8081` to check port usage

#### "Invalid signature" errors

- Verify webhook secret configured in the connector application matches the `Webhook Secret` configured in the Connector Configuration in Avaya Infinity™ Admin Console

#### "Access token expired" errors"

- Token refresh happens automatically
- Check Avaya Infinity™ client credentials are correct

### Debug Mode

Enable detailed logging by setting:

```env
DEBUG=express:*
```

## Code Structure

```text
  avaya-infinity-twilio-sms-connector/  
  ├── README.md                           # This file  
  ├── LICENSE                             # Project license  
  ├── package.json                        # Dependencies & npm scripts  
  │  
  └── src/                                # Source code directory  
      ├── app.js                          # Main application entry point  
      ├── config/                         # Configuration management  
      │   └── environment.js             # Environment variables & settings  
      ├── controllers/                    # Request handlers
      │   ├── avayaInfinityController.js  # Handles Avaya Infinity™ webhooks callback requests   
      │   ├── twilioController.js         # Handles Twilio webhooks callback requests
      │   └── configController.js         # Configuration API endpoints   
      ├── services/                       # External API integration layer  
      │   ├── avayaInfinityService.js     # Avaya Infinity™ API client  
      │   ├── avayaTokenService.js        # Avaya Infinity™ Auth token management  
      │   └── twilioService.js            # Twilio API client  
      └── middleware/                     # Express middleware components  
          ├── avayaSignatureValidation.js # Security middleware  
          └── logger.js                   # Logging middleware  
```

If you wish to connect to any other messaging platform, instead of Twilio, replace the code in the following files:

| File | Changes Required |
|------|------------------|
| `src/controllers/twilioController.js` | Handle incoming SMS from the new messaging platform |
| `src/services/twilioService.js` | Handle outgoing SMS to the new messaging platform |
| `src/controllers/avayaInfinityController.js` | Call the service of the new messaging platform |
| `src/config/environment.js` | Update the environment variables for the new messaging platform |
| `.env.dev` | Update the environment variables for the new messaging platform |

Refer the [Twilio SMS Connector](https://github.com/Avaya-Infinity/sample-applications/tree/main/avaya-infinity-twilio-sms-connector) for more details.

## License

See the [LICENSE](LICENSE) file for details.
