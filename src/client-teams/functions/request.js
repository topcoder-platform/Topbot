/**
 * Handles the @topbot request command
 */
const rp = require('request-promise')
const config = require('config')
const { getProjectByTeamsConversationId } = require('../../common/dbHelper')
const logger = require('../../common/logger')

module.exports.handler = logger.traceFunction('request.handler', async (body, teamsClient) => {
  const description = body.text.split(' ').slice(2).join(' ').trim() // Remove the first two words from text like "<user> request description"
  const conversationId = body.conversation.id

  // Check for empty description
  if (description.length === 0) {
    return teamsClient.conversations.sendToConversation(conversationId, {
      text: 'Project description cannot be empty. Please try again with a valid project description',
      type: 'message'
    })
  }

  // Check if new project request is inside an existing conversation
  const existingProject = await getProjectByTeamsConversationId(conversationId)
  if (existingProject) {
    return teamsClient.conversations.sendToConversation(conversationId, {
      text: 'A project already exists inside this conversation. Please use a new conversation to create your project',
      type: 'message'
    })
  }

  // POST to TC central
  await rp({
    method: 'POST',
    uri: `${process.env.LAMBDA_URI}/tc-slack/request`,
    body: {
      description,
      requester: body.from.name,
      teamsConversationId: conversationId,
      serviceUrl: body.serviceUrl,
      platform: config.get('PLATFORMS.TEAMS')
    },
    json: true
  })

  // Post acknowledgement to Client teams
  return teamsClient.conversations.sendToConversation(conversationId, {
    text: 'Request posted to Topcoder',
    type: 'message'
  })
})
