/**
 * Contains the schema for projects table
 */

const config = require('config')

const projects = {
  AttributeDefinitions: [{
    AttributeName: 'id',
    AttributeType: 'S'
  }, {
    AttributeName: 'clientSlackThread',
    AttributeType: 'S'
  }],
  KeySchema: [{
    AttributeName: 'id',
    KeyType: 'HASH'
  }],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1
  },
  GlobalSecondaryIndexes: [{
    IndexName: config.get('DYNAMODB.CLIENT_SLACK_THREAD_INDEX'),
    KeySchema: [{
      AttributeName: 'clientSlackThread',
      KeyType: 'HASH'
    }],
    Projection: {
      ProjectionType: 'ALL'
    },
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1
    }
  }],
  TableName: config.get('DYNAMODB.PROJECT_TABLE_NAME')
}

module.exports = projects
