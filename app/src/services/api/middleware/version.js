import errors from 'restify-errors'


export default ( server, versions, defaultVersion ) => {
    server.pre( ( req, res, next ) => {
        let parts = req.url.match( /^\/v(\d{1,})(\/.+)/ )
        let version = defaultVersion

        if ( parts ) {
            req.url = parts[ 2 ]
            version = Number( parts[ 1 ] )
        }

        if ( versions.includes( version ) ) {
            res.header( 'API-Version', version )
            req.version = version
            next()
        } else {
            next( new errors.InvalidVersionError( 'The API version you requested does not exist.' ) )
        }
    } )
}
