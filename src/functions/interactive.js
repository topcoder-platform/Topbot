/**
 * Handler for iteractions with interactive components in TC Slack
 */
const querystring = require('querystring')
const rp = require('request-promise')
const config = require('config')
const HttpStatus = require('http-status-codes')
const { getSlackWebClient, authenticateRequest } = require('../common/helper')
const { getProject, updateProjectStatus } = require('../common/dbHelper')
const logger = require('../common/logger')

const INTERACTIVE_MESSAGE_TYPES = config.get('INTERACTIVE_MESSAGE_TYPES')
const slackWebClient = getSlackWebClient()

module.exports.handler = async event => {
  try {
    const isValidRequest = authenticateRequest(event)
    if (!isValidRequest) {
      return {
        statusCode: HttpStatus.BAD_REQUEST
      }
    }

    // Payload is an URL encoded string
    var payload = JSON.parse(querystring.decode(event.body).payload)

    switch (payload.type) {
      case 'interactive_message':
        switch (payload.actions[0].name) {
          case INTERACTIVE_MESSAGE_TYPES.POST_RESPONSE:
            await handlePostResponse(payload)
            break
          case INTERACTIVE_MESSAGE_TYPES.APPROVE:
            await handleApprove(payload)
            break
          default:
        }
        break
      case 'dialog_submission': {
        const type = JSON.parse(payload.state).type
        switch (type) {
          case INTERACTIVE_MESSAGE_TYPES.TEXT_AREA_POST_RESPONSE:
            await handlePostResponseDialogSubmission(payload)
            break
          default:
        }
      }
        break
      default:
    }

    return { // Acknowledge to Slack that the message was received
      statusCode: HttpStatus.OK
    }
  } catch (err) {
    logger.logFullError(err)
    return slackWebClient.chat.postMessage({
      thread_ts: payload.message_ts,
      channel: payload.channel.id,
      text: 'An error occured. Please try again'
    })
  }
}

/**
 * Opens a dialog when "Post a response" button is clicked
 * @param {Object} payload
 */
async function handlePostResponse (payload) {
  // Get project from DB
  const id = payload.callback_id
  const project = await getProject(id)

  // Check if project is valid
  if (!project) {
    return slackWebClient.chat.postMessage({
      thread_ts: payload.message_ts,
      channel: payload.channel.id,
      text: config.get('CONSTANTS.PROJECT_DOES_NOT_EXIST')
    })
  }

  // Check if project already has a response
  if (!(project.status === config.get('PROJECT_STATUS.LAUNCHED'))) {
    return slackWebClient.chat.postMessage({
      thread_ts: payload.message_ts,
      channel: payload.channel.id,
      text: 'Project already has a response. You cannot respond again'
    })
  }

  // Open a dialog
  await slackWebClient.dialog.open({
    trigger_id: payload.trigger_id,
    dialog: JSON.stringify({
      callback_id: id,
      title: 'Respond to request',
      submit_label: 'Post',
      elements: [{
        label: 'Response',
        name: INTERACTIVE_MESSAGE_TYPES.TEXT_AREA_POST_RESPONSE,
        type: 'textarea',
        hint: 'Respond to project request'
      }],
      state: JSON.stringify({
        type: INTERACTIVE_MESSAGE_TYPES.TEXT_AREA_POST_RESPONSE
      })
    })
  })
}

/**
 * Handles clicking "Post" in the post a response dialog
 * @param {Object} payload
 */
async function handlePostResponseDialogSubmission (payload) {
  // Get project
  const id = payload.callback_id
  const project = await getProject(id)
  // Get response
  const response = payload.submission[INTERACTIVE_MESSAGE_TYPES.TEXT_AREA_POST_RESPONSE].trim()

  // Check if empty
  if (response.length === 0) {
    return slackWebClient.chat.postMessage({
      thread_ts: project.tcSlackThread,
      channel: process.env.CHANNEL,
      text: 'Response cannot be empty'
    })
  }

  // Check if exists
  if (!project) {
    return slackWebClient.chat.postMessage({
      thread_ts: project.tcSlackThread,
      channel: process.env.CHANNEL,
      text: config.get('CONSTANTS.PROJECT_DOES_NOT_EXIST')
    })
  }

  // Forward response to Slack lambda
  try {
    await rp({
      method: 'POST',
      uri: `${process.env.SLACK_LAMBDA_URI}/response`,
      json: true,
      body: {
        projectId: project.id,
        text: `Topcoder user *${payload.user.name}* responded to your request with response, "${response}"`
      }
    })
  } catch (e) {
    logger.logFullError(e)
    // If error, post error to TC Slack
    return slackWebClient.chat.postMessage({
      thread_ts: project.tcSlackThread,
      channel: process.env.CHANNEL,
      text: 'Could not post response to Client Slack. Please try again'
    })
  }

  // Post acknowledgement to TC Slack
  await slackWebClient.chat.postMessage({
    thread_ts: project.tcSlackThread,
    channel: process.env.CHANNEL,
    text: `*Response: * "${response}" was successfully posted`
  })

  // Update project status to responded
  await updateProjectStatus(project.id, config.get('PROJECT_STATUS.RESPONDED'))
}

/**
 * Handle click on Approve button
 * @param {Object} payload
 */
async function handleApprove (payload) {
  const projectId = payload.callback_id
  const project = await getProject(projectId)

  // Check if exists
  if (!project) {
    return slackWebClient.chat.postMessage({
      thread_ts: payload.message_ts,
      channel: payload.channel.id,
      text: config.get('CONSTANTS.PROJECT_DOES_NOT_EXIST')
    })
  }

  // Check if already approved
  if (project.status === 'APPROVED') {
    return slackWebClient.chat.postMessage({
      thread_ts: payload.message_ts,
      channel: payload.channel.id,
      text: 'Project has already been approved'
    })
  }

  // POST to Slack lambda
  await rp({
    method: 'POST',
    uri: `${process.env.SLACK_LAMBDA_URI}/approve`,
    body: {
      projectId
    },
    json: true
  })

  // Post acknowledgement to TC Slack
  await slackWebClient.chat.postMessage({
    thread_ts: payload.message_ts,
    channel: payload.channel.id,
    text: 'Project approved!'
  })

  // Set project status to approved
  await updateProjectStatus(project.id, config.get('PROJECT_STATUS.APPROVED'))
}
