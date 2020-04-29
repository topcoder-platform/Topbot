/**
 * Handler for POST /slack/receive events from Client slack
 */
const config = require('config')
const HttpStatus = require('http-status-codes')
const { getSlackWebClient, decrypt } = require('../common/helper')
const logger = require('../../common/logger')
const request = require('./request.js')
const email = require('./email')
const help = require('./help.js')
const { getClientByTeamId } = require('../../common/dbHelper')

const eventTextRegex = new RegExp('^<.*> ')
const firstWordRegex = new RegExp(' .*')
const commands = config.get('COMMANDS')

/**
 * Call the appropriate handlers for the command
 * @param {String} command
 * @param {Object} body
 * @param {Object} slackWebClient
 */
async function handleCommand (command, body, slackWebClient) {
  try {
    switch (command) {
      case commands.REQUEST:
        await request.handler(body, slackWebClient)
        break
      case commands.EMAIL:
        await email.handler(body, slackWebClient)
        break
      case commands.HELP:
        await help.handler(body, slackWebClient)
        break
      default: {
        // Command not supported
        await slackWebClient.chat.postMessage({
          thread_ts: body.event.ts,
          channel: body.event.channel,
          text: `Topbot did not understand your command "${command}". Please run "@topbot help" for a list of valid commands.`
        })
      }
    }
  } catch (err) {
    logger.logFullError(err)
    await slackWebClient.chat.postMessage({
      thread_ts: body.event.ts,
      channel: body.event.channel,
      text: 'An error occured while processing your command. Please try again.'
    })
  }
}

module.exports.handler = logger.traceFunction('events.handler', async event => {
  if (event && event.Records && event.Records[0] && event.Records[0].Sns) {
    const body = JSON.parse(event.Records[0].Sns.Message)
    const client = await getClientByTeamId(body.team_id)
    if (!client) {
      return {
        statusCode: HttpStatus.UNAUTHORIZED
      }
    }
    const slackWebClient = getSlackWebClient(decrypt(client.botToken))
    const command = body.event.text.replace(eventTextRegex, '').trim().replace(firstWordRegex, '').trim().toLowerCase() // Get the command from text like "<user_name> command other_text"
    await handleCommand(command, body, slackWebClient)
  }
})
