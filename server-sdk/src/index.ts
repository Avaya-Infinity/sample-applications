/**
 * Avaya Infinity Server SDK
 * Main entry point for the library
 */

import { AvayaInfinityMessagingClient } from './services/messaging-client.js';
import { SignatureValidationService } from './services/signature-validation.js';
import { MessagingConnectorInitParams, TextMessage, Message } from './types.js';

/**
 * Main class for interacting with Avaya Infinity
 */
export class AvayaInfinity {
  /**
   * Initializes a new Avaya Infinity messaging client
   * @param params Parameters for initializing the client
   * @returns A new AvayaInfinityMessagingClient instance
   */
  public static init(params: MessagingConnectorInitParams): AvayaInfinityMessagingClient {
    const {
      host,
      clientId,
      clientSecret,
      eagerInitialization = false
    } = params;

    // Create a new messaging client
    const client = new AvayaInfinityMessagingClient(
      host,
      clientId,
      clientSecret,
      eagerInitialization
    );

    // Set credentials for lazy initialization
    client.setCredentials(clientId, clientSecret);

    return client;
  }

  /**
   * Verifies the signature of an Avaya Infinity webhook event
   * @param request The webhook request
   * @param webhookSecret The secret used to verify the signature
   * @returns True if the signature is valid, false otherwise
   */
  public static verifyEventSignature(
    request: { body: any; headers: { [key: string]: string | string[] | undefined } },
    webhookSecret: string
  ): boolean {
    const signature = request.headers['x-avaya-event-signature'];
    
    if (!signature || typeof signature !== 'string') {
      return false;
    }

    const validationService = new SignatureValidationService(webhookSecret);
    return validationService.verifySignature(request.body, signature);
  }
}

// Export types
export { MessagingConnectorInitParams, TextMessage, Message };
export { AvayaInfinityMessagingClient };
