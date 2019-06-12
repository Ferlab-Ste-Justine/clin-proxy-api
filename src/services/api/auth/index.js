import rjwt from 'restify-jwt-community'
import http from 'http'
import https from 'https'
import axios from 'axios'

import ApiService from '../service'
import { generateGetFunctionForApiVersion } from '../service'
import restifyAsyncWrap from '../helpers/async'
import CacheClient from '../../cache'
import KeycloakClient from '../../keycloak'
import validators from '../helpers/validators'

import Apiv1 from './v1'


const getFunctionForApiVersion = generateGetFunctionForApiVersion( {
    1: Apiv1
} )

export const refreshTokenMiddlewareGenerator = ( config ) => {
    return async ( req ) => {
        try {
            const protocol = req.isSecure() ? 'https' : 'http'
            const host = req.headers.host.split( ':' )[ 0 ].replace( '//', '' )
            const port = config.port ? `:${config.port}` : ''
            const endpoint = `${protocol}://${host}${port}${config.endpoint}/token`
            const result = await axios( {
                method: 'post',
                url: endpoint,
                headers: {
                    Cookie: req.headers.cookie
                },
                json: true
            } )

            req.refreshToken = result.headers[ 'set-cookie' ]
            return result.data
        } catch ( e ) {
            return null
        }
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

        await this.logService.debug( 'Cache Service Client appears functional ... checking connectivity.' )
        this.cacheService = new CacheClient( this.config.cache )
        await this.cacheService.create( 'authService', new Date().getTime() )

        await this.logService.debug( 'Keycloak Service Client appears functional ... checking connectivity.' )
        this.keycloakService = new KeycloakClient( this.config.keykloak )
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
            try {
                const response = await getFunctionForApiVersion( req.version, 'login' )( req, res,
                    this.keycloakService,
                    this.cacheService,
                    this.logService,
                    this.config
                )

                res.send( response )
                next()
            } catch ( e ) {
                next( e )
            }

        } ) )

        // Register Logout Route
        this.instance.del( `${this.config.endpoint}`, restifyAsyncWrap( async( req, res, next ) => {
            try {
                const response = await getFunctionForApiVersion( req.version, 'logout' )( req, res,
                    this.cacheService,
                    this.logService,
                    this.config
                )

                res.send( response )
                next()
            } catch ( e ) {
                next( e )
            }

        } ) )

        // Register Token Refresh Route
        // @NOTE Endpoint should only be exposed to the Docker Cluster's private network :)
        this.instance.post( `${this.config.endpoint}/token`, restifyAsyncWrap( async( req, res, next ) => {
            try {
                const response = await getFunctionForApiVersion( req.version, 'token' )( req, res,
                    this.keycloakService,
                    this.cacheService,
                    this.logService,
                    this.config
                )

                res.send( response )
                next()
            } catch ( e ) {
                next( e )
            }

        } ) )

        super.start()
    }

}
