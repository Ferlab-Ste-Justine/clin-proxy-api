import errors from 'restify-errors'
import uniqid from 'uniqid'
import rjwt from 'restify-jwt-community'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'
import http from 'http'

import ApiService from '../service'
import restifyAsyncWrap from '../helpers/async'
import CacheClient from '../../cache'
import KeycloakClient from '../../keycloak'
import validators from '../helpers/validators'


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

const generateCacheKey = () => {
    return uniqid()
}

export const refreshTokenMiddlewareGenerator = ( config ) => {
    return ( req, payload, callback ) => {
        const refreshTokenIsExpired = payload.expiry <= Math.round( new Date().getTime() / 1000 )

        if ( refreshTokenIsExpired ) {
            callback( null, true )
        }

        const options = {
            host: `${( req.isSecure() ) ? 'https' : 'http' }://${req.headers.host}`,
            port: config.port,
            path: `${config.endpoint}/token`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }

        let response = ''
        let refreshWasSuccessful = false
        const refreshRequest = http.request( options, ( refreshResponse ) => {
            refreshResponse.on( 'data', ( chunk ) => {
                response += chunk
            } )
        } )

        refreshRequest.write( JSON.stringify( {} ) )
        refreshRequest.end()

        const jsonResponse = JSON.parse( response )

        if ( jsonResponse.data ) {
            refreshWasSuccessful = true
        }

        callback( null, !refreshWasSuccessful )
    }
}


export default class AuthService extends ApiService {
    constructor( config ) {
        config.logService.info( 'Roger.' )
        super( config )
        this.config.cache = config.cacheConfig
        this.config.keykloak = config.keycloakConfig
    }

    async init() {
        super.init()

        this.cacheService = new CacheClient( this.config.cache )
        await this.logService.debug( 'Cache Service Client appears functional ... Testing.' )
        await this.cacheService.create( 'authService', new Date().getTime() )

        this.keycloakService = new KeycloakClient( this.config.keykloak )
        await this.logService.debug( 'Keycloak Service Client appears functional ... Testing.' )
        await this.keycloakService.ping()
    }

    async start() {

        // JWT Endpoint Exceptions
        this.instance.use( rjwt( this.config.jwt ).unless( {
            path: [
                { methods: [ 'GET' ], url: `${this.config.endpoint}/docs` },
                { methods: [ 'GET' ], url: `${this.config.endpoint}/health` },
                { methods: [ 'POST' ], url: `${this.config.endpoint}/token` },
                { methods: [ 'POST' ], url: `${this.config.endpoint}` }
            ]
        } ) )

        // Register Login Route
        this.instance.post( {
            path: `${this.config.endpoint}`,
            validation: validators.login
        }, restifyAsyncWrap( async( req, res, next ) => {
            const username = req.body.username

            try {
                const password = req.body.password
                const keycloakResponse = await this.keycloakService.authenticate( username, password )
                const jsonReponse = JSON.parse( keycloakResponse )
                const accessToken = jsonReponse.access_token
                const accessTokenExpiresInSeconds = jsonReponse.expires_in
                const refreshToken = jsonReponse.refresh_token
                const refreshTokenExpiresInSeconds = jsonReponse.refresh_expires_in
                const cacheKey = generateCacheKey()
                const token = generateSignedToken(
                    this.config.jwt.secret,
                    cacheKey,
                    this.config.version,
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

                await this.cacheService.create( cacheKey, cacheData, refreshTokenExpiresInSeconds )
                await this.logService.debug( `Login for ${username} using ${cacheKey}` )
                res.setHeader( 'Set-Cookie', cookie.serialize( this.config.jwt.requestProperty, token, {
                    httpOnly: true,
                    maxAge: refreshTokenExpiresInSeconds
                } ) )
                res.send( { user } )
                return next()
            } catch ( e ) {
                await this.logService.warning( `Login for ${username} ${e.toString()}` )
                return next( new errors.UnauthorizedError() )
            }
        } ) )

        // Register Logout Route
        this.instance.del( `${this.config.endpoint}`, restifyAsyncWrap( async( req, res, next ) => {
            const cacheKey = req.jwt.uid

            try {
                await this.cacheService.delete( cacheKey )
                await this.logService.debug( `Logout using ${cacheKey}` )
                res.setHeader( 'Set-Cookie', cookie.serialize( this.config.jwt.requestProperty, null, {
                    httpOnly: true,
                    maxAge: 0
                } ) )
                res.send( {} )
                return next()
            } catch ( e ) {
                await this.logService.warning( `Logout using ${cacheKey} ${e.toString()}` )
                return next( new errors.InternalServerError() )
            }
        } ) )

        // Register Token Refresh Route
        // @NOTE Endpoint should only be exposed to the Docker Cluster's private network :)
        this.instance.post( `${this.config.endpoint}/token`, restifyAsyncWrap( async( req, res, next ) => {
            const cacheKey = req.jwt.uid

            try {
                const currentCachedData = await this.cacheService.read( cacheKey )
                const refreshToken = currentCachedData.auth.refresh_token
                const keycloakResponse = await this.keycloakService.refresh( refreshToken )
                const jsonReponse = JSON.parse( keycloakResponse )
                const newAccessToken = jsonReponse.access_token
                const newAccessTokenExpiresInSeconds = jsonReponse.expires_in
                const newRefreshToken = jsonReponse.refresh_token
                const newRefreshTokenExpiresInSeconds = jsonReponse.refresh_expires_in
                const newCacheData = generateCacheData( newAccessToken, newAccessTokenExpiresInSeconds, newRefreshToken, newRefreshTokenExpiresInSeconds, currentCachedData.user )
                const newToken = generateSignedToken(
                    this.config.jwt.secret,
                    cacheKey,
                    this.config.version,
                    newRefreshTokenExpiresInSeconds,
                    newAccessTokenExpiresInSeconds
                )

                await this.cacheService.update( cacheKey, newCacheData )

                await this.logService.debug( `Refreshed token for ${currentCachedData.user.username} using ${cacheKey}` )
                res.setHeader( 'Set-Cookie', cookie.serialize( this.config.jwt.requestProperty, newToken, {
                    httpOnly: true,
                    maxAge: newRefreshTokenExpiresInSeconds
                } ) )
                res.send( { user: currentCachedData.user } )
                return next()
            } catch ( e ) {
                await this.logService.warning( `Token Refresh ${cacheKey} ${e.toString()}` )
                return next( new errors.InternalServerError() )
            }
        } ) )

        super.start()
    }

}
