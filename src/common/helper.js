/**
 * Common helper methods
 */

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

module.exports = {
  getSlackWebClient,
  reflect
}
