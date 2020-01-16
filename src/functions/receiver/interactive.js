const querystring = require('querystring')
const HttpStatus = require('http-status-codes')
const { authenticateSlackRequest, getSnsClient, getArnForTopic } = require('../../common/helper')

module.exports.handler = async event => {
  const body = querystring.decode(event.body)
  if (body.ssl_check || !body.payload) {
    return { // Events received when interactive components are enabled for the first time
      statusCode: HttpStatus.OK
    }
  }

  const isValidRequest = authenticateSlackRequest(event, process.env.CLIENT_SIGNING_SECRET)

  if (!isValidRequest) {
    return {
      statusCode: HttpStatus.BAD_REQUEST
    }
  }

  const snsClient = getSnsClient()
  const arn = getArnForTopic(process.env.TC_SLACK_INTERACTIVE_TOPIC)
  snsClient.publish({
    Message: event.body,
    TopicArn: arn
  }).send()

  return {
    statusCode: HttpStatus.OK
  }
}
