/**
 * Handler for POST /launch request from client slack or client teams lambda
 */
const HttpStatus = require('http-status-codes')
const uuid = require('uuid/v4')
const config = require('config')
const schema = require('../common/schema')
const { put } = require('../common/dbHelper')
const { getSlackWebClient } = require('../common/helper')

const slackWebClient = getSlackWebClient()

module.exports.handler = async event => {
  const { error, value } = schema.launchSchema.validate(JSON.parse(event.body))
  if (error) {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      body: JSON.stringify(error)
    }
  }

  try {
    // Create task in TC Slack
    var response = await slackWebClient.chat.postMessage({
      channel: process.env.CHANNEL,
      text: value.description
    })

    /*
    https://api.slack.com/methods/chat.postMessage#channels
    Other errors can be returned in the case where the service is down or other unexpected factors affect processing. Callers should always check the value of the ok params in the response
    */
    if (!response.ok) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        body: JSON.stringify(response.error)
      }
    }

    var task = {
      id: uuid(),
      description: value.description,
      launcher: value.user,
      threadId: response.ts,
      status: config.get('TASK_STATUS.LAUNCHED')
    }

    // Create task in Dynamodb table
    await put({
      TableName: config.get('DYNAMODB.TASK_TABLE_NAME'),
      Item: task
    })
  } catch (err) {
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      body: JSON.stringify(err)
    }
  }

  // Return the created task
  return {
    statusCode: HttpStatus.OK,
    body: JSON.stringify(task)
  }
}
