const util = require('util')
const logger = require('../common/logger')

module.exports = function (controller) {
  controller.on('onboard', function (bot) {
    bot.startPrivateConversation({ user: bot.config.createdBy }, function (err, convo) {
      if (err) {
        logger.error(util.inspect(err))
      } else {
        convo.say('I am a bot that has just joined your team')
        convo.say('You must now /invite me to a channel so that I can be of use!')
      }
    })
  })
}
