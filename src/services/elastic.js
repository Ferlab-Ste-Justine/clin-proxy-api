import rp from 'request-promise-native'


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

    generateAcl( acl ) {
        const filters = []

        if ( acl.role === 'practitioner' ) {
            filters.push( { match: { 'practitioners.id': acl.practitioner_id } } )
        } else if ( acl.role === 'genetician' ) {
            filters.push( { match: { 'organization.id': acl.organization_id } } )
        }

        return filters
    }


    async getPatientById( uid, acl ) {
        const filters = this.generateAcl( acl )

        filters.push( { match: { id: uid } } )
        return rp( {
            method: 'GET',
            uri: `${this.host}/patient/_search`,
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
        const filters = this.generateAcl( acl )
        const includes = []

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
            uri: `${this.host}/patient/_search`,
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
        const filters = this.generateAcl( acl )

        return rp( {
            method: 'GET',
            uri: `${this.host}/patient/_search`,
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

}
