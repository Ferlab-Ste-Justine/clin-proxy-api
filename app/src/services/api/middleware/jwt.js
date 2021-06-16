import Keycloak from '../helpers/keycloak'
import { findIndex } from 'lodash'

// The following is required when using a local instance of KeyCloak which uses self-signed certificates
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

export default ( server, config ) => {
    // eslint-disable-next-line new-cap
    const keycloak = Keycloak( config.jwt )
    const exclusions = [
        { methods: [ 'GET' ], path: '/docs' },
        { methods: [ 'GET' ], path: '/health' }
    ]

    const isExcluded = ( route ) => {
        const excluded = findIndex( exclusions, ( exclusion ) => {
            return exclusion.methods.includes( route.method ) && route.path.indexOf( exclusion.path ) > -1
        } )

        return excluded > -1
    }

    server.use( ( req, res, next ) => {
        const accessToken = req.headers.Authorization || req.headers.authorization || null

        // server.router.lookup( req, res )
        const route = req.getRoute()
        const excluded = isExcluded( route )

        if ( route && !excluded ) {
            keycloak
                .verifyOffline( ( accessToken && accessToken.indexOf( ' ' ) > -1 ) ? accessToken.split( ' ' )[ 1 ] : '' )
                .then( ( ) => {
                    req.fhirPractitionerId = req.query.fhirPractitionerId
                    req.fhirOrganizationId = req.query.fhirOrganizationId
                    req.roles = JSON.parse( req.query.realm_access ).roles
                    return next()
                } )
                .catch( () => {
                    // Token expired or is invalid
                    res.send( 403 )
                } )
        } else {
            return next()
        }

    } )
}
