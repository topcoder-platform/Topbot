const config = require('config')
const uuid = require('uuid/v4')
const util = require('util')
const logger = require('../common/logger')
const COMMANDS = config.get('COMMANDS')
const {SlackDialog} = require('botbuilder-adapter-slack')
module.exports = (controller) => {
  var pendingDialogs = new Map()
  const helpCommand = new RegExp(`^${COMMANDS.HELP}\\b`)
  const launchCommand = new RegExp(`^${COMMANDS.LAUNCH}\\b`)
  const acceptCommand = new RegExp(`^${COMMANDS.ACCEPT}\\b`)
  const approveCommand = new RegExp(`^${COMMANDS.APPROVE}\\b`)
  const requestCommand = new RegExp(`^${COMMANDS.REQUEST}\\b`)
  // When user runs help command, send all avaible commands
  controller.hears(helpCommand, ['direct_message','direct_mention','mention'] ,async (bot, message) => {
    try {
      await bot.say({
        channel: message.channel,
        text: 'Help!',
        blocks: JSON.stringify(config.get('HELP_COMMAND_REPLY'))
      })
    } catch(err) {
      logger.error(util.inspect(err))
    }
  })
  // When user runs request command with request text, send his request to topcoder team
  controller.hears(requestCommand, ['direct_message','direct_mention','mention'], async (bot, message) => { // On slash command
    const request = message.text.substr(COMMANDS.REQUEST.length + 1)
    if (request) { // Check is request not empty
      let team = config.get('TEAM_TO_POST')
      let channel = config.get('CHANNEL_TO_POST')
      if (team && channel) { // Check if team and channel, were user is going to send request, is specified in enviroment
        // Create bot that will send message to the topcoder team with request and button that will allow to respond to it.
        let id = uuid() // id that will be callback_id and will allow to easier track request.
        pendingDialogs.set(id, { // Add request with originating team and channel id, user's id and request.
          team_id: message.team,
          channel_id: message.channel,
          user: message.user,
          request
        })
        // Get topcoder team data and send request to specified channel
        await controller.plugins.database.teams.get(team, async (err,data) => {
          if (err) return logger.error(err)
          if(!data) return logger.info('No data')
          let topcoderBot = await controller.spawn(team)
          await topcoderBot.api.chat.postMessage({
            channel, // Send message to topcoder team
            attachments: [
              {
                title: 'Request: ' + request,
                callback_id: id,
                attachment_type: 'dialog',
                actions: [
                  {
                    name: 'createResponse',
                    text: 'Post a response',
                    type: 'button'
                  }
                ]
              }]
          })
          // Send request confirmation to user
          await bot.api.chat.postMessage({
            channel: message.channel,
            text: 'Request: ' + request + ' sent!'
          })
        })
      }
    }
  })
  // On dialog submission
  controller.on('dialog_submission', async (bot, message) => {
    let id = message.incoming_message.channelData.callback_id// Get callback id
    let pendingDialog = pendingDialogs.get(id) // Get request data from Map
    // If request was found, send request and response to the originating channel.
    if (pendingDialog) {
      // Get team id from which request was made and send response.
      await controller.plugins.database.teams.get(pendingDialog.team_id, async (err,data) => {
        if(err) return logger.error(err)
        else if(!data) return logger.error('Team not found')
        const returnBot = await controller.spawn(data.id)
        await returnBot.api.chat.postMessage({
          text: `<@${pendingDialog.user}> Topcoder team responded to your request: "${pendingDialog.request}"\n Response: "${message.submission.response}"`,
          channel: pendingDialog.channel_id 
        })
        await bot.api.chat.postMessage({
          channel: message.channel,
          text: message.submission.response
        })
      })
    } else {
      await bot.api.chat.postMessage({channel: message.channel, text: 'Not found.'}) 
    }
  })
  // On interactive message event 
  controller.on('interactive_message', async (bot, message) => {
    switch (message.actions[0].name) {
      // Send response dialog when someone from topcoder team click on "Post a response" button
      case 'createResponse':
        let id = message.incoming_message.channelData.callback_id
        if (pendingDialogs.get(id)) {
          let dialog = new SlackDialog('Respond to a request', id, 'Post').addTextarea('Response', 'response')
          await bot.replyWithDialog(message, dialog.asObject())
          break
        } else {
          await bot.api.chat.postMessage({channel: message.channel, text: 'This request is not avaible any more.'})
        }
    }
  })
  // When launch command is dispatched, launch new task 
  controller.hears(launchCommand, ['direct_mention','mention'], async (bot, message) => {
    try {
      const quote = message.text.substr(COMMANDS.LAUNCH.length).trim()
      const postMessage = Promise.promisify(bot.api.chat.postMessage)
      // Check is task provided
      if(quote) {
        // Send task to pre-configured channel
        const res = await postMessage({
          text: quote,
          channel: config.get('CHANNEL_TO_POST_TASKS')
        })
        // Save task to datbase
        await controller.plugins.database.tasks.save({
          id: uuid(),
          launcher: message.user,
          threadId: res.ts,
          taskDescription: res.message.text,
          status: config.get('TASK_STATUS.LAUNCHED')
        })
      } else {
        return bot.api.chat.postMessage({channel: message.channel, text: 'Please add a task description'})
      }
    } catch(err) {
      logger.error(util.inspect(err))
    }
  })
  // On accept command
  controller.hears(acceptCommand, ['direct_message','direct_mention','mention'], async (bot, message) => {
    try {
      // Trying to accept outside of a thread
      if(!message.thread_ts) {
        return bot.api.chat.postMessage({channel: message.channel, text: 'Please reply to the launched task in a thread'})
      }
  
      const task = (await controller.plugins.database.tasks.find({ 
        threadId: message.thread_ts
      }))[0]
      // If no task from thread was found
      if(!task) {
        return bot.api.chat.postMessage({channel: message.channel, text: 'Task does not exist. You can only accept tasks by replying to the launched task\'s message'})
      }
      // If person who is trying to accept task is the same as person who launched it
      if(task.launcher === message.user) {
        return bot.api.chat.postMessage({channel: message.channel, text: 'You can not accept a task which you\'ve launched'})
      }
      // If task is not in "LAUNCH" status
      if(task.status !== config.get('TASK_STATUS.LAUNCHED')) {
        return bot.api.chat.postMessage({channel: message.channel, text: 'Task has already been accepted'})
      }
      const createChannel = Promise.promisify(bot.api.channels.create)
      const inviteChannel = Promise.promisify(bot.api.channels.invite)
      controller.plugins.database.teams.get(message.team, async (err, team) => {
        if (err) return new Error('Could not find a team')
        let token = team.bot.app_token
        // Create channel
        const channel = (await createChannel({
          token,
          name: `${task.taskDescription.substr(0, 15)}__${task.id.substr(0, 4)}`
        })).channel
        // Add launcher, user who accepts and bot to new channel
        let users = [task.launcher, message.user, team.bot.user_id] 
        const adminUser = message.user
        const shouldRemoveAdminUserFromChannel = (adminUser !== users[0]) && (adminUser !== users[1]) // Since admin user is added by default when creating a channel, remove him if he is not launcher or one who accepts the task
        users = users.filter((user) => user !== adminUser) // Do not add admin user as he creates the channel and so is already a member
       
        await Promise.all(users.map((user) => {
          inviteChannel({
            token,
            channel: channel.id,
            user
          })
        }))

        if(shouldRemoveAdminUserFromChannel) {
          const leaveChannel = Promise.promisify(bot.api.channels.leave)
          await leaveChannel({
            token,
            channel: channel.id
          })
        }
      
        // Update task status
        task.status = config.get('TASK_STATUS.ACCEPTED')
        task.acceptedBy = message.user
        task.channel = channel.id
        await controller.plugins.database.tasks.save(task)
      })}
    catch (err) {
      logger.error(util.inspect(err))
    }}) 
  // On approve command
  controller.hears(approveCommand, ['direct_message','direct_mention','mention'], async (bot, message) => {
    try {
      const task = (await controller.plugins.database.tasks.find({
        channel: message.channel
      }))[0]
      if(!task) {
        return bot.api.chat.postMessage({channel: message.channel, text: 'You can only approve tasks in the channel created for it after it is accepted'})
      }
      if(task.launcher !== message.user) {
        return bot.api.chat.postMessage({channel: message.channel, text: 'Only task launchers can approve a task'})
      }
      if(task.status === config.get('TASK_STATUS.APPROVED')) {
        return bot.api.chat.postMessage({channel: message.channel, text: 'The task has already been approved'})
      }
      // Change task status to approved, save to database and send confirmation message to task's channel
      task.status = config.get('TASK_STATUS.APPROVED')
      await controller.storage.tasks.save(task)
      bot.api.chat.postMessage({channel: message.channel, text: 'Great! We\'ll get your work done'})
    } catch (err) {
      logger.error(util.inspect(err))
    }
  })
}