/**
 * Handles the @topbot help command
 */
const logger = require('../../common/logger')

module.exports.handler = logger.traceFunction('help.handler', async (body, teamsClient) => {
  return teamsClient.conversations.sendToConversation(body.conversation.id, {
    text: 'Topbot supports the following commands\n\n1. `@topbot request <project_description>`: Create a project with project_description\n\n2. `@topbot email <email_id>`: Invite users with email_id to an approved Connect project\n\n3. `@topbot help`: Show supported commands',
    type: 'message'
  })
})
