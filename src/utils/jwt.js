const R = require('ramda');
import cookie from 'cookie'
import jwt from 'jsonwebtoken'

import { launcherLog } from './logger'
import { refreshTokenMiddlewareGenerator } from './services/api/auth'

let refreshTokenMiddleware = () => {
    return null
}

try {
    const authServiceConfig = JSON.parse( process.env.AUTH_API_SERVICE )

    refreshTokenMiddleware = refreshTokenMiddlewareGenerator( authServiceConfig )
} catch ( e ) {
    launcherLog.warning( 'No Token Refresh Middleware will be available for API Services launched.' )
}

const process_request_token = R.curry(( 
    serviceJwtPropertyName,
    jwtSecret,
    launcherVersion,
    req 
    ) => {
    if ( req.headers && req.headers.cookie ) {
        const cookieJar = cookie.parse( req.headers.cookie )
        let token = cookieJar[ serviceJwtPropertyName ] || null

        if ( token ) {
            req.jwt = jwt.decode( token, jwtSecret )

            // Signed JWT Token Version Should Match Package Version
            if ( req.jwt.version !== launcherVersion ) {
                return new errors.InvalidCredentialsError( 'The token version is outdated' )
            }

            // Signed JWT Token Is Expired
            const currentTimeInSeconds = Math.round( new Date().getTime() / 1000 )

            if ( req.jwt.expiry <= currentTimeInSeconds ) {
                const refreshPayload = refreshTokenMiddleware( req )

                token = refreshPayload.data.token.value
                req.jwt = jwt.decode( token, jwtSecret )
                req.newAccessTokenIssued = token
            }

            return token
        }
    }
    return null
});

export default process_request_token