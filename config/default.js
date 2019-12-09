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
    TEXT_AREA_PROJECT_NAME: 'projectNameTextArea',
    APPROVE: 'approve'
  },
  // Winston log level
  LOG_LEVEL: 'error',
  // Common constants
  CONSTANTS: {
    PROJECT_DOES_NOT_EXIST: 'Project does not exist'
  },
  // Topcoder Connect configurations
  CONNECT: {
    CREATE_PROJECT: 'https://api.topcoder-dev.com/v4/projects',
    INVITE_MEMBER: (projectId) => `https://api.topcoder-dev.com/v4/projects/${projectId}/members/invite`,
    PROJECT_URI: (projectId) => `https://connect.topcoder-dev.com/projects/${projectId}`,
    PROJECT_TYPE: 'scoped-solutions',
    INVITE_ROLE: 'customer',
    CONNECT_TEMPLATE_ID: 221,
    CONNECT_VERSION: 'v3',
    PROJECT_DETAILS_DEV_QA: {
      intakePurpose: 'client-request',
      utm: {
        code: 'topbot'
      },
      appDefinition: {
        deliverables: ['dev-qa'],
        needAdditionalScreens: 'no',
        targetDevices: ['mobile'],
        mobilePlatforms: '',
        addons: {
          development: ''
        }
      },
      apiDefinition: {
        notes: ''
      },
      techstack: {
        hasLanguagesPref: false,
        hasFrameworksPref: '',
        hasDatabasePref: '',
        hasServerPref: '',
        hasHostingPref: '',
        noPref: true,
        sourceControl: '',
        languages: ''
      },
      hideDiscussions: true
    }
  }
}
