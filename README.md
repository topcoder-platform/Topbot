# Topbot - Central TC Lambda

## Overview

Central TC acts as a bridge between TC Slack and Client Slack Lambda or Client MS Teams Lambda

![](docs/images/architecture.png)

## Deployment Guide

Follow instructions in [Deployment Guide](docs/DeploymentGuide.md)

## Verification Guide

Follow instructions in [Verification Guide](docs/VerificationGuide.md)

Also see demo video at https://youtu.be/PqyhPuFK7ew

## Swagger documentation

REST API's are documented in [swagger.yaml](docs/swagger/swagger.yaml)

## DynamoDB database description

Database has one table `projects` with the following fields,

`id` (primary_key): Unique id for each project

`description`: Project description

`requester`: The name of the client user who initiates project request

`createdAt`: Timestamp at which the project was created

`status`: Current status of the project. It is one of LAUNCHED, RESPONDED, ACCEPTED, DECLINED or APPROVED. 

Why we need it: To handle scenarios like multiple clicks on buttons.

`clientSlackThread` (has an index - `client_slack_thread_index`): The thread id in client slack where the @topbot request command was initially invoked.

`clientSlackChannel`: The channel in client slack where the @topbot request command was initially invoked. The client can invoked this command in any channel so the combination of clientSlackThread and clientSlackChannel uniquely identify a request thread.

Why we need it: `clientSlackThread` and `clientSlackChannel`: These fields are used by Slack lambda to post a response to the right thread when `/approve` is called on it. It is also used to identify the project when an `email` command is issued. Without these fields we'd have no context of which thread to post responses to.

`tcSlackThread`: Thread id in topcoder slack where the project request was initially posted by TC Central.

Why we need it: This is used to post messages to TC Slack when routes `/accept` or `/decline` or `/invite` is called. Also used during dialog submission. Without it we'd have no context of which thread to post responses to.
There is no need to store tcSlackChannel as it is fixed.
