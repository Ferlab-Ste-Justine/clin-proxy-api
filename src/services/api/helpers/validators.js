import Joi from '@hapi/joi'

export default {
    login: {
        schema: {
            body: Joi.object( {
                username: Joi.string().email().required(),
                password: Joi.string().min( 5 ).max( 32 ).required()
            } ).required()
        }
    },
    searchPatientByPatientId: {
        schema: {
            params: Joi.object( {
                uid: Joi.string().alphanum().min( 3 ).max( 32 ).required()
            } ).required()
        }
    },
    searchVariantsForPatientByQuery: {
        body: Joi.object( {
            patient: Joi.string().required(),
            statement: Joi.array().required(),
            query: Joi.string().required(),
            group: Joi.string(),
            index: Joi.number().integer().min( 0 ),
            limit: Joi.number().integer().min( 1 ).max( 1000 )
        } ).required()
    }
}
