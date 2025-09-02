/**
 * Signature Validation Service for Avaya Infinity API
 * Handles validation of webhook events from Avaya Infinity
 */

import crypto from 'crypto';

/**
 * Service for validating signatures of Avaya Infinity webhook events
 */
export class SignatureValidationService {
  private webhookSecret: string;

  /**
   * Creates a new SignatureValidationService
   * @param webhookSecret Secret used to verify webhook events
   */
  constructor(webhookSecret: string) {
    this.webhookSecret = webhookSecret;
  }

  /**
   * Verifies the signature of an Avaya Infinity webhook event
   * @param body The request body as a JSON object
   * @param signature The signature from the X-Avaya-Event-Signature header
   * @returns True if the signature is valid, false otherwise
   */
  public verifySignature(body: any, signature: string): boolean {
    if (!this.webhookSecret || this.webhookSecret === '') {
      console.warn('Webhook secret not configured. Skipping signature validation.');
      return true;
    }

    if (!signature?.startsWith('sha256=')) {
      console.error('Missing or invalid X-Avaya-Event-Signature header');
      return false;
    }

    try {
      // Create HMAC SHA256 of the request body
      const hmac = crypto.createHmac('sha256', this.webhookSecret);
      hmac.update(JSON.stringify(body), 'utf8');
      const generatedHmac = 'sha256=' + hmac.digest('base64');

      // Use timing-safe comparison with explicit encoding
      const receivedBuffer = Buffer.from(signature, 'utf8');
      const generatedBuffer = Buffer.from(generatedHmac, 'utf8');
      
      if (receivedBuffer.length !== generatedBuffer.length || 
          !crypto.timingSafeEqual(receivedBuffer, generatedBuffer)) {
        console.error('Invalid Avaya signature');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating Avaya signature:', error);
      return false;
    }
  }
}
