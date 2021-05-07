import axios from 'axios'
import queryString from 'querystring'
import { AUTH_RESOURCES,
    AUTH_RESOURCE_PATIENT_VARIANTS,
    AUTH_RESOURCE_PATIENT_LIST,
    KEYCLOAK_AUTH_GRANT_TYPE,
    KEYCLOAK_AUTH_RESPONSE_MODE
} from '../helpers/acl'

const checkPatientSearchAuth = ( url, resources ) => {
    return url.startsWith( '/patient' ) && resources.includes( AUTH_RESOURCE_PATIENT_LIST )
}

const checkPatientVariantsAuth = ( url, resources ) => {
    return ( url.startsWith( '/variant' ) || url.startsWith( '/gene' ) ) && resources.includes( AUTH_RESOURCE_PATIENT_VARIANTS )
}

const checkProfileAuth = ( url ) => {
    return url.startsWith( '/meta' )
}
  

const fetchAllowedResources = async ( token ) => {
    const data = queryString.encode( {
        grant_type: KEYCLOAK_AUTH_GRANT_TYPE,
        audience: process.env.KEYCLOAK_AUTH_CLIENT_ID,
        response_mode: KEYCLOAK_AUTH_RESPONSE_MODE,
        permission: AUTH_RESOURCES
    } )
  
    try {
        const response = await axios.post(
            `${process.env.KEYCLOAK_URL}realms/clin/protocol/openid-connect/token`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
  
        return response.data.map( ( resource ) => resource.rsname )
    } catch ( e ) {
        return []
    }
}
  
const authorizers = [ checkPatientSearchAuth, checkPatientVariantsAuth, checkProfileAuth ]

export default ( server ) => {
    server.use( async ( req, res, next ) => {
        try {
            const url = req.url
            const accessToken = req.headers.Authorization || req.headers.authorization || null
            const token = accessToken.split( ' ' )[ 1 ]
            const resources = await fetchAllowedResources( token )

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
