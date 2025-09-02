# Avaya Infinity Server SDK

A TypeScript library for integrating with Avaya Infinity's messaging API. This SDK provides an easy way to send messages to Avaya Infinity and validate webhook events from Avaya Infinity.

## Table of Contents

- [Avaya Infinity Server SDK](#avaya-infinity-server-sdk)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Initialize the SDK](#initialize-the-sdk)
    - [Send a Message](#send-a-message)
    - [Verify Webhook Event Signature](#verify-webhook-event-signature)
  - [Type Definitions](#type-definitions)
    - [MessagingConnectorInitParams](#messagingconnectorinitparams)
    - [TextMessage](#textmessage)
    - [Message (Response)](#message-response)
  - [API Reference](#api-reference)
    - [AvayaInfinity](#avayainfinity)
      - [Methods](#methods)
    - [AvayaInfinityMessagingClient](#avayainfinitymessagingclient)
      - [Methods](#methods-1)
    - [Types](#types)
      - [MessagingConnectorInitParams](#messagingconnectorinitparams-1)
      - [TextMessage](#textmessage-1)
      - [Message](#message)
  - [Example](#example)
    - [Building and Testing the Example Locally](#building-and-testing-the-example-locally)
  - [License](#license)

## Features

- Send messages to Avaya Infinity
- Verify webhook event signatures
- TypeScript support with full type definitions

## Installation

```bash
npm install avaya-infinity-server-sdk
```

You can also use the bundled version directly:

```html
<!-- In a browser via ES modules -->
<script type="module">
  import { AvayaInfinity } from './avaya-infinity-server-sdk.js';
  // Your code here
</script>
```

## Module Formats

This SDK supports both ES modules and CommonJS. You can use it in both environments:

### ES Modules

```javascript
// ESM (in Node.js with "type": "module" in package.json or .mjs files)
import { AvayaInfinity } from 'avaya-infinity-server-sdk';

// Use the SDK
const client = AvayaInfinity.init({...});
```

### CommonJS

```javascript
// CommonJS (in Node.js without "type": "module")
const { AvayaInfinity } = require('avaya-infinity-server-sdk');

// Use the SDK
const client = AvayaInfinity.init({...});
```

```javascript
// In Node.js
import { AvayaInfinity } from './avaya-infinity-server-sdk.js';
```

## Usage

### Initialize the SDK

The SDK can be initialized in two modes:

- **Lazy initialization** (default): Token service is initialized only when the first message is sent
- **Eager initialization**: Token service is initialized immediately when the client is created

```typescript
import { AvayaInfinity, MessagingConnectorInitParams } from 'avaya-infinity-server-sdk';

// Define initialization parameters
const params: MessagingConnectorInitParams = {
  host: 'your-avaya-infinity-host',
  account: 'your-account-id',
  connectorId: 'your-connector-id',
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  webhookSecret: 'your-webhook-secret', // Optional
  eagerInitialization: false // Optional (default: false)
};

// Initialize with lazy initialization (default)
const client = AvayaInfinity.init(params);

// OR with eager initialization
const clientEager = AvayaInfinity.init({
  ...params,
  eagerInitialization: true
});
```

### Send a Message

Create a `TextMessage` object and send it through the client:

```typescript
import { TextMessage } from 'avaya-infinity-server-sdk';

const message: TextMessage = {
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

try {
  const response = await client.sendMessage(message);
  console.log('Message sent successfully:', response);
  
  // Access response properties
  const messageId = response.messageId;
  const conversationSessionId = response.conversationSessionId;
} catch (error) {
  console.error('Failed to send message:', error);
}
```

### Verify Webhook Event Signature

Use the `verifyEventSignature` method to validate webhook events coming from Avaya Infinity:

```typescript
import { AvayaInfinity } from 'avaya-infinity-server-sdk';
import express from 'express';

const app = express();
app.use(express.json());

// Your webhook secret from Avaya Infinity
const webhookSecret = 'your-webhook-secret';

// In an Express.js route handler
app.post('/webhook', (req, res) => {
  const isValid = AvayaInfinity.verifyEventSignature(req, webhookSecret);
  
  if (!isValid) {
    console.error('Invalid signature received');
    return res.status(401).send('Invalid signature');
  }
  
  // Process the webhook event
  const event = req.body;
  
  if (event.eventType === 'HEALTH_CHECK') {
    console.log('Received health check event from Avaya Infinity');
  } else if (event.eventType === 'MESSAGES') {
    console.log('Received message event from Avaya Infinity');
    // Process the message
  }
  
  res.status(200).send('OK');
});

app.listen(3000, () => {
  console.log('Webhook server listening on port 3000');
});
```

## Type Definitions

### MessagingConnectorInitParams

```typescript
interface MessagingConnectorInitParams {
  account: string;
  connectorId: string;
  clientId: string;
  clientSecret: string;
  webhookSecret?: string;
  host: string;
  eagerInitialization?: boolean;
}
```

### TextMessage

```typescript
interface TextMessage {
  from: string;
  to: string;
  text: string;
  contextParameters?: Record<string, string>;
  providerMetaData?: {
    messageId?: string;
    messageTimestamp?: string;
  };
}
```

### Message (Response)

```typescript
interface Message {
  messageId: string;
  accountId: string;
  conversationSessionId: string;
  connectorId: string;
  channel: string;
  headers: {
    from: string;
    to: string[];
  };
  body: {
    text: string;
  };
  contextParameters?: Record<string, string>;
  providerMetaData?: {
    messageId: string;
    messageTimestamp: string;
  };
}
```

## API Reference

### AvayaInfinity

Static class that provides factory methods for the SDK.

#### Methods

- `init(params: MessagingConnectorInitParams): AvayaInfinityMessagingClient`
  Initializes and returns a new messaging client.

- `verifyEventSignature(request: any, webhookSecret: string): boolean`
  Verifies the signature of an Avaya Infinity webhook event.

### AvayaInfinityMessagingClient

Client for sending messages to Avaya Infinity.

#### Methods

- `sendMessage(message: TextMessage): Promise<Message>`
  Sends a message to Avaya Infinity.

- `setCredentials(clientId: string, clientSecret: string): void`
  Sets the client credentials for authentication.

- `dispose(): void`
  Cleans up resources when the client is no longer needed.

### Types

#### MessagingConnectorInitParams

Parameters required to initialize the messaging client.

```typescript
interface MessagingConnectorInitParams {
  host: string;              // Avaya Infinity host URL
  account: string;           // Avaya Infinity account ID
  connectorId: string;       // Connector ID assigned by Avaya Infinity
  clientId: string;          // Client ID for OAuth authentication
  clientSecret: string;      // Client secret for OAuth authentication
  webhookSecret?: string;    // Secret used to verify webhook events
  eagerInitialization?: boolean; // Whether to eagerly initialize token service
}
```

#### TextMessage

Message to be sent to Avaya Infinity.

```typescript
interface TextMessage {
  from: string;              // Sender phone number
  to: string;                // Recipient phone number
  text: string;              // Message content (max 1024 characters)
  contextParameters?: Record<string, string>; // Optional parameters
  providerMetaData?: {       // Optional metadata
    messageId?: string;
    messageTimestamp?: string;
  };
}
```

#### Message

Response from sending a message to Avaya Infinity.

```typescript
interface Message {
  messageId: string;         // Avaya Infinity message ID
  accountId: string;         // Account ID
  conversationSessionId: string; // Conversation session ID
  connectorId: string;       // Connector ID
  channel: string;           // Channel type
  headers: {
    from: string;
    to: string[];
  };
  body: {
    text: string;
  };
  contextParameters?: Record<string, string>; // Optional parameters
  providerMetaData?: {       // Optional metadata
    messageId: string;
    messageTimestamp: string;
  };
}
```

## Example

See the `example-usage.js` file in this repository for a complete example.

### Building and Testing the Example Locally

To build the library and run the example locally:

1. **Build the library**:

   ```bash
   cd server-sdk
   npm install
   npm run build
   ```

   This will generate both the individual module files and a single bundled file `dist/avaya-infinity-server-sdk.js` that contains the entire library.

2. **Update the example with your credentials**:
   Open `example-usage.js` and replace the placeholder values with your actual Avaya Infinity credentials.

3. **Run the example**:

   ```bash
   node example-usage.js
   ```

   If you encounter module resolution issues, use:

   ```bash
   node --experimental-modules example-usage.js
   ```

4. **Testing webhook verification**:
   The example includes a webhook verification simulation. For testing with actual webhooks, you'll need to:
   - Deploy your webhook handler to a publicly accessible endpoint
   - Configure your Avaya Infinity connector to point to this endpoint
   - Ensure your webhook handler validates incoming signatures using `AvayaInfinity.verifyEventSignature()`

## License

See the [LICENSE](./LICENSE) file for details.
