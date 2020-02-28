const querystring = require('querystring')
const HttpStatus = require('http-status-codes')
const { authenticateSlackRequest, getSnsClient, getArnForTopic } = require('../../common/helper')
const logger = require('../../common/logger')

module.exports.handler = logger.traceFunction('receiver.interactive.handler', async event => {
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

  try {
    const response = await publishSnsTopic(event.body)
    console.log('Response : ', response)
    return {
      statusCode: HttpStatus.OK
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

  async function publishSnsTopic (data) {
    const params = {
      Message: data,
      TopicArn: getArnForTopic(process.env.TC_SLACK_INTERACTIVE_TOPIC)
    }
    const snsClient = getSnsClient()
    return snsClient.publish(params).promise()
  }
})
