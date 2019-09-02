const {Router} = require('express')
const config = require('config')
const logger = require('../../common/logger')
module.exports = function (controller) {
  const handler = {
    login: function (req, res) {
      res.redirect(controller.adapter.getInstallLink())
    },

    oauth: async function (req, res) {
      try {
        const auth = await controller.adapter.validateOauthCode(req.query.code)
        controller.trigger('oauth:success', [auth])
        res.cookie('team_id', auth.team_id)
        res.cookie('bot_user_id', auth.bot.bot_user_id)
        res.redirect(config.get('API_PREFIX') + '/login_success.html')
      }
      catch (e) {
        logger.error('Could not valide oauth code')
        res.redirect(config.get('API_PREFIX') + '/login_error.html')
      }
    }
  }

  const route = new Router()
  // Create a /login link
  // This link will send user's off to Slack to authorize the app
  route.get(config.get('API_PREFIX') + '/login', handler.login)

  // Create a /oauth link
  // This is the link that receives the postback from Slack's oauth system
  // So in Slack's config, under oauth redirect urls,
  // your value should be https://<my custom domain or IP>/oauth
  route.get(config.get('API_PREFIX') + '/oauth', handler.oauth)

  return route
}
