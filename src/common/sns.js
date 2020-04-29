const AWS = require('aws-sdk')
/**
 * Returns an instance of the sns client
 */
function getSnsClient () {
  const snsConfig = {
    region: process.env.SNS_REGION
  }
  // use endpoint value when doing local setup
  if (process.env.IS_OFFLINE) {
    snsConfig.endpoint = process.env.SNS_ENDPOINT
  }
  return new AWS.SNS(snsConfig)
}

/**
 * Creates an arn from topic name
 * @param {String} topic
 */
function getArnForTopic (topic) {
  return `arn:aws:sns:${process.env.SNS_REGION}:${process.env.SNS_ACCOUNT_ID}:${topic}`
}

module.exports = {
  getSnsClient,
  getArnForTopic
}
