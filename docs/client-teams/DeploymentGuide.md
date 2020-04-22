# MS Teams Deployment Guide

## Pre Deployment Configuration

### Office 365 subscription

1. Create a new microsoft account if you don't have one already. You can sign up [here](https://account.microsoft.com/account)

2. Add a First and Last name to your account if you don't have one already. Click `Add Name` button [here](https://account.microsoft.com/profile/)

![](../images/teams/add_name.png)

3. Once done, join the Office 365 Developer Program by clicking `Join Now` button [here](https://dev.office.com/devprogram).

If you just added your name in Step 2, you need to wait a couple of hours before you can join the Office 365 Developer Program.

![](../images/teams/wait.png)

4. Provide country, company name, accept license and click Next

![](../images/teams/dev_program.png)

5. Provide required fields, I provided values, `Information technology`, `Personal projects`, `Personal projects`, `Microsoft Teams`. Click `Next`.

![](../images/teams/dev_required.png)

6. Click `Set Up Subscription` in the following step, provide username, domain and password and click continue. Remember these values. Your TEAMS_EMAIL for subsequent steps will be `username@domain.onmicrosoft.com` and your TEAMS_PASSWORD will be the password you entered.

![](../images/teams/dev_sub_1.png)

7. Provide your phone number for a verification code and enter it

![](../images/teams/dev_sub_2.png)

### Admin portal setup

1. Go to [Admin portal](https://portal.office.com/adminportal/home) and sign in using TEAMS_EMAIL and TEAMS_PASSWORD from above

2. Click on `Users` -> `Active Users` -> Select your user -> `Licenses and Apps` in the side menu, Check the license `Microsoft 365 E5 Developer (without Windows and Audio Conferencing)` and click `Save changes`.

![](../images/teams/admin.png)

### Ms Teams setup

1. Sign in to MS teams [here](https://products.office.com/en-us/microsoft-teams/group-chat-software?SilentAuth=1) using the TEAMS_EMAIL and TEAMS_PASSWORD from above. Click `Use the web app instead`

2. On success, you will see teams. Click `Teams` -> `Create a team` -> `Build a teams from scratch` -> `Public` -> Provide a name and click `Create`

![](../images/teams/create_team.png)

3. Skip adding members. On success, you should see your team created,

![](../images/teams/team_created.png)

### Create a bot

1. Go to https://dev.botframework.com/bots/new and sign in using TEAMS_EMAIL and TEAMS_PASSWORD.

2. Provide details,

  a. Display name

  b. Bot handle

![](../images/teams/create_ms_bot.png)

  c. Configuration -> Click Create Microsoft App ID. You will be redirected to Azure. Click `Register an application`. Provide name and select `Accounts in any organizational directory (Any Azure AD directory - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)` and click register

![](../images/teams/azure_1.png)

![](../images/teams/azure_2.png)

  d. Copy you Application (client) id

![](../images/teams/app_id.png)

  e. **ENV** Paste App id back in the `Create bot` -> `Configuration` -> `Paste your app ID below to continue` section. This will be your app id. Provide this value in `serverless.yml` -> `# Client Teams bot configuration` -> `APP_ID`

![](../images/teams/paste_app_id.png)

  f. Accept license and click `Register`

3. On the bot page, click `Add featured channel` -> `Ms Teams`

![](../images/teams/add_teams_1.png)

4. Click `Save`

![](../images/teams/add_teams_2.png)

### App Studio setup

1. Go back to Ms Teams and click `...` -> Search for `App Studio` and `Add` it

![](../images/teams/app_studio_1.png)

2. Click `Manifest Editor` -> `Import Existing App` -> Select `manifest.zip`. Upload it.

3. Click `Edit` manifest

![](../images/teams/edit_manifest.png)

4. In `App details` click `Identification` -> `Generate`

5. In `Capabilities` -> `Bots` -> Click `Delete` to delete any existing bot. Then click, `Setup` -> `Existing bot`

6. Provide name, select existing bot -> choose bot from `Create a bot section`, Check `Scope` Personal, Team and Group and click `Save`

![](../images/teams/add_ms_bot.png)

7. **ENV** Under `App passwords` click `Generate new password`. Copy this value to `serverless.yml` -> `# Client Teams bot configuration` -> `APP_PASSWORD`. If the password contains special characters, enclose it in quotes. e.g. `APP_PASSWORD: 'Jips0:0JPN.B-kSuSZG3XWza8I:aFnE:'`

### Lambdas setup

If you haven't already done it, then setup lambdas by following its [DeploymentGuide.md](../DeploymentGuide.md).
By now, all required fields in the env file should be filled:
```
   # MS Teams bot configuration
   CLIENT_TEAMS_APP_ID=
   CLIENT_TEAMS_APP_PASSWORD=
```

## Post Deployment Configuration
This section helps to complete configurations for local deployment and AWS Account deployment.
You should use your custom domain instead of `NGROK_OR_CUSTOM_URL` for AWS Account deployment.
You should use your ngrok domain instead of `NGROK_OR_CUSTOM_URL` for local deployment.

1. In `Messaging endpoint` provide value `NGROKOR_CUSTOM_URL/client-teams/events`

**NOTE** Steps 11, 12 and 13 may not be needed if you just upload `manifest.zip`

2. Click `Add` in `Commands`. Provide values, command text as `request`, Help text `Send a project description message`. Scope all 3 and click `Save`

![](../images/teams/command.png)

3. Repeat step 11 for `email` command. Provide values, command text as `email`, Help text `Provide an email id to invite to project`. Scope all 3 and click `Save`

![](../images/teams/email.png)

4. Repeat step 11 for `help` command. Provide values, command text as `help`, Help text `Show supported commands`. Scope all 3 and click `Save`

5. Click `Finish` -> `Test and distribute` -> `Download`. Save the zip file

6. Go to `...` -> `More apps` -> `Upload a custom app` and upload the zip file from step 12

7. Click on the uploaded app and `Add` it to team by selecting `Add to team` in dropdown.

![](../images/teams/add_app.png)

![](../images/teams/add_app_team.png)

8. Now if you go to the `General` or any other new channel you create, you will be able to see `@topbot`.

**NOTE** If the NGROK_OR_CUSTOM_URL is changed or is deployed for the first time, you might need to wait for a few minutes before you can issue commands successfully.

Follow steps in [Verification Guide](./VerificationGuide.md) to verify.
