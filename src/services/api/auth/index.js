import rjwt from 'restify-jwt-community'
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
    return ( req ) => {
        try {
            const protocol = req.isSecure() ? 'https' : 'http'
            const host = req.headers.host.split( ':' )[ 0 ].replace( '//', '' )
            const port = config.port ? `:${config.port}` : ''
            const url = `${protocol}://${host}${port}`
            const endpoint = `${url}${config.endpoint}/token`

            let response = false

            axios( {
                method: 'POST',
                url: endpoint,
                data: {},
                headers: {
                    Cookie: req.headers.cookie
                },
                timeout: 2500,
                json: true,
                httpsAgent: new https.Agent( { keepAlive: true, rejectUnauthorized: false } )
            } ).then( ( result ) => {
                response = result
            } ).catch( ( e ) => {
                response = e
            } )

            /* eslint-disable */
            require( 'deasync' ).loopWhile( () => {
                return !response
            } )

            if (response instanceof Error) {
                throw response
            }

            return response.data
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
        this.config.keycloak = config.keycloakConfig
        this.test = 0
        this.runServicesHealthCheck = async () => {
            try {


                //if (this.test > 1) {
                //    throw Error('meh')
                //}
                //this.test++;

                try {
                    await this.cacheService.ping()
                } catch ( cacheException ) {
                    throw new Error( `Cache Service Client health check failed with ${ cacheException.message}` )
                }
                await this.logService.debug( 'Cache Service is healthy.' )

                try {
                    await this.keycloakService.ping()
                } catch ( keycloakException ) {
                    throw new Error( `Keycloak Service Client health check failed with ${ keycloakException.message}` )
                }
                await this.logService.debug( 'Keycloak Service is healthy.' )
            } catch (e) {
                throw new Error(`NOK with ${e.toString()}`)
            }
        }
    }

    async init() {
        super.init()

        await this.logService.debug( 'Initializing service dependencies...' )

        this.cacheService = new CacheClient( this.config.cache )
        this.keycloakService = new KeycloakClient( this.config.keycloak,  this.logService )

        await this.runServicesHealthCheck()
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

                res.status( 200 )
                res.send( response )
                next()
            } catch ( e ) {
                next( e )
            }

        } ) )

        // Register Session Route
        this.instance.get( {
            path: `${this.config.endpoint}`
        }, restifyAsyncWrap( async( req, res, next ) => {
            try {
                const response = await getFunctionForApiVersion( req.version, 'identity' )( req, res,
                    this.cacheService,
                    this.logService,
                )

                res.status( 200 )
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

                res.status( 200 )
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

                res.status( 201 )
                res.send( response )
                next()
            } catch ( e ) {
                next( e )
            }

        } ) )

        super.start()
    }

}
