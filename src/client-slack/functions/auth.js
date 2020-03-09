/**
 * Handles the oauth redirect command
 */
const rp = require('request-promise')
const HttpStatus = require('http-status-codes')
const config = require('config')
const logger = require('../../common/logger')
const { put, getClientByTeamId, update } = require('../../common/dbHelper')
const { encrypt, findValueOfKeyInObject } = require('../common/helper')

module.exports.handler = logger.traceFunction('auth.handler', async (event) => {
  const redirectUri = `https://${findValueOfKeyInObject(event.headers, 'host')}/client-slack/auth/redirect`
  logger.debug('redirectUri:' + redirectUri)
  const authCode = event.queryStringParameters.code
  try {
    const response = JSON.parse(await rp({
      uri: `https://slack.com/api/oauth.access?code=${authCode}&client_id=${process.env.CLIENT_SLACK_CLIENT_ID}&client_secret=${process.env.CLIENT_SLACK_CLIENT_SECRET}&redirect_uri=${redirectUri}`,
      method: 'GET'
    }))

    if (!response.ok) {
      logger.logFullError(response)
      return {
        statusCode: HttpStatus.UNAUTHORIZED,
        body: `Could not install app to workspace. Please try again.\nError: ${response.error}`
      }
    }

    // Check if client team exists
    const existingClient = await getClientByTeamId(response.team_id)
    if (existingClient) {
      await update({
        TableName: config.get('DYNAMODB.SLACK_CLIENTS_TABLE_NAME'),
        Key: {
          teamId: response.team_id
        },
        UpdateExpression: 'set #ui = :u, #ut = :uat, #bt = :bat',
        ExpressionAttributeValues: {
          ':u': response.user_id,
          ':uat': encrypt(response.access_token),
          ':bat': encrypt(response.bot.bot_access_token)
        },
        ExpressionAttributeNames: {
          '#ui': 'userId',
          '#ut': 'userToken',
          '#bt': 'botToken'
        }
      })
    } else {
      // Create new team
      const client = {
        teamId: response.team_id,
        userId: response.user_id,
        userToken: encrypt(response.access_token),
        botToken: encrypt(response.bot.bot_access_token)
      }

      await put({
        TableName: config.get('DYNAMODB.SLACK_CLIENTS_TABLE_NAME'),
        Item: client
      })
    }

    return {
      statusCode: HttpStatus.OK,
      body: 'Successfully added topbot to workspace'
    }
  } catch (e) {
    logger.logFullError(e)
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      body: 'Something went wrong. Please try again'
    }
  }
})
