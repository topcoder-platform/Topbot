/**
 * Common helper methods
 */

const crypto = require('crypto')
const { WebClient } = require('@slack/web-api')

/**
 * Returns an instance of the slack web api client
 */
function getSlackWebClient (botToken) {
  return new WebClient(botToken)
}

/**
 * Encrypts a string
 * @param {String} text
 */
function encrypt (text) {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from('p3s6v9y$B&E(H+Mb'), iv)
  let encrypted = cipher.update(text, 'utf8', 'binary')
  encrypted += cipher.final('binary')
  return iv.toString('hex') + ':' + Buffer.from(encrypted, 'binary').toString('hex')
}

/**
 * Decrypts a string
 * @param {String} text
 */
function decrypt (text) {
  const split = text.split(':')
  const iv = Buffer.from(split[0], 'hex')
  const encrypted = Buffer.from(split[1], 'hex')
  const decipher = crypto.createDecipheriv('aes-128-cbc', Buffer.from('p3s6v9y$B&E(H+Mb'), iv)
  let decrypted = decipher.update(encrypted, 'binary', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted.toString('hex')
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
  encrypt,
  decrypt,
  findValueOfKeyInObject,
  authenticateSlackRequest
}
