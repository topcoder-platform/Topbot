/**
 * Contains schemas for input validation
 */

const Joi = require('@hapi/joi')

// Schema for POST /approve
const approveSchema = Joi.object({
  projectId: Joi.string().required()
})

// Schema for POST /response
const responseSchema = Joi.object({
  projectId: Joi.string().required(),
  text: Joi.string().required()
})

module.exports = {
  approveSchema,
  responseSchema
}
