/**
 * Handler for POST /invite
 */

const HttpStatus = require('http-status-codes')
const config = require('config')
const schema = require('../common/schema')
const { getSlackWebClient } = require('../common/helper')
const { getProject } = require('../common/dbHelper')
const logger = require('../common/logger')

const slackWebClient = getSlackWebClient()

module.exports.handler = async event => {
  try {
    // Validate input
    const { error, value } = schema.inviteSchema.validate(JSON.parse(event.body))
    if (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        body: JSON.stringify(error)
      }
    }

    const project = await getProject(value.projectId)

    // Check if exists
    if (!project) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        body: JSON.stringify({
          name: config.get('CONSTANTS.PROJECT_DOES_NOT_EXIST')
        })
      }
    }

    // Post to TC Slack
    await slackWebClient.chat.postMessage({
      thread_ts: project.tcSlackThread,
      channel: process.env.CHANNEL,
      text: `User with email ${value.email} has been successfully invited to the project`
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
}
