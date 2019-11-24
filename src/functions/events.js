/**
 * Handler for POST /slack/receive events from TC slack
 */
const config = require('config')
const HttpStatus = require('http-status-codes')
const { getSlackWebClient, authenticateRequest } = require('../common/helper')
const logger = require('../common/logger')
const help = require('./help')

const commandTextRegex = new RegExp('^<.*> ')
const commands = config.get('COMMANDS')
const slackWebClient = getSlackWebClient()

/**
 * Call the appropriate handlers for the command
 * @param {String} command
 * @param {Object} event
 */
async function handleCommand (command, event) {
  try {
    switch (command) {
      case commands.HELP:
        await help.handler(event)
        break
      default: {
        // Command not supported
        const body = JSON.parse(event.body)
        await slackWebClient.chat.postMessage({
          thread_ts: body.event.ts,
          channel: body.event.channel,
          text: `Topbot did not understand your command "${command}". Please run "@topbot help" for a list of valid commands.`
        })
      }
    }
  } catch (err) {
    logger.logFullError(err)
  }
}

module.exports.handler = async event => {
  const isValidRequest = authenticateRequest(event)
  if (!isValidRequest) {
    return {
      statusCode: HttpStatus.BAD_REQUEST
    }
  }

  const body = JSON.parse(event.body)

  if (body.event && body.event.text) {
    const command = body.event.text.replace(commandTextRegex, '').trim().toLowerCase()
    await handleCommand(command, event)
  }

  return {
    statusCode: HttpStatus.OK,
    body: JSON.stringify({
      challenge: body.challenge // Event subscription handler must respond with the challenge value
    })
  }
}
