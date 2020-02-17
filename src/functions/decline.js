/**
 * Handler for decline command
 */

const HttpStatus = require('http-status-codes')
const config = require('config')
const schema = require('../common/schema')
const { getSlackWebClient } = require('../common/helper')
const { getProject } = require('../common/dbHelper')
const logger = require('../common/logger')

const slackWebClient = getSlackWebClient()

module.exports.handler = logger.traceFunction('decline.handler', async event => {
  try {
    const { error, value } = schema.declineSchema.validate(JSON.parse(event.body))
    if (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        body: JSON.stringify(error)
      }
    }

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

    // Post message to TC Slack
    await slackWebClient.chat.postMessage({
      thread_ts: project.tcSlackThread,
      channel: process.env.CHANNEL,
      text: 'Sorry, the client rejected the project'
    })

    // Return OK to Slack lambda
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
