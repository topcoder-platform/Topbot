const querystring = require('querystring')
const HttpStatus = require('http-status-codes')
const { authenticateSlackRequest } = require('../../common/helper')
const { getSnsClient, getArnForTopic } = require('../../../common/sns')
const logger = require('../../../common/logger')

module.exports.handler = logger.traceFunction('receiver.interactive.handler', async event => {
  const body = querystring.decode(event.body)
  if (body.ssl_check || !body.payload) {
    return { // Events received when interactive components are enabled for the first time
      statusCode: HttpStatus.OK
    }
  }

  const isValidRequest = authenticateSlackRequest(event, process.env.CLIENT_SLACK_CLIENT_SIGNING_SECRET)

  if (!isValidRequest) {
    return {
      statusCode: HttpStatus.BAD_REQUEST
    }
  }

  try {
    const response = await publishSnsTopic(event.body)
    console.log('Response : ', response)
    return {
      statusCode: HttpStatus.OK,
      body: JSON.stringify({
        challenge: body.challenge // Event subscription handler must respond with the challenge value
      })
    }
  } catch (err) {
    logger.logFullError(err)
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Couldn\'t published the message due to an internal error.'
      })
    }
  }
})

async function publishSnsTopic (data) {
  const params = {
    Message: data,
    TopicArn: getArnForTopic(process.env.CLIENT_SLACK_EVENTS_INTERACTIVE)
  }
  const snsClient = getSnsClient()
  return snsClient.publish(params).promise()
}
