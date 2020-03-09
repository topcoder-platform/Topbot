const logger = require('../../common/logger')

module.exports.handler = logger.traceFunction('help.handler', async (body, slackWebClient) => {
  // Post help mesage
  await slackWebClient.chat.postMessage({
    text: 'Help!',
    channel: body.event.channel,
    thread_ts: body.event.ts,
    blocks: JSON.stringify([{ // The help message block to display for the help command
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'These are the commands I understand'
      }
    }, {
      type: 'divider'
    }, {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '@topbot *request* <description> : Request a project with description'
      }
    }, {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '@topbot *email* <email_id> : Invite a user with email_id to the approved project'
      }
    }, {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '@topbot *help* : Show list of supported commands'
      }
    }
    ])
  })
})
