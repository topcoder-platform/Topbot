const config = require('config')
const uuid = require('uuid/v4')
const util = require('util')
const logger = require('../common/logger')
const COMMANDS = config.get('COMMANDS')

module.exports = (controller) => {
  var pendingDialogs = new Map()
  const helpCommand = new RegExp(`^${COMMANDS.HELP}\\b`)
  const launchCommand = new RegExp(`^${COMMANDS.LAUNCH}\\b`)
  const acceptCommand = new RegExp(`^${COMMANDS.ACCEPT}\\b`)
  const approveCommand = new RegExp(`^${COMMANDS.APPROVE}\\b`)
  const requestCommand = new RegExp(`^${COMMANDS.REQUEST}\\b`)
  controller.hears(helpCommand, ['direct_message,direct_mention,mention'], async (bot, message) => {
    try {
      const postMessage = Promise.promisify(bot.api.chat.postMessage)
      await postMessage({
        text: 'Help!',
        channel: message.channel,
        blocks: JSON.stringify(config.get('HELP_COMMAND_REPLY'))
      })
    } catch(err) {
      logger.error(util.inspect(err))
    }
  })

  controller.hears(requestCommand, ['direct_message, direct_mention, mention'], async (bot, message) => { // On slash command
    const request = message.text.substr(COMMANDS.REQUEST.length + 1)
    if (message) { // Check is command topbot's
      let team = config.get('TEAM_TO_POST')
      let channel = config.get('CHANNEL_TO_POST')
      if (team && channel) { // Check if team and channel, were user is going to send request, is specified in enviroment
        // Create bot that will send message to the topcoder team with request and button that will allow to respond to it.
        // await topcoderBot.startConversationInChannel(channel, message.user)
        let id = uuid() // id that will be callback_id and will allow to easier track request.
        pendingDialogs.set(id, { // Add request with originating team and channel id, user's id and request.
          team_id: message.team_id,
          channel_id: message.event.channel,
          user: message.event.user,
          request
        })
        await controller.storage.teams.get(team, async (err,data) => {
          if (err) return logger.error(err)
          if(!data) return logger.info('No data')
          let topcoderBot = await controller.spawn(data.bot)
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
          await bot.reply(message, 'Request: ' + request + ' sent!')
        })
      }
    }
  })
  // On dialog submission
  controller.on('dialog_submission', async (bot, message) => {
    let id = message.raw_message.callback_id // Get callback id
    let pendingDialog = pendingDialogs.get(id) // Get request data from Map
    // If request was found, send request and response to the originating channel.
    if (pendingDialog) {
      await controller.storage.teams.get(pendingDialog.team_id, async (err,data) => {
        if(err) return logger.error(err)
        else if(!data) return logger.error('Team not found')
        const returnBot = controller.spawn(data.bot)
        await returnBot.api.chat.postMessage({
          text: `<@${pendingDialog.user}> Topcoder team responded to your request: "${pendingDialog.request}"\n Response: "${message.raw_message.submission.response}"`,
          channel: pendingDialog.channel_id 
        })
        await bot.reply(message, message.raw_message.submission.response)
        await bot.dialogOk()
      })
    } else {
      await bot.say('Not found')
    }
  })
  controller.on('interactive_message_callback', async (bot, message) => {
    switch (message.raw_message.actions[0].name) {
      // Send response dialog when someone from topcoder team click on "Post a response" button
      case 'createResponse':
        let id = message.raw_message.callback_id
        if (pendingDialogs.get(id)) {
          let dialog = bot.createDialog('Respond to a request', id, 'Post').addTextarea('Response', 'response')
          await bot.replyWithDialog(message, dialog.asObject())
          break
        } else {
          await bot.say('This request is not avaible any more.')
        }
    }
  })



  controller.hears(launchCommand, ['direct_message,direct_mention,mention'], async (bot, message) => {
    try {
      const quote = message.text.substr(COMMANDS.LAUNCH.length).trim()
      const postMessage = Promise.promisify(bot.api.chat.postMessage)

      if(quote) {
        const res = await postMessage({
          text: quote,
          channel: config.get('CHANNEL_TO_POST_TASKS')
        })
        await controller.storage.tasks.save({
          id: uuid(),
          launcher: message.user,
          threadId: res.ts,
          taskDescription: res.message.text,
          status: config.get('TASK_STATUS.LAUNCHED')
        })
      } else {
        return bot.reply(message, 'Please add a task description')
      }
    } catch(err) {
      logger.error(util.inspect(err))
    }
  })

  controller.hears(acceptCommand, ['direct_message,direct_mention,mention'], async (bot, message) => {
    try {
      // Trying to accept outside of a thread
      if(!message.thread_ts) {
        return bot.reply(message, 'Please reply to the launched task in a thread')
      }
  
      const task = (await controller.storage.tasks.find({ 
        threadId: message.thread_ts
      }))[0]

      if(!task) {
        return bot.reply(message, 'Task does not exist. You can only accept tasks by replying to the launched task\'s message')
      }

      if(task.launcher === message.user) {
        return bot.reply(message, 'You can not accept a task which you\'ve launched')
      }
  
      if(task.status !== config.get('TASK_STATUS.LAUNCHED')) {
        return bot.reply(message, 'Task has already been accepted')
      }
  
      const createChannel = Promise.promisify(bot.api.channels.create)
      const inviteChannel = Promise.promisify(bot.api.channels.invite)
  
      // Create channel
      const channel = (await createChannel({
        token: bot.config.bot.app_token,
        name: `${task.taskDescription.substr(0, 15)}__${task.id.substr(0, 4)}`
      })).channel
      
      // Add launcher, user who accepts and bot to new channel
      let users = [task.launcher, message.user, bot.identity.id] 
      const adminUser = bot.config.createdBy
      const shouldRemoveAdminUserFromChannel = (adminUser !== users[0]) && (adminUser !== users[1]) // Since admin user is added by default when creating a channel, remove him if he is not launcher or one who accepts the task
      users = users.filter((user) => user !== adminUser) // Do not add admin user as he creates the channel and so is already a member
       
      await Promise.all(users.map((user) => {
        inviteChannel({
          token: bot.config.bot.app_token,
          channel: channel.id,
          user
        })
      }))

      if(shouldRemoveAdminUserFromChannel) {
        const leaveChannel = Promise.promisify(bot.api.channels.leave)
        await leaveChannel({
          token: bot.config.bot.app_token,
          channel: channel.id
        })
      }
      
      // Update task status
      task.status = config.get('TASK_STATUS.ACCEPTED')
      task.acceptedBy = message.user
      task.channel = channel.id
      await controller.storage.tasks.save(task)
    } catch (err) {
      logger.error(util.inspect(err))
    }
  })

  controller.hears(approveCommand, ['direct_message,direct_mention,mention'], async (bot, message) => {
    try {
      const task = (await controller.storage.tasks.find({
        channel: message.channel
      }))[0]
      if(!task) {
        return bot.reply(message, 'You can only approve tasks in the channel created for it after it is accepted')
      }
      if(task.launcher !== message.user) {
        return bot.reply(message, 'Only task launchers can approve a task')
      }
      if(task.status === config.get('TASK_STATUS.APPROVED')) {
        return bot.reply(message, 'The task has already been approved')
      }
  
      task.status = config.get('TASK_STATUS.APPROVED')
      await controller.storage.tasks.save(task)
      bot.reply(message, 'Great! We\'ll get your work done')
    } catch (err) {
      logger.error(util.inspect(err))
    }
  })
}