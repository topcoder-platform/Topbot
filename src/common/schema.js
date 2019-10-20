/**
 * Contains schemas for input validation
 */

const Joi = require('@hapi/joi')

// Schema for POST /launch
const launchSchema = Joi.object({
  description: Joi.string().required(),
  user: Joi.string().required()
})

module.exports = {
  launchSchema
}
