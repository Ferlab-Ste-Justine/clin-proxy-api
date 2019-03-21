const restifyPlugins = require( 'restify' ).plugins

export default ( server ) => {
    server.use( restifyPlugins.acceptParser( [
        'application/json'
    ] ) )
}
