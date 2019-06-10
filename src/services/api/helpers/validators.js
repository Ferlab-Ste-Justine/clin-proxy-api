import Joi from '@hapi/joi'

export default {
    login: {
        schema: {
            body: Joi.object( {
                username: Joi.string().email().required(),
                password: Joi.string().min( 5 ).max( 32 ).required()
            } ).required()
        }
    }
}
