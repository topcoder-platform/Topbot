# Verification Guide

## Prerequisites

TC Central, Slack lambda and Teams lambda need to be up and running. They all need to have their endpoints exposed by ngrok.

So you will have three workspaces, 
one where TC Central bot is installed - `Topcoder Workspace`
and another where Slack bot is installed - `Client teams workspace`
and another where Teams bot is installed - `Client teams workspace`

## Verification

### Verify Slack lambda

1. Issue a project request command in `Client Workspace` in any channel

![](images/request.png)

Observe,

An acknowledgement is posted to `Client Workspace`

![](images/s_ack.png)

The request is posted to `Topcoder Workspace` along with the requester name and a "Post a response" button

![](images/t_request.png)

2. Click on the "Post a response" button in `Topcoder Workspace`

Observe,

A dialog will open

![](images/dialog.png)

3. Provide a response and click "Post"

![](images/dialog_response.png)

Observe,

An acknowledgement is posted to `Topcoder Workspace`

![](images/t_dialog_ack.png)

The response is posted to `Client Workspace` along with the topcoder user name who responded and two buttons, "Accept" and "Decline"

![](images/response.png)

4. Click on "Accept"

Observe,

An acknowledgement is posted to `Client Workspace`

![](images/accept_ack.png)

A message with `Provide project name` is posted to slack

![](images/teams/provide_name.png)

5. Click on the `Provide project button`. You will see a dialog where you can enter the project name. Add a name and click `Post`.

![](images/teams/provide_name_dialog.png)

    Observe,

    a. A project created message is posted to Slack

![](images/project_created.png)

    b. An acknowledgement is posted to TC Slack

![](images/teams/project_created_slack.png)

5. Provide an email using `@topbot email mayur.gmail.com` as a reply to the project created message

![](images/provide_email.png)

    Observe,

    a. An invite confirmation message is posted to Client Slack with a link to the Connect project

![](images/email_ack.png)


    b. A message is posted to TC Slack saying user has been invited

![](images/teams/email_slack.png)

6. Open the `Connect` link and login using your connect credentials. You will see the created project along with the invited user

![](images/connect.png)



This completes one flow. Repeat steps 1, 2 and 3 and then,

4. Click on "Decline"

Observe,

An acknowledgement is posted to `Client Workspace`

![](images/declined_ack.png)

Message is posted to `Topcoder Workspace`

![](images/declined.png)


Help command,

1. Issue in `Client Workspace`

![](images/c_help.png)

2. Issue in `Topcoder Workspace`

![](images/t_help.png)

## Edge cases

1. Issue project request in a thread which already has a project. This needs to fail because of many error scenarios. One of them is that the `email` command uses the root thread id to identify a project. So if a thread has two projects, the `email` command will always choose the first project. The second project can never have users invited. 

![](images/project_exists.png)

2. Try email command in non-request thread

![](images/email_no_thread.png)

3. Multiple clicks on Accept and Decline when project is Approved

![](images/ad_approved.png)

4. Multiple clicks on Accept and Decline when project is Accepted but not Approved

![](images/ad_accepted.png)

5. Multiple clicks on Accept and Decline when project is Declined

![](images/ad_declined.png)

6. Multiple clicks on "Post a response"

![](images/multiple_post.png)


### Verify Teams lambda

# Verification Guide

## Prerequisites

Both TC Central and Teams lambda need to be up and running. They both need to have their endpoints exposed by ngrok. They also need events and interactive component endpoints configured in Slack and Teams.

So you will have two workspaces, 
one where TC Central bot is installed - `Topcoder Workspace`
and another where Teams bot is installed - `Client Workspace`

## Verification

1. Issue a command `@topbot request Create a topcoder bot` in a Ms Teams channel.

![](images/teams/request.png)

    You will see two things,

    a. A request acknowledgement is posted to Ms Teams

![](images/teams/request_ack.png)

    b. The request is posted to the configured Slack channel

![](images/teams/request_slack.png)

2. Click on the `Post a response` button in the Slack message. You will see a dialog with a text area where you can add a response. Add a response and click `Post`.

![](images/teams/response.png)

    You will see two things,

    a. An acknowledgement is posted to Slack

![](images/teams/response_ack.png)

    b. The response is posted back to Ms Teams with the `accept` and `decline` buttons

![](images/teams/response_teams.png)

3. Click on the `Accept` button in Ms Teams

    Observe,

    a. An acknowledgement is posted to Ms Teams

![](images/teams/accept_ack.png)

    b. A message with `Provide project name` is posted to slack

![](images/teams/provide_name.png)

4. Click on the `Provide project button`. You will see a dialog where you can enter the project name. Add a name and click `Post`.

![](images/teams/provide_name_dialog.png)

    Observe,

    a. A project created message is posted to Ms Teams

![](images/teams/project_created.png)

    b. An acknowledgement is posted to Slack

![](images/teams/project_created_slack.png)

5. Provide an email using `@topbot email mayur.gmail.com` as a reply to the project created message

![](images/teams/provide_email.png)

    Observe,

    a. An invite confirmation message is posted to Ms teams with a link to the Connect project

![](images/teams/email_ack.png)


    b. A message is posted to Slack saying user has been invited

![](images/teams/email_slack.png)

6. Open the `Connect` link and login using your connect credentials. You will see the created project along with the invited user

![](images/teams/connect.png)

7. You can repeat Steps 1 and 2 and click the `Decline` button. You will see a message posted to Slack

![](images/teams/decline.png)

8. Issue help command, `@topbot help`

![](images/teams/help.png)

8. You can also try different scenarios

    a. Invite user who is already invited

    b. Try email command in non request thread

    c. Multiple clicks on Accept and Decline

    d. Multiple clicks on "Post a response" and "Provide a name"

