# TopBot

## Testing directly on Slack

I have deployed the bot to an ec2 nano instance. You can test it directly without any additional setup

1. Sign into `topbot-workspace.slack.com` using `dmessinger@topcoder.com`. This user has already been invited to the workspace.

2. You will need another user for testing. Invite another user by clicking the `Invite people` button. Sign into `topbot-workspace.slack.com` with that user on a different browser. Let's call this user `testuser@topcoder.com`. Now go back to `dmessinger@topcoder.com` account.

3. By default, all launched task messages are posted to `#tasks`

4. Create a new channel for testing, say `#test`

  ![](docs/images/create_channel.png)

5. Invite the bot, `/invite @topbot`. You will see a welcome message in `#test`. The bot is also automatically added to the `#tasks` channel if it is not already a member. You will see a welcome message on `#tasks` if it is a fresh add. This is to notify all members of `#tasks` who are not a part of `#test` that a bot is availabe.
   
   ![](docs/images/invite_topbot.png) 

6. Issue `help` command, `@topbot help`. You will see a list of commands supported by the bot.
   
   ![](docs/images/help_command.png) 

7. Launch a task. `@topbot launch Horizon - Create New Project Mock API Integration - Part 2`. You will see a message posted in `#tasks`
   
   ![](docs/images/launch_task.png) 

8. Accept this task as `testuser@topcoder.com` by clicking the `Start a thread` and then reply `@topcoder accept`
   
   ![](docs/images/start_a_thread.png)
   
   ![](docs/images/accept_task.png) 

9.  A new channel will be created with the name `<first_15_characters of task description>__<taskUUid>`. The uuid is added to avoid conflicts incase two tasks have similar descriptions. Slack limits channel names to 21 characters.
  
  The channel will have two users, `dmessinger@topcoder.com` and `testuser@topcoder.com`. The bot will also automatically be added.

10. As `dmessinger@topcoder.com`, approve the task inside the newly created channel. `@topbot approve`. You will see a confirmation message.
 
    ![](docs/images/approve_task.png)  

There are several error scenarios which the bot handles. These are,


1. `launch` task with no description

  ![](docs/images/launch_no_description.png)

2. `accept` command in a non thread.
 
   ![](docs/images/accept_non_thread.png) 

3. `accept` a task which is already accepted.
 
   ![](docs/images/second_accept.png) 

4. `accept` in a thread but not for a launched task.
    
    ![](docs/images/accept_non_task.png)

5. `accept` a task launched by the same user

    ![](docs/images/accept_own_task.png)

6. `approve` in a channel which is not the one created for a task.

    ![](docs/images/approve_non_channel.png)

7. `approve` task as a user who did not launch the task

    ![](docs/images/approve_non_launcher.png)

8. `approve` task which is already approved as a launcher

    ![](docs/images/second_approve.png)

## Local setup

### Prerequisites

1. Node.js v10.14.2 or higher. Download link: https://nodejs.org/en/download/

2. ngrok. Download link: https://ngrok.com/download

3. Slack account

4. Mongodb community edition. Download link: https://www.mongodb.com/download-center/community

### How to run

1. Start ngrok and obtain a https url. `./ngrok http 3000`.

2. Make sure you have `/data/db` directory created with write access to current user. Start mongodb `mongod`. Create a database, say `topbot`.

3. Login to slack and create a channel to post tasks to. Update the name of this channel in `config/default.js -> CHANNEL_TO_POST_TASKS` (make sure to include the '#')

4. The instructions here, https://botkit.ai/docs/provisioning/slack-events-api.html are really comprehensive. You can follow steps 1 to 6 and ignore step 2. The only change is, in step 3 (Configure OAuth), make sure to add the `channels.write` scope and click `Save changes`.

  ![](docs/images/add_scope.png)

5. Before step 7, go to the `Basic information` tab of your app. Collect these values from `App credentials` section, `Client id`, `Client secret`, `Signing Secret`.

  ![](docs/images/app_credentials.png)

6. Update `.env` file with the information from above steps.

   ![](docs/images/env.png) 

7. Start your node app. `npm i` followed by `npm start`.

8. Now follow step 7. i.e open the ngrok url on a browser.

9.  On the home page of the `ngrok` url, click `Add to Slack`.

  ![](docs/images/add_to_slack.png)

10. Click `Authorize` on the next page.

  ![](docs/images/authorize.png)

11. You will recieve a bot added message.

  ![](docs/images/bot_added.png)

12. **IMPORTANT** Before proceeding further, go to the `OAuth and permissions` page of you bot. (From step 3, Configure OAuth). You will see a banner saying permissions have changed. Reinstall the app by clicking `click here`. Authorize on the following page.

  ![](docs/images/reinstall_bot.png)

  ![](docs/images/authorize_again.png)

13. Now you can follow the same steps as in "Testing directly on Slack".

### App comfiguration

Configuration is defined in `config/default.js`. The comments there explain each field.
You need to get team and channel id where you want to send your requests and paste them in "TEAM_TO_POST" and "CHANNEL_TO_POST" config variables

### Linting

Run `npm run lint`

### Other important notes

1. `Signing Secret` is very important for security. So make sure to update that field too in the `.env` file if not already. It is used to verify that the incoming messages from slack to the bot are indeed from slack and not from an attacker. This check happens in, `component/routes/incoming_webhooks.js`

2. Logs are written to files, `combined.log` for all logs and `error.log` for errors by winston.

3. Tasks are created in the `tasks` collection in MongoDB.

4. `npm audit` shows one vulnerability. Installing the fix is a major dependency update which might break features of botkit as it was a dependency that was installed by botkit. So I have not updated it.
