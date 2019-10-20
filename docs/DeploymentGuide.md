# Deployment Guide

## Prerequisites

1. Node.js > v10.14.2

2. ngrok

Follow the below instructions in order to fully deploy the bot locally,

## Dynamodb setup

1. Download and install dynamodb from [here](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.DownloadingAndRunning.html)

2. In terminal, navigate to the directory where you extracted DynamoDBLocal.jar, and enter the following command. `java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb`. This will start dynamodb on port 8000 by default.

3. **ENV** Provide aws dynamodb configuration options in the `provider:environment` field in `serverless.yml`. For local deployment, the values will be,
    ```
    environment:
        # AWS configuration
        AWS_ACCESS_KEY_ID: FAKE_ACCESS_KEY_ID
        AWS_SECRET_ACCESS_KEY: FAKE_SECRET_ACCESS_KEY
        AWS_REGION: FAKE_REGION
        DYNAMODB_ENDPOINT: http://localhost:8000
    ```

3. [Optional] You can view the contents of dynamodb in your browser using a tool like [dynamodb-admin](https://www.npmjs.com/package/dynamodb-admin)

## Create a free Slack account

1. Create a slack account if you don't have one already. Click `Create a new workspace` [here](https://slack.com/get-started).

2. Provide an email address and click confirm

3. A verification code will be sent to your email, post the verification code back to the slack setup page

4. Create a team and a project

5. Click `Skip for now` if you don't want to add more users

![](images/skip.png)

6. You should see your team and your channel created

![](images/created.png)

**ENV** In the list of Channels in your workspace, pick one and provide its name in the `provider:environment:CHANNEL` field in `serverless.yml`. This will be the channel to which new task requests will be posted

## Create a Slack App

1. Open the create app page, click [here](https://api.slack.com/apps?new_app=1)

2. Provide a name and select a workspace

![](images/create_app.png)

3. **ENV** Go to app credentials from `Settings` -> `Basic Information`. Get the value of `Signing Secret` and provide it in `provider:environment:CLIENT_SIGNING_SECRET` field in `serverless.yml`

![](images/credentials.png)

4. Click on `Features` -> `Bot users` -> `Add a Bot User`. Provide a name say, `topbot` and click `Add Bot User`

![](images/add_bot_user.png)

5. Click on `Features` -> `OAuth & Permissions` -> `Install App to Workspace`

![](images/install.png)

6. Click `Allow`

![](images/allow.png)

7. On the same page, go to `Scopes` -> `Select Permission Scopes` -> Add scope `channels.write` and click `Save changes`. Reinstall the app by clicking the link on the top banner.

![](images/channels_write.png)

![](images/reinstall.png)

8. **ENV** On success, you will see your `OAuth Access Token` and
 `Bot User OAuth Access Token` in `OAuth Tokens & Redirect URLs`. 
 
 Copy `OAuth Access Token` and provide it in `provider:environment:ADMIN_USER_TOKEN` field in `serverless.yml`.

 Copy `Bot User OAuth Access Token` and provide it in `provider:environment:BOT_TOKEN` field in `serverless.yml`. 

9. All the required environment values in `serverless.yml` should be filled now. It should look something like,
    ```
    provider:
    name: aws
    runtime: nodejs10.x

    environment:
        # AWS configuration
        AWS_ACCESS_KEY_ID: FAKE_ACCESS_KEY_ID
        AWS_SECRET_ACCESS_KEY: FAKE_SECRET_ACCESS_KEY
        AWS_REGION: FAKE_REGION
        DYNAMODB_ENDPOINT: http://localhost:8000
        # TC Slack bot configuration
        ADMIN_USER_TOKEN: xoxp-755656631591-747386116513-790462410723-d3be79c80587a314ac3f9138bb34e473
        BOT_TOKEN: xoxb-755656631591-801933083072-yn118D4F6Pv6VEHLCesEIJsR
        CHANNEL: demo
        CLIENT_SIGNING_SECRET: 22a3b51e8d48599e5d77be0917da86a1
    ```

## Start Central TC server

1. Install `serverless` globally. `npm i -g serverless`

2. In the `Central_TC` directory run `npm i` to install required modules

3. [Optional] Check for lint errors by running `npm run lint`. Fix any errors by running `npm run lint:fix`

4. In the `Central_TC` directory run `serverless offline` to start the Serverless API gateway on port 3000. The gateway runs the lambda functions on demand.

5. Expose the server using `ngrok`. Run `ngrok http 3000`. You will obtain a url like `https://c238256a.ngrok.io`. Note down this value. I will refer to it as NGROK_URL.

## Enable event subscriptions in Slack app

1. Go to https://api.slack.com/apps and click on the app that you created earlier in `Create a Slack App`

2. Click on `Features` -> `Event Subscriptions`. Turn it on.

3. Go to `Subscribe to Bot Events` section and add `app_mention` event. (See the image below)

4. Scroll up and provide a `Request URL`. Provide value `NGROK_URL/slack/receive` and click `Save changes` once verified.

![](images/events.png)

## Setup slack workspace

1. Invite the bot user `/invite @topbot` to the channel that you configured earlier in the `provider:environment:CHANNEL` field in `serverless.yml`

2. You will need atleast one other user in your workspace. Click on your workspace -> `Invite people`

![](images/invite.png)

3. Click `Share invite link`

![](images/share_invite.png)

4. Copy the link and post it in your browser. Follow the resulting instructions to add a new user. The new user's email has to be different from the one you created in `Create a free Slack account`

![](images/link.png)

5. Invite the new user `/invite @<User name>` to the channel that you configured earlier in the `provider:environment:CHANNEL` field in `serverless.yml`

At the end of the process, you should have 2 human members and one app/bot in your channel

![](images/channel.png)