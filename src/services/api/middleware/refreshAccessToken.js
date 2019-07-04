import cookie from 'cookie'


export default ( server, requestProperty ) => {
    server.use( ( req, res, next ) => {
        if ( req.newAccessTokenIssued ) {
            res.header( 'Set-Cookie', cookie.serialize( requestProperty, req.newAccessTokenIssued, {
                httpOnly: true,
                secure: true,
                path: '/'
            } ) )
        }

        return next()
    } )
}
