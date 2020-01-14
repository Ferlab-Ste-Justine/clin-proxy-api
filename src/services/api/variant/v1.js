import errors from 'restify-errors'
import { readFileSync } from 'fs'

import translate from './sqon'
import { DIALECT_LANGUAGE_ELASTIC_SEARCH, EMPTY_ELASTIC_SEARCH_DIALECT_OPTIONS } from './sqon/dialect/es'

const schema = JSON.parse( readFileSync( `${__dirname}/schema/1.json`, 'utf8' ) )

const getSessionDataFromToken = async ( token, cacheService ) => {
    return await cacheService.read( token.uid )
}

const getSchema = async ( logService ) => {
    try {
        await logService.debug( `Returned schema version ${schema.version}` )
        return schema
    } catch ( e ) {
        await logService.warning( 'Could not locate schema version' )
        return new errors.InternalServerError()
    }
}

const getVariants = async ( req, res, cacheService, elasticService, logService ) => {
    try {
        const sessionData = await getSessionDataFromToken( req.token, cacheService )
        const params = req.body
        const patient = params.patient
        const statement = params.statement
        const query = params.query
        const group = params.group || null
        const limit = params.size || 25
        const index = ( params.page ? ( params.page - 1 ) : 0 ) * limit
        const translatedQuery = translate( statement, query, schema, DIALECT_LANGUAGE_ELASTIC_SEARCH, EMPTY_ELASTIC_SEARCH_DIALECT_OPTIONS )
        const response = await elasticService.searchVariantsForPatient( patient, translatedQuery, sessionData.acl.fhir, schema, group, index, limit )

        const hits = response.hits.hits.map( ( hit ) => {
            return hit._source
        } )

        const facets = Object.keys( response.aggregations ).reduce( ( aggs, category ) => {
            aggs[ category ] = response.aggregations[ category ].buckets.reduce( ( accumulator, bucket ) => {
                return [ ...accumulator, { value: bucket.key, count: bucket.doc_count } ]
            }, [] )
            return aggs
        }, {} )

        await logService.debug( `Elastic searchVariantsForPatient using ${patient}/${query} [${index},${limit}] found ${response.hits.total} matches` )

        return {
            total: response.hits.total,
            query,
            hits,
            facets
        }
    } catch ( e ) {
        await logService.warning( `Elastic searchVariantsForPatient ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

export default {
    getSchema,
    getVariants
}
