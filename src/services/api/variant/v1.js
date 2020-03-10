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
                    const result = hit._source
                    result.donors = result.donors.filter((donor) => donor.patientId === patient)
                    result.id = hit._id
                    return result
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
        let facetsFromResponse = {}

        switch ( dialect ) {
            default:
            case DIALECT_LANGUAGE_GRAPHQL:
                return new errors.NotImplementedError()

            case DIALECT_LANGUAGE_ELASTIC_SEARCH:
                response = await elasticService.getFacetsForVariant( patient, translatedQuery, denormalizedQuery, sessionData.acl.fhir, schema, facets )

                // Filtered Non-Nested
                if ( response.aggregations.filtered ) {
                    delete response.aggregations.filtered.meta
                    delete response.aggregations.filtered.doc_count
                    facetsFromResponse = Object.keys( response.aggregations.filtered ).reduce( ( aggs, category ) => {
                        const filteredCategoryData = response.aggregations.filtered[ category ]

                        if ( filteredCategoryData.value !== undefined ) {
                            aggs[ category ] = [ { value: Number( filteredCategoryData.value ) } ]
                        } else {
                            aggs[ category ] = filteredCategoryData.buckets.reduce( ( accumulator, bucket ) => {
                                return [ ...accumulator, { value: bucket.key, count: bucket.doc_count } ]
                            }, [] )
                        }

                        return aggs
                    }, {} )
                    delete response.aggregations.filtered
                }

                // Filtered Nested
                Object.keys( response.aggregations ).forEach( ( category ) => {
                    if ( category.indexOf( 'nested_' ) !== -1 ) {
                        const filteredCategoryData = response.aggregations[ category ]

                        delete filteredCategoryData.filtered.doc_count

                        Object.keys( filteredCategoryData.filtered ).forEach( ( nestedId ) => {
                            if ( filteredCategoryData.filtered[ nestedId ].value !== undefined ) {
                                facetsFromResponse[ nestedId ] = [ { value: Number( filteredCategoryData.filtered[ nestedId ].value ) } ]

                            } else {

                                facetsFromResponse[ nestedId ] = filteredCategoryData.filtered[ nestedId ].buckets.reduce( ( acc, nestedBucket ) => {
                                    return [ ...acc, { value: nestedBucket.key, count: nestedBucket.doc_count } ]
                                }, [] )
                            }
                        } )

                        delete response.aggregations[ category ]
                    }
                } )

                // Unfiltered
                Object.keys( response.aggregations ).forEach( ( category ) => {
                    const unfilteredCategoryData = response.aggregations[ category ]
                    const filterExceptSelfKey = `filtered_except_${category}`
                    const isNestedSubtype = !unfilteredCategoryData[ filterExceptSelfKey ][ category ]

                    // Unfiltered Not-Nested
                    if ( !isNestedSubtype ) {
                        if ( unfilteredCategoryData[ filterExceptSelfKey ][ category ].value !== undefined ) {
                            facetsFromResponse[ category ] = [ { value: Number( unfilteredCategoryData[ filterExceptSelfKey ][ category ].value ) } ]
                        } else {
                            facetsFromResponse[ category ] = unfilteredCategoryData[ filterExceptSelfKey ][ category ].buckets.reduce( ( accumulator, bucket ) => {
                                return [ ...accumulator, { value: bucket.key, count: bucket.doc_count } ]
                            }, [] )
                        }
                    } else {
                        // Unfiltered Nested
                        // @TODO Currently hardcoded to nested_donors; should take value from JSON schema!
                        const nestedPath = 'nested_donors'

                        delete unfilteredCategoryData[ filterExceptSelfKey ][ nestedPath ].filtered.doc_count

                        if ( unfilteredCategoryData[ filterExceptSelfKey ][ nestedPath ].filtered[ category ] === undefined ) {
                            Object.keys( unfilteredCategoryData[ filterExceptSelfKey ][ nestedPath ].filtered ).forEach( ( filterKey ) => {
                                facetsFromResponse[ filterKey ] = [ { value: unfilteredCategoryData[ filterExceptSelfKey ][ nestedPath ].filtered[ filterKey ].value } ]
                            } )

                        } else {
                            facetsFromResponse[ category ] = unfilteredCategoryData[ filterExceptSelfKey ][ nestedPath ].filtered[ category ].buckets.reduce( ( accumulator, bucket ) => {
                                return [ ...accumulator, { value: bucket.key, count: bucket.doc_count } ]
                            }, [] )
                        }
                    }
                } )
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

const getVariantById = async ( req, res, cacheService, elasticService, logService ) => {
    try {
        const sessionData = await getSessionDataFromToken( req.token, cacheService )
        const response = await elasticService.searchVariants( sessionData.acl.fhir, [], [ { ids: { values: [ req.params.vid ] } } ], 0, 1 )

        if ( response.hits.total < 1 ) {
            return new errors.NotFoundError()
        }

        await logService.debug( `Elastic getVariantById for ${req.params.vid}` )

        const result = response.hits.hits[ 0 ]._source

        result.id = response.hits.hits[ 0 ]._id
        return result
    } catch ( e ) {
        await logService.warning( `Elastic getVariantById ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

export default {
    getSchema,
    getVariants,
    getFacets,
    countVariants,
    getVariantById
}
