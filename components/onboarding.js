const util = require('util')
const logger = require('../common/logger')

module.exports = function (controller) {
  // Send welcome message
  controller.on('onboard', async function (bot) {
    let team = bot[1]
    bot = bot[0]
    try {
      bot.startPrivateConversation({ user: team.createdBy }, function (err, convo) {
        if (err) {
          logger.error(util.inspect(err))
        } else {
          convo.say('I am a bot that has just joined your team')
          convo.say('You must now /invite me to a channel so that I can be of use!')
        }
      })
    }
    catch (e) {
      logger.error('Onboarding: User not found')
    }
  })
}
