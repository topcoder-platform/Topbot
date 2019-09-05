const crypto = require('crypto')
const config = require('config')
const {Router} = require('express')
module.exports = function (controller) {
  const route = new Router()
  route.post(config.get('API_PREFIX') + '/slack/receive', async (req, res) => {
    // Verify that the request is from slack
    // Documentation: https://api.slack.com/docs/verifying-requests-from-slack
    // Tutorial for node: https://medium.com/@rajat_sriv/verifying-requests-from-slack-using-node-js-69a8b771b704
    const slackSignature = req.headers['x-slack-signature']
    const body = req.rawBody
    const timestamp = req.headers['x-slack-request-timestamp']
    const sigBasestring = `v0:${timestamp}:${body}`
    const slackSigningSecret = process.env.clientSigningSecret
    const receivedSignature = 'v0=' + crypto.createHmac('sha256', slackSigningSecret).update(sigBasestring, 'utf8').digest('hex')
    if(crypto.timingSafeEqual(Buffer.from(receivedSignature), Buffer.from(slackSignature))) {
      // respond to Slack that the webhook has been received.
      res.status(200)
      // Now, pass the webhook into controller to be processed
      await controller.adapter.processActivity(req, res,async (context) => {
        if (context) {
          if (context._activity.channelData.type === 'interactive_message') context._activity.channelData.botkitEventType = 'interactive_message'
          await controller.handleTurn(context)
        }
      })
      return
    }
    
    return res.status(400).send('Verification failed')
  })
  return route
}
