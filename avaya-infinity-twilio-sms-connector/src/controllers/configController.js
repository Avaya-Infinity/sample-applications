/******************************************************************************
 * Config Controller.
 * This controller handles configuration management for the application.
 * It provides endpoints to get and set configurations, and reinitializes
 * services when configurations change.
 ******************************************************************************/

import { updateConfig, getMaskedConfig } from '../config/environment.js';
import twilioService from '../services/twilioService.js';
import avayaInfinityService from '../services/avayaInfinityService.js';

/**
 * Retrieve the current configuration, masking sensitive information.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export const getConfig = async (req, res) => {
  try {
    const maskedConfig = getMaskedConfig();
    
    res.status(200).json({
      success: true,
      config: maskedConfig
    });
  } catch (error) {
    console.error('Error getting config:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Set the configuration and reinitialize Avaya Infinity or Twilio services
 * if necessary. Returns the updated masked configuration.
 * @param {Object} req - The request object containing the new configuration.
 * @param {Object} res - The response object.
 */
export const setConfig = async (req, res) => {
  try {
    const newConfig = req.body;
    
    console.info('Updating configuration...');
    
    // Update the config and get information about what changed
    const { twilioChanged, avayaChanged } = updateConfig(newConfig);
    
    // Reinitialize services if their config changed
    if (twilioChanged) {
      console.info('Twilio config changed, reinitializing Twilio service...');
      twilioService.reinitialize();
    }
    
    if (avayaChanged) {
      console.info('Avaya config changed, reinitializing Avaya services...');
      
      // Reinitialize Avaya Infinity service
      try {
        avayaInfinityService.initialize();
      } catch (error) {
        console.error('Failed to reinitialize Avaya token service:', error);
      }
    }
    
    // Return the updated masked config
    const maskedConfig = getMaskedConfig();
    
    res.status(200).json({
      success: true,
      message: 'Configuration updated successfully',
      config: maskedConfig,
      changes: {
        twilioChanged,
        avayaChanged
      }
    });
  } catch (error) {
    console.error('Error setting config:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
