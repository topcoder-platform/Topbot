/**
 * Handler for project response message
 */

const HttpStatus = require('http-status-codes')
const config = require('config')
const schema = require('../common/schema')
const { getTeamsClient } = require('../common/helper')
const { getProject } = require('../../common/dbHelper')
const logger = require('../../common/logger')

module.exports.handler = logger.traceFunction('response.handler', async event => {
  try {
    // Validate request
    const { error, value } = schema.responseSchema.validate(JSON.parse(event.body))
    if (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        body: JSON.stringify(error)
      }
    }

    // Get project
    const project = await getProject(value.projectId)
    const teamsClient = getTeamsClient(project.serviceUrl)

    // Check if valid
    if (!project) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        body: JSON.stringify({
          name: config.get('CONSTANTS.PROJECT_DOES_NOT_EXIST')
        })
      }
    }

    // Store state in button
    const buttonValue = JSON.stringify({
      projectId: value.projectId,
      isButton: true
    })
    // Post response message with "Accept" and "Decline" buttons to Client Teams
    await teamsClient.conversations.sendToConversation(project.teamsConversationId, {
      text: value.text,
      type: 'message',
      attachments: [{
        contentType: 'application/vnd.microsoft.card.hero',
        content: {
          buttons: [{
            type: 'messageBack',
            value: buttonValue,
            text: 'Accept'
          }, {
            type: 'messageBack',
            value: buttonValue,
            text: 'Decline'
          }]
        }
      }]
    })

    // Return OK
    return {
      statusCode: HttpStatus.OK
    }
  } catch (e) {
    logger.logFullError(e)
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR
    }
  }
})
