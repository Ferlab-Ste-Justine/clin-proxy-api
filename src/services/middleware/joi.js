const validator = require( 'restify-joi-middleware' )

module.exports = ( server ) => {
    server.use( validator( {
        keysToValidate: [ 'params', 'body', 'query', 'user', 'headers', 'trailers', 'files' ],
        errorTransformer: ( input, errors ) => {
            let messages = []

            for ( let eidx in errors.details ) {
                messages.push( errors.details[ eidx ].message )
            }
            return new Error( messages )
        },
        errorResponder: ( transformedErr, req, res ) => {
            return res.send( 400, transformedErr )
        }
    } ) )
}
