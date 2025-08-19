/******************************************************************************
 * Avaya Infinity Service.
 * Handles interactions with the Avaya Infinity API.
 * Deals with setting of the base URL for API requests and 
 * sending messages to Avaya Infinity.
 * Also supports the mock mode for testing purposes.
 *****************************************************************************/

import { config } from '../config/environment.js';
import { getAccessToken, initializeTokenService } from './avayaTokenService.js';
/**
 * Avaya Infinity Service allows interaction with the Avaya Infinity API,
 * mainly, sending messages to Avaya Infinity.
 */
class AvayaInfinityService {
  /**
   * Initializes the Avaya Infinity service with the base URL from the configuration.
   */
  constructor() {
    this.baseUrl = this._formatBaseUrl(config.avaya.host);
  }

  _formatBaseUrl(hostname) {
    if (hostname.startsWith('http://') || hostname.startsWith('https://')) {
      return hostname;
    }
    return `https://${hostname}`;
  }

  /**
   * Initializes the Avaya Infinity service with the current configuration.
   * This method updates the base URL based on the current configuration.
   * @returns {void}
   */
  async initialize() {
    console.info('Initializing Avaya Infinity service...');

    // Set base URL and token URL from environment variables

    const { host, clientId, clientSecret } = config.avaya;
    if (host.startsWith('http://') || host.startsWith('https://')) {
        this.baseUrl = host;
    } else {
        this.baseUrl = `https://${host}`;
    }

    this.baseUrl = this._formatBaseUrl(host);

    // Initialize the token service with the base URL and credentials
    await initializeTokenService(this.baseUrl, clientId, clientSecret);

    console.info('Avaya Infinity service initialized with baseUrl:', this.baseUrl);
  }

  /**
   * Forwards a message from Twilio to Avaya Infinity.
   * @param {object} twilioMessage - The message object from Twilio.
   * @returns {Promise<object>} The response from the Avaya Infinity API.
   * @throws {Error} If the request to Avaya Infinity fails.
   */
  async sendMessage(message) {
    const url = `${this.baseUrl}/api/digital/messaging/v1/accounts/${config.avaya.accountId}/messages`;

    const postData = JSON.stringify(message);

    // If mock mode is enabled, log the request and return a mock response
    if (config.avaya.isMockMode) {
      console.info('Sending message to Avaya Infinity (mock mode):');
      console.info('URL:', url);
      console.info('Body:', postData);
      return { success: true, messageId: 'mock_avaya_id' };
    }

    // If not in mock mode, make an actual API request
    // to Avaya Infinity to send the message
    console.debug('Sending message to Avaya Infinity:', {
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAccessToken()}`
      },
      url,
      body: postData
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAccessToken()}`
        },
        body: postData
      });

      if (!response.ok) {
        throw new Error(`Failed to forward message to Avaya Infinity: ${await response.text()}`);
      }

      console.info('Message sent to Avaya Infinity successfully');
      return await response.json();
    } catch (error) {
      console.error('Error sending message to Avaya Infinity:', error);
      throw error;
    }
  }
}

export default new AvayaInfinityService();
