/**
 * Contains schemas for input validation
 */

const Joi = require('@hapi/joi')

// Schema for POST /request
const requestSchema = Joi.object({
  description: Joi.string().required(),
  requester: Joi.string().required(),
  clientSlackThread: Joi.string().required(),
  clientSlackChannel: Joi.string().required()
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
