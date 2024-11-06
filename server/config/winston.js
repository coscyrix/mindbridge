//config/winston.js

import winston from 'winston';
import fs from 'fs';
import path from 'path';

// Ensure log directory exists
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.simple(),
    winston.format.timestamp(),
    winston.format.printf(
      ({ level, message }) => `[${level.toUpperCase()}] ${message}`,
    ),
  ),
  transports: [
    new winston.transports.File({
      filename: `${logDir}/error.log`,
      level: 'error',
    }),
    new winston.transports.File({
      filename: `${logDir}/warn.log`,
      level: 'warn',
    }),
    new winston.transports.File({
      filename: `${logDir}/info.log`,
      level: 'info',
    }),
  ],
});

// Optional: Add console transport for non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.simple(),
        winston.format.timestamp(),
        winston.format.printf(
          ({ level, message }) => `[${level.toUpperCase()}] ${message}`,
        ),
      ),
    }),
  );
}

export default logger;
