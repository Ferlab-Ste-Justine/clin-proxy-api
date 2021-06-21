import {
    AUTH_RESOURCE_PATIENT_VARIANTS,
    AUTH_RESOURCE_PATIENT_LIST,
    AUTH_RESOURCE_PATIENT_PRESCRIPTIONS
} from '../helpers/acl'
import configureKeycloak from '../helpers/keycloak'

const checkPatientSearchAuth = ( url, resources ) => {
    return url.startsWith( '/patient' ) && resources.includes( AUTH_RESOURCE_PATIENT_LIST )
}

const checkPatientVariantsAuth = ( url, resources ) => {
    return ( url.startsWith( '/variant' ) || url.startsWith( '/gene' ) ) && resources.includes( AUTH_RESOURCE_PATIENT_VARIANTS )
}

const checkProfileAuth = ( url ) => {
    return url.startsWith( '/meta' )
}

const checkHpos = ( url, resources ) => {
    return url.startsWith( '/hpo' ) && resources.includes( AUTH_RESOURCE_PATIENT_PRESCRIPTIONS )
}
  
  
const authorizers = [ checkPatientSearchAuth, checkPatientVariantsAuth, checkProfileAuth, checkHpos ]

export default ( server, config ) => {
    const keycloak = configureKeycloak( config.jwt )

    server.use( async ( req, res, next ) => {
        try {
            const url = req.url
            
            const bearer = req.headers.Authorization || req.headers.authorization || null
            const authorization = bearer.split( ' ' )[ 1 ]

            const parsed = await keycloak.verifyOffline( authorization )
            const resources = parsed.authorization.permissions.map( ( permission ) => permission.rsname )

            const result = authorizers.some( ( authorizer ) => authorizer( url, resources ) )
            
            if ( !result ){
                throw new Error( 'Resource access denied' )
            }
            return next()
        } catch ( e ){
            res.send( 403 )
        }
    } )
}
