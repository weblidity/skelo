const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.colorize({ all: true }), // Colorize everything
    winston.format.printf(info => `${info.timestamp} - ${info.level}: ${info.message}`) // Include the log level
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({
          all: true,
          colors: {
            error: 'red',
            warn: 'yellow',
            info: 'blue',
            http: 'green',
            verbose: 'cyan',
            debug: 'white',
            silly: 'magenta',
          },
        }),
        winston.format.printf(info => `${info.timestamp} - ${info.level}: ${info.message}`)
      ),
    }),
  ],
});

const customLogger = {
    ...logger, // Spread the existing logger properties

    error: (showMessage, message, ...meta) => {
        if (showMessage) logger.error(message, ...meta);
    },
    warn: (showMessage, message, ...meta) => {
        if (showMessage) logger.warn(message, ...meta);
    },
    info: (showMessage, message, ...meta) => {
        if (showMessage) logger.info(message, ...meta);
    },
    http: (showMessage, message, ...meta) => {
        if (showMessage) logger.http(message, ...meta);
    },
    verbose: (showMessage, message, ...meta) => {
        if (showMessage) logger.verbose(message, ...meta);
    },
    debug: (showMessage, message, ...meta) => {
        if (showMessage) logger.debug(message, ...meta);
    },
    silly: (showMessage, message, ...meta) => {
        if (showMessage) logger.silly(message, ...meta);
    },
};



module.exports = customLogger;

