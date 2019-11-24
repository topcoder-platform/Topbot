/**
 * Application configuration options
 */

module.exports = {
  // Status of a task during its lifetime
  PROJECT_STATUS: {
    LAUNCHED: 'LAUNCHED',
    ACCEPTED: 'ACCEPTED',
    DECLINED: 'DECLINED',
    APPROVED: 'APPROVED',
    RESPONDED: 'RESPONDED'
  },
  // Dynamodb table and index names
  DYNAMODB: {
    PROJECT_TABLE_NAME: 'projects',
    CLIENT_SLACK_THREAD_INDEX: 'client_slack_thread_index'
  },
  // Supported commands received as events
  COMMANDS: {
    HELP: 'help'
  },
  // Names of interactive components
  INTERACTIVE_MESSAGE_TYPES: {
    POST_RESPONSE: 'postResponse',
    TEXT_AREA_POST_RESPONSE: 'postResponseTextArea',
    APPROVE: 'approve'
  },
  // Winston log level
  LOG_LEVEL: 'error',
  // Common constants
  CONSTANTS: {
    PROJECT_DOES_NOT_EXIST: 'Project does not exist'
  }
}
