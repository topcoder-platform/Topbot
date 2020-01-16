/**
 * Common helper methods
 */

const { WebClient } = require('@slack/web-api')
const config = require('config')
const crypto = require('crypto')
const AWS = require('aws-sdk')

/**
 * Returns an instance of the slack web api client
 */
function getSlackWebClient () {
  return new WebClient(process.env.BOT_TOKEN)
}

/**
 * Returns a promise that is always successful when this promise is settled
 * @param {Promise} promise
 */
function reflect (promise) {
  return promise.then(
    function (v) { return { v: v, status: 'fulfilled' } },
    function (e) { return { e: e, status: 'rejected' } }
  )
}

/**
 * Returns base URI for each platform
 * @param {String} platform
 */
function getClientLambdaUri (platform) {
  switch (platform) {
    case config.get('PLATFORMS.SLACK'):
      return process.env.SLACK_LAMBDA_URI
    case config.get('PLATFORMS.TEAMS'):
      return process.env.TEAMS_LAMBDA_URI
  }
}

/**
 * Returns an instance of the sns client
 */
function getSnsClient () {
  return new AWS.SNS({
    endpoint: process.env.SNS_ENDPOINT,
    region: process.env.SNS_REGION
  })
}

/**
 * Creates an arn from topic name
 * @param {String} topic 
 */
function getArnForTopic (topic) {
  return `arn:aws:sns:${process.env.SNS_REGION}:${process.env.SNS_ACCOUNT_ID}:${topic}`
}

/**
 * Verify that the request is from slack
 * Documentation: https://api.slack.com/docs/verifying-requests-from-slack
 * Tutorial for node: https://medium.com/@rajat_sriv/verifying-requests-from-slack-using-node-js-69a8b771b704
 * @param {Object} event
 */
function authenticateSlackRequest (event, slackSigningSecret) {
  const body = event.body
  // Case insensitive search of required header values
  const slackSignature = findValueOfKeyInObject(event.headers, 'x-slack-signature')
  const timestamp = findValueOfKeyInObject(event.headers, 'x-slack-request-timestamp')

  const sigBasestring = `v0:${timestamp}:${body}`
  const receivedSignature = 'v0=' + crypto.createHmac('sha256', slackSigningSecret).update(sigBasestring, 'utf8').digest('hex')

  return crypto.timingSafeEqual(Buffer.from(receivedSignature), Buffer.from(slackSignature))
}

/**
 * Finds the value of a key by performing case insensitive search
 * @param {Object} object
 */
function findValueOfKeyInObject (object, keyToFind) {
  return object[Object.keys(object).find(key => key.toLowerCase() === keyToFind.toLowerCase())]
}

module.exports = {
  getSlackWebClient,
  reflect,
  getClientLambdaUri,
  getSnsClient,
  getArnForTopic,
  authenticateSlackRequest
}
