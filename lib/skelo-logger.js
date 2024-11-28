const winston = require('winston');
const { combine, timestamp, printf, colorize } = winston.format;

// Define the custom format
const customFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

// Create the logger
const logger = winston.createLogger({
  level: 'info',
  format: combine(
    colorize(), // Add color to the output
    timestamp(), // Add timestamp to the output
    customFormat // Use the custom format
  ),
  transports: [
    new winston.transports.Console() // Output to the console
  ]
});

/**
 * Logs a debug message if logging is enabled.
 *
 * @param {boolean} shouldLog - Determines if the message should be logged.
 * @param {string} msg - The message to log.
 */
const logDebug = (shouldLog, msg) => {
  if (shouldLog) {
    logger.debug(msg);
  }
};

/**
 * Logs an error message if logging is enabled.
 *
 * @param {boolean} shouldLog - Determines if the message should be logged.
 * @param {string} msg - The message to log.
 */
const logError = (shouldLog, msg) => {
  if (shouldLog) {
    logger.error(msg);
  }
};

/**
 * Logs an informational message if logging is enabled.
 *
 * @param {boolean} shouldLog - Determines if the message should be logged.
 * @param {string} msg - The message to log.
 */
const logInfo = (shouldLog, msg) => {
  if (shouldLog) {
    logger.info(msg);
  }
};

/**
 * Logs a warning message if logging is enabled.
 *
 * @param {boolean} shouldLog - Determines if the message should be logged.
 * @param {string} msg - The message to log.
 */
const logWarn = (shouldLog, msg) => {
  if (shouldLog) {
    logger.warn(msg);
  }
};

// Export functions in alphabetical order
module.exports = { logDebug, logError, logInfo, logWarn };