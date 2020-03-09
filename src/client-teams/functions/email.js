/**
 * Handles the @topbot email command
 */
const rp = require('request-promise')
const HttpStatus = require('http-status-codes')
const config = require('config')
const { getProjectByTeamsConversationId } = require('../../common/dbHelper')
const logger = require('../../common/logger')

const emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i // eslint-disable-line

module.exports.handler = logger.traceFunction('email.handler', async (body, teamsClient) => {
  const conversationId = body.conversation.id
  // Check if email command is issued inside a project request conversation
  const project = await getProjectByTeamsConversationId(conversationId)
  if (!project) {
    return teamsClient.conversations.sendToConversation(conversationId, {
      text: 'Email command can only be issued in a valid project request conversation',
      type: 'message'
    })
  }

  const email = body.text.split(' ').slice(2).join(' ').trim()

  // Check if email is empty
  if (email.length === 0) {
    return teamsClient.conversations.sendToConversation(conversationId, {
      text: 'Email id cannot be empty',
      type: 'message'
    })
  }

  // Validate email
  if (!emailRegex.test(email)) {
    return teamsClient.conversations.sendToConversation(conversationId, {
      text: 'Email id is invalid',
      type: 'message'
    })
  }

  // Check if not approved
  if (!(project.status === config.get('PROJECT_STATUS.APPROVED'))) {
    return teamsClient.conversations.sendToConversation(conversationId, {
      text: 'Project has to be approved in order to invite people to it',
      type: 'message'
    })
  }

  // POST to TC central
  try {
    await rp({
      method: 'POST',
      uri: `${process.env.LAMBDA_URI}/tc-slack/invite`,
      body: {
        projectId: project.id,
        email
      },
      json: true
    })
    // Post to Client Teams on success
    return teamsClient.conversations.sendToConversation(conversationId, {
      text: `User with ${email} has been successfully invited to the project. The project can be accessed at [Connect](${config.get('CONNECT.PROJECT_URI')(project.connectProjectId)})`,
      type: 'message'
    })
  } catch (e) {
    logger.logFullError(e)
    // Email has already been invited
    if (e.statusCode === HttpStatus.FORBIDDEN) {
      return teamsClient.conversations.sendToConversation(conversationId, {
        text: `User with email ${email} has already been invited to the project. The project can be accessed at [Connect](${config.get('CONNECT.PROJECT_URI')(project.connectProjectId)})`,
        type: 'message'
      })
    } else {
      throw e
    }
  }
})
