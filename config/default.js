module.exports = {
  TEAM_TO_POST: process.env.TEAM_TO_POST || '', //The id of the team where your requests and tasks will be posted
  CHANNEL_TO_POST: process.env.CHANNEL_TO_POST || '', // The id of the channel to post requests
  CHANNEL_TO_POST_TASKS: process.env.CHANNEL_TO_POST_TASKS || '', // The name of the channel to post launched tasks 
  API_PREFIX: '/v5/topbot',
  COMMANDS: { // List of supported commands
    LAUNCH: 'launch',
    ACCEPT: 'accept',
    APPROVE: 'approve',
    HELP: 'help',
    REQUEST: 'request'
  },
  TASK_STATUS: { // Status of a task during its lifetime
    LAUNCHED: 'LAUNCHED',
    ACCEPTED: 'ACCEPTED',
    APPROVED: 'APPROVED'
  },
  LOG_LEVEL: '', // Set to debug to view comprehensive logs 
  HELP_COMMAND_REPLY: [{ // The help message block to display for the help command
    'type': 'section',
    'text': {
      'type': 'mrkdwn',
      'text': 'These are the commands I understand'
    }
  }, {
    'type': 'divider'
  }, {
    'type': 'section',
    'text': {
      'type': 'mrkdwn',
      'text': '@topbot *launch* <description> : Launch a task with description'
    }
  }, {
    'type': 'section',
    'text': {
      'type': 'mrkdwn',
      'text': '@topbot *accept* : Accept a task'
    }
  }, {
    'type': 'section',
    'text': {
      'type': 'mrkdwn',
      'text': '@topbot *approve* : Approve a task'
    }
  }, {
    'type': 'section',
    'text': {
      'type': 'mrkdwn',
      'text': '@topbot *help* : Show list of supported commands'
    }
  },
  {
    'type': 'section',
    'text': {
      'type': 'mrkdwn',
      'text': '@topbot *request* <request> : Send request to the topcoder channel'
    }
  }
  ]
}