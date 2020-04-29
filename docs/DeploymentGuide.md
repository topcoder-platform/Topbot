# Deployment Guide

## Prerequisites

1. Node.js >= v12.14.1

2. ngrok for local development: https://ngrok.com/download

## Setup

1. Install `serverless` globally with the command `npm i -g serverless`

## Configure and deploy Slack bots

### Build the project
1. In the root directory run `npm i` to install required modules

2. [Optional] Check for lint errors by running `npm run lint`. Fix any errors by running `npm run lint:fix`

### Stage and environment files
You must use the 'local' stage  for local development. The environment file called '.env.local' will be used.
You should enter all required parameters in this files. Don't change any values in serverless.xml.

### Configure Dynamodb
Topbot uses Dynamodb to store/retrieve data and listens to SNS topics to obtain events from Topbot - Receiver.

If you already have DynamoDB running, then you can skip the install and run steps 1 and 2.

1. To install DynamoDB locally run `sls dynamodb install`.

2. To start DynamoDB run `sls dynamodb start --migrate`. This will automatically create tables and starts dynamodb on port 8000 by default.

3. **ENV** Update `DYNAMODB_ENDPOINT` field in the env file with the dynamodb port

    ```
      DYNAMODB_ENDPOINT: http://localhost:8000 # This value
    ```
4. [Optional] You can view the contents of dynamodb in your browser using a tool like [dynamodb-admin](https://www.npmjs.com/package/dynamodb-admin)

#### Configure SNS Endpoints
1. `serverless-offline-sns` will run a SNS instance locally.

Update `SNS_ENDPOINT_HOST` and `SNS_ENDPOINT_PORT` with this value.

```
  # SNS Configuration
  SNS_ENDPOINT_PORT=4000
  SNS_ENDPOINT_HOST=http://localhost
```

   The other SNS config values can be set the same unless you explicitly change it in SNS.

### TC Slack bot parameters
You must set the TC Slack parameters in serverless.xml before deploying.
Go to TC Slack Deployment Guide to find how get these values and updates `serverless.xml`.
You need only the section:
- [`Pre Deployment Configuration`](./tc-slack/DeploymentGuide.md)

We'll continue configuring TC Slack after deploying in AWS Account.

### Client Slack bot parameters
You must set the Client Slack parameters in serverless.xml before deploying if you want to use Client Slack bot.
Go to Client Slack Deployment Guide to find how get these values and updates `serverless.xml`.
You need to do only this section.
- [`Pre Deployment Configuration`](./client-slack/DeploymentGuide.md)

We'll continue configuring Client Slack after deploying in AWS Account.

### MS Teams bot parameters
You must set the MS Teams parameters in serverless.xml before deploying if you want to use MS Team bot.
Go to MS Teams Deployment Guide to find how get these values and updates `serverless.xml`.
You need to do only this section.
- [`Pre Deployment Configuration`](./client-teams/DeploymentGuide.md)

We'll continue configuring Client MS Team after deploying in AWS Account.

### Deploying locally
1. In the directory run `sls offline` to start the Serverless API gateway on port 3000. The gateway runs the lambda functions on demand.
You shouls see the output:
```
> serverless offline

Serverless: INFO[serverless-offline-sns]: Creating topic: "tc-slack-events" for fn "tc_slack_sns_events"
Serverless: INFO[serverless-offline-sns]: Creating topic: "tc-slack-interactive" for fn "tc_slack_sns_interactive"
Serverless: INFO[serverless-offline-sns]: Creating topic: "client-slack-events" for fn "client_slack_sns_events"
Serverless: INFO[serverless-offline-sns]: Creating topic: "client-slack-interactive" for fn "client_slack_sns_interactive"
Serverless: INFO[serverless-offline-sns]: Creating topic: "client-teams-events" for fn "client_teams_sns_events"
Serverless: Starting Offline: local/us-east-1.

Serverless: Routes for tc_slack_events:
Serverless: POST /tc-slack/events
Serverless: POST /{apiVersion}/functions/BotLambda-local-tc_slack_events/invocations

Serverless: Routes for tc_slack_interactive:
Serverless: POST /tc-slack/interactive
Serverless: POST /{apiVersion}/functions/BotLambda-local-tc_slack_interactive/invocations

Serverless: Routes for client_slack_events:
Serverless: POST /client-slack/events
Serverless: POST /{apiVersion}/functions/BotLambda-local-client_slack_events/invocations

Serverless: Routes for client_slack_interactive:
Serverless: POST /client-slack/interactive
Serverless: POST /{apiVersion}/functions/BotLambda-local-client_slack_interactive/invocations

Serverless: Routes for tc_slack_request:
Serverless: POST /tc-slack/request
Serverless: POST /{apiVersion}/functions/BotLambda-local-tc_slack_request/invocations

Serverless: Routes for tc_slack_sns_events:
Serverless: POST /{apiVersion}/functions/BotLambda-local-tc_slack_sns_events/invocations

Serverless: Routes for tc_slack_sns_interactive:
Serverless: POST /{apiVersion}/functions/BotLambda-local-tc_slack_sns_interactive/invocations

Serverless: Routes for tc_slack_accept:
Serverless: POST /tc-slack/accept
Serverless: POST /{apiVersion}/functions/BotLambda-local-tc_slack_accept/invocations

Serverless: Routes for tc_slack_decline:
Serverless: POST /tc-slack/decline
Serverless: POST /{apiVersion}/functions/BotLambda-local-tc_slack_decline/invocations

Serverless: Routes for tc_slack_invite:
Serverless: POST /tc-slack/invite
Serverless: POST /{apiVersion}/functions/BotLambda-local-tc_slack_invite/invocations

Serverless: Routes for client_slack_sns_events:
Serverless: POST /{apiVersion}/functions/BotLambda-local-client_slack_sns_events/invocations

Serverless: Routes for client_slack_sns_interactive:
Serverless: POST /{apiVersion}/functions/BotLambda-local-client_slack_sns_interactive/invocations

Serverless: Routes for client_slack_response:
Serverless: POST /client-slack/response
Serverless: POST /{apiVersion}/functions/BotLambda-local-client_slack_response/invocations

Serverless: Routes for client_slack_approve:
Serverless: POST /client-slack/approve
Serverless: POST /{apiVersion}/functions/BotLambda-local-client_slack_approve/invocations

Serverless: Routes for client_slack_signIn:
Serverless: GET /client-slack/signin
Serverless: POST /{apiVersion}/functions/BotLambda-local-client_slack_signIn/invocations

Serverless: Routes for client_slack_auth:
Serverless: GET /client-slack/auth/redirect
Serverless: POST /{apiVersion}/functions/BotLambda-local-client_slack_auth/invocations

Serverless: Routes for client_teams_events:
Serverless: POST /client-teams/events
Serverless: POST /{apiVersion}/functions/BotLambda-local-client_teams_events/invocations

Serverless: Routes for client_teams_sns_events:
Serverless: POST /{apiVersion}/functions/BotLambda-local-client_teams_sns_events/invocations

Serverless: Routes for client_teams_response:
Serverless: POST /client-teams/response
Serverless: POST /{apiVersion}/functions/BotLambda-local-client_teams_response/invocations

Serverless: Routes for client_teams_approve:
Serverless: POST /client-teams/approve
Serverless: POST /{apiVersion}/functions/BotLambda-local-client_teams_approve/invocations

Serverless: Offline [HTTP] listening on http://localhost:3000
Serverless: Enter "rp" to replay the last request
```

2. You can verify this using the aws cli `aws --endpoint-url=http://localhost:4000 sns list-topics`.
```
aws --endpoint-url=http://localhost:4000 sns list-topics
{
    "Topics": [
        {
            "TopicArn": "arn:aws:sns:us-east-1:123456789012:tc-slack-events"
        },
        {
            "TopicArn": "arn:aws:sns:us-east-1:123456789012:tc-slack-interactive"
        },
        {
            "TopicArn": "arn:aws:sns:us-east-1:123456789012:client-slack-events"
        },
        {
            "TopicArn": "arn:aws:sns:us-east-1:123456789012:client-slack-interactive"
        },
        {
            "TopicArn": "arn:aws:sns:us-east-1:123456789012:client-teams-events"
        }
    ]
}

```

3. Expose the server using `ngrok`. Run `ngrok http 3000`. You will obtain a url like `https://bba62ba4.ngrok.io`. Note down this value. I will refer to it as `NGROK_OR_CUSTOM_URL`.

4. Need to complete the configuration

    Go to TC Slack Deployment Guide to complete the configuration:
    - ['Post Deployment Configuration' section](./tc-slack/DeploymentGuide.md)

    Go to Client Slack Deployment Guide to complete the configuration:
    - ['Post Deployment Configuration' section](./client-slack/DeploymentGuide.md)

    Go to Client MS Teams Deployment Guide to complete the configuration:
    - ['Post Deployment Configuration'](./client-teams/DeploymentGuide.md)

Configuration completed. Go to verification steps.
