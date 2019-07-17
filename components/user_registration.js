const util = require('util')
const logger = require('../common/logger')

module.exports = function (controller) {
  /* Handle event caused by a user logging in with oauth */
  controller.on('oauth:success', function (payload) {
    if (!payload.identity.team_id) {
      logger.error('Error: received an oauth response without a team id: %j', payload)
    }
    controller.storage.teams.get(payload.identity.team_id, function (err, team) {
      if (err) {
        logger.error(`Error: could not load team from storage system. Team id = ${payload.identity.team_id}`)
        logger.error(util.inspect(err))
      }

      var new_team = false
      if (!team) {
        team = {
          id: payload.identity.team_id,
          createdBy: payload.identity.user_id,
          url: payload.identity.url,
          name: payload.identity.team
        }
        var new_team = true
      }

      team.bot = {
        token: payload.bot.bot_access_token,
        user_id: payload.bot.bot_user_id,
        createdBy: payload.identity.user_id,
        app_token: payload.access_token
      }

      var testbot = controller.spawn(team.bot)

      testbot.api.auth.test({}, function (err, bot_auth) {
        if (err) {
          logger.error(util.inspect(err))
        } else {
          team.bot.name = bot_auth.user

          // add in info that is expected by Botkit
          testbot.identity = bot_auth

          testbot.identity.id = bot_auth.user_id
          testbot.identity.name = bot_auth.user

          testbot.team_info = team

          controller.storage.teams.save(team, function (err) {
            if (err) {
              logger.error(util.inspect(err))
            } else {
              if (new_team) {
                controller.trigger('onboard', [testbot, team])
              }
            }
          })
        }
      })
    })
  })
}
