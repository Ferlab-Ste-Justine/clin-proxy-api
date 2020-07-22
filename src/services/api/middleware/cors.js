export default ( server, config ) => {

    server.pre( ( req, res, next ) => {
        const origin = req.header( 'origin' )
        
        if ( origin && config.cors && config.cors.origins ){
            if ( config.cors.origins.includes( origin ) ){
                res.header( 'Access-Control-Allow-Credentials', true )
                res.header( 'Access-Control-Allow-Origin', origin )

                return next()
            }
        }

        return next()
    } )
}
