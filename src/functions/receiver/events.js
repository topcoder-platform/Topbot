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
      console.log('err : ', err)
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Couldn\'t published the message due to an internal error.'
        })
      }
    }
  }
}

async function publishSnsTopic (data) {
  const params = {
    Message: data,
    TopicArn: getArnForTopic(process.env.TC_SLACK_EVENTS_TOPIC)
  }
  const snsClient = getSnsClient()
  return snsClient.publish(params).promise()
}
