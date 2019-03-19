const Joi = require('joi')

const validators = {
    login: {
        schema: {
            body: {
                username: Joi.string().email().required(),
                password: Joi.string().min(5).max(32).required()
            }
        }
    }
}

module.exports = validators
