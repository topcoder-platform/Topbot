/**
 * Handler for POST /slack/receive events from TC slack
 */
const config = require('config')
const { getSlackWebClient } = require('../common/helper')
const logger = require('../common/logger')
const help = require('./help')

const commandTextRegex = new RegExp('^<.*> ')
const commands = config.get('COMMANDS')
const slackWebClient = getSlackWebClient()

/**
 * Call the appropriate handlers for the command
 * @param {String} command
 * @param {Object} body
 */
async function handleCommand (command, body) {
  try {
    switch (command) {
      case commands.HELP:
        await help.handler(body)
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
  }
}

module.exports.handler = logger.traceFunction('events.handler', async event => {
  if (event && event.Records && event.Records[0] && event.Records[0].Sns) {
    const body = JSON.parse(event.Records[0].Sns.Message)
    const command = body.event.text.replace(commandTextRegex, '').trim().toLowerCase()
    await handleCommand(command, body)
  }
})
