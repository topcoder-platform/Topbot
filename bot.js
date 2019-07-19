global.Promise = require('bluebird')
const env = require('node-env-file')
const Botkit = require('botkit')
const config = require('config')


env(__dirname + '/.env')

if (!process.env.clientId || !process.env.clientSecret || !process.env.MONGO_URI || !process.env.clientSigningSecret) {
  usage_tip()
  process.exit(1)
}

const bot_options = {
  clientId: process.env.clientId,
  clientSecret: process.env.clientSecret,
  clientSigningSecret: process.env.clientSigningSecret,
  scopes: ['bot', 'chat:write:bot']
}

const mongoStorage = require('botkit-storage-mongo')({
  mongoUri: process.env.MONGO_URI,
  tables: ['tasks']
})
bot_options.storage = mongoStorage
const controller = Botkit.slackbot(bot_options)
controller.startTicking()
// Set up an Express-powered webserver to expose oauth and webhook endpoints
const webserver = require(__dirname + '/components/express_webserver.js')(controller)

webserver.get(config.get('API_PREFIX') + '/health', function (req, res) {
  res.end(200);
});

webserver.get(config.get('API_PREFIX') + '/', function (req, res) {
  res.render('index', {
    domain: req.get('host'),
    protocol: req.protocol,
    glitch_domain: process.env.PROJECT_DOMAIN,
    layout: 'layouts/default'
  })
})

// Set up a simple storage backend for keeping a record of customers
// who sign up for the app via the oauth
require(__dirname + '/components/user_registration.js')(controller)

// Send an onboarding message when a new team joins
require(__dirname + '/components/onboarding.js')(controller)

var normalizedPath = require('path').join(__dirname, 'skills')
require('fs').readdirSync(normalizedPath).forEach(function (file) {
  require('./skills/' + file)(controller)
})

function usage_tip() {
  console.log('~~~~~~~~~~')
  console.log('Botkit Starter Kit')
  console.log('Execute your bot application like this:')
  console.log('clientId=<MY SLACK CLIENT ID> clientSecret=<MY CLIENT SECRET> PORT=3000 MONGO_URI=<MONGODB URI> clientSigningSecret=<CLIENT SIGNING SECRET> node bot.js')
  console.log('Get Slack app credentials here: https://api.slack.com/apps')
  console.log('~~~~~~~~~~')
}
