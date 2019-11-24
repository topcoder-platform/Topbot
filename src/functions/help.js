/**
 * Handler for help command
 */

const { getSlackWebClient } = require('../common/helper')
const slackWebClient = getSlackWebClient()

module.exports.handler = async event => {
  const body = JSON.parse(event.body)

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
        text: '@topbot *help* : Show list of supported commands'
      }
    }
    ])
  })
}
