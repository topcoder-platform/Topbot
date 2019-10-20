/**
 * Helper functions to communicate with Dynamodb
 */

const AWS = require('aws-sdk')
const config = require('config')
const tasksSchema = require('../tables/tasks')
let documentClient = null

/**
 * Create tasks table and initialize DocumentClient
 */
async function initialize () {
  AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    endpoint: process.env.DYNAMODB_ENDPOINT
  })

  const dynamodb = new AWS.DynamoDB()
  // Create table if it does not exist already
  const list = await dynamodb.listTables().promise()
  if (!list.TableNames.includes(config.get('DYNAMODB.TASK_TABLE_NAME'))) {
    await dynamodb.createTable(tasksSchema).promise()
  }

  documentClient = new AWS.DynamoDB.DocumentClient()
}

/**
 * Returns an instance of DocumentClient
 */
async function getDocumentClient () {
  if (!documentClient) {
    return initialize()
  }
}

/**
 * Create an item in Dynamodb
 * @param {Object} params
 */
async function put (params) {
  await getDocumentClient()
  return documentClient.put(params).promise()
}

/**
 * Query for item from Dynamodb table
 * @param {Object} params
 */
async function query (params) {
  await getDocumentClient()
  return documentClient.query(params).promise()
}

/**
 * Update an item in Dynamodb table
 * @param {Object} params
 */
async function update (params) {
  await getDocumentClient()
  return documentClient.update(params).promise()
}

module.exports = {
  put,
  query,
  update
}
