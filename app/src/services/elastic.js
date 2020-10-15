import rp from 'request-promise-native'
import { cloneDeep, flatten, isArray, isString, map } from 'lodash'

import {
    ROLE_TYPE_ADMIN,
    ROLE_TYPE_GROUP,
    ROLE_TYPE_USER,
    SERVICE_TYPE_META,
    SERVICE_TYPE_PATIENT,
    SERVICE_TYPE_VARIANT
} from './api/helpers/acl'
import translate, {
    denormalize,
    getFieldFacetNameFromFieldIdMappingFunction,
    getFieldSearchNameFromFieldIdMappingFunction,
    getFieldSubtypeFromFieldIdMappingFunction,
    getQueryByKey,
    instructionIsFilter,
    traverseArrayAndApplyFunc
} from './api/variant/sqon'
import {
    DIALECT_LANGUAGE_ELASTIC_SEARCH,
    elasticSearchTranslator,
    FILTER_SUBTYPE_NESTED
} from './api/variant/sqon/dialect/es'

const replacePlaceholderInJSON = ( query, placeholder, placeholderValue ) => {
    return JSON.parse(
        JSON.stringify( query ).split( placeholder ).join( placeholderValue )
    )
}

const generateAclFilters = ( acl, service, schema = null ) => {
    const filters = []

    const practitionerId = acl.practitioner_id
    // PLA: In Keycloak a user can be associated with multiple groups and each group could have a different organization id
    // Shouldn't acl.organization_id be a list?  If so, in the Keycloak fhir organization mapper, activate the multi-value switch.
    const organizationId = acl.organization_id

    switch ( acl.role ) {

        case ROLE_TYPE_USER:
            if ( service === SERVICE_TYPE_PATIENT ) {
                filters.push( { match: { 'practitioners.id': practitionerId } } )
            } else if ( service === SERVICE_TYPE_VARIANT ) {
                filters.push( { term: { [ schema.fields.practitioner ]: practitionerId } } )
            } else if ( service === SERVICE_TYPE_META ) {
                filters.push( { match: { practitionerId } } )
            }
            break

        case ROLE_TYPE_GROUP:
            if ( service === SERVICE_TYPE_PATIENT ) {
                filters.push( { match: { 'organization.id': organizationId } } )
            } else if ( service === SERVICE_TYPE_VARIANT ) {
                filters.push( { term: { [ schema.fields.organization ]: organizationId } } )
            } else if ( service === SERVICE_TYPE_META ) {
                filters.push( { match: { practitionerId } } )
            }
            break

        case ROLE_TYPE_ADMIN:
            if ( service === SERVICE_TYPE_META ) {
                filters.push( { match: { practitionerId } } )
            }
            break

        default:
            break
    }

    return filters
}

export const generateVariantQuery = ( patient, statement, query, acl, schema, group, index, limit ) => {
    const request = translate( statement, query, schema, DIALECT_LANGUAGE_ELASTIC_SEARCH )
    const sortDefinition = schema.groups[ ( !group ? schema.defaultGroup : group ) ]
    const filter = generateAclFilters( acl, SERVICE_TYPE_VARIANT, schema )
    let sort = sortDefinition.sort

    if ( sortDefinition.postprocess ) {
        // eslint-disable-next-line no-new-func
        const postprocess = new Function( 'context', sortDefinition.postprocess )
        const context = {
            sort,
            acl,
            patient,
            index,
            limit
        }

        sort = postprocess( context )
    }
    if ( filter.length > 0 ) {
        request.query.bool.filter.push( filter )
    }

    request.query.bool.filter.push( { term: { [ schema.fields.patient ]: patient } } )

    return {
        from: index,
        size: limit,
        query: replacePlaceholderInJSON( request.query, '%patient_id%', patient ),
        sort
    }
}


const apiCall = ( options ) => {
    const headers = process.env.AUTHORIZATION != null ? {
        ...options.headers,
        Authorization: process.env.AUTHORIZATION
    } : options.headers

    return rp(
        {
            ...options,
            headers
        }
    )
}

export const generateFacetQuery = ( patient, statement, queryId, acl, schema ) => {
    const denormalizedStatement = denormalize( statement )
    const denormalizedRequest = getQueryByKey( denormalizedStatement, queryId )
    const request = translate( statement, queryId, schema, DIALECT_LANGUAGE_ELASTIC_SEARCH )
    const schemaFacets = flatten(
        map( schema.categories, 'filters' )
    ).filter( ( filter ) => {
        return isArray( filter.facet )
    } )
    const filter = generateAclFilters( acl, SERVICE_TYPE_VARIANT, schema )
    const getSearchFieldNameFromFieldId = getFieldSearchNameFromFieldIdMappingFunction( schema )
    const getFacetFieldNameFromFieldId = getFieldFacetNameFromFieldIdMappingFunction( schema )
    const getFieldSubtypeFromFieldId = getFieldSubtypeFromFieldIdMappingFunction( schema )
    const aggs = {
        filtered: {
            aggs: {},
            filter: { bool: { } }
        }
    }

    const facetsWithSubtypes = {
        [ FILTER_SUBTYPE_NESTED ]: {}
    }
    const facetFilteredExcept = {}

    // generation of the regular aggregation (all non-nested and all unfiltered one excluded)
    aggs.filtered.aggs = schemaFacets.reduce( ( accumulator, agg ) => {
        agg.facet.forEach( ( facet ) => {
            const facetSubtype = getFieldSubtypeFromFieldId( facet.id )

            if ( !facetSubtype ) {
                accumulator[ [ facet.id ] ] = facet.query
            } else {
                facetsWithSubtypes[ FILTER_SUBTYPE_NESTED ][ [ facet.id ] ] = facetSubtype
            }
        } )
        return accumulator
    }, {} )

    // generation of the 'filtered' nested aggregations

    if ( facetsWithSubtypes[ FILTER_SUBTYPE_NESTED ] !== {} ) {
        Object.keys( facetsWithSubtypes[ FILTER_SUBTYPE_NESTED ] ).forEach( ( nestedFacetId ) => {
            const nestedFacetConfig = facetsWithSubtypes[ FILTER_SUBTYPE_NESTED ][ nestedFacetId ].config
            const nestedFacetFields = getFacetFieldNameFromFieldId( nestedFacetId )

            if ( !aggs[ [ `nested_${nestedFacetConfig.path}` ] ] ) {
                aggs[ [ `nested_${nestedFacetConfig.path}` ] ] = {
                    nested: { path: nestedFacetConfig.path },
                    aggs: {
                        filtered: {
                            filter: {
                                bool: {
                                    filter: { term: { [ schema.fields.patient ]: patient } }
                                }
                            },
                            aggs: {}
                        }
                    }
                }
            }
            // at the same time generate all nested facet
            nestedFacetFields.forEach( ( nestedFacetField ) => {
                aggs[ [ `nested_${nestedFacetConfig.path}` ] ].aggs.filtered.aggs[ nestedFacetField.id ] = nestedFacetField.query
                if ( !facetFilteredExcept[ [ nestedFacetField.id ] ] ) {
                    facetFilteredExcept[ [ nestedFacetField.id ] ] = { [ `nested_${nestedFacetConfig.path}` ]: aggs[ [ `nested_${nestedFacetConfig.path}` ] ] }
                }
            } )
        } )
    }
    // generate unfiltered aggs
    traverseArrayAndApplyFunc( denormalizedRequest.instructions, ( index, instruction ) => {
        if ( instructionIsFilter( instruction ) ) {
            const facetId = instruction.data.id
            const facetFields = getFacetFieldNameFromFieldId( facetId )

            if ( facetFields ) {
                let searchFields = getSearchFieldNameFromFieldId( facetId )

                // boolean comparison -- normalize to always be an object
                searchFields = isString( searchFields ) ? { [ facetId ]: searchFields } : searchFields

                Object.keys( searchFields ).forEach( ( facetField ) => {
                    let filteredExceptAggs = { [ facetField ]: aggs.filtered.aggs[ facetField ] }
                    let instructionsWithoutFacetId = []

                    traverseArrayAndApplyFunc( denormalizedRequest.instructions, ( iindex, iinstruction ) => {
                        if ( !isArray( iinstruction ) ) {
                            if ( !instructionIsFilter( iinstruction ) ) {
                                instructionsWithoutFacetId.push( iinstruction )
                            } else {
                                const fiinstruction = cloneDeep( iinstruction )

                                if ( iinstruction.data.id === facetId ) {
                                    fiinstruction.data.values = []
                                }
                                instructionsWithoutFacetId.push( fiinstruction )
                            }
                        }
                    } )

                    const translatedFacet = elasticSearchTranslator.translate( { instructions: instructionsWithoutFacetId }, {}, getSearchFieldNameFromFieldId, getFacetFieldNameFromFieldId, getFieldSubtypeFromFieldId )
                    const normalizedNestedFields = Object.keys( facetsWithSubtypes[ FILTER_SUBTYPE_NESTED ] ).filter( ( key ) => key.replace( '_min', '' ).replace( '_max', '' ) === facetField )
                    const isNestedAgg = normalizedNestedFields.length > 0

                    if ( isNestedAgg ) {

                        normalizedNestedFields.forEach( ( normalizedNestedField ) => {
                            filteredExceptAggs = cloneDeep( facetFilteredExcept[ normalizedNestedField ] )
                            const normalizedNestedPath = Object.keys( filteredExceptAggs )[ 0 ]

                            filteredExceptAggs[ normalizedNestedPath ].aggs.filtered.aggs = facetFields.reduce( ( fieldAcc, facetFieldData ) => {
                                fieldAcc[ [ facetFieldData.id ] ] = facetFieldData.query
                                return fieldAcc
                            }, {} )
                        } )
                    } else {

                        // non nested aggs min max should be here
                        if ( JSON.stringify( filteredExceptAggs ) === '{}' ) {
                            // min and max
                            filteredExceptAggs = { [ `${facetField}_min` ]: aggs.filtered.aggs[ `${facetField}_min` ],
                                [ `${facetField}_max` ]: aggs.filtered.aggs[ `${facetField}_max` ]
                            }
                        }

                        translatedFacet.query.bool.filter.push( { bool: {
                            filter: { term: { [ schema.fields.patient ]: patient } }
                        } } )
                    }

                    aggs[ [ facetField ] ] = {
                        global: {},
                        aggs: {
                            [ `filtered_except_${facetField}` ]: {
                                filter: translatedFacet.query,
                                aggs: filteredExceptAggs
                            }
                        }
                    }
                } )
            }
        }
    } )

    const query = {
        bool: {
            filter: request.query.bool.filter
        }
    }

    if ( filter.length > 0 ) {
        query.bool.filter.push( filter )
    }

    query.bool.filter.push( { term: { [ schema.fields.patient ]: patient } } )

    return {
        size: 0,
        query: replacePlaceholderInJSON( query, '%patient_id%', patient ),
        aggs: replacePlaceholderInJSON( aggs, '%patient_id%', patient )
    }
}

export const generateCountQuery = ( patient, statement, query, acl, schema ) => {
    const request = translate( statement, query, schema, DIALECT_LANGUAGE_ELASTIC_SEARCH )
    const filter = generateAclFilters( acl, SERVICE_TYPE_VARIANT, schema )

    if ( filter.length > 0 ) {
        request.query.bool.filter.push( filter )
    }

    request.query.bool.filter.push( { term: { [ schema.fields.patient ]: patient } } )

    return {
        query: replacePlaceholderInJSON( request.query, '%patient_id%', patient )
    }
}


export default class ElasticClient {

    constructor( config ) {
        this.host = config.host
    }

    async ping() {
        return apiCall( {
            method: 'GET',
            uri: `${this.host}`,
            json: true
        } )
    }

    async searchPatients( acl, includes = [], filters = [], shoulds = [], index, limit ) {
        const uri = `${this.host}/patient/_search`
        const aclFilters = generateAclFilters( acl, SERVICE_TYPE_PATIENT )
        const body = {
            from: index,
            size: limit,
            query: {
                bool: {
                    must: filters.concat( aclFilters )
                }
            }
        }

        if ( includes.length > 0 ) {
            body._source = { includes }
        }

        if ( shoulds.length > 0 ) {
            body.query.bool.should = shoulds
            body.query.bool.minimum_should_match = 1
        }

        return apiCall( {
            method: 'GET',
            uri,
            json: true,
            body
        } )
    }

    async searchGenes( includes = [], filters = [], shoulds = [], index, limit, highlight = null ) {
        const uri = `${this.host}/genes/_search`
        const body = {
            from: index,
            size: limit,
            query: {
                bool: {
                    must: filters
                }
            }
        }

        if ( includes.length > 0 ) {
            body._source = { includes }
        }

        if ( shoulds.length > 0 ) {
            body.query.bool.should = shoulds
            body.query.bool.minimum_should_match = 1
        }

        if ( highlight ) {
            body.highlight = highlight
        }

        return apiCall( {
            method: 'GET',
            uri,
            json: true,
            body
        } )
    }

    async searchVariantsForPatient( patient, statement, query, acl, schema, group, index, limit ) {
        const uri = `${this.host}${schema.path}/_search`
        const body = generateVariantQuery( patient, statement, query, acl, schema, group, index, limit )

        return apiCall( {
            method: 'POST',
            uri,
            json: true,
            body
        } )
    }

    async getFacetsForVariant( patient, statement, query, acl, schema ) {
        const uri = `${this.host}${schema.path}/_search`
        const body = generateFacetQuery( patient, statement, query, acl, schema )

        return apiCall( {
            method: 'POST',
            uri,
            json: true,
            body
        } )
    }

    async countVariantsForPatient( patient, statement, query, acl, schema, group ) {
        const uri = `${this.host}${schema.path}/_count`
        const body = generateCountQuery( patient, statement, query, acl, schema, group )

        return apiCall( {
            method: 'POST',
            uri,
            json: true,
            body
        } )
    }

    async searchVariants( acl, includes = [], filters = [], index, limit ) {
        const uri = `${this.host}/variants_re_bat1/_search`
        const aclFilters = generateAclFilters( acl, SERVICE_TYPE_VARIANT )
        const body = {
            from: index,
            size: limit,
            query: {
                bool: {
                    filter: filters.concat( aclFilters )
                }
            }
        }

        if ( includes.length > 0 ) {
            body._source = { includes }
        }

        return apiCall( {
            method: 'GET',
            uri,
            json: true,
            body
        } )
    }

    async searchMeta( acl, type = null, includes = [], filters = [], shoulds = [], index, limit ) {
        if ( type !== null ) {
            const uri = `${this.host}/${type}/_search`
            const aclFilters = generateAclFilters( acl, SERVICE_TYPE_META )
            const body = {
                from: index,
                size: limit,
                query: {
                    bool: {
                        must: filters.concat( aclFilters )
                    }
                }
            }

            if ( includes.length > 0 ) {
                body._source = { includes }
            }

            if ( shoulds.length > 0 ) {
                body.query.bool.should = shoulds
                body.query.bool.minimum_should_match = 1
            }

            return apiCall( {
                method: 'GET',
                uri,
                json: true,
                body
            } )
        }
    }

    async createMeta( acl, index = null, data = {} ) {
        if ( index !== null ) {
            const uri = `${this.host}/${index}/_doc`

            data.practitionerId = acl.practitioner_id
            data.organizationId = acl.organization_id
            return apiCall( {
                method: 'POST',
                uri,
                json: true,
                body: data
            } )
        }
    }

    async updateMeta( acl, index = null, uid, data = {}, source = null, filters = [] ) {
        if ( index !== null && uid !== null ) {
            const uri = `${this.host}/${index}/_doc/_update_by_query`
            const aclFilters = generateAclFilters( acl, SERVICE_TYPE_META )

            if ( !source ) {
                aclFilters.push( { match: { _id: uid } } )
            }
            data.practitionerId = acl.practitioner_id
            data.organizationId = acl.organization_id
            return apiCall( {
                method: 'POST',
                uri,
                json: true,
                body: {
                    script: {
                        source: ( !source ? 'ctx._source = params.data' : source ),
                        lang: 'painless',
                        params: {
                            data,
                            uid
                        }
                    },
                    query: {
                        bool: {
                            must: filters.concat( aclFilters )
                        }
                    }
                }
            } )
        }
    }

    async deleteMeta( acl, index = null, uid = null ) {
        if ( index !== null && uid !== null ) {
            const uri = `${this.host}/${index}/_doc/_delete_by_query`
            const aclFilters = generateAclFilters( acl, SERVICE_TYPE_META )

            aclFilters.push( { match: { _id: uid } } )

            return apiCall( {
                method: 'POST',
                uri,
                json: true,
                body: {
                    query: {
                        bool: {
                            must: aclFilters
                        }
                    }
                }
            } )
        }
    }
    async searchHPODescendants( hpoId ) {
        const uri = `${this.host}/hpo/_search`
        const body = {
            query: {
                term: {
                    'parents.id': hpoId
                }
            }
        }

        return apiCall( {
            method: 'GET',
            uri,
            json: true,
            body
        } )
    }


    async searchHPOAutocomplete( prefix ) {
        const uri = `${this.host}/hpo/_search`
        const body = {
            query: {
                bool: {
                    should: [
                        {
                            prefix: {
                                name: prefix
                            }
                        },
                        {
                            match_phrase_prefix: {
                                id: prefix
                            }
                        }
                    ]
                }
            }
        }


        return apiCall( {
            method: 'GET',
            uri,
            json: true,
            body
        } )
    }

}
