import cookie from 'cookie'
import jwt from 'jsonwebtoken'
import errors from 'restify-errors'
import uniqid from 'uniqid'


const generateCacheKey = () => {
    return uniqid()
}

const generateSignedToken = (
    jwtSecret,
    cacheKey,
    packageVersion,
    refreshTokenExpiresInSeconds,
    accessTokenExpiresInSeconds,
    scope
) => {
    const currentTimeInSeconds = Math.round( new Date().getTime() / 1000 )

    return jwt.sign( {
        uid: cacheKey,
        expiry: currentTimeInSeconds + accessTokenExpiresInSeconds,
        version: packageVersion,
        scope
    }, jwtSecret, { expiresIn: `${refreshTokenExpiresInSeconds}s` } )
}

const generateCacheData = (
    accessToken,
    accessTokenExpiresInSeconds,
    refreshToken,
    refreshTokenExpiresInSeconds,
    idToken,
    acl,
    user
) => {
    return {
        auth: {
            access_token: accessToken,
            expires_in: accessTokenExpiresInSeconds,
            refresh_token: refreshToken,
            refresh_expires_in: refreshTokenExpiresInSeconds,
            id_token: idToken
        },
        acl,
        user
    }
}

const login = async ( req, res, keycloakService, cacheService, logService, config ) => {
    const username = req.body.username

    try {
        const password = req.body.password
        const keycloakResponse = await keycloakService.authenticate( username, password )

        await logService.debug( `keycloakResponse=${JSON.stringify( keycloakResponse )}` )
        const jsonReponse = JSON.parse( keycloakResponse )

        if ( jsonReponse.error && jsonReponse.error.code === 401 ) {
            return new errors.UnauthorizedError()
        }

        const accessToken = jsonReponse.access_token
        const decodedAccessToken = jwt.decode( accessToken, config.jwt.secret )
        const accessTokenExpiresInSeconds = jsonReponse.expires_in
        const refreshToken = jsonReponse.refresh_token
        const refreshTokenExpiresInSeconds = jsonReponse.refresh_expires_in
        const idToken = jsonReponse.id_token
        const cacheKey = generateCacheKey()
        const token = generateSignedToken(
            config.jwt.secret,
            cacheKey,
            config.packageVersion,
            refreshTokenExpiresInSeconds,
            accessTokenExpiresInSeconds,
            jsonReponse.scope,
        )
        const user = {
            username,
            firstName: decodedAccessToken.given_name,
            lastName: decodedAccessToken.family_name,
            groups: decodedAccessToken.groups,
            roles: decodedAccessToken.realm_access.roles
        }
        const acl = {
            fhir: {
                role: decodedAccessToken.realm_access.roles.find( ( role ) => {
                    return role.startsWith( 'clin_' )
                } ).replace( 'clin_', '' ),
                organization_id: decodedAccessToken.fhir_organization_id || null,
                practitioner_id: decodedAccessToken.fhir_practitioner_id || null
            }
        }
        const cacheData = generateCacheData(
            accessToken,
            accessTokenExpiresInSeconds,
            refreshToken,
            refreshTokenExpiresInSeconds,
            idToken,
            acl,
            user,
        )

        await cacheService.create( cacheKey, cacheData, refreshTokenExpiresInSeconds )
        await logService.debug( `Login for ${username} using ${cacheKey}` )
        res.setHeader( 'Set-Cookie', cookie.serialize( config.jwt.requestProperty, token, {
            httpOnly: true,
            secure: true
        } ) )
        return { user }
    } catch ( e ) {
        await logService.warning( `Login for ${username} ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

const identity = async ( req, res, cacheService, logService ) => {
    const cacheKey = req.jwt.uid

    try {
        const currentCachedData = await cacheService.read( cacheKey )

        if ( currentCachedData ) {
            await logService.debug( `Found identity using ${cacheKey}` )
            return {
                user: currentCachedData.user
            }
        }

        await logService.warning( `No identity found using ${cacheKey}` )
        return new errors.NotFoundError()
    } catch ( e ) {
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
            secure: true,
            maxAge: 0
        } ) )
        return {}
    } catch ( e ) {
        await logService.warning( `Logout using ${cacheKey} ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

// @NOTE Keep endpoint internal. It cannot be used directly; see refreshAccessToken middleware.
const token = async ( req, res, keycloakService, cacheService, logService, config ) => {
    try {
        const cookieJar = cookie.parse( req.headers.cookie )
        const jwtCookie = cookieJar[ config.jwt.requestProperty ] || null
        const decodedJwt = jwt.decode( jwtCookie, config.jwt.secret )
        const cacheKey = decodedJwt.uid
        const currentCachedData = await cacheService.read( cacheKey )

        if ( currentCachedData ) {
            const refreshToken = currentCachedData.auth.refresh_token
            const keycloakResponse = await keycloakService.refresh( refreshToken )
            const jsonReponse = JSON.parse( keycloakResponse )
            const newAccessToken = jsonReponse.access_token
            const newAccessTokenExpiresInSeconds = jsonReponse.expires_in
            const newRefreshToken = jsonReponse.refresh_token
            const newRefreshTokenExpiresInSeconds = jsonReponse.refresh_expires_in
            const newIdToken = jsonReponse.id_token
            const newCacheData = generateCacheData(
                newAccessToken,
                newAccessTokenExpiresInSeconds,
                newRefreshToken,
                newRefreshTokenExpiresInSeconds,
                newIdToken,
                currentCachedData.acl,
                currentCachedData.user,
            )
            const newToken = generateSignedToken(
                config.jwt.secret,
                cacheKey,
                config.packageVersion,
                newRefreshTokenExpiresInSeconds,
                newAccessTokenExpiresInSeconds,
                jsonReponse.scope,
            )

            await cacheService.update( cacheKey, newCacheData, newRefreshTokenExpiresInSeconds )

            await logService.debug( `Refreshed token for ${currentCachedData.user.username} using ${cacheKey}` )
            return {
                user: currentCachedData.user,
                token: {
                    value: newToken,
                    expiry: newAccessTokenExpiresInSeconds
                }
            }
        }
        await logService.warning( `Token Refresh data expired using ${cacheKey}` )
        return new errors.ForbiddenError() // @NOTE 440 might be better

    } catch ( e ) {
        await logService.warning( `Token Refresh ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

export default {
    login,
    logout,
    identity,
    token
}
