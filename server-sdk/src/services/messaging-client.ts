/**
 * Avaya Infinity Messaging Client
 * Provides methods for sending messages to Avaya Infinity
 */

import { Message, TextMessage } from '../types.js';
import { TokenService } from './token-service.js';

/**
 * Client for interacting with Avaya Infinity messaging API
 */
export class AvayaInfinityMessagingClient {
  private readonly baseUrl: string;
  private readonly tokenService: TokenService;
  private readonly eagerInitialization: boolean;
  private account: string;
  private connectorId: string;
  private isInitialized: boolean;
  private _clientId: string = '';
  private _clientSecret: string = '';

  /**
   * Creates a new AvayaInfinityMessagingClient
   * @param host Avaya Infinity host URL
   * @param account Avaya Infinity account ID
   * @param connectorId Connector ID assigned by Avaya Infinity
   * @param clientId Client ID for OAuth authentication
   * @param clientSecret Client secret for OAuth authentication
   * @param eagerInitialization Whether to eagerly initialize the token service
   */
  constructor(
    host: string,
    clientId: string,
    clientSecret: string,
    eagerInitialization: boolean = false
  ) {
    this.baseUrl = this.formatBaseUrl(host);
    this.tokenService = new TokenService();
    this.eagerInitialization = eagerInitialization;
    this.isInitialized = false;
    this._clientId = clientId;
    this._clientSecret = clientSecret;
  }

  /**
   * Starts the eager initialization process if configured to do so
   * This should be called after the constructor to begin async initialization
   */
  public startEagerInitialization(): void {
    if (this.eagerInitialization) {
      this.initialize(this.clientId, this.clientSecret)
        .then(() => {
          console.info('AvayaInfinityMessagingClient eagerly initialized');
        })
        .catch(error => {
          console.error('Failed to eagerly initialize AvayaInfinityMessagingClient:', error);
        });
    }
  }

  /**
   * Formats the base URL to ensure it starts with https://
   * @param hostname Host URL
   * @returns Formatted base URL
   */
  private formatBaseUrl(hostname: string): string {
    if (hostname.startsWith('http://') || hostname.startsWith('https://')) {
      return hostname;
    }
    return `https://${hostname}`;
  }

  /**
   * Initializes the client by setting up the token service
   * @param clientId Client ID for OAuth authentication
   * @param clientSecret Client secret for OAuth authentication
   */
  private async initialize(clientId: string, clientSecret: string): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      await this.tokenService.initialize(this.baseUrl, clientId, clientSecret);
      this.isInitialized = true;
      this.account = this.tokenService.getTokenAccountId();
      this.connectorId = this.tokenService.getTokenConnectorId();
      console.info('AvayaInfinityMessagingClient initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AvayaInfinityMessagingClient:', error);
      throw error;
    }
  }

  /**
   * Gets the client ID used for authentication
   * @returns The client ID
   */
  private get clientId(): string {
    return this._clientId;
  }

  /**
   * Gets the client secret used for authentication
   * @returns The client secret
   */
  private get clientSecret(): string {
    return this._clientSecret;
  }

  /**
   * Sets the credentials for authentication
   * @param clientId Client ID for OAuth authentication
   * @param clientSecret Client secret for OAuth authentication
   */
  public setCredentials(clientId: string, clientSecret: string): void {
    this._clientId = clientId;
    this._clientSecret = clientSecret;
  }

  /**
   * Converts a TextMessage to the format expected by Avaya Infinity
   * @param textMessage The message to send
   * @returns Formatted message for Avaya Infinity API
   */
  private formatMessage(textMessage: TextMessage): any {
    return {
      connectorId: this.connectorId,
      channel: 'text',
      headers: {
        from: textMessage.from,
        to: [textMessage.to]
      },
      body: {
        text: textMessage.text
      },
      contextParameters: textMessage.contextParameters || {},
      providerMetaData: textMessage.providerMetaData || {}
    };
  }

  /**
   * Sends a message to Avaya Infinity
   * @param textMessage The message to send
   * @returns The response from Avaya Infinity
   * @throws Error if sending fails
   */
  public async sendMessage(textMessage: TextMessage): Promise<Message> {
    // Lazy initialization if not already initialized
    if (!this.isInitialized && !this.tokenService.isInitializedStatus()) {
      console.info('Lazily initializing AvayaInfinityMessagingClient');
      await this.initialize(this.clientId, this.clientSecret);
    }

    const url = `${this.baseUrl}/api/digital/messaging/v1/accounts/${this.account}/messages`;
    const message = this.formatMessage(textMessage);
    const postData = JSON.stringify(message);

    console.debug('Sending message to Avaya Infinity:', {
      url,
      from: textMessage.from,
      to: textMessage.to
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.tokenService.getAccessToken()}`
        },
        body: postData
      });

      if (!response.ok) {
        throw new Error(`Failed to send message to Avaya Infinity: ${await response.text()}`);
      }

      console.info('Message sent to Avaya Infinity successfully');
      return await response.json() as Message;
    } catch (error) {
      console.error('Error sending message to Avaya Infinity:', error);
      throw error;
    }
  }

  /**
   * Cleans up resources when the client is no longer needed
   */
  public dispose(): void {
    this.tokenService.dispose();
    this.isInitialized = false;
  }
}
