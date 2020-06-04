import errors from 'restify-errors'
import { DIALECT_LANGUAGE_ELASTIC_SEARCH } from '../helpers/sqonMapper/dialect/es'
import { DIALECT_LANGUAGE_GRAPHQL } from '../helpers/sqonMapper/dialect/gql'
import { readFileSync } from 'fs'


const readSchemaAndAttachEnvironmentVariables = ( dialects, variables ) => {
    return dialects.reduce( ( accumulator, dialect ) => {
        let schema = readFileSync( `${__dirname}/schema/${dialect}/1.json`, 'utf8' )

        Object.keys( variables ).forEach( ( variable ) => {
            schema = schema.replace( `%%${variable}%%`, variables[ variable ] )
        } )

        accumulator[ dialect ] = JSON.parse( schema )
        return accumulator
    }, {} )
}

const schemaVariables = JSON.parse( process.env.VARIANT_API_SERVICE ).schemaVariables || {}
const schemas = readSchemaAndAttachEnvironmentVariables( [ DIALECT_LANGUAGE_ELASTIC_SEARCH, DIALECT_LANGUAGE_GRAPHQL ], schemaVariables )


const getSessionDataFromToken = async ( token, cacheService ) => {
    return await cacheService.read( token.uid )
}

const getPatientById = async ( req, res, cacheService, elasticService, logService ) => {
    try {
        const sessionData = await getSessionDataFromToken( req.token, cacheService )
        const response = await elasticService.searchPatients( sessionData.acl.fhir, [], [ { match: { id: req.params.uid } } ], [] )

        if ( response.hits.total < 1 ) {
            return new errors.NotFoundError()
        }

        await logService.debug( `Elastic getPatientById for ${req.params.uid}` )
        return response.hits.hits[ 0 ]._source
    } catch ( e ) {
        await logService.warning( `Elastic getPatientById ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

const searchPatients = async ( req, res, cacheService, elasticService, logService ) => {
    try {
        const sessionData = await getSessionDataFromToken( req.token, cacheService )
        const params = req.query || req.params || req.body
        const limit = params.size || 25
        const index = ( params.page ? ( params.page - 1 ) : 0 ) * limit

        const response = await elasticService.searchPatients( sessionData.acl.fhir, [], [], [], index, limit )

        await logService.debug( `Elastic searchPatients [${index},${limit}] returns ${response.hits.total} matches` )
        return {
            total: response.hits.total,
            hits: response.hits.hits
        }
    } catch ( e ) {
        await logService.warning( `Elastic searchPatients ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

const getPatients = async ( req, res, cacheService, elasticService, logService ) => {
    try {
        console.log( '++ entering getPatients' )
        const sessionData = await getSessionDataFromToken( req.token, cacheService )
        const params = req.body
        const statement = params.statement
        const query = params.query
        const group = params.group || null
        const limit = params.size || 25
        const index = ( params.page ? ( params.page - 1 ) : 0 ) * limit
        const dialect = params.dialect || DIALECT_LANGUAGE_ELASTIC_SEARCH
        const schema = schemas[ dialect ]

        let response = {}
        let totalFromResponse = 0
        let hitsFromResponse = []

        switch ( dialect ) {
            default:
            case DIALECT_LANGUAGE_GRAPHQL:
                return new errors.NotImplementedError()

            case DIALECT_LANGUAGE_ELASTIC_SEARCH:
                response = await elasticService.searchPatientsWithSQON( statement, query, sessionData.acl.fhir, schema, group, index, limit )
                /*
                totalFromResponse = response.hits.total
                hitsFromResponse = response.hits.hits.map( ( hit ) => {
                    const result = hit._source

                    result.donors = result.donors.filter( ( donor ) => donor.patientId === patient )
                    result.id = hit._id
                    return result
                } )
                break

                 */
                break
        }

        // await logService.debug( `Elastic getVariants using ${patient}/${query} [${index},${limit}] found ${response.hits.total} matches` )

        return {
            body: response.body,
            query,
            dialect,
            total: totalFromResponse,
            hits: hitsFromResponse
        }
    } catch ( e ) {
        await logService.warning( `Elastic getVariants ${e.toString()}` )
        return new errors.InternalServerError()
    }
}


const searchPatientsByAutoComplete = async ( req, res, cacheService, elasticService, logService ) => {
    try {
        const sessionData = await getSessionDataFromToken( req.token, cacheService )
        const params = req.query || req.params
        const query = params.query
        const type = params.type || 'partial'
        const limit = params.size || 25
        const index = ( params.page ? ( params.page - 1 ) : 0 ) * limit
        const fields = []

        if ( type === 'partial' ) {
            fields.push(
                'id',
                'name.family',
                'name.given',
                'identifier.JHN',
            )
        }

        const matches = [
            {
                multi_match: {
                    query: query,
                    type: 'phrase_prefix',
                    fields: [
                        'id',
                        'familyId',
                        'name.family',
                        'name.given',
                        'studies.title',
                        'specimens.id',
                        'identifier.MR',
                        'identifier.JHN',
                        'studies.title',
                        'samples.id'
                    ]
                }
            }
        ]

        const response = await elasticService.searchPatients( sessionData.acl.fhir, fields, [], matches, index, limit )

        await logService.debug( `Elastic searchPatientsByAutoComplete using ${params.type}/${params.query} [${index},${limit}] returns ${response.hits.total} matches` )
        return {
            total: response.hits.total,
            hits: response.hits.hits
        }
    } catch ( e ) {
        await logService.warning( `Elastic searchPatientsByAutoComplete ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

export default {
    getPatientById,
    searchPatients,
    getPatients,
    searchPatientsByAutoComplete
}
