/******************************************************************************
* Logger Middleware.
* This middleware sets up a logger.
******************************************************************************/

import chalk from 'chalk';

// Store original console methods
const originalMethods = {
  log: console.log,
  info: console.info,
  debug: console.debug,
  error: console.error,
  warn: console.warn
};

/**
 * Creates a styled logger function with chalk
 * @param {Function} originalMethod - The original console method
 * @param {string} level - The log level (LOG, INFO, DEBUG, ERROR, WARN)
 * @returns {Function} - The enhanced logger function
 */
const createStyledLogger = (originalMethod, level) => {
  return (...args) => {
    const timestamp = new Date().toISOString();
    const dimTags = chalk.dim.white(`[${level.padEnd(5, ' ')}][${timestamp}]`);
    
    // Style the message based on log level
    const styledArgs = args.map(arg => {
      if (typeof arg !== 'string') return arg;
      
      switch (level) {
        case 'WARN': return chalk.yellow(arg);
        case 'ERROR': return chalk.redBright(arg);
        case 'DEBUG': return chalk.dim.white(arg);
        default: return chalk.white(arg); // LOG and INFO
      }
    });
    
    originalMethod(dimTags, ...styledArgs);
  };
};

/**
 * Sets up styled logging for all console methods
 */
export const setupLogger = () => {
  // Override console methods with styled versions
  console.log = createStyledLogger(originalMethods.log, 'LOG');
  console.info = createStyledLogger(originalMethods.info, 'INFO');
  console.debug = createStyledLogger(originalMethods.debug, 'DEBUG');
  console.error = createStyledLogger(originalMethods.error, 'ERROR');
  console.warn = createStyledLogger(originalMethods.warn, 'WARN');
  
  console.debug('Logger initialized');
};

/**
 * Restores original console methods (useful for testing)
 */
export const restoreLogger = () => {
  Object.assign(console, originalMethods);
  console.log('Logger restored to original state');
};
