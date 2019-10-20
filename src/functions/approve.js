/**
 * Handler for approve command
 */

const config = require('config')
const { getSlackWebClient } = require('../common/helper')
const { query, update } = require('../common/dbHelper')

const slackWebClient = getSlackWebClient()

module.exports.handler = async event => {
  const body = JSON.parse(event.body)

  // Get task
  const task = (await query({
    TableName: config.get('DYNAMODB.TASK_TABLE_NAME'),
    IndexName: config.get('DYNAMODB.CHANNEL_INDEX'),
    KeyConditionExpression: 'channel = :c',
    ExpressionAttributeValues: {
      ':c': body.event.channel
    }
  })).Items[0]

  // Task does not exist
  if (!task) {
    return slackWebClient.chat.postMessage({
      thread_ts: body.event.ts,
      channel: body.event.channel,
      text: 'You can only approve tasks in the channel created for it after it is accepted'
    })
  }

  // Check if task creator is not the one who is approving the task
  if (task.launcher !== body.event.user) {
    return slackWebClient.chat.postMessage({
      thread_ts: body.event.ts,
      channel: body.event.channel,
      text: 'Only task launchers can approve a task'
    })
  }

  // Check if task is already APPROVED
  if (task.status === config.get('TASK_STATUS.APPROVED')) {
    return slackWebClient.chat.postMessage({
      thread_ts: body.event.ts,
      channel: body.event.channel,
      text: 'Task has already been approved'
    })
  }

  // Update task status
  await update({
    TableName: config.get('DYNAMODB.TASK_TABLE_NAME'),
    Key: {
      id: task.id
    },
    UpdateExpression: 'set #st = :s',
    ExpressionAttributeValues: {
      ':s': config.get('TASK_STATUS.APPROVED')
    },
    ExpressionAttributeNames: {
      '#st': 'status'
    }
  })

  // Post acknowledgement back to TC slack
  return slackWebClient.chat.postMessage({
    thread_ts: body.event.ts,
    channel: body.event.channel,
    text: 'Great! We\'ll get your work done'
  })
}
