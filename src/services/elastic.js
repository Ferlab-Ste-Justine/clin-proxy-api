import rp from 'request-promise-native'
import { flatten, map, isArray } from 'lodash'


const generateAclFilters = ( acl, index = 'patient' ) => {
    const filters = []

    if ( acl.role === 'practitioner' ) {
        const practitionerId = acl.practitioner_id

        if ( index === 'patient' ) {
            filters.push( { match: { 'practitioners.id': practitionerId } } )
        } else if ( index === 'mutation' ) {
            filters.push( { match: { 'donors.practitionerId': practitionerId } } )
        } else if ( index === 'statement' ) {
            filters.push( { match: { practitionerId: practitionerId } } )
        }

    } else if ( acl.role === 'genetician' ) {
        const organizationId = acl.organization_id

        if ( index === 'patient' ) {
            filters.push( { match: { 'organization.id': organizationId } } )
        } else if ( index === 'mutation' ) {
            filters.push( { match: { 'donors.organizationId': organizationId } } )
        } else if ( index === 'statement' ) {
            filters.push( { match: { organizationId: organizationId } } )
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

    async searchMeta( acl, type = null, includes = [], filters = [], shoulds = [], index, limit ) {
        if ( type !== null ) {
            const uri = `${this.host}/${type}/_search`
            const aclFilters = generateAclFilters( acl, 'statement' )
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
            const aclFilters =  generateAclFilters(acl, 'statement')
            if (!source) {
                aclFilters.push({match: {_id: uid}})
                source = 'ctx._source = params.data'
            }
            data.practitionerId = acl.practitioner_id
            data.organizationId = acl.organization_id
            return rp( {
                method: 'POST',
                uri,
                json: true,
                body: {
                    script: {
                        source: source,
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

            return rp( {
                method: 'POST',
                uri,
                json: true,
                body: {
                    query: {
                        bool: {
                            must: [
                                { match: { _id: uid } },
                                { match: { practitionerId: acl.practitioner_id } },
                                { match: { organizationId: acl.organization_id } }
                            ]
                        }
                    }
                }
            } )
        }
    }

}
