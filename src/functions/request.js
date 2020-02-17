/**
 * Handler for POST /request request from client slack lambda
 */
const HttpStatus = require('http-status-codes')
const uuid = require('uuid/v4')
const config = require('config')
const schema = require('../common/schema')
const { put } = require('../common/dbHelper')
const { getSlackWebClient } = require('../common/helper')
const logger = require('../common/logger')

const slackWebClient = getSlackWebClient()

module.exports.handler = logger.traceFunction('request.handler', async event => {
  // Validate request
  const { error, value } = schema.requestSchema.validate(JSON.parse(event.body))
  if (error) {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      body: JSON.stringify(error)
    }
  }

  // Create a project id
  const projectId = uuid()

  try {
    // Create project request in TC Slack
    const response = await slackWebClient.chat.postMessage({
      channel: process.env.CHANNEL,
      text: `*Request from ${value.requester}:*   \n ${value.description}`,
      mrkdwn: true,
      attachments: [
        {
          fallback: 'Click button to post a response',
          callback_id: projectId,
          attachment_type: 'default',
          actions: [{
            name: config.get('INTERACTIVE_MESSAGE_TYPES.POST_RESPONSE'),
            text: 'Post a response',
            type: 'button'
          }]
        }]
    })

    /*
    https://api.slack.com/methods/chat.postMessage#channels
    Other errors can be returned in the case where the service is down or other unexpected factors affect processing. Callers should always check the value of the ok params in the response
    */
    if (!response.ok) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        body: JSON.stringify(response.error)
      }
    }

    // Create project object
    var project
    switch (value.platform) {
      case config.get('PLATFORMS.SLACK'):
        project = {
          id: projectId,
          description: value.description,
          requester: value.requester,
          createdAt: new Date().toISOString(),
          status: config.get('PROJECT_STATUS.LAUNCHED'),
          clientSlackThread: value.clientSlackThread,
          clientSlackChannel: value.clientSlackChannel,
          slackTeam: value.slackTeam,
          tcSlackThread: response.ts,
          platform: value.platform
        }
        break
      case config.get('PLATFORMS.TEAMS'):
        project = {
          id: projectId,
          description: value.description,
          requester: value.requester,
          createdAt: new Date().toISOString(),
          status: config.get('PROJECT_STATUS.LAUNCHED'),
          teamsConversationId: value.teamsConversationId,
          serviceUrl: value.serviceUrl,
          tcSlackThread: response.ts,
          platform: value.platform
        }
        break
    }

    // Save project to Dynamodb table
    await put({
      TableName: config.get('DYNAMODB.PROJECT_TABLE_NAME'),
      Item: project
    })
  } catch (err) {
    logger.logFullError(err)
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      body: JSON.stringify(err)
    }
  }

  // Return the created project
  return {
    statusCode: HttpStatus.OK,
    body: JSON.stringify(project)
  }
})
