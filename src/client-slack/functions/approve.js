/**
 * Handler for approve command
 */

const HttpStatus = require('http-status-codes')
const config = require('config')
const schema = require('../common/schema')
const { getSlackWebClient, decrypt } = require('../common/helper')
const { getProject, getClientByTeamId } = require('../../common/dbHelper')
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

    // Check if exists
    if (!project) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        body: JSON.stringify({
          name: config.get('CONSTANTS.PROJECT_DOES_NOT_EXIST')
        })
      }
    }

    const client = await getClientByTeamId(project.slackTeam)
    if (!client) {
      return {
        statusCode: HttpStatus.UNAUTHORIZED,
        body: JSON.stringify({
          name: 'Topbot is not installed in client workspace'
        })
      }
    }

    const slackWebClient = getSlackWebClient(decrypt(client.botToken))

    // Post message to Client Slack
    await slackWebClient.chat.postMessage({
      thread_ts: project.clientSlackThread,
      channel: project.clientSlackChannel,
      text: 'Your project was approved. Now you can use @topbot email command to invite more people in your project via email IDs'
    })

    // Return OK to TC Cetral
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
