import Keycloak from '../helpers/keycloak'
import errors from 'restify-errors'

// TODO: Find an alternative for local
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

export default ( server, config ) => {
    // eslint-disable-next-line new-cap
    const keycloak = Keycloak( config.jwt )
    const exclusions = [
        { methods: [ 'GET' ], path: '/docs' },
        { methods: [ 'GET' ], path: '/health' }
    ]
  
    server.pre( ( req, res, next ) => {
        const accessToken = req.headers.Authorization || req.headers.authorization || null

        server.router.lookup( req, res )
        const route = req.getRoute()

        let match = false

        exclusions.forEach( ( exclusion ) => {
            match = exclusion.methods.includes( route.method ) && exclusion.path === route.path
        } )

        if ( match ){
            next()
        } else {
            keycloak
                .verifyOffline( accessToken.split( ' ' )[ 1 ] )
                .then( ( user ) => {
                    req.fhir = user.fhirPractitionerId
                    next()
                } )
                .catch( () => {
                    // Token expired or is invalid
                    next( new errors.ForbiddenError() )
                } )
        }
    } )
}
