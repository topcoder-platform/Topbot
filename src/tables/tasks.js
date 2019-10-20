/**
 * Contains the schema for tasks table
 */

const config = require('config')

const tasks = {
  AttributeDefinitions: [{
    AttributeName: 'id',
    AttributeType: 'S'
  }, {
    AttributeName: 'threadId',
    AttributeType: 'S'
  }, {
    AttributeName: 'channel',
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
    IndexName: config.get('DYNAMODB.THREADID_INDEX'),
    KeySchema: [{
      AttributeName: 'threadId',
      KeyType: 'HASH'
    }],
    Projection: {
      ProjectionType: 'ALL'
    },
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1
    }
  }, {
    IndexName: config.get('DYNAMODB.CHANNEL_INDEX'),
    KeySchema: [{
      AttributeName: 'channel',
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
  TableName: config.get('DYNAMODB.TASK_TABLE_NAME')
}

module.exports = tasks
