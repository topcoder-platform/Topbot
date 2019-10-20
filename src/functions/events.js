/**
 * Handler for POST /slack/receive events from TC slack
 */
const crypto = require('crypto')
const config = require('config')
const HttpStatus = require('http-status-codes')
const { getSlackWebClient } = require('../common/helper')
const logger = require('../common/logger')
const accept = require('./accept')
const approve = require('./approve')
const help = require('./help')

const commandTextRegex = new RegExp('^<.*> ')
const commands = config.get('COMMANDS')
const slackWebClient = getSlackWebClient()

/**
 * Verify that the request is from slack
 * Documentation: https://api.slack.com/docs/verifying-requests-from-slack
 * Tutorial for node: https://medium.com/@rajat_sriv/verifying-requests-from-slack-using-node-js-69a8b771b704
 * @param {Object} event
 */
function authenticateRequest (event) {
  const body = event.body
  const slackSignature = event.headers['X-Slack-Signature']
  const timestamp = event.headers['X-Slack-Request-Timestamp']
  const sigBasestring = `v0:${timestamp}:${body}`
  const slackSigningSecret = process.env.CLIENT_SIGNING_SECRET
  const receivedSignature = 'v0=' + crypto.createHmac('sha256', slackSigningSecret).update(sigBasestring, 'utf8').digest('hex')
  return crypto.timingSafeEqual(Buffer.from(receivedSignature), Buffer.from(slackSignature))
}

/**
 * Call the appropriate handlers for the command
 * @param {String} command
 * @param {Object} event
 */
async function handleCommand (command, event) {
  try {
    switch (command) {
      case commands.ACCEPT:
        await accept.handler(event)
        break
      case commands.APPROVE:
        await approve.handler(event)
        break
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
