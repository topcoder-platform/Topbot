const { MicrosoftAppCredentials, ConnectorClient } = require('botframework-connector')
const credentials = new MicrosoftAppCredentials(process.env.CLIENT_TEAMS_APP_ID, process.env.CLIENT_TEAMS_APP_PASSWORD)

const { SimpleCredentialProvider, JwtTokenValidation } = require('botframework-connector')
const credentialsProvider = new SimpleCredentialProvider(process.env.CLIENT_TEAMS_APP_ID, process.env.CLIENT_TEAMS_APP_PASSWORD)

const logger = require('../../common/logger')

/**
 * Validates incoming request from teams
 * @param {Object} body
 * @param {String} authHeader
 */
async function authenticateTeamsRequest (body, authHeader) {
  try {
    const identity = await JwtTokenValidation.authenticateRequest(body, authHeader, credentialsProvider, '')
    return identity.isAuthenticated
  } catch (e) {
    logger.logFullError(e)
    return false
  }
}

/**
 * Returns an instance of the slack web api client
 */
function getTeamsClient (serviceUrl) {
  MicrosoftAppCredentials.trustServiceUrl(serviceUrl)
  return new ConnectorClient(credentials, {
    baseUri: serviceUrl
  })
}

module.exports = {
  getTeamsClient,
  authenticateTeamsRequest
}
