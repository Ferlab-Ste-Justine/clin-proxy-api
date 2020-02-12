import rp from 'request-promise-native'
import { flatten, map, isArray, isString, cloneDeep } from 'lodash'

import { SERVICE_TYPE_PATIENT, SERVICE_TYPE_VARIANT, SERVICE_TYPE_META, ROLE_TYPE_USER, ROLE_TYPE_GROUP, ROLE_TYPE_ADMIN } from './api/helpers/acl'
import {
    traverseArrayAndApplyFunc,
    instructionIsFilter,
    getFieldSearchNameFromFieldIdMappingFunction,
    getFieldFacetNameFromFieldIdMappingFunction
} from './api/variant/sqon'
import { elasticSearchTranslator } from './api/variant/sqon/dialect/es'


const generateAclFilters = ( acl, service ) => {
    const filters = []
    const practitionerId = acl.practitioner_id
    const organizationId = acl.organization_id

    switch ( acl.role ) {

        case ROLE_TYPE_USER:
            if ( service === SERVICE_TYPE_PATIENT ) {
                filters.push( { match: { 'practitioners.id': practitionerId } } )
            } else if ( service === SERVICE_TYPE_VARIANT ) {
                filters.push( { match: { 'donors.practitionerId': practitionerId } } )
            } else if ( service === SERVICE_TYPE_META ) {
                filters.push( { match: { practitionerId } } )
            }
            break

        case ROLE_TYPE_GROUP:
            if ( service === SERVICE_TYPE_PATIENT ) {
                filters.push( { match: { 'organization.id': organizationId } } )
            } else if ( service === SERVICE_TYPE_VARIANT ) {
                filters.push( { match: { 'donors.organizationId': organizationId } } )
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
        let sort = sortDefinition.sort

        if ( sortDefinition.postprocess ) {
            const postprocess = new Function( 'context', sortDefinition.postprocess ) /* eslint-disable-line */
            const context = {
                sort,
                acl,
                patient,
                index,
                limit
            }

            sort = postprocess( context )
        }

        const filter = generateAclFilters( acl, SERVICE_TYPE_VARIANT )

        filter.push( { match: { 'donors.patientId': patient } } )
        request.query.bool.filter = filter

        const body = {
            from: index,
            size: limit,
            query: request.query,
            sort
        }

        console.debug( JSON.stringify( body ) )
        return rp( {
            method: 'POST',
            uri,
            json: true,
            body
        } )
    }

    async getFacetsForVariant( patient, request, denormalizedRequest, acl, schema ) {
        const uri = `${this.host}${schema.path}/_search`
        const schemaFilters = flatten(
            map( schema.categories, 'filters' )
        ).filter( ( filter ) => {
            return isArray( filter.facet )
        } )
        const aggs = {
            filtered: { aggs: {} }
        }
        const filter = generateAclFilters( acl, SERVICE_TYPE_VARIANT )

        filter.push( { match: { 'donors.patientId': patient } } )

        aggs.filtered.filter = request.query
        aggs.filtered.aggs = schemaFilters.reduce( ( accumulator, agg ) => {
            agg.facet.forEach( ( facet ) => {
                accumulator[ [ facet.id ] ] = { terms: facet.terms }
            } )
            return accumulator
        }, {} )

        const getSearchFieldNameFromFieldId = getFieldSearchNameFromFieldIdMappingFunction( schema )
        const getFacetFieldNameFromFieldId = getFieldFacetNameFromFieldIdMappingFunction( schema )

        traverseArrayAndApplyFunc( denormalizedRequest.instructions, ( index, instruction ) => {
            if ( instructionIsFilter( instruction ) ) {
                const facetId = instruction.data.id
                const facetFields = getFacetFieldNameFromFieldId( facetId )

                if ( facetFields ) {
                    const searchFields = getSearchFieldNameFromFieldId( facetId )
                    let instructionsWithoutFacetId = []

                    if ( isString( searchFields ) ) {
                        traverseArrayAndApplyFunc( denormalizedRequest.instructions, ( iindex, iinstruction ) => {
                            if ( !isArray( iinstruction ) && ( !instructionIsFilter( iinstruction ) || iinstruction.data.id !== facetId ) ) {
                                instructionsWithoutFacetId.push( iinstruction )
                            }
                        } )

                        const translatedFacet = elasticSearchTranslator.translate( { instructions: instructionsWithoutFacetId }, {}, getSearchFieldNameFromFieldId )

                        aggs[ [ facetId ] ] = {
                            filter: translatedFacet.query,
                            aggs: {
                                [ facetId ]: aggs.filtered.aggs[ facetId ]
                            }
                        }
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
                            const translatedFacet = elasticSearchTranslator.translate( { instructions: instructionsWithoutFacetId }, {}, getFieldNameFromFieldId )

                            aggs[ [ facetField ] ] = {
                                filter: translatedFacet.query,
                                aggs: {
                                    [ facetField ]: aggs.filtered.aggs[ facetField ]
                                }
                            }
                        } )
                    }
                }
            }
        } )

        const body = {
            size: 0,
            query: { bool: { filter } },
            aggs
        }

        console.debug( JSON.stringify( body ) )
        return rp( {
            method: 'POST',
            uri,
            json: true,
            body
        } )
    }

    async countVariantsForPatient( patient, request, acl, schema, group ) {
        const uri = `${this.host}${schema.path}/_count`
        const filter = generateAclFilters( acl, SERVICE_TYPE_VARIANT )

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

        filter.push( { match: { 'donors.patientId': patient } } )
        request.query.bool.filter = filter

        const body = {
            query: request.query
        }

        console.debug( JSON.stringify( body ) )
        return rp( {
            method: 'POST',
            uri,
            json: true,
            body,
            sort
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

}
