/**
 * Handles click on Decline button
 */
const rp = require('request-promise')
const config = require('config')
const { getProject, updateProjectStatus } = require('../../common/dbHelper')
const logger = require('../../common/logger')

module.exports.handler = logger.traceFunction('decline.handler', async (body, teamsClient) => {
  // Get project
  const projectId = body.value.projectId
  const project = await getProject(projectId)

  // Check if valid
  if (!project) {
    return teamsClient.conversations.sendToConversation(body.conversation.id, {
      text: config.get('CONSTANTS.PROJECT_DOES_NOT_EXIST'),
      type: 'message'
    })
  }

  // Take action based on current project status
  switch (project.status) {
    case config.get('PROJECT_STATUS.ACCEPTED'): {
      return teamsClient.conversations.sendToConversation(body.conversation.id, {
        text: 'Project has already been accepted. You cannot decline it now',
        type: 'message'
      })
    }
    case config.get('PROJECT_STATUS.DECLINED'): {
      return teamsClient.conversations.sendToConversation(body.conversation.id, {
        text: 'Project has already been declined.',
        type: 'message'
      })
    }
    case config.get('PROJECT_STATUS.APPROVED'): {
      return teamsClient.conversations.sendToConversation(body.conversation.id, {
        text: 'Project has already been approved. You cannot decline it now.',
        type: 'message'
      })
    }
    case config.get('PROJECT_STATUS.RESPONDED'): {
      // Post accepted to TC Central
      await rp({
        method: 'POST',
        uri: `${process.env.LAMBDA_URI}/tc-slack/decline`,
        body: {
          projectId
        },
        json: true
      })

      // Update status of project to DECLINED
      await updateProjectStatus(project.id, config.get('PROJECT_STATUS.DECLINED'))

      // Post acknowledgement to Client Teams
      return teamsClient.conversations.sendToConversation(body.conversation.id, {
        text: 'Project declined.',
        type: 'message'
      })
    }
  }
})
