/**
 * Application configuration options
 */

module.exports = {
  // Status of a task during its lifetime
  TASK_STATUS: {
    LAUNCHED: 'LAUNCHED',
    ACCEPTED: 'ACCEPTED',
    APPROVED: 'APPROVED'
  },
  // Dynamodb table and index names
  DYNAMODB: {
    TASK_TABLE_NAME: 'tasks',
    THREADID_INDEX: 'threadid_index',
    CHANNEL_INDEX: 'channel_index'
  },
  // Supported commands received as events
  COMMANDS: {
    ACCEPT: 'accept',
    APPROVE: 'approve',
    HELP: 'help'
  },
  // Winston log level
  LOG_LEVEL: 'error'
}
