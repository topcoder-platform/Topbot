const config = require('config')
const util = require('util')
const logger = require('../common/logger')

module.exports = function (controller) {
  controller.on('bot_channel_join', (bot, message) => {
    // Post welcome message when added to channel
    bot.reply(message, 'I have arrived! I am TopBot. Type in "@topbot help" to see all the commands I understand.')

    // Add bot to tasks posting channel if not already added
    bot.api.channels.list({}, async (err, res) => {
      if(err) {
        return logger.error(util.inspect(err))
      }
      // Find id of channel to post tasks to
      const channelToJoin = res.channels.find((channel) => (`#${channel.name}` === config.get('CHANNEL_TO_POST_TASKS')))
      // If bot is not a member of that channel, then invite bot to the channel
      if(channelToJoin && !channelToJoin.members.includes(bot.identity.id)) {
        const channelIdToJoin = channelToJoin.id
        const inviteChannel = Promise.promisify(bot.api.channels.invite)
        try {
          await inviteChannel({
            token: bot.config.bot.app_token,
            channel: channelIdToJoin,
            user: bot.identity.id
          })
        } catch (err) {
          logger.error(util.inspect(err))
        }
      }
    })
  })
}
