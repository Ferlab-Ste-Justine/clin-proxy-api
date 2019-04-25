// https://github.com/graphql-compose/graphql-compose-elasticsearch

import errors from 'restify-errors'
import rjwt from 'restify-jwt-community'

import ApiService from '../service'
import restifyAsyncWrap from '../helpers/async'

export default class QueryService extends ApiService {
    constructor( config ) {
        config.logService.info( 'Roger that.' )
        super( config )
    }

    async start() {
        // JWT Endpoint Exceptions
        this.instance.use( rjwt( this.config.jwt ).unless( {
            path: [
                { methods: [ 'GET' ], url: `${this.config.endpoint}/docs` },
                { methods: [ 'GET' ], url: `${this.config.endpoint}/health` },
                { methods: [ 'GET' ], url: `${this.config.endpoint}` }
            ]
        } ) )

        this.instance.get( `${this.config.endpoint}`, restifyAsyncWrap( async( req, res, next ) => {
            next( new errors.NotImplementedError( req.version.toString() ) )
        } ) )

        super.start()
    }

}
