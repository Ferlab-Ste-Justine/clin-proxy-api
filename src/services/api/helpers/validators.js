import Joi from '@hapi/joi'

export default {
    login: {
        schema: {
            body: Joi.object( {
                username: Joi.string().email().required(),
                password: Joi.string().min( 1 ).max( 256 ).required()
            } ).required()
        }
    },
    searchPatientByPatientId: {
        schema: {
            params: Joi.object( {
                uid: Joi.string().alphanum().min( 1 ).max( 256 ).required()
            } ).required()
        }
    },
    searchPatientByAutoComplete: {
        schema: {
            query: Joi.object( {
                type: Joi.string().valid( [ 'partial', 'complete' ] ).required(),
                query: Joi.string().alphanum().min( 1 ),
                page: Joi.number().integer().min( 0 ),
                size: Joi.number().integer().min( 1 ).max( 1000 )
            } ).required()
        }
    },
    searchVariantsForPatientByQuery: {
        schema: {
            body: Joi.object( {
                patient: Joi.string().required(),
                statement: Joi.array().required(),
                query: Joi.string().min( 1 ).max( 256 ).required(),
                group: Joi.string(),
                page: Joi.number().integer().min( 0 ),
                size: Joi.number().integer().min( 1 ).max( 1000 )
            } ).required()
        }
    }
}
