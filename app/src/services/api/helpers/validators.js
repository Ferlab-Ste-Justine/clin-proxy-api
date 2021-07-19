import Joi from '@hapi/joi'

import { DIALECT_LANGUAGE_ELASTIC_SEARCH } from '../variant/sqon/dialect/es'
import { DIALECT_LANGUAGE_GRAPHQL } from '../variant/sqon/dialect/gql'

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
                uid: Joi.string().regex( /^[a-zA-Z0-9-]+$/ ).min( 1 ).max( 256 ).required()
            } ).required()
        }
    },
    searchPatientByAutoComplete: {
        schema: {
            query: Joi.object( {
                type: Joi.string().valid( [ 'partial', 'complete' ] ).required(),
                query: Joi.string().min( 1 ),
                page: Joi.number().integer().min( 0 ),
                size: Joi.number().integer().min( 1 ).max( 1000 ),
                gender: Joi.string().valid( [ 'Female', 'Male' ] )
            } ).required()
        }
    },
    searchGenesByAutoComplete: {
        schema: {
            query: Joi.object( {
                type: Joi.string().valid( [ 'partial', 'complete' ] ).required(),
                query: Joi.string().min( 1 ),
                page: Joi.number().integer().min( 0 ),
                size: Joi.number().integer().min( 1 ).max( 1000 )
            } ).required()
        }
    },
    searchVariantsForPatient: {
        schema: {
            body: Joi.object( {
                patient: Joi.string().required(),
                statement: Joi.array().min( 1 ).required(),
                query: Joi.string().min( 1 ).max( 256 ).required(),
                dialect: Joi.string().valid( [ DIALECT_LANGUAGE_ELASTIC_SEARCH, DIALECT_LANGUAGE_GRAPHQL ] ),
                group: Joi.string(),
                page: Joi.number().integer().min( 0 ),
                size: Joi.number().integer().min( 1 ).max( 1000 )
            } ).required()
        }
    },
    searchFacetsForPatient: {
        schema: {
            body: Joi.object( {
                patient: Joi.string().required(),
                statement: Joi.array().min( 1 ).required(),
                query: Joi.string().min( 1 ).max( 256 ).required(),
                dialect: Joi.string().valid( [ DIALECT_LANGUAGE_ELASTIC_SEARCH, DIALECT_LANGUAGE_GRAPHQL ] )
            } ).required()
        }
    },
    countVariantsForPatient: {
        schema: {
            body: Joi.object( {
                patient: Joi.string().required(),
                statement: Joi.array().min( 1 ).required(),
                queries: Joi.array().min( 1 ).required(),
                dialect: Joi.string().valid( [ DIALECT_LANGUAGE_ELASTIC_SEARCH, DIALECT_LANGUAGE_GRAPHQL ] )
            } ).required()
        }
    },
    searchVariantById: {
        schema: {
            params: Joi.object( {
                vid: Joi.string().alphanum().min( 1 ).max( 256 ).required()
            } ).required()
        }
    },
    requieredParentHpoId: {
        schema: {
            body: Joi.object( {
                parentHpoId: Joi.string().min( 10 ).max( 10 ).required()
            } )
        }
    }
}
