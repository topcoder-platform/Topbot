# Verification Guide

## Prerequisites

Both TC Central and Slack lambda need to be up and running. They both need to have their endpoints exposed by ngrok. They also need events and interactive component endpoints configured in Slack.

So you will have two Slack workspaces, 
one where TC Central bot is installed - `Topcoder Workspace`
and another where Slack bot is installed - `Client Workspace`

## Verification

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

Message is posted to `Topcoder Workspace` along with an "Approve" button

![](images/accept.png)

5. Click on "Approve"

Observe,

An acknowledgement is posted to `Topcoder Workspace`

![](images/approve_ack.png)

Message is posted to `Client Workspace` telling them they can invite users now

![](images/approve.png)

6. Issue an user invite command in `Client Workspace`

![](images/email.png)

Observe,

An acknowledgement is posted to `Client Workspace`

![](images/c_email.png)

A message is posted to `Topcoder Workspace`

![](images/t_email.png)



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

6. Multipl clicks on Approve

![](images/multiple_approved.png)

7. Multiple clicks on "Post a response"

![](images/multiple_post.png)

