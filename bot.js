global.Promise = require('bluebird')
const env = require('node-env-file')
const {Botkit}= require('botkit')
const config = require('config')
const { SlackAdapter, SlackMessageTypeMiddleware, SlackEventMiddleware } = require('botbuilder-adapter-slack');
const logger = require('./common/logger')
var express = require('express')
var hbs = require('express-hbs')

env(__dirname + '/.env')

if (!process.env.clientId || !process.env.clientSecret || !process.env.MONGO_URI || !process.env.clientSigningSecret) {
  usage_tip()
  process.exit(1)
}
const mongoStorage = require('botkit-storage-mongo')({
  mongoUri: process.env.MONGO_URI,
  tables: ['tasks']
})
// Create adapter for slack with all required variables
const adapter = new SlackAdapter({
  clientId: process.env.clientId,
  clientSecret: process.env.clientSecret,
  clientSigningSecret: process.env.clientSigningSecret,
  scopes: ['bot', 'chat:write:bot', 'channels:write'],
  redirectUri: process.env.uri + config.get('API_PREFIX') + '/oauth',
  getTokenForTeam: async (teamId) => { // Get token for team
    let token = await mongoStorage.teams.get(teamId, function (err, team) {
      if (err) return logger.error('Team not found in databsae', teamId)
      return team
    })
    if (!token || !token.bot.token) return 
    return token.bot.token
  },
  getBotUserByTeam: async (teamId) => { // Get bot user for team
    let token = await mongoStorage.teams.get(teamId, function (err, team) {
      if (err) return logger.error('Team not found in databsae', teamId)
      return team
    })
    if (!token || !token.bot.user_id) return 
    return token.bot.user_id
  }
})
// Use SlackEventMiddleware to emit events that match their original Slack event types.
adapter.use(new SlackEventMiddleware());

// Use SlackMessageType middleware to further classify messages as direct_message, direct_mention, or mention
adapter.use(new SlackMessageTypeMiddleware());

const controller = new Botkit({
  adapter,
  webhook_uri: config.get('API_PREFIX') + '/slack/'
})
// Add mongo database as controller's extension
controller.addPluginExtension('database', mongoStorage)
// set up handlebars ready for tabs
controller.webserver.engine('hbs', hbs.express4({ partialsDir: __dirname + '/views/partials' }))
controller.webserver.set('view engine', 'hbs')
controller.webserver.set('views', __dirname + '/views/')
controller.webserver.use(config.get('API_PREFIX'), express.static('public'))
// Set up health check and root route
controller.webserver.get(config.get('API_PREFIX') + '/health', function (req, res) {
  res.json({ok:true});
});

controller.webserver.get(config.get('API_PREFIX') + '/', function (req, res) {
  res.render('index', {
    domain: req.get('host'),
    protocol: req.protocol,
    glitch_domain: process.env.PROJECT_DOMAIN,
    layout: 'layouts/default'
  })
})
// import all the pre-defined routes that are present in /components/routes
var normalizedPath = require('path').join(__dirname, 'components', 'routes')
require('fs').readdirSync(normalizedPath).forEach(function (file) {
  controller.webserver.use(require('./components/routes/' + file)(controller))
})
// Set up a simple storage backend for keeping a record of customers
// who sign up for the app via the oauth
require(__dirname + '/components/user_registration.js')(controller)

// Send an onboarding message when a new team joins
require(__dirname + '/components/onboarding.js')(controller)

var normalizedPath = require('path').join(__dirname, 'skills')
// When controller is ready, load all slack's skills
controller.ready(() => {
  controller.loadModules(__dirname + '/skills')
})

function usage_tip() {
  console.log('~~~~~~~~~~')
  console.log('Botkit Starter Kit')
  console.log('Execute your bot application like this:')
  console.log('clientId=<MY SLACK CLIENT ID> clientSecret=<MY CLIENT SECRET> PORT=3000 MONGO_URI=<MONGODB URI> clientSigningSecret=<CLIENT SIGNING SECRET> node bot.js')
  console.log('Get Slack app credentials here: https://api.slack.com/apps')
  console.log('~~~~~~~~~~')
}
