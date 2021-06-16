import axios from 'axios'
import { path, find, compose, flip, curryN } from 'ramda'
import jwt from 'jsonwebtoken'
import jwkToPem from 'jwk-to-pem'

const certificatesCache = {}

const makeUser = ( data ) => ( {
    id: data.sub,
    userName: data.preferred_username,
    emailVerified: data.email_verified,
    resourceAccess: data.resource_access,
    email: data.email,
    name: data.name,
    firstName: data.given_name,
    lastName: data.family_name,
    authorization: data.authorization
} )

const verify = curryN( 2 )( jwt.verify )

const isTheRightKid = ( kid ) => ( publicKey ) => publicKey.kid === kid

const findPublicKeyFromKid = ( publicKey ) => ( kid ) =>
    find( isTheRightKid( kid ) )( publicKey )

const getKid = path( [ 'header', 'kid' ] )

const decode = compose(
    curryN( 2 ),
    flip
)( jwt.decode )

const getUserFromPublicKey = ( token ) =>
    compose(
        makeUser,
        verify( token )
    )

const getUserFromJWK = ( token ) => ( jwk ) =>
    compose(
        getUserFromPublicKey( token ),
        jwkToPem,
        findPublicKeyFromKid( jwk ),
        getKid,
        decode( { complete: true } )
    )( token )

const fetchPublicKeys = ( { realm, authServerUrl, useCache = true } ) => {
    const url = `${authServerUrl}/auth/realms/${realm}/protocol/openid-connect/certs`
    const key = url

    if ( useCache ) {
        return certificatesCache[ key ] ? Promise.resolve(
            certificatesCache[ key ]
        ) : axios
            .get( url )
            .then( path( [ 'data', 'keys' ] ) )
            .then( ( publicKey ) => {
                certificatesCache[ key ] = publicKey
                return publicKey
            } )
    }
    return axios.get( url ).then( path( [ 'data', 'keys' ] ) )
}

const verifyOffline = ( config ) => async ( accessToken, options = {} ) => {
    const { publicKey } = config

    return publicKey ? getUserFromPublicKey( accessToken )(
        publicKey
    ) : fetchPublicKeys( { ...config, ...options } ).then(
        getUserFromJWK( accessToken )
    )
}

const Keycloak = ( config ) => ( {
    verifyOffline: verifyOffline( config )
} )

export default Keycloak
