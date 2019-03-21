const corsMiddleware = require( 'restify-cors-middleware' )

export default ( server, config ) => {
    const cors = corsMiddleware( config.cors )

    server.pre( cors.preflight )
    server.use( cors.actual )
    server.use( ( req, res, next ) => {
        res.header( 'Access-Control-Allow-Credentials', true )
        return next()
    } )
}
