/**
 * Helper functions to communicate with Dynamodb
 */

const AWS = require('aws-sdk')
const config = require('config')
const logger = require('./logger')
const projectsSchema = require('../tables/projects')

let documentClient = null

/**
 * Create tasks table and initialize DocumentClient
 */
async function initialize () {
  AWS.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    endpoint: process.env.DYNAMODB_ENDPOINT
  })

  const dynamodb = new AWS.DynamoDB()

  const projectsTable = config.get('DYNAMODB.PROJECT_TABLE_NAME')
  await dynamodb.createTable(projectsSchema).promise().catch((err) => {
    if (err.code === 'ResourceInUseException') {
      logger.warn(`Table already exists: ${projectsTable}`)
    } else {
      throw err
    }
  })

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

/**
 * Updates project status
 * @param {String} projectId
 * @param {String} newStatus
 */
async function updateProjectStatus (projectId, newStatus) {
  return update({
    TableName: config.get('DYNAMODB.PROJECT_TABLE_NAME'),
    Key: {
      id: projectId
    },
    UpdateExpression: 'set #st = :s',
    ExpressionAttributeValues: {
      ':s': newStatus
    },
    ExpressionAttributeNames: {
      '#st': 'status'
    }
  })
}

/**
 * Updates project with connect project name, connect project id and sets status to APPROVED
 * @param {String} projectId
 * @param {String} projectName
 * @param {String} connectProjectId
 */
async function updateProjectWithConnectAndApprove (projectId, projectName, connectProjectId) {
  return update({
    TableName: config.get('DYNAMODB.PROJECT_TABLE_NAME'),
    Key: {
      id: projectId
    },
    UpdateExpression: 'set #pn = :p, #cpi = :c, #st = :s',
    ExpressionAttributeValues: {
      ':p': projectName,
      ':c': connectProjectId,
      ':s': config.get('PROJECT_STATUS.APPROVED')
    },
    ExpressionAttributeNames: {
      '#pn': 'projectName',
      '#cpi': 'connectProjectId',
      '#st': 'status'
    }
  })
}

/**
 * Get a project by id
 * @param {String} projectId
 */
async function getProject (projectId) {
  return ((await query({
    TableName: config.get('DYNAMODB.PROJECT_TABLE_NAME'),
    KeyConditionExpression: 'id = :idVal',
    ExpressionAttributeValues: {
      ':idVal': projectId
    }
  })).Items[0])
}

module.exports = {
  initialize,
  put,
  query,
  update,
  updateProjectStatus,
  getProject,
  updateProjectWithConnectAndApprove
}
