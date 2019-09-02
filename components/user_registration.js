const util = require('util')
const logger = require('../common/logger')

module.exports = function (controller) {
  /* Handle event caused by a user logging in with oauth */
  controller.on('oauth:success', function (payload) {
    payload = payload[0]
    if (!payload.team_id) {
      logger.error('Error: received an oauth response without a team id: %j', payload)
    }
    controller.plugins.database.teams.get(payload.team_id, function (err, team) {
      if (err) {
        logger.error(`Error: could not load team from storage system. Team id = ${payload.team_id}`)
        logger.error(util.inspect(err))
      }
      
      var new_team = false
      if (!team) {
        team = {
          id: payload.team_id,
          createdBy: payload.user_id,
          name: payload.team_name
        }
        new_team = true
      }

      team.bot = {
        token: payload.bot.bot_access_token,
        user_id: payload.bot.bot_user_id,
        createdBy: payload.user_id,
        app_token: payload.access_token
      }
      // Save user to database and send welcome message if new
      controller.plugins.database.teams.save(team, async function (err) {
        if (err) {
          logger.error(util.inspect(err))
        } else {
          if (new_team) {
            let bot = await controller.spawn(team.id)
            controller.trigger('onboard', [bot, team])
          }
        }
      })
    })
  })
}
