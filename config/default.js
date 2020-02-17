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
  // Supported messaging platforms
  PLATFORMS: {
    SLACK: 'slack',
    TEAMS: 'teams'
  },
  // Dynamodb table and index names
  DYNAMODB: {
    PROJECT_TABLE_NAME: 'projects',
    CLIENT_SLACK_THREAD_INDEX: 'client_slack_thread_index',
    TEAMS_CONVERSATION_ID_INDEX: 'teams_conversation_id_index'
  },
  // Supported commands received as events
  COMMANDS: {
    HELP: 'help'
  },
  // Names of interactive components
  INTERACTIVE_MESSAGE_TYPES: {
    POST_RESPONSE: 'postResponse',
    TEXT_AREA_POST_RESPONSE: 'postResponseTextArea',
    TEXT_AREA_PROJECT_NAME: 'projectNameTextArea',
    APPROVE: 'approve'
  },
  // Winston log level
  LOG_LEVEL: 'error',
  DISABLE_LAMBDA_DEBUG_LOGGING: false,
  // Common constants
  CONSTANTS: {
    PROJECT_DOES_NOT_EXIST: 'Project does not exist'
  },
  // Topcoder Connect configurations
  CONNECT: {
    CREATE_PROJECT: 'https://api.topcoder-dev.com/v5/projects',
    INVITE_MEMBER: (projectId) => `https://api.topcoder-dev.com/v5/projects/${projectId}/members/invite`,
    PROJECT_URI: (projectId) => `https://connect.topcoder-dev.com/projects/${projectId}`,
    PROJECT_TYPE: 'scoped-solutions',
    INVITE_ROLE: 'customer',
    CONNECT_TEMPLATE_ID: 101,
    CONNECT_VERSION: 'v3',
    PROJECT_DETAILS_DEV_QA: {
      intakePurpose: 'client-request',
      utm: {
        code: 'topbot'
      },
      appDefinition: {
        qaType: 'real-world-unstructured',
        unstructuredTestsScreenCount: 'upto-10',
        caNeeded: 'yes'
      },
      apiDefinition: {},
      hideDiscussions: true
    }
  }
}
