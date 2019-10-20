/**
 * This module contains the winston logger configuration.
 */

const { createLogger, format, transports } = require('winston')
const config = require('config')

const logger = createLogger({
  level: config.get('LOG_LEVEL'),
  format: format.combine(
    format.json(),
    format.colorize(),
    format.printf((data) => `${new Date().toISOString()} - ${data.level}: ${JSON.stringify(data.message, null, 4)}`)
  )
})

// Log to console if not in production
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    stderrLevels: ['error'],
    level: config.get('LOG_LEVEL')
  }))
}

/**
 * Logs complete error message with stack trace if present
 */
logger.logFullError = (err) => {
  if (err && err.stack) {
    logger.error(err.stack)
  } else {
    logger.error(JSON.stringify(err))
  }
}

module.exports = logger
