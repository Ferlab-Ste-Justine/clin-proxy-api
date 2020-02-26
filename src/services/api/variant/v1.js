import errors from 'restify-errors'
import { readFileSync } from 'fs'

import translate, { denormalize, getQueryByKey } from './sqon'
import { DIALECT_LANGUAGE_ELASTIC_SEARCH } from './sqon/dialect/es'
import { DIALECT_LANGUAGE_GRAPHQL } from './sqon/dialect/gql'

const schemas = {
    [ DIALECT_LANGUAGE_ELASTIC_SEARCH ]: JSON.parse( readFileSync( `${__dirname}/schema/${DIALECT_LANGUAGE_ELASTIC_SEARCH}/1.json`, 'utf8' ) ),
    [ DIALECT_LANGUAGE_GRAPHQL ]: JSON.parse( readFileSync( `${__dirname}/schema/${DIALECT_LANGUAGE_GRAPHQL}/1.json`, 'utf8' ) )
}

const getSessionDataFromToken = async ( token, cacheService ) => {
    return await cacheService.read( token.uid )
}

const getSchema = async ( logService, dialect = DIALECT_LANGUAGE_ELASTIC_SEARCH ) => {
    try {
        const schema = schemas[ dialect ]

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
        const dialect = params.dialect || DIALECT_LANGUAGE_ELASTIC_SEARCH
        const schema = schemas[ dialect ]
        const translatedQuery = translate( statement, query, schema, dialect )

        let response = {}
        let totalFromResponse = 0
        let hitsFromResponse = []

        switch ( dialect ) {
            default:
            case DIALECT_LANGUAGE_GRAPHQL:
                return new errors.NotImplementedError()

            case DIALECT_LANGUAGE_ELASTIC_SEARCH:
                response = await elasticService.searchVariantsForPatient( patient, translatedQuery, sessionData.acl.fhir, schema, group, index, limit )
                totalFromResponse = response.hits.total
                hitsFromResponse = response.hits.hits.map( ( hit ) => {
                    return hit._source
                } )
                break
        }

        await logService.debug( `Elastic getVariants using ${patient}/${query} [${index},${limit}] found ${response.hits.total} matches` )

        return {
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

const getFacets = async ( req, res, cacheService, elasticService, logService ) => {
    try {
        const sessionData = await getSessionDataFromToken( req.token, cacheService )
        const params = req.body
        const patient = params.patient
        const statement = params.statement
        const query = params.query
        const dialect = params.dialect || DIALECT_LANGUAGE_ELASTIC_SEARCH
        const facets = params.facets || []
        const schema = schemas[ dialect ]
        const denormalizedStatement = denormalize( statement )
        const denormalizedQuery = getQueryByKey( denormalizedStatement, query )
        const translatedQuery = translate( statement, query, schema, dialect )
        let response = {}
        let responseFacetKeys = []
        let facetsFromResponse = {}

        switch ( dialect ) {
            default:
            case DIALECT_LANGUAGE_GRAPHQL:
                return new errors.NotImplementedError()

            case DIALECT_LANGUAGE_ELASTIC_SEARCH:
                response = await elasticService.getFacetsForVariant( patient, translatedQuery, denormalizedQuery, sessionData.acl.fhir, schema, facets )
                if ( response.aggregations.filtered ) {
                    delete response.aggregations.filtered.meta
                    delete response.aggregations.filtered.doc_count
                    facetsFromResponse = Object.keys( response.aggregations.filtered ).reduce( ( aggs, category ) => {
                        const filtererdCategoryData = response.aggregations.filtered[ category ]

                        if ( filtererdCategoryData.value !== undefined ) {
                            aggs[ category ] = [ { value: Number( filtererdCategoryData.value ) } ]
                        } else {
                            aggs[ category ] = filtererdCategoryData.buckets.reduce( ( accumulator, bucket ) => {
                                return [ ...accumulator, { value: bucket.key, count: bucket.doc_count } ]
                            }, [] )
                        }
                        return aggs
                    }, {} )
                    delete response.aggregations.filtered
                }

                responseFacetKeys = Object.keys( response.aggregations )
                if ( responseFacetKeys.length > 0 ) {
                    responseFacetKeys.forEach( ( category ) => {
                        const unfilteredCategoryData = response.aggregations[ category ]

                        if ( unfilteredCategoryData[ category ].value !== undefined ) {
                            facetsFromResponse[ category ] = [ { value: Number( unfilteredCategoryData[ category ].value ) } ]
                        } else if ( response.aggregations[ category ][ category ] !== undefined ) {
                            facetsFromResponse[ category ] = response.aggregations[ category ][ category ].buckets.reduce( ( accumulator, bucket ) => {
                                return [ ...accumulator, { value: bucket.key, count: bucket.doc_count } ]
                            }, [] )
                        }
                    } )
                }
                break
        }

        await logService.debug( `Elastic getFacets in ${dialect} dialect using ${patient}/${query}` )

        return {
            query,
            dialect,
            facets: facetsFromResponse
        }
    } catch ( e ) {
        await logService.warning( `Elastic getFacets ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

const countVariants = async ( req, res, cacheService, elasticService, logService ) => {
    try {
        const sessionData = await getSessionDataFromToken( req.token, cacheService )
        const params = req.body
        const patient = params.patient
        const statement = params.statement
        const queries = params.queries
        const group = params.group || null
        const dialect = params.dialect || DIALECT_LANGUAGE_ELASTIC_SEARCH
        const schema = schemas[ dialect ]

        let totalFromResponse = {}

        switch ( dialect ) {
            default:
            case DIALECT_LANGUAGE_GRAPHQL:
                return new errors.NotImplementedError()

            case DIALECT_LANGUAGE_ELASTIC_SEARCH:
                await Promise.all(
                    queries.map( async( query ) => {
                        const translatedQuery = translate( statement, query, schema, dialect )
                        const response = await elasticService.countVariantsForPatient( patient, translatedQuery, sessionData.acl.fhir, schema, group )

                        totalFromResponse[ query ] = response.count
                        await logService.debug( `Elastic countVariants in ${dialect} dialect resolved query ${patient}/${query} found ${response.count} matches` )
                    } )
                )
                break
        }

        return {
            queries,
            total: totalFromResponse
        }
    } catch ( e ) {
        await logService.warning( `Elastic countVariants ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

export default {
    getSchema,
    getVariants,
    getFacets,
    countVariants
}
