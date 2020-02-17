/**
 * This module contains the winston logger configuration.
 */

const _ = require('lodash')
const { createLogger, format, transports } = require('winston')
const config = require('config')
const getParams = require('get-parameter-names')
const util = require('util')

/**
 * Convert array with arguments to object
 * @param {Array} params the name of parameters
 * @param {Array} arr the array with values
 * @private
 */
const _combineObject = (params, arr) => {
  const ret = {}
  _.each(arr, (arg, i) => {
    ret[params[i]] = arg
  })
  return ret
}

/**
 * Logger
 */
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
 * @param logger
 * @param err
 */
const logFullError = (logger, err) => {
  if (err && err.stack) {
    logger.error(err.stack)
  } else {
    logger.error(JSON.stringify(err))
  }
}

/**
 * Logs complete error message with stack trace if present
 */
logger.logFullError = (err) => {
  logFullError(logger, err)
}

/**
 * Logger for printing function ENTER/EXIT events.
 */
const functionLogger = createLogger({
  level: 'debug',
  format: format.combine(
    format.colorize(),
    format.printf((data) => `${new Date().toISOString()} - ${data.level}: ${data.message}`)
  )
})

functionLogger.add(new transports.Console({
  stderrLevels: ['error'],
  level: 'debug'
}))

/**
 * Takes a handler function and return a function that logs arguments and return value.
 * @param fn
 * @param name
 * @return {function(...[*]=)}
 */
logger.traceFunction = (name, fn) => {
  if (config.get('DISABLE_LAMBDA_DEBUG_LOGGING')) {
    return fn
  }
  return async function () {
    const params = fn.params || getParams(fn)
    const args = Array.prototype.slice.call(arguments)
    functionLogger.debug(`ENTER ${name}`)
    functionLogger.debug(`input arguments ${util.inspect(_combineObject(params, args), true)}`)
    try {
      const result = await fn.apply(this, arguments)
      functionLogger.debug(`EXIT ${util.inspect(result, true)}`)
      return result
    } catch (e) {
      logFullError(functionLogger, e)
    }
  }
}

module.exports = logger
