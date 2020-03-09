/**
 * Handles the @topbot request command
 */
const rp = require('request-promise')
const config = require('config')
const { getProjectByClientSlackThread } = require('../../common/dbHelper')
const logger = require('../../common/logger')

module.exports.handler = logger.traceFunction('request.handler', async (body, slackWebClient) => {
  const description = body.event.text.split(' ').slice(2).join(' ').trim() // Remove the first two words from text like "<user> request description"

  // Check for empty description
  if (description.length === 0) {
    return slackWebClient.chat.postMessage({
      thread_ts: body.event.ts,
      channel: body.event.channel,
      text: 'Project description cannot be empty. Please try again with a valid project description'
    })
  }

  // Check if new project request is inside an existing project thread
  if (body.event.thread_ts) {
    const project = await getProjectByClientSlackThread(body.event.thread_ts)

    if (project) {
      return slackWebClient.chat.postMessage({
        thread_ts: body.event.ts,
        channel: body.event.channel,
        text: 'A project already exists inside this thread. Please use a new thread to create your project'
      })
    }
  }

  // Get name of the requester. The event only contains requester id
  const requester = (await slackWebClient.users.info({
    user: body.event.user
  })).user.real_name

  // POST to TC central
  await rp({
    method: 'POST',
    uri: `${process.env.LAMBDA_URI}/tc-slack/request`,
    body: {
      description,
      requester,
      clientSlackThread: body.event.ts,
      clientSlackChannel: body.event.channel,
      slackTeam: body.event.team,
      platform: config.get('PLATFORMS.SLACK')
    },
    json: true
  })

  // Post acknowledgement to Client slack
  return slackWebClient.chat.postMessage({
    thread_ts: body.event.ts,
    channel: body.event.channel,
    text: 'Request posted to Topcoder'
  })
})
