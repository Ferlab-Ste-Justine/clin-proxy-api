import errors from 'restify-errors'
import uniqid from 'uniqid'
import rjwt from 'restify-jwt-community'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'

import ApiService from '../service'
import restifyAsyncWrap from '../helpers/async'
import CacheClient from '../../cache'
import KeycloakClient from '../../keycloak'
import validators from '../helpers/validators'


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
                {
                    methods: [ 'GET' ],
                    url: `${this.config.endpoint}/docs`
                },
                {
                    methods: [ 'GET' ],
                    url: `${this.config.endpoint}/health`
                },
                {
                    methods: [ 'POST' ],
                    url: `${this.config.endpoint}`
                }
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
                const sessionState = jsonReponse.session_state
                const expiresIn = jsonReponse.expires_in
                const cacheKey = uniqid()
                const token = jwt.sign( {
                    uid: cacheKey,
                    version: this.config.version
                }, this.config.jwt.secret, { expiresIn: `${expiresIn}s` } )
                const cacheData = {
                    auth: {
                        access_token: accessToken,
                        session_state: sessionState
                    },
                    acl: {}
                }
                const user = {
                    username
                }

                await this.cacheService.create( cacheKey, cacheData, expiresIn )
                await this.logService.debug( `Login for ${username} using ${cacheKey}` )
                res.setHeader( 'Set-Cookie', cookie.serialize( this.config.jwt.requestProperty, token, {
                    httpOnly: true,
                    maxAge: expiresIn
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

        super.start()
    }

}
