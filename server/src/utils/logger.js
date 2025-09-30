/**
 * Winston logger configuration
 * Provides structured logging with file and console transports
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// Ensure log directory exists
const logDir = config.logging.filePath;
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

/**
 * Custom log format
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

/**
 * Console log format (more readable for development)
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

/**
 * Create Winston logger instance
 */
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { service: 'whatsapp-api' },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: config.logging.maxSize,
      maxFiles: config.logging.maxFiles,
    }),
    // Combined log file
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: config.logging.maxSize,
      maxFiles: config.logging.maxFiles,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log'),
    }),
  ],
});

/**
 * Add console transport in development
 */
if (config.env !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

/**
 * Create a child logger with additional metadata
 * @param {Object} meta - Additional metadata
 * @returns {Object} Child logger
 */
logger.child = (meta) => {
  return logger.child(meta);
};

/**
 * Log HTTP requests (for Morgan integration)
 */
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

module.exports = logger;

