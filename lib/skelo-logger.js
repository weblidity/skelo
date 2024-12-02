const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.colorize({
      all: true,
      colors: {
        error: 'red',
        warn: 'yellow', // Note: winston uses 'yellow' for orange
        info: 'green',
        verbose: 'cyan',
        debug: 'blue',
      },
    }),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      winston.format.colorize({
        all: true,
        colors: {
          error: 'red',
          warn: 'yellow', // Note: winston uses 'yellow' for orange
          info: 'green',
          verbose: 'cyan',
          debug: 'blue',
        },
      }),
      winston.format.simple()
    ),
  }));
}

const logError = (show, message) => {
  if (show) {
    logger.error(message);
  }
};

const logWarn = (show, message) => {
  if (show) {
    logger.warn(message);
  }
};

const logInfo = (show, message) => {
  if (show) {
    logger.info(message);
  }
};

const logVerbose = (show, message) => {
  if (show) {
    logger.verbose(message);
  }
};

const logDebug = (show, message) => {
  if (show) {
    logger.debug(message);
  }
};

module.exports = { logError, logWarn, logInfo, logVerbose, logDebug, logger };