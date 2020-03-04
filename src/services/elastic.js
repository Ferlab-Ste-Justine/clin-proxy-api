import rp from 'request-promise-native'
import { flatten, map, isArray, isString, cloneDeep } from 'lodash'

import { SERVICE_TYPE_PATIENT, SERVICE_TYPE_VARIANT, SERVICE_TYPE_META, ROLE_TYPE_USER, ROLE_TYPE_GROUP, ROLE_TYPE_ADMIN } from './api/helpers/acl'
import {
    traverseArrayAndApplyFunc,
    instructionIsFilter,
    getFieldSearchNameFromFieldIdMappingFunction,
    getFieldFacetNameFromFieldIdMappingFunction,
    getFieldSubtypeFromFieldIdMappingFunction
} from './api/variant/sqon'
import { elasticSearchTranslator, FILTER_SUBTYPE_NESTED } from './api/variant/sqon/dialect/es'


const replacePlaceholderInJSON = ( query, placeholder, placeholderValue ) => {
    return JSON.parse(
        JSON.stringify( query ).split( placeholder ).join( placeholderValue )
    )
}

const generateAclFilters = ( acl, service, schema = null ) => {
    const filters = []
    const practitionerId = acl.practitioner_id
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

export default class ElasticClient {

    constructor( config ) {
        this.host = config.host
    }

    async ping() {
        return rp( {
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

        return rp( {
            method: 'GET',
            uri,
            json: true,
            body
        } )
    }

    async searchVariantsForPatient( patient, request, acl, schema, group, index, limit ) {
        const uri = `${this.host}${schema.path}/_search`
        const sortDefinition = schema.groups[ ( !group ? schema.defaultGroup : group ) ]
        const filter = generateAclFilters( acl, SERVICE_TYPE_VARIANT, schema )
        let sort = sortDefinition.sort

        if ( sortDefinition.postprocess ) {
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
        // console.debug(`+++ search request.body:${JSON.stringify( request.query )}`  )

        const body = {
            from: index,
            size: limit,
            query: replacePlaceholderInJSON( request.query, '%patientId.keyword%', patient ),
            sort
        }

        console.debug( `searchVariantsForPatient: ${JSON.stringify( body )}` )

        return rp( {
            method: 'POST',
            uri,
            json: true,
            body
        } )
    }

    async getFacetsForVariant( patient, request, denormalizedRequest, acl, schema ) {
        const uri = `${this.host}${schema.path}/_search`
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
                filter: { bool: { must: [] } }
            }
        }

        const facetsWithSubtypes = {
            [ FILTER_SUBTYPE_NESTED ]: {}
        }

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

        aggs.filtered.filter.bool.must = request.query.bool.filter

        if ( filter.length > 0 ) {
            aggs.filtered.filter.bool.must.push( filter )
        }

        aggs.filtered.filter.bool.must.push( { term: { [ schema.fields.patient ]: patient } } )

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
                                        filter: [ {
                                            term: { [ `${nestedFacetConfig.path}.${nestedFacetConfig.field}` ]: `%${nestedFacetConfig.field}%` }
                                        } ]
                                    }
                                },
                                aggs: {}
                            }
                        }
                    }
                }

                nestedFacetFields.forEach( ( nestedFacetField ) => {
                    aggs[ [ `nested_${nestedFacetConfig.path}` ] ].aggs.filtered.aggs[ nestedFacetField.id ] = nestedFacetField.query
                } )
            } )
        }

        traverseArrayAndApplyFunc( denormalizedRequest.instructions, ( index, instruction ) => {
            if ( instructionIsFilter( instruction ) ) {
                const facetId = instruction.data.id
                const facetFields = getFacetFieldNameFromFieldId( facetId )

                if ( facetFields ) {
                    const searchFields = getSearchFieldNameFromFieldId( facetId )
                    // let instructionsWithoutFacetId = []

                    if ( isString( searchFields ) ) {
                        console.log( `isSTRING ${ JSON.stringify( searchFields )}` )
                    } else {
                        console.log( `notSTRING ${ JSON.stringify( searchFields )}` )
                    }


                }


                /*
                    if ( isString( searchFields ) ) {
                        traverseArrayAndApplyFunc( denormalizedRequest.instructions, ( iindex, iinstruction ) => {
                            if ( !isArray( iinstruction ) && ( !instructionIsFilter( iinstruction ) || iinstruction.data.id !== facetId ) ) {
                                instructionsWithoutFacetId.push( iinstruction )
                            }
                        } )

                        const translatedFacet = elasticSearchTranslator.translate( { instructions: instructionsWithoutFacetId }, {}, getSearchFieldNameFromFieldId, getFacetFieldNameFromFieldId, getFieldSubtypeFromFieldId )

                        facetFields.forEach( ( facetField ) => {
                            aggs[ [ facetField.id ] ] = {
                                filter: translatedFacet.query,
                                aggs: {
                                    [ facetField.id ]: aggs.filtered.aggs[ facetField.id ]
                                }
                            }
                        } )

                    } else {
                        Object.keys( searchFields ).forEach( ( facetField ) => {
                            instructionsWithoutFacetId = []
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

                            aggs[ [ facetField ] ] = {
                                filter: translatedFacet.query,
                                aggs: {
                                    [ facetField ]: aggs.filtered.aggs[ facetField ]
                                }
                            }
                        } )
                    }

                }
                                 */
            }
        } )

        const query = {
            bool: {
                filter: []
            }
        }

        if ( filter.length > 0 ) {
            query.bool.filter.push( filter )
        }

        query.bool.filter.push( { term: { [ schema.fields.patient ]: patient } } )

        const body = {
            size: 0,
            query: replacePlaceholderInJSON( query, '%patientId.keyword%', patient ),
            aggs: replacePlaceholderInJSON( aggs, '%patientId.keyword%', patient )
        }

        console.debug( `getFacetsForVariant: ${JSON.stringify( body )}` )

        return rp( {
            method: 'POST',
            uri,
            json: true,
            body
        } )
    }

    async countVariantsForPatient( patient, request, acl, schema, group ) {
        const uri = `${this.host}${schema.path}/_count`
        const filter = generateAclFilters( acl, SERVICE_TYPE_VARIANT, schema )
        const sortDefinition = schema.groups[ ( !group ? schema.defaultGroup : group ) ]
        let sort = sortDefinition.sort

        if ( sortDefinition.postprocess ) {
            const postprocess = new Function( 'context', sortDefinition.postprocess ) /* eslint-disable-line */
            const context = {
                sort,
                acl,
                patient,
                index: 0,
                limit: 0
            }

            sort = postprocess( context )
        }

        if ( filter.length > 0 ) {
            request.query.bool.filter.push( filter )
        }

        request.query.bool.filter.push( { term: { [ schema.fields.patient ]: patient } } )

        const body = {
            query: replacePlaceholderInJSON( request.query, '%patientId.keyword%', patient )
        }

        console.debug( `countVariantsForPatient: ${JSON.stringify( body )}` )

        return rp( {
            method: 'POST',
            uri,
            json: true,
            body,
            sort
        } )
    }

    async searchVariants( acl, includes = [], filters = [], index, limit ) {
        const uri = `${this.host}/mutations/_search`
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

        return rp( {
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

            return rp( {
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
            return rp( {
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
            return rp( {
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

            return rp( {
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

    async clearCacheMeta( index = null ) {
        if ( index !== null ) {
            const uri = `${this.host}/${index}/_cache/clear?query=true`

            return rp( {
                method: 'POST',
                uri,
                json: true

            } )
        }
    }

}
