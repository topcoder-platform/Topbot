# Deployment Guide

## Prerequisites

1. Node.js >= v12.14.1

2. ngrok: https://ngrok.com/download

## Dynamodb & SNS setup

Slack lambda uses Dynamodb to store/retrieve data and listens to SNS topics to obtain events from Topbot - Receiver.

## TC Central Setup

In order to deploy Slack lambda, you will need to configure TC Central as well. The Slack account created there will represent Topcoder slack. You will then need to create an app in that workspace. This app will then be installed by clients in their workspaces.

## Create an app in Topcoder slack account

1. Open the create app page, click [here](https://api.slack.com/apps?new_app=1)

2. Provide a name and select a workspace (This represents the Topcoder workspace)

![](images/create_app.png)

3. **ENV** Go to app credentials from `Settings` -> `Basic Information`.
Update `serverless.yml` with the the values,
Client id -> `provider:environment:CLIENT_SLACK_CLIENT_ID` (**Make sure to use quotes around CLIENT_SLACK_CLIENT_ID**)
Client secret -> `provider:environment:CLIENT_SLACK_CLIENT_SECRET`
`Signing Secret` -> `provider:environment:CLIENT_SLACK_CLIENT_SIGNING_SECRET`

![](images/credentials.png)

4. Click on `Features` -> `Bot users` -> `Add a Bot User`. Provide a name say, `topbot` and click `Add Bot User`

![](images/add_bot_user.png)

5. Click on `Features` -> `OAuth & Permissions`, go to `Scopes` -> `Select Permission Scopes` -> Add scope `bot`, `channels:write` and `users:read` and click `Save changes`.
![](images/scopes.png)

**Do not install the app into workspace. This app is meant to be installed in client workspace and not Topcoder workspace.**

6. By default, all lambdas runs on port 3000. So if you are using defaults, you don't need to change this field.

7. `serverless.yml` should look something like,

```yml

  environment:
    # Client Slack bot configuration
    CLIENT_SLACK_CLIENT_ID: '751151625041.751156216241'
    CLIENT_SLACK_CLIENT_SECRET: f4adf8e2b83ac725cfdd7bfe3cc6941c
    CLIENT_SLACK_CLIENT_SIGNING_SECRET: 52810ea6b0cf1e67b2861be8bddce102
    CLIENT_SLACK_ADD_TO_SLACK_BUTTON: '<a href="https://slack.com/oauth/authorize?client_id=751151625041.751156216241&scope=bot,channels:write,users:read"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"></a>'

    # Token encryption/decryption key
    CRYPTO_KEY: '3i)!Pf#"kq-)C[;UN-AVQ/doOk,[24'
```

## Start the server

1. Follow steps [Development Guide](./../DeploymentGuide.md) to start the server.If the server has been started then restart it to apply changes in the settings.
## Enable event subscriptions in Slack app

1. Go to https://api.slack.com/apps and click on the app that you created earlier in `Create a Slack App`

2. Click on `Features` -> `Event Subscriptions`. Turn it on.

3. Go to `Subscribe to Bot Events` section and add `app_mention` event. (See the image below)

4. Scroll up and provide a `Request URL`. Provide value `NGROK_URL/client-slack/events` and click `Save changes` once verified.

![](images/events.png)

## Enable interactive components in Slack app

1. Go to https://api.slack.com/apps and click on the app that you created earlier in `Create a Slack App`

2. Click on `Features` -> `Interactive Components`. Turn it on and fill in `NGROK_URL/client-slack/interactive` into the `Request URL` field. Click Save changes.

![](images/interactive.png)

## Provide redirect url

1. Click on `Features` -> `OAuth & Permissions`, go to `Redirect URL's` -> `Add new redirect url`, provide value `NGROK_URL/client-slack/auth/redirect` and click save.

![](images/redirect_url.png)

## Make app distributable publicly

1. Go to https://api.slack.com/apps and click on the app that you created earlier in `Create a Slack App`

2. Click on `Settings` -> `Manage distribution`.
Check `Remove Hard Coded Information`. The `Activate Public Distribution` button should now become enabled. Click it.

![](images/public.png)

3. **ENV** Copy the html code provided in the Embeddable Slack Button box and paste it into `serverless.yml` -> `provider:environment:ADD_TO_SLACK_BUTTON`.

![](images/add_to_slack.png)

**Restart server for the CLIENT_SLACK_ADD_TO_SLACK_BUTTON env variable to take effect**

## Create Client workspace

### Create a free Slack account

1. Create a slack account if you don't have one already. Click `Create a new workspace` [here](https://slack.com/get-started).

2. Provide an email address and click confirm

3. A verification code will be sent to your email, post the verification code back to the slack setup page

4. Create a team and a project

5. Click `Skip for now` if you don't want to add more users

![](images/skip.png)

6. You should see your team and your channel created

![](images/created.png)

### Install slack lambda to client workspace

1. While logged in to client workspace account, open url `NGROK_URL/client-slack/signin`. You should see th Add to Slack button.

![](images/signin.png)

2. Click the button, click "Allow" to install the bot to client workspace

![](images/allow.png)

3. On success, you will see a success message,

![](images/oauth_success.png)

### Setup slack channel

1. Invite the bot user `/invite @topbot` to any channel from which you want to create project requests

## Setup TC Central lambda

1. If you haven't already done it, then setup TC Central lambda by following its `DeploymentGuide.md` before moving on to [Verification Guide](./VerificationGuide.md).
