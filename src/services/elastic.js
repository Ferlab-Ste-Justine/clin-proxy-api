/* eslint-disable */
import rp from 'request-promise-native'
import { filter, pullAllBy, flatten, find, map } from 'lodash'


const generateAclFiltersForPatientIndex = ( acl ) => {
    const filters = []

    if ( acl.role === 'practitioner' ) {
        filters.push( { match: { 'practitioners.id': acl.practitioner_id } } )
    } else if ( acl.role === 'genetician' ) {
        filters.push( { match: { 'organization.id': acl.organization_id } } )
    }
    return filters
}

const generateAclFiltersForMutationIndex = ( acl ) => {
    const filters = []

    if ( acl.role === 'practitioner' ) {
        filters.push( { match: { 'donors.practitionerId': acl.practitioner_id } } )
    } else if ( acl.role === 'genetician' ) {
        filters.push( { match: { 'donors.organizationId': acl.organization_id } } )
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

    async getPatientById( uid, acl ) {
        const uri = `${this.host}/patient/_search`
        const filters = generateAclFiltersForPatientIndex( acl )

        filters.push( { match: { id: uid } } )
        return rp( {
            method: 'GET',
            uri,
            json: true,
            body: {
                query: {
                    bool: {
                        must: filters
                    }
                }
            }
        } )
    }

    async getPatientsByAutoComplete( type, query, acl, index, limit ) {
        const uri = `${this.host}/patient/_search`
        const filters = generateAclFiltersForPatientIndex( acl )
        const includes = []

        // @TODO Field logic should be moved to versioned route
        if ( type === 'partial' ) {
            includes.push(
                'id',
                'familyId',
                'specimens.id',
                'identifier.MR',
                'identifier.JHN',
                'name.family',
                'name.given',
                'studies.title'
            )
        }

        return rp( {
            method: 'GET',
            uri,
            json: true,
            body: {
                from: index,
                size: limit,
                _source: { includes },
                query: {
                    bool: {
                        must: filters,
                        should: [
                            { match_phrase_prefix: { id: query } },
                            { match_phrase_prefix: { 'name.family': query } },
                            { match_phrase_prefix: { 'name.given': query } },
                            { match_phrase_prefix: { 'studies.title': query } },
                            { match_phrase_prefix: { 'specimens.id': query } },
                            { match_phrase_prefix: { 'identifier.MR': query } },
                            { match_phrase_prefix: { 'identifier.JHN': query } },
                            { match_phrase_prefix: { familyId: query } },
                            { wildcard: { id: `*${query}` } },
                            { wildcard: { 'identifier.MR': `*${query}` } },
                            { wildcard: { 'identifier.MR': `*${query}` } },
                            { wildcard: { 'identifier.JHN': `*${query}` } },
                            { wildcard: { familyId: `*${query}` } },
                            { fuzzy: { 'name.given': query } },
                            { fuzzy: { 'name.family': query } }
                        ],
                        minimum_should_match: 1
                    }
                }
            }
        } )
    }

    async searchPatients( acl, index, limit ) {
        const uri = `${this.host}/patient/_search`
        const filters = generateAclFiltersForPatientIndex( acl )

        return rp( {
            method: 'GET',
            uri,
            json: true,
            body: {
                from: index,
                size: limit,
                query: {
                    bool: {
                        must: filters
                    }
                }
            }
        } )
    }
    /* eslint-disable */

    async getVariantAggregationForPatientId( uid, variants, query, acl, schema ) {
        const uri = `${this.host}${schema.path}`
        const schemaFilters = flatten(
            map(schema.categories, 'filters')
        );

        const aggs = variants.reduce((accumulator, variant) => {
            const filter = find(schemaFilters, { id: variant })
            if (filter) {
                return Object.assign(accumulator, { [variant]: filter.facet });
            }
        }, {});

        const filters = generateAclFiltersForMutationIndex( acl )
        filters.push( { match: { 'donors.patientId': uid } } )

        // @TODO Add active query instructions to filters
        // query

        const body = {
            size: 0,
            aggs,
            query: {
                bool: {
                    must: [
                        filters
                    ]
                }
            }
        }

        return rp( {
            method: 'GET',
            uri,
            json: true,
            body
        } );
    }

    async getVariantResultsForPatientId( patient, variant, query, acl, schema, index, limit ) {
        return null
    }


/*
    GET /variants/_search
{
    "size": 0,
    "aggs" : {
        "chromosome" : {
            "terms" : {
                "field" : "chrom.keyword"
            }
        },
        "variant_type" : {
            "terms" : {
                "field" : "type.keyword"
            }
        }
    },

    "query": {
        "bool": {
            "must": [
                { "match": { "donor.patientId":   "PA00002" }}
                ]
        }
    }

}
*/



}
