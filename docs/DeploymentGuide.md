# Deployment Guide

## Prerequisites

1. Node.js > v10.14.2

2. ngrok

Follow the below instructions in order to fully deploy the bot locally,

## Dynamodb setup 

If you already have dynamodb running, then you can skip the install and run steps 1 and 2

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

## Create a free Slack account - This will be your Topcoder slack

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

7. On the same page, go to `Scopes` -> `Select Permission Scopes` -> Add scope `bot` and `channels:write`  and click `Save changes`. Reinstall the app by clicking the link on the top banner.

![](images/scopes.png)

![](images/reinstall.png)

8. **ENV** On success, you will see your `OAuth Access Token` and
 `Bot User OAuth Access Token` in `OAuth Tokens & Redirect URLs`. 
 
 Copy `OAuth Access Token` and provide it in `provider:environment:ADMIN_USER_TOKEN` field in `serverless.yml`.

 Copy `Bot User OAuth Access Token` and provide it in `provider:environment:BOT_TOKEN` field in `serverless.yml`. 

9. **ENV** Central TC needs to communicate with Slack lambda. Set the URI of Slack lambda in the `provider:environment:SLACK_LAMBDA_URI` field in `serverless.yml`. You can deploy Slack lambda at this port later after TC central is deployed. 
    
 By default, Slack lambda runs on port 3001. So if you are using defaults, you don't need to change this field.

10. **ENV** Central TC needs to communicate with Slack lambda. Set the URI of Teams lambda in the `provider:environment:TEAMS_LAMBDA_URI` field in `serverless.yml`. You can deploy Teams lambda at this port later after TC central is deployed. 
    
 By default, Teams lambda runs on port 3002. So if you are using defaults, you don't need to change this field.

11. **ENV** Provide conect bearer token in `serverless.yml` -> `provider:environment:CONNECT_BEARER_TOKEN`

12. All the required environment values in `serverless.yml` should be filled now. It should look something like,
    ```
    service: central_tc

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
        ADMIN_USER_TOKEN: xoxp-755656631591-747386116513-856432302385-bbe6afecbaa9410f2630e45908b5e498
        BOT_TOKEN: xoxb-755656631591-802800975089-M6OZs1GH4HlF16PuZsgfHVQ1
        CHANNEL: general
        CLIENT_SIGNING_SECRET: 49162bd8ebe79a8f64a9a29332e22c74
        
        # Slack Lambda configuration
        SLACK_LAMBDA_URI: 'http://localhost:3001'

        # Teams lambda configuration
        TEAMS_LAMBDA_URI: 'http://localhost:3002'

        # Topcoder connect configuration
        CONNECT_BEARER_TOKEN: sample_connect_bearer_tokeniJKV1QiLCJhbGciOiJI.eyJyb2xlcyI6WyJUb3Bjb2RlciBVc2VyIl0sImlzcyI6Imh0dHBzOi8vYXBpLnRvcGNvZGVyLWRldi5jb20iLsample_connect_bearer_tokenIiwiZXhwIjoxNTsample_connect_bearer_tokenQiOiI0MDE1Osample_connect_bearer_tokenMTU3NTUxMTk3NywiZW1haWwiOiJiaWxsc2Vksample_connect_bearer_token.-ZJHFCqxgvdCeyx9sample_connect_bearer_tokenCk
    ```

## Start Central TC server

1. Install `serverless` globally. `npm i -g serverless`

2. In the `Topbot` directory run `npm i` to install required modules

3. [Optional] Check for lint errors by running `npm run lint`. Fix any errors by running `npm run lint:fix`

4. In the `Topbot` directory run `serverless offline` to start the Serverless API gateway on port 3000. The gateway runs the lambda functions on demand.

5. Expose the server using `ngrok`. Run `ngrok http 3000`. You will obtain a url like `https://bba62ba4.ngrok.io`. Note down this value. I will refer to it as `NGROK_URL`.

**NOTE on ngrok** 

If you are using a free version of ngrok, it allows only one simultaneous connection. This is a problem if you want to run both Slack lambda and TC Central and expose both using ngrok. 

The solution is to use the `--region` field while starting ngrok. So, if you're already running ngrok, you will see a region such as `Region United States (us)` in the terminal.
To start another ngrok session just choose another region to run in by executing `ngrok http 3001 --region au`. This will start ngrok in `Region Australia (au)`

## Enable event subscriptions in Slack app

1. Go to https://api.slack.com/apps and click on the app that you created earlier in `Create a Slack App`

2. Click on `Features` -> `Event Subscriptions`. Turn it on.

3. Go to `Subscribe to Bot Events` section and add `app_mention` event. (See the image below)

4. Scroll up and provide a `Request URL`. Provide value `NGROK_URL/slack/events` and click `Save changes` once verified.

![](images/events.png)

## Enable interactive components in Slack app

1. Go to https://api.slack.com/apps and click on the app that you created earlier in `Create a Slack App`

2. Click on `Features` -> `Interactive Components`. Turn it on and fill in `NGROK_URL/slack/interactive` into the `Request URL` field. Click Save changes.

![](images/interactive.png)

## Setup slack workspace

1. Invite the bot user `/invite @topbot` to the channel that you configured earlier in the `provider:environment:CHANNEL` field in `serverless.yml`

## Setup Slack lambda

If you haven't already done it, then setup Slack lambda by following its `DeploymentGuide.md` before moving on to [Verification Guide](./VerificationGuide.md). Note that if you change the port of Slack lambda, then you need to update `provider:environment:SLACK_LAMBDA_URI` field in `serverless.yml` **and restart** TC Central lambda.

## Setup Teams lambda

If you haven't already done it, then setup Teams lambda by following its `DeploymentGuide.md` before moving on to [Verification Guide](./VerificationGuide.md). Note that if you change the port of Teams lambda, then you need to update `provider:environment:TEAMS_LAMBDA_URI` field in `serverless.yml` **and restart** TC Central lambda.