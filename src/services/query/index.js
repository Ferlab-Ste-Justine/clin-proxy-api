// https://github.com/graphql-compose/graphql-compose-elasticsearch

import restify from 'restify'
import errors from 'restify-errors'
import rjwt from 'restify-jwt-community'

const queryService = {
    start: ( config ) => {
        config.serviceLog.info( 'Roger that.' )
        return new Promise( ( resolve, reject ) => {
            try {
                const logger = config.serviceLog
                const server = restify.createServer( config.options )

                logger.info( 'API Service Ready ... Testing.' )

                // JWT Endpoint Exceptions
                server.use( rjwt( config.jwt ).unless( {
                    path: [
                        {
                            methods: [ 'GET' ],
                            url: `${config.prefix}/health`
                        }
                    ]
                } ) )

                // Query
                server.get( `${config.prefix}`, ( req, res, next ) => {
                    next( new errors.NotImplementedError() )
                } )

                resolve( server )
            } catch ( e ) {
                reject( e )
            }
        } )
    }
}

module.exports = queryService
