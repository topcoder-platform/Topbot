# Deployment Guide

## Prerequisites

1. Node.js >= v12.14.1

2. ngrok: https://ngrok.com/download

## Create a free Slack account - This will be your Topcoder slack

1. Create a slack account if you don't have one already. Click `Create a new workspace` [here](https://slack.com/get-started).

2. Provide an email address and click confirm

3. A verification code will be sent to your email, post the verification code back to the slack setup page

4. Create a team and a project

5. Click `Skip for now` if you don't want to add more users

![](images/skip.png)

6. You should see your team and your channel created

![](images/created.png)

**ENV** In the list of Channels in your workspace, pick one and provide its name in the `provider:environment:TC_SLACK_CHANNEL` field in `serverless.yml`. This will be the channel to which new task requests will be posted

## Create a Slack App

1. Open the create app page, click [here](https://api.slack.com/apps?new_app=1)

2. Provide a name and select a workspace

![](images/create_app.png)

3. **ENV** Go to app credentials from `Settings` -> `Basic Information`. Get the value of `Signing Secret` and provide it in `provider:environment:TC_SLACK_CLIENT_SIGNING_SECRET` field in `serverless.yml`

![](images/credentials.png)

4. Click on `Features` -> `Bot users` -> `Add a Bot User`. Provide a name say, `topbot` and click `Add Bot User`

![](images/add_bot_user.png)

5. Click on `Features` -> `OAuth & Permissions` -> `Install App to Workspace`

![](images/install.png)

6. Click `Allow`

![](images/allow.png)

7. On the same page, go to `Scopes` -> `Select Permission Scopes` -> Add scope `bot` and `channels:write`  and click `Save changes`. Reinstall the app by clicking the link on the top banner.

![](images/scopes.png)

![](images/reinstall.png)

8. **ENV** On success, you will see your `OAuth Access Token` and
 `Bot User OAuth Access Token` in `OAuth Tokens & Redirect URLs`.

 Copy `OAuth Access Token` and provide it in `provider:environment:TC_SLACK_ADMIN_USER_TOKEN` field in `serverless.yml`.

 Copy `Bot User OAuth Access Token` and provide it in `provider:environment:TC_SLACK_BOT_TOKEN` field in `serverless.yml`.

9. **ENV** Provide conect bearer token in `serverless.yml` -> `provider:environment:CONNECT_BEARER_TOKEN`

12. All the required environment values in `serverless.yml` should be filled now. It should look something like,

```yml
service: botLambda

provider:
  name: aws
  runtime: nodejs10.x
  profile: bot-dev
  stage: local

  environment:
    # AWS configuration
    ACCESS_KEY_ID: FAKE_ACCESS_KEY_ID
    SECRET_ACCESS_KEY: FAKE_SECRET_ACCESS_KEY
    REGION: FAKE_REGION
    DYNAMODB_ENDPOINT: http://localhost:8000

    # TC Slack bot configuration
    TC_SLACK_ADMIN_USER_TOKEN: xoxp-755656631591-747386116513-856432302385-bbe6afecbaa9410f2630e45908b5e498
    TC_SLACK_BOT_TOKEN: xoxb-755656631591-802800975089-M6OZs1GH4HlF16PuZsgfHVQ1
    TC_SLACK_CHANNEL: general
    TC_SLACK_CLIENT_SIGNING_SECRET: 49162bd8ebe79a8f64a9a29332e22c74
    # Topcoder connect configuration
    CONNECT_BEARER_TOKEN: sample_connect_bearer_tokeniJKV1QiLCJhbGciOiJI.eyJyb2xlcyI6WyJUb3Bjb2RlciBVc2VyIl0sImlzcyI6Imh0dHBzOi8vYXBpLnRvcGNvZGVyLWRldi5jb20iLsample_connect_bearer_tokenIiwiZXhwIjoxNTsample_connect_bearer_tokenQiOiI0MDE1Osample_connect_bearer_tokenMTU3NTUxMTk3NywiZW1haWwiOiJiaWxsc2Vksample_connect_bearer_token.-ZJHFCqxgvdCeyx9sample_connect_bearer_tokenCk
```

## Start the server

1. Follow steps [Development Guide](./../DeploymentGuide.md) to start the server.If the server has been started then restart it to apply changes in the settings.
## Enable event subscriptions in Slack app

1. Go to https://api.slack.com/apps and click on the app that you created earlier in `Create a Slack App`

2. Click on `Features` -> `Event Subscriptions`. Turn it on.

3. Go to `Subscribe to Bot Events` section and add `app_mention` event. (See the image below)

4. Scroll up and provide a `Request URL`. Provide value `NGROK_URL/tc-slack/events` and click `Save changes` once verified.

![](images/events.png)

## Enable interactive components in Slack app

1. Go to https://api.slack.com/apps and click on the app that you created earlier in `Create a Slack App`

2. Click on `Features` -> `Interactive Components`. Turn it on and fill in `NGROK_URL/tc-slack/interactive` into the `Request URL` field. Click Save changes.

![](images/interactive.png)

