/**
 * Handler for iteractions with interactive components in Client slack
 */
const querystring = require('querystring')
const HttpStatus = require('http-status-codes')
const rp = require('request-promise')
const config = require('config')
const { getSlackWebClient, decrypt } = require('../common/helper')
const { updateProjectStatus, getProject, getClientByTeamId } = require('../../common/dbHelper')
const logger = require('../../common/logger')

const INTERACTIVE_MESSAGE_TYPES = config.get('INTERACTIVE_MESSAGE_TYPES')

module.exports.handler = logger.traceFunction('interactive.handler', async event => {
  try {
    if (event && event.Records && event.Records[0] && event.Records[0].Sns) {
      const body = querystring.decode(event.Records[0].Sns.Message)
      var payload = JSON.parse(body.payload)
      if (payload.type === 'interactive_message') {
        try {
          const client = await getClientByTeamId(payload.team.id)
          if (!client) {
            return {
              statusCode: HttpStatus.UNAUTHORIZED
            }
          }
          var slackWebClient = getSlackWebClient(decrypt(client.botToken))
          switch (payload.type) {
            case 'interactive_message':
              switch (payload.actions[0].name) {
                case INTERACTIVE_MESSAGE_TYPES.ACCEPT:
                  await handleAccept(payload, slackWebClient)
                  break
                case INTERACTIVE_MESSAGE_TYPES.DECLINE:
                  await handleDecline(payload, slackWebClient)
                  break
                default:
              }
              break
            default:
          }
        } catch (e) {
          // Post error to Client Slack
          return slackWebClient.chat.postMessage({
            thread_ts: payload.message_ts,
            channel: payload.channel.id,
            text: 'An error occured. Please try again'
          })
        }
      }
    }
  } catch (err) {
    logger.logFullError(err)
  }
})

/**
 * Handles click on the Accept button
 * @param {Object} payload
 */
async function handleAccept (payload, slackWebClient) {
  // Get project
  const projectId = payload.callback_id
  const project = await getProject(projectId)

  // Check if valid
  if (!project) {
    return slackWebClient.chat.postMessage({
      thread_ts: payload.message_ts,
      channel: payload.channel.id,
      text: config.get('CONSTANTS.PROJECT_DOES_NOT_EXIST')
    })
  }

  // Take action based on current project status
  switch (project.status) {
    case config.get('PROJECT_STATUS.ACCEPTED'): {
      return slackWebClient.chat.postMessage({
        thread_ts: payload.message_ts,
        channel: payload.channel.id,
        text: 'Project has already been accepted'
      })
    }
    case config.get('PROJECT_STATUS.DECLINED'): {
      return slackWebClient.chat.postMessage({
        thread_ts: payload.message_ts,
        channel: payload.channel.id,
        text: 'Project has already been declined. You cannot accept it now.'
      })
    }
    case config.get('PROJECT_STATUS.APPROVED'): {
      return slackWebClient.chat.postMessage({
        thread_ts: payload.message_ts,
        channel: payload.channel.id,
        text: 'Project has already been approved. You cannot accept it now.'
      })
    }
    case config.get('PROJECT_STATUS.RESPONDED'): {
      // Post accepted to TC Central
      await rp({
        method: 'POST',
        uri: `${process.env.LAMBDA_URI}/tc-slack/accept`,
        body: {
          projectId
        },
        json: true
      })

      // Update status of project to ACCEPTED
      await updateProjectStatus(project.id, config.get('PROJECT_STATUS.ACCEPTED'))

      // Post acknowledgement to Client Slack
      return slackWebClient.chat.postMessage({
        thread_ts: payload.message_ts,
        channel: payload.channel.id,
        text: 'Project has been accepted.'
      })
    }
  }
}

/**
 * Handles click on Decline button
 * @param {Object} payload
 */
async function handleDecline (payload, slackWebClient) {
  const projectId = payload.callback_id
  const project = await getProject(projectId)

  // Check if project exists
  if (!project) {
    return slackWebClient.chat.postMessage({
      thread_ts: payload.message_ts,
      channel: payload.channel.id,
      text: config.get('CONSTANTS.PROJECT_DOES_NOT_EXIST')
    })
  }

  // Handle based on current project status
  switch (project.status) {
    case config.get('PROJECT_STATUS.ACCEPTED'): {
      return slackWebClient.chat.postMessage({
        thread_ts: payload.message_ts,
        channel: payload.channel.id,
        text: 'Project has already been accepted. You cannot decline it now'
      })
    }
    case config.get('PROJECT_STATUS.DECLINED'): {
      return slackWebClient.chat.postMessage({
        thread_ts: payload.message_ts,
        channel: payload.channel.id,
        text: 'Project has already been declined.'
      })
    }
    case config.get('PROJECT_STATUS.APPROVED'): {
      return slackWebClient.chat.postMessage({
        thread_ts: payload.message_ts,
        channel: payload.channel.id,
        text: 'Project has already been approved. You cannot decline it now.'
      })
    }
    case config.get('PROJECT_STATUS.RESPONDED'): {
      // POST to TC Central
      await rp({
        method: 'POST',
        uri: `${process.env.LAMBDA_URI}/tc-slack/decline`,
        body: {
          projectId
        },
        json: true
      })

      await slackWebClient.chat.postMessage({
        thread_ts: payload.message_ts,
        channel: payload.channel.id,
        text: 'Project declined.'
      })

      // Set project status to declined
      await updateProjectStatus(project.id, config.get('PROJECT_STATUS.DECLINED'))
    }
  }
}
