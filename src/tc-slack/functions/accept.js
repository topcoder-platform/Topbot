/**
 * Handler for accept a project
 */

const HttpStatus = require('http-status-codes')
const config = require('config')
const schema = require('../../common/schema')
const { getSlackWebClient } = require('../common/helper')
const { getProject } = require('../../common/dbHelper')
const logger = require('../../common/logger')

const slackWebClient = getSlackWebClient()

module.exports.handler = logger.traceFunction('accept.handler', async event => {
  try {
    // Validate schema
    const { error, value } = schema.acceptSchema.validate(JSON.parse(event.body))
    if (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        body: JSON.stringify(error)
      }
    }

    // Get project
    const project = await getProject(value.projectId)

    // Check if valid
    if (!project) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        body: JSON.stringify({
          name: config.get('CONSTANTS.PROJECT_DOES_NOT_EXIST')
        })
      }
    }

    // Post accepted to TC Central
    await slackWebClient.chat.postMessage({
      thread_ts: project.tcSlackThread,
      channel: process.env.TC_SLACK_CHANNEL,
      text: 'Great, the client accepted the project, please provide an awesome project name',
      mrkdwn: true,
      attachments: [
        {
          fallback: 'Click button to provide a project name',
          callback_id: project.id,
          attachment_type: 'default',
          actions: [{
            name: config.get('INTERACTIVE_MESSAGE_TYPES.APPROVE'),
            text: 'Provide project name',
            type: 'button'
          }]
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
