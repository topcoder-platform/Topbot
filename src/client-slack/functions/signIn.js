/**
 * Displays the sign in page with the Add to Slack button
 */
const HttpStatus = require('http-status-codes')
const logger = require('../../common/logger')

module.exports.handler = logger.traceFunction('signin.handler', async (event) => {
  return {
    statusCode: HttpStatus.OK,
    headers: {
      'Content-Type': 'text/html'
    },
    body: `<html><body><div align="center">${process.env.CLIENT_SLACK_ADD_TO_SLACK_BUTTON}</div></body></html>`
  }
})
