const restifyPlugins = require( 'restify' ).plugins

export default ( server ) => {
    server.use( restifyPlugins.bodyParser( {
        mapParams: false
    } ) )
}
