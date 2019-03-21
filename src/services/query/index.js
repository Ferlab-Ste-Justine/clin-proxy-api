// https://github.com/graphql-compose/graphql-compose-elasticsearch

import restify from 'restify'
import errors from 'restify-errors'
import rjwt from 'restify-jwt-community'

const queryService = {
    start: ( config ) => {
        const server = restify.createServer( config.options )

        server.use( rjwt( config.jwt ).unless( {
            path: [
                {
                    methods: [ 'GET' ],
                    url: `${config.prefix}/health`
                }
            ]
        } ) )

        server.get( `${config.prefix}`, ( req, res, next ) => {
            next( new errors.NotImplementedError() )
        } )

        return server
    }
}

module.exports = queryService
