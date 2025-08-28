/******************************************************************************
 * This file contains the configuration settings for the application.
 * It exports the configuration object and functions to set and get the configuration.
 ******************************************************************************/

import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.dev' });

export const PORT = process.env.PORT || 3000;

const isMockMode = (service) => 
  process.env.ENV === 'mock_all' || process.env.ENV === `mock_${service}`;

const isAvayaMockMode = isMockMode('avaya') || !process.env.AVAYA_INFINITY_HOST || process.env.AVAYA_INFINITY_CLIENT_ID.trim() === '';

/**
 * The configuration object contains settings for 
 * Twilio and Avaya Infinity services.
 */
export const config = {
  // Twilio configuration
  twilio: {
    account: {
      sid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN
    },
    apiKey: {
      sid: process.env.TWILIO_API_KEY_SID,
      secret: process.env.TWILIO_API_KEY_SECRET
    },
    isMockMode: isMockMode('twilio')
  },
  // Avaya Infinity configuration
  avaya: {
    host: process.env.AVAYA_INFINITY_HOST,
    accountId: process.env.AVAYA_INFINITY_ACCOUNT_ID,
    clientId: process.env.AVAYA_INFINITY_CLIENT_ID,
    clientSecret: process.env.AVAYA_INFINITY_CLIENT_SECRET,
    connectorId: process.env.AVAYA_INFINITY_CONNECTOR_ID,
    webhookSecret: process.env.AVAYA_INFINITY_WEBHOOK_SECRET,
    isMockMode: isAvayaMockMode
  }
};

/**
 * Update the configuration with new values.
 * @param {Object} newConfig - The new configuration values.
 * @returns {Object} - An object indicating which services were changed.
 */
export const updateConfig = (newConfig) => {
  let twilioChanged = false;
  let avayaChanged = false;

  // Helper function to update nested config
  const updateNestedConfig = (target, source) => {
    let changed = false;
    
    for (const [key, value] of Object.entries(source)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Recursively handle nested objects
        if (target[key]) {
          const nestedChanged = updateNestedConfig(target[key], value);
          if (nestedChanged) changed = true;
        }
      } else if (value !== undefined && target[key] !== value) {
        target[key] = value;
        changed = true;
      }
    }

    const avayaHost = newConfig.avaya.host;
    // Set isMockMode to true if avayaHost is falsy or blank
    target.isMockMode = !avayaHost || avayaHost.trim() === '';
    
    return changed;
  };

  // Update Twilio config if provided
  if (newConfig.twilio) {
    twilioChanged = updateNestedConfig(config.twilio, newConfig.twilio);
  }

  // Update Avaya config if provided
  if (newConfig.avaya) {
    avayaChanged = updateNestedConfig(config.avaya, newConfig.avaya);
  }

  return { twilioChanged, avayaChanged };
};

/**
 * Get the masked configuration for responses.
 * @returns {Object} - The masked configuration object with sensitive information hidden.
 */
export const getMaskedConfig = () => {
  const maskString = (str) => {
    if (!str) return str;
    if (str.length <= 6) return '***';
    return str.substring(0, 3) + '***' + str.substring(str.length - 2);
  };

  return {
    twilio: {
      account: {
        sid: maskString(config.twilio.account.sid),
        authToken: maskString(config.twilio.account.authToken)
      },
      apiKey: {
        sid: maskString(config.twilio.apiKey.sid),
        secret: maskString(config.twilio.apiKey.secret)
      },
      isMockMode: config.twilio.isMockMode
    },
    avaya: {
      host: config.avaya.host,
      accountId: config.avaya.accountId,
      clientId: maskString(config.avaya.clientId),
      clientSecret: maskString(config.avaya.clientSecret),
      connectorId: config.avaya.connectorId,
      webhookSecret: maskString(config.avaya.webhookSecret),
      isMockMode: config.avaya.isMockMode
    }
  };
};

