/**
 * Parameters required to initialize the Avaya Infinity messaging client
 */
export interface MessagingConnectorInitParams {
  /** Avaya Infinity account ID */
  account: string;
  
  /** Connector ID assigned by Avaya Infinity */
  connectorId: string;
  
  /** Client ID for OAuth authentication */
  clientId: string;
  
  /** Client secret for OAuth authentication */
  clientSecret: string;
  
  /** Secret used to verify webhook events from Avaya Infinity */
  webhookSecret?: string;
  
  /** Avaya Infinity host URL */
  host: string;
  
  /** Whether to eagerly initialize the token service (default: false for lazy initialization) */
  eagerInitialization?: boolean;
}

/**
 * Text message to be sent
 */
export interface TextMessage {
  /** Sender phone number */
  from: string;
  
  /** Recipient phone number */
  to: string;
  
  /** Message content, max 1024 characters */
  text: string;
  
  /** Optional contextual parameters */
  contextParameters?: Record<string, string>;
  
  /** Optional provider metadata */
  providerMetaData?: {
    messageId?: string;
    messageTimestamp?: string;
  };
}

/**
 * Headers for a message
 */
export interface MessageHeaders {
  from: string;
  to: string[];
}

/**
 * Message body content
 */
export interface MessageBody {
  text: string;
}

/**
 * Response from sending a message through Avaya Infinity
 */
export interface Message {
  /** Avaya Infinity message ID */
  messageId: string;
  
  /** Account ID */
  accountId: string;
  
  /** Conversation session ID */
  conversationSessionId: string;
  
  /** Connector ID */
  connectorId: string;
  
  /** Channel type */
  channel: string;
  
  /** Message headers */
  headers: {
    from: string;
    to: string[];
  };
  
  /** Message body */
  body: {
    text: string;
  };
  
  /** Optional contextual parameters */
  contextParameters?: Record<string, string>;
  
  /** Optional provider metadata */
  providerMetaData?: {
    messageId: string;
    messageTimestamp: string;
  };
}
