/**
 * Handler for approve command
 */

const HttpStatus = require('http-status-codes')
const config = require('config')
const schema = require('../common/schema')
const { getTeamsClient } = require('../common/helper')
const { getProject } = require('../../common/dbHelper')
const logger = require('../../common/logger')

module.exports.handler = logger.traceFunction('approve.handler', async event => {
  try {
    const { error, value } = schema.approveSchema.validate(JSON.parse(event.body))
    if (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        body: JSON.stringify(error)
      }
    }

    const project = await getProject(value.projectId)
    const teamsClient = getTeamsClient(project.serviceUrl)

    // Check if exists
    if (!project) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        body: JSON.stringify({
          name: config.get('CONSTANTS.PROJECT_DOES_NOT_EXIST')
        })
      }
    }

    // Post message to Client Teams
    await teamsClient.conversations.sendToConversation(project.teamsConversationId, {
      text: 'Your project was approved. Now you can use @topbot email command to invite more people in your project via email IDs',
      type: 'message'
    })

    // Return OK to TC Central
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
