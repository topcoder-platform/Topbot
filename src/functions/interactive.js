/**
 * Handler for iteractions with interactive components in TC Slack
 */
const querystring = require('querystring')
const rp = require('request-promise')
const config = require('config')
const { getSlackWebClient, getClientLambdaUri } = require('../common/helper')
const { getProject, updateProjectStatus, updateProjectWithConnectAndApprove } = require('../common/dbHelper')
const logger = require('../common/logger')

const INTERACTIVE_MESSAGE_TYPES = config.get('INTERACTIVE_MESSAGE_TYPES')
const slackWebClient = getSlackWebClient()

module.exports.handler = async event => {
  try {
    if (event && event.Records && event.Records[0] && event.Records[0].Sns) {
      // event.Records[0].Sns.Message is a URL encoded string
      var payload = JSON.parse(querystring.decode(event.Records[0].Sns.Message).payload)

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
            case INTERACTIVE_MESSAGE_TYPES.TEXT_AREA_PROJECT_NAME:
              await handleProjectNameDialogSubmission(payload)
              break
            default:
          }
        }
          break
        default:
      }
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

  // Forward response to Client lambda
  try {
    await rp({
      method: 'POST',
      uri: `${getClientLambdaUri(project.platform)}/response`,
      json: true,
      body: {
        projectId: project.id,
        text: `Topcoder user *${payload.user.name}* responded to your request with response, "${response}"`
      }
    })
  } catch (e) {
    logger.logFullError(e)
    // If error, post error to TC Slack
    // TODO update error message depending upon platform slack/teams
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
 * Handler for project name dialog submission
 * @param {Object} payload
 */
async function handleProjectNameDialogSubmission (payload) {
  // Get project
  const id = payload.callback_id
  const project = await getProject(id)
  // Get project name
  const projectName = payload.submission[INTERACTIVE_MESSAGE_TYPES.TEXT_AREA_PROJECT_NAME].trim()

  // Check if empty
  if (projectName.length === 0) {
    return slackWebClient.chat.postMessage({
      thread_ts: project.tcSlackThread,
      channel: process.env.CHANNEL,
      text: 'Project name cannot be empty'
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

  try {
    // Create project in connect
    const projectBody = {
      name: projectName,
      description: project.description,
      type: config.get('CONNECT.PROJECT_TYPE'),
      templateId: config.get('CONNECT.CONNECT_TEMPLATE_ID'),
      version: config.get('CONNECT.CONNECT_VERSION'),
      estimation: [],
      attachments: [],
      details: config.get('CONNECT.PROJECT_DETAILS_DEV_QA')
    }
    var connectResponse = await rp({
      uri: config.get('CONNECT.CREATE_PROJECT'),
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.CONNECT_BEARER_TOKEN}`
      },
      body: projectBody,
      json: true
    })
  } catch (e) {
    logger.logFullError(e)
    return slackWebClient.chat.postMessage({
      thread_ts: project.tcSlackThread,
      channel: process.env.CHANNEL,
      text: `Connect project could not be created. ${(((connectResponse || {}).result || {}).content || {}).message || ''}`
    })
  }

  // Check if valida id is returned
  const connectProjectId = (connectResponse || {}).id
  if (!connectProjectId) {
    logger.logFullError(connectResponse)
    return slackWebClient.chat.postMessage({
      thread_ts: project.tcSlackThread,
      channel: process.env.CHANNEL,
      text: 'Connect project could not be created. Project id returned was empty'
    })
  }

  await updateProjectWithConnectAndApprove(project.id, projectName, connectProjectId)

  await slackWebClient.chat.postMessage({
    thread_ts: project.tcSlackThread,
    channel: process.env.CHANNEL,
    text: 'The project was created successfully'
  })

  // Post approved to client
  await rp({
    method: 'POST',
    uri: `${getClientLambdaUri(project.platform)}/approve`,
    body: {
      projectId: project.id
    },
    json: true
  })
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

  // Open a dialog to get project name
  await slackWebClient.dialog.open({
    trigger_id: payload.trigger_id,
    dialog: JSON.stringify({
      callback_id: projectId,
      title: 'Enter a project name',
      submit_label: 'Post',
      elements: [{
        label: 'Project name',
        name: INTERACTIVE_MESSAGE_TYPES.TEXT_AREA_PROJECT_NAME,
        type: 'textarea',
        hint: 'Provide a project name'
      }],
      state: JSON.stringify({
        type: INTERACTIVE_MESSAGE_TYPES.TEXT_AREA_PROJECT_NAME
      })
    })
  })
}
