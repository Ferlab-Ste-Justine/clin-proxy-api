import rp from 'request-promise-native'
import { flatten, map, isArray } from 'lodash'


const generateAclFilters = ( acl, index = 'patient' ) => {
    const filters = []

    if ( acl.role === 'practitioner' ) {
        if ( index === 'patient' ) {
            filters.push( { match: { 'practitioners.id': acl.practitioner_id } } )
        } else if ( index === 'mutation' ) {
            filters.push( { match: { 'donors.practitionerId': acl.practitioner_id } } )
        }

    } else if ( acl.role === 'genetician' ) {
        if ( index === 'patient' ) {
            filters.push( { match: { 'organization.id': acl.organization_id } } )
        } else if ( index === 'mutation' ) {
            filters.push( { match: { 'donors.organizationId': acl.organization_id } } )
        }

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
        const aclFilters = generateAclFilters( acl, 'patient' )
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
        const uri = `${this.host}${schema.path}`
        const schemaFilters = flatten(
            map( schema.categories, 'filters' )
        )

        const aggs = schemaFilters.reduce( ( accumulator, filter ) => {
            const filters = {}

            if ( isArray( filter.facet ) ) {
                filter.facet.forEach( ( facet ) => {
                    filters[ [ facet.id ] ] = { terms: facet.terms }
                } )
            }
            return Object.assign( accumulator, filters )
        }, {} )

        const sort = [
            schema.groups[ ( !group ? schema.defaultGroup : group ) ]
        ]

        const filter = generateAclFilters( acl, 'mutation' )

        filter.push( { match: { 'donors.patientId': patient } } )
        request.query.bool.filter = filter

        const body = {
            from: index,
            size: limit,
            query: request.query,
            aggs,
            sort
        }

        console.debug( JSON.stringify( body ) )
        return rp( {
            method: 'GET',
            uri,
            json: true,
            body
        } )
    }

}
