/**
 * Contains schemas for input validation
 */

const Joi = require('@hapi/joi')
const config = require('config')

const PLATFORMS = config.get('PLATFORMS')

// Schema for POST /request
const requestSchema = Joi.object({
  description: Joi.string().required(),
  requester: Joi.string().required(),
  clientSlackThread: Joi.string().when('platform', {
    is: PLATFORMS.SLACK,
    then: Joi.required()
  }),
  clientSlackChannel: Joi.string().when('platform', {
    is: PLATFORMS.SLACK,
    then: Joi.required()
  }),
  slackTeam: Joi.string().when('platform', {
    is: PLATFORMS.SLACK,
    then: Joi.required()
  }),
  teamsConversationId: Joi.string().when('platform', {
    is: PLATFORMS.TEAMS,
    then: Joi.required()
  }),
  platform: Joi.string().valid(PLATFORMS.SLACK, PLATFORMS.TEAMS).required()
})

// Schema for POST /accept
const acceptSchema = Joi.object({
  projectId: Joi.string().required()
})

// Schema for POST /decline
const declineSchema = Joi.object({
  projectId: Joi.string().required()
})

// Schema for POST /invite
const inviteSchema = Joi.object({
  projectId: Joi.string().required(),
  email: Joi.string().required()
})

module.exports = {
  requestSchema,
  acceptSchema,
  declineSchema,
  inviteSchema
}
