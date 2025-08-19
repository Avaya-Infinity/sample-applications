/******************************************************************************
 * Twilio Service.
 * Handles interactions with the Twilio API using the Twilio Server SDK.
 * Deals with initialization of Twilio SDK and sending message to Twilio.
 * Also supports the mock mode for testing purposes.
 *****************************************************************************/

import twilio from 'twilio';
import { config } from '../config/environment.js';

/**
 * Twilio Service allows sending messages via Twilio API.
 */
class TwilioService {
  constructor() {
    this.client = null;
  }

  /**
   * Initializes the Twilio client.
   * @returns {void}
   */
  initialize() {
    if (config.twilio.isMockMode) {
      console.warn('Twilio client initialized in mock mode');
      return;
    }

    // Initialize Twilio client with API key if available
    if (config.twilio.apiKey.sid && config.twilio.apiKey.secret) {
      try {
        this.client = twilio(
          config.twilio.apiKey.sid, 
          config.twilio.apiKey.secret, 
          { accountSid: config.twilio.account.sid }
        );
        console.info('Twilio client initialized successfully using API key');
        return;
      } catch (error) {
        console.error('Failed to initialize Twilio client with API key:', error);
      }
    } 
    
    // If API key is not available, fall back to account SID and auth token
    if (config.twilio.account.sid && config.twilio.account.authToken) {
      try {
        this.client = twilio(
          config.twilio.account.sid, 
          config.twilio.account.authToken
        );
        console.info('Twilio client initialized successfully using account SID and auth token');
        return;
      } catch (error) {
        console.error('Failed to initialize Twilio client with account credentials:', error);
      }
    } 
    
    // If no valid credentials are available, log a warning
    console.warn('Twilio client not initialized - insufficient credentials provided. Call the configurations API to set valid credentials');
    this.client = null;
  }

  /**
   * Reinitializes the Twilio client.
   * This method is called when the Twilio credentials are updated.
   * @return {void}
   * @throws {Error} If the client cannot be reinitialized due to invalid credentials.
   */
  async reinitialize() {
    console.info('Reinitializing Twilio client...');
    if (this.client) {
      // Clear existing client connection
      this.client.invalidateBasicAuth();
      this.client = null;
    }
    this.initialize();
  }

  /**
   * Sends a message via Twilio.
   * @param {string} from - The sender's phone number.
   * @param {string} to - The recipient's phone number.
   * @param {string} message - The message content.
   * @returns {Promise<object>} The result of the message sending operation.
   * @throws {Error} If the message cannot be sent due to an error.
   */
  async sendMessage(from, to, message) {
    if (config.twilio.isMockMode) {
      console.info('Forwarding message to Twilio (mock mode):', { from, to, message });
      return { sid: 'mock_message_id' };
    }

    if (!this.client) {
      throw new Error('Twilio client not initialized - please set valid credentials first');
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: from,
        to: to
      });
      
      console.info('Message forwarded to Twilio successfully:', result.sid);
      return result;
    } catch (error) {
      console.error('Failed to forward message to Twilio:', error);
      throw error;
    }
  }
}

export default new TwilioService();
