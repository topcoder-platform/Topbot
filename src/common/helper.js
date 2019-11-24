/**
 * Common helper methods
 */

const crypto = require('crypto')
const { WebClient } = require('@slack/web-api')

const slackWebClient = null

/**
 * Returns an instance of the slack web api client
 */
function getSlackWebClient () {
  if (slackWebClient) {
    return slackWebClient
  }
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
 * Verify that the request is from slack
 * Documentation: https://api.slack.com/docs/verifying-requests-from-slack
 * Tutorial for node: https://medium.com/@rajat_sriv/verifying-requests-from-slack-using-node-js-69a8b771b704
 * @param {Object} event
 */
function authenticateRequest (event) {
  const body = event.body
  const slackSignature = event.headers['X-Slack-Signature']
  const timestamp = event.headers['X-Slack-Request-Timestamp']
  const sigBasestring = `v0:${timestamp}:${body}`
  const slackSigningSecret = process.env.CLIENT_SIGNING_SECRET
  const receivedSignature = 'v0=' + crypto.createHmac('sha256', slackSigningSecret).update(sigBasestring, 'utf8').digest('hex')
  return crypto.timingSafeEqual(Buffer.from(receivedSignature), Buffer.from(slackSignature))
}

module.exports = {
  getSlackWebClient,
  reflect,
  authenticateRequest
}
