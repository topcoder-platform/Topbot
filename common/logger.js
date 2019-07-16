/**
 * This module contains the winston logger configuration.
 */
const { createLogger, format, transports } = require('winston')
const config = require('config')

const logger = createLogger({
  level: config.get('LOG_LEVEL'),
  format: format.combine(
    format.splat(),
    format.simple()
  ),
  transports: [
    new transports.File({ filename: 'error.log', level: 'error' }), // Write errors to error.log
    new transports.File({ filename: 'combined.log' }) // Write all logs to combined.log
  ]
})
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.simple()
  })) // Log to console if not in production
}

module.exports = logger
