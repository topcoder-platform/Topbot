const HttpStatus = require('http-status-codes')
const { authenticateSlackRequest, getSnsClient, getArnForTopic } = require('../../common/helper')

module.exports.handler = async event => {
  const isValidRequest = authenticateSlackRequest(event, process.env.CLIENT_SIGNING_SECRET)

  if (!isValidRequest) {
    return {
      statusCode: HttpStatus.BAD_REQUEST
    }
  }

  const body = JSON.parse(event.body)

  if (body.event && body.event.text) {
    const snsClient = getSnsClient()
    const arn = getArnForTopic(process.env.TC_SLACK_EVENTS_TOPIC)
    snsClient.publish({
      Message: event.body,
      TopicArn: arn
    }).send()
  }

  return {
    statusCode: HttpStatus.OK,
    body: JSON.stringify({
      challenge: body.challenge // Event subscription handler must respond with the challenge value
    })
  }
}
