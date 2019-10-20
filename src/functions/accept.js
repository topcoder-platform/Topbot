/**
 * Handler for accept command
 */

const config = require('config')
const { getSlackWebClient, reflect } = require('../common/helper')
const { query, update } = require('../common/dbHelper')

const slackWebClient = getSlackWebClient()

module.exports.handler = async event => {
  const body = JSON.parse(event.body)

  // Trying to accept outside of a thread
  if (!body.event.thread_ts) {
    return slackWebClient.chat.postMessage({
      thread_ts: body.event.ts,
      channel: body.event.channel,
      text: 'Please reply to the launched task in a thread'
    })
  }

  // Get task
  const task = (await query({
    TableName: config.get('DYNAMODB.TASK_TABLE_NAME'),
    IndexName: config.get('DYNAMODB.THREADID_INDEX'),
    KeyConditionExpression: 'threadId = :threadIdVal',
    ExpressionAttributeValues: {
      ':threadIdVal': body.event.thread_ts
    }
  })).Items[0]

  // Task does not exist
  if (!task) {
    return slackWebClient.chat.postMessage({
      thread_ts: body.event.ts,
      channel: body.event.channel,
      text: 'Task does not exist. You can only accept tasks by replying to the launched task\'s message'
    })
  }

  // Check if task creator is the one accepting the task
  if (task.launcher === body.event.user) {
    return slackWebClient.chat.postMessage({
      thread_ts: body.event.ts,
      channel: body.event.channel,
      text: 'You can not accept a task which you\'ve launched'
    })
  }

  // Check if task is already accepted or approved
  if (task.status !== config.get('TASK_STATUS.LAUNCHED')) {
    return slackWebClient.chat.postMessage({
      thread_ts: body.event.ts,
      channel: body.event.channel,
      text: 'Task has already been accepted'
    })
  }

  // Create a new channel
  const channel = (await slackWebClient.channels.create({
    token: process.env.ADMIN_USER_TOKEN,
    name: `${task.description.substr(0, 15)}__${task.id.substr(0, 4)}`
  })).channel

  // Invite user who launched the task, user who accepted the task and the bot user
  const channelMembers = [task.launcher, body.event.user, body.authed_users[0]]
  const addMembers = channelMembers.map((channelMember) => slackWebClient.channels.invite({
    token: process.env.ADMIN_USER_TOKEN,
    channel: channel.id,
    user: channelMember
  }))
  await Promise.all(addMembers.map(reflect)) // Add other members even if one or more member invites fail

  // Update task
  await update({
    TableName: config.get('DYNAMODB.TASK_TABLE_NAME'),
    Key: {
      id: task.id
    },
    UpdateExpression: 'set #st = :s, channel = :c, acceptedBy = :a',
    ExpressionAttributeValues: {
      ':s': config.get('TASK_STATUS.ACCEPTED'),
      ':c': channel.id,
      ':a': body.event.user
    },
    ExpressionAttributeNames: {
      '#st': 'status'
    }
  })
}
