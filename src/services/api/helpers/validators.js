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
    byPatientId: {
        schema: {
            params: Joi.object( {
                uid: Joi.string().alphanum().min( 3 ).max( 32 ).required()
            } ).required()
        }
    },
    byPatientIdAndObservationType: {
        schema: {
            params: Joi.object( {
                uid: Joi.string().alphanum().min( 3 ).max( 32 ).required(),
                type: Joi.string().valid( [ 'medical', 'phenotype' ] )
            } ).required()
        }
    }
}
