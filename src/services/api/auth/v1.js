import cookie from 'cookie'
import jwt from 'jsonwebtoken'
import errors from 'restify-errors'
import uniqid from 'uniqid'


const generateCacheKey = () => {
    return uniqid()
}

const generateSignedToken = ( jwtSecret, cacheKey, packageVersion, refreshTokenExpiresInSeconds, accessTokenExpiresInSeconds ) => {
    const currentTimeInSeconds = Math.round( new Date().getTime() / 1000 )

    return jwt.sign( {
        uid: cacheKey,
        expiry: currentTimeInSeconds + refreshTokenExpiresInSeconds,
        version: packageVersion
    }, jwtSecret, { expiresIn: `${accessTokenExpiresInSeconds}s` } )
}

const generateCacheData = ( accessToken, accessTokenExpiresInSeconds, refreshToken, refreshTokenExpiresInSeconds, user ) => {
    return {
        acl: {},
        auth: {
            access_token: accessToken,
            expires_in: accessTokenExpiresInSeconds,
            refresh_token: refreshToken,
            refresh_expires_in: refreshTokenExpiresInSeconds
        },
        user
    }
}

const login = async ( req, res, keycloakService, cacheService, logService, config ) => {
    const username = req.body.username

    try {
        const password = req.body.password
        const keycloakResponse = await keycloakService.authenticate( username, password )
        const jsonReponse = JSON.parse( keycloakResponse )
        const accessToken = jsonReponse.access_token
        const accessTokenExpiresInSeconds = jsonReponse.expires_in
        const refreshToken = jsonReponse.refresh_token
        const refreshTokenExpiresInSeconds = jsonReponse.refresh_expires_in
        const cacheKey = generateCacheKey()
        const token = generateSignedToken(
            config.jwt.secret,
            cacheKey,
            config.packageVersion,
            refreshTokenExpiresInSeconds,
            accessTokenExpiresInSeconds
        )

        const user = {
            username
        }
        const cacheData = generateCacheData(
            accessToken,
            accessTokenExpiresInSeconds,
            refreshToken,
            refreshTokenExpiresInSeconds,
            user,
        )

        await cacheService.create( cacheKey, cacheData, refreshTokenExpiresInSeconds )
        await logService.debug( `Login for ${username} using ${cacheKey}` )
        res.setHeader( 'Set-Cookie', cookie.serialize( config.jwt.requestProperty, token, {
            httpOnly: true,
            maxAge: refreshTokenExpiresInSeconds
        } ) )
        return { user }
    } catch ( e ) {
        await logService.warning( `Login for ${username} ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

const logout = async ( req, res, cacheService, logService, config ) => {
    const cacheKey = req.jwt.uid

    try {
        await cacheService.delete( cacheKey )
        await logService.debug( `Logout using ${cacheKey}` )
        res.setHeader( 'Set-Cookie', cookie.serialize( config.jwt.requestProperty, null, {
            httpOnly: true,
            maxAge: 0
        } ) )
        return {}
    } catch ( e ) {
        await logService.warning( `Logout using ${cacheKey} ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

const token = async ( req, res, keycloakService, cacheService, logService, config ) => {
    try {
        const cookieJar = cookie.parse( req.headers.cookie )
        const encodedJwt = cookieJar[ config.jwt.requestProperty ] || null
        const decodedJwt = jwt.decode( encodedJwt, config.jwt.secret )
        const cacheKey = decodedJwt.uid
        const currentCachedData = await cacheService.read( cacheKey )
        const refreshToken = currentCachedData.auth.refresh_token
        const keycloakResponse = await keycloakService.refresh( refreshToken )
        const jsonReponse = JSON.parse( keycloakResponse )
        const newAccessToken = jsonReponse.access_token
        const newAccessTokenExpiresInSeconds = jsonReponse.expires_in
        const newRefreshToken = jsonReponse.refresh_token
        const newRefreshTokenExpiresInSeconds = jsonReponse.refresh_expires_in
        const newCacheData = generateCacheData( newAccessToken, newAccessTokenExpiresInSeconds, newRefreshToken, newRefreshTokenExpiresInSeconds, currentCachedData.user )
        const newToken = generateSignedToken(
            config.jwt.secret,
            cacheKey,
            config.packageVersion,
            newRefreshTokenExpiresInSeconds,
            newAccessTokenExpiresInSeconds
        )

        await cacheService.update( cacheKey, newCacheData, newRefreshTokenExpiresInSeconds )

        await logService.debug( `Refreshed token for ${currentCachedData.user.username} using ${cacheKey}` )
        res.setHeader( 'Set-Cookie', cookie.serialize( config.jwt.requestProperty, newToken, {
            httpOnly: true,
            maxAge: newRefreshTokenExpiresInSeconds
        } ) )
        return { user: currentCachedData.user }
    } catch ( e ) {
        await logService.warning( `Token Refresh ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

export default {
    login,
    logout,
    token
}
