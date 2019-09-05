const config = require('config')
const util = require('util')
const logger = require('../common/logger')

module.exports = function (controller) {
  controller.on('channel_join', (bot, message) => {
    // Post welcome message when added to channel
    bot.api.chat.postMessage({channel: message.channel,text: 'I have arrived! I am TopBot. Type in "@topbot help" to see all the commands I understand.'})

    // Add bot to tasks posting channel if not already added
    bot.api.channels.list({}, async (err, res) => {
      if(err) {
        return logger.error(util.inspect(err))
      }
      // Find id of channel to post tasks to
      const channelToJoin = res.channels.find((channel) => (`#${channel.name}` === config.get('CHANNEL_TO_POST_TASKS')))
      // If bot is not a member of that channel, then invite bot to the channel
      await controller.plugins.database.teams.get(message.team, (err,team) => {
        if (err) return logger.error(util.inspect(err)) 
        if(channelToJoin && !channelToJoin.members.includes(team.bot.user_id)) {
          const channelIdToJoin = channelToJoin.id
          try {
            bot.api.channels.invite({
              token: team.bot.app_token,
              channel: channelIdToJoin,
              user: team.bot.user_id
            })
          } catch (err) {
            logger.error(util.inspect(err))
          }
        }
      })
    })
  })
}
