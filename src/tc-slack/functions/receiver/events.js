const HttpStatus = require('http-status-codes')
const { authenticateSlackRequest } = require('../../common/helper')
const { getSnsClient, getArnForTopic } = require('../../../common/sns')
const logger = require('../../../common/logger')

module.exports.handler = logger.traceFunction('receiver.events.handler', async event => {
  const isValidRequest = authenticateSlackRequest(event, process.env.TC_SLACK_CLIENT_SIGNING_SECRET)

  if (!isValidRequest) {
    return {
      statusCode: HttpStatus.BAD_REQUEST
    }
  }

  const body = JSON.parse(event.body)

  if (body.type === 'url_verification') {
    return {
      statusCode: HttpStatus.OK,
      body: JSON.stringify({
        challenge: body.challenge
      })
    }
  }

  if (body.event && body.event.text) {
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
  }
})

async function publishSnsTopic (data) {
  const params = {
    Message: data,
    TopicArn: getArnForTopic(process.env.TC_SLACK_EVENTS_TOPIC)
  }
  const snsClient = getSnsClient()
  return snsClient.publish(params).promise()
}
