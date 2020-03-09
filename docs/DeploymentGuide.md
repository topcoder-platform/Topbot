# Deployment Guide

## Prerequisites

1. Node.js >= v12.14.1

2. ngrok: https://ngrok.com/download

## Dynamodb & SNS setup

Topbot uses Dynamodb to store/retrieve data and listens to SNS topics to obtain events from Topbot - Receiver.

If you already have dynamodb running, then you can skip the install and run steps 1 and 2

1. To install DynamoDB locally run `sls dynamodb install`.

2. To start DynamoDB run `sls dynamodb start --migrate`. This will automatically create tables and starts dynamodb on port 8000 by default.

3. **ENV** Update `provider:environment:DYNAMODB_ENDPOINT` field in `serverless.yml` with the dynamodb port

```yml
environment:
  # AWS configuration
  ACCESS_KEY_ID: DEFAULT_ACCESS_KEY
  SECRET_ACCESS_KEY: DEFAULT_SECRET
  REGION: FAKE_REGION
  DYNAMODB_ENDPOINT: http://localhost:8000 # This value
```

4. `serverless-offline-sns` will run a SNS instance locally.

**ENV** Update `custom:serverless-offline-sns:sns-endpoint` field in `serverless.yml` with the SNS port

```yml
serverless-offline-sns:
  port: 4000 # This value
  debug: false
```

Update `provider:environment:SNS_ENDPOINT` with this value.

```yml
environment:
  # SNS Configuration
  SNS_ENDPOINT: http://localhost:4000 # This value should be identical with the value in `serverless-offline-sns`
  SNS_REGION: us-west-2
  SNS_ACCOUNT_ID: 123456789012 # Dummy value in local setup
```

The other SNS config values can be set the same unless you explicitly change it in SNS.

5. [Optional] You can view the contents of dynamodb in your browser using a tool like [dynamodb-admin](https://www.npmjs.com/package/dynamodb-admin)

## Build the project
1. Install `serverless` globally. `npm i -g serverless`

2. In the `Topbot` directory run `npm i` to install required modules

3. [Optional] Check for lint errors by running `npm run lint`. Fix any errors by running `npm run lint:fix`


## Setup TC Central lambda
If you haven't already done it, then setup TC Central lambda by following its [DeploymentGuide.md](./tc-slack/DeploymentGuide.md) before moving on to [Verification Guide](./VerificationGuide.md).
## Start the server

1. In the directory run `serverless offline` to start the Serverless API gateway on port 3000. The gateway runs the lambda functions on demand.

2. You should see that the SNS topics are created.
```
Serverless: INFO[serverless-offline-sns]: Creating topic: "tc-slack-events" for fn "tc_slack_sns_events"
Serverless: INFO[serverless-offline-sns]: Creating topic: "tc-slack-interactive" for fn "tc_slack_sns_interactive"
Serverless: INFO[serverless-offline-sns]: Creating topic: "client-slack-events" for fn "client_slack_sns_events"
Serverless: INFO[serverless-offline-sns]: Creating topic: "client-slack-interactive" for fn "client_slack_sns_interactive"
Serverless: INFO[serverless-offline-sns]: Creating topic: "client-teams-events" for fn "client_teams_sns_events"
```
You can verify this using the aws cli `aws --endpoint-url=http://localhost:4000 sns list-topics`.

3. Expose the server using `ngrok`. Run `ngrok http 3000`. You will obtain a url like `https://bba62ba4.ngrok.io`. Note down this value. I will refer to it as `NGROK_URL`.
## Setup Slack lambda
If you haven't already done it, then setup Slack lambda by following its [DeploymentGuide.md](./client-slack/DeploymentGuide.md) before moving on to [Verification Guide](./VerificationGuide.md).
## Setup Teams lambda
If you haven't already done it, then setup Teams lambda by following its [DeploymentGuide.md](./client-teams/DeploymentGuide.md) before moving on to [Verification Guide](./VerificationGuide.md).
