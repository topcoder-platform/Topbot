/**
 * Handler for teams events
 */
const config = require('config')
const { getTeamsClient } = require('../common/helper')
const request = require('./request')
const email = require('./email')
const accept = require('./accept')
const decline = require('./decline')
const help = require('./help')
const logger = require('../../common/logger')

/**
 * Handles @topbot commands from teams
 * @param {Object} body
 * @param {Object} teamsClient
 */
async function handleCommand (body, teamsClient) {
  let command = body.text.split(' ')[1]
  const conversationId = body.conversation.id

  if (!command) {
    return teamsClient.conversations.sendToConversation(conversationId, {
      text: 'Please specify a valid command. Issue @topbot help to see the list of available commands',
      type: 'message'
    })
  }

  command = command.trim()

  switch (command) {
    case config.get('COMMANDS.REQUEST'):
      await request.handler(body, teamsClient)
      break
    case config.get('COMMANDS.EMAIL'):
      await email.handler(body, teamsClient)
      break
    case config.get('COMMANDS.HELP'):
      await help.handler(body, teamsClient)
      break
    default:
      await teamsClient.conversations.sendToConversation(body.conversation.id, {
        text: `Topbot did not understand your command "${command}". Please run "@topbot help" for a list of valid commands.`,
        type: 'message'
      })
  }
}

/**
 * Handles clicks on buttons
 * @param {Object} body
 * @param {Object} teamsClient
 */
async function handleButton (body, teamsClient) {
  switch (body.text.toLowerCase().trim()) {
    case config.get('INTERACTIVE_MESSAGE_TYPES.ACCEPT'):
      await accept.handler(body, teamsClient)
      break
    case config.get('INTERACTIVE_MESSAGE_TYPES.DECLINE'):
      await decline.handler(body, teamsClient)
      break
  }
}

module.exports.handler = logger.traceFunction('events.handler', async event => {
  try {
    if (event && event.Records && event.Records[0] && event.Records[0].Sns) {
      var body = JSON.parse(event.Records[0].Sns.Message)
      var teamsClient = getTeamsClient(body.serviceUrl)

      if (body.type === 'message') {
        const isButton = (body.value || {}).isButton
        if (!isButton) {
          await handleCommand(body, teamsClient)
        } else {
          await handleButton(body, teamsClient)
        }
      }
    }
  } catch (e) {
    logger.logFullError(e)
    await teamsClient.conversations.sendToConversation(body.conversation.id, {
      text: 'An error occured while processing your request. Please try again.',
      type: 'message'
    })
  }
})
