import rjwt from 'restify-jwt-community'

import ApiService from '../service'
import { generateGetFunctionForApiVersion } from '../service'
import CacheClient from '../../cache'
import OvertureClient from '../../overture'

import Apiv1 from './v1'
import restifyAsyncWrap from '../helpers/async'


const getFunctionForApiVersion = generateGetFunctionForApiVersion( {
    1: Apiv1
} )

export default class MetaService extends ApiService {
    constructor( config ) {
        config.logService.info( 'Oy?' )
        super( config )
        this.config.cache = config.cacheConfig
        this.config.overture = config.overtureConfig
        this.runServicesHealthCheck = async () => {
            try {
                try {
                    await this.cacheService.ping()
                } catch ( cacheException ) {
                    throw new Error( `Cache Service Client health check failed with ${ cacheException.message}` )
                }
                await this.logService.debug( 'Cache Service is healthy.' )

                try {
                    await this.overtureService.ping()
                } catch ( overtureException ) {
                    throw new Error( `Overture Client health check failed with ${ overtureException.message}` )
                }
                await this.logService.debug( 'Overture Service is healthy.' )

            } catch ( e ) {
                throw new Error( `NOK with ${e.toString()}` )
            }
        }
    }

    async init() {
        super.init()

        await this.logService.debug( 'Initializing service dependencies...' )

        this.cacheService = new CacheClient( this.config.cache )
        this.overtureService = new OvertureClient( this.config.overture )

        await this.runServicesHealthCheck()
    }

    async start() {
        // JWT Endpoint Exceptions
        this.instance.use( rjwt( this.config.jwt ).unless( {
            path: [
                { methods: [ 'GET' ], url: `${this.config.endpoint}/docs` },
                { methods: [ 'GET' ], url: `${this.config.endpoint}/health` }
            ]
        } ) )

        // Test Route -> //overture/test
        this.instance.get( {
            path: `${this.config.endpoint}/test`
        }, restifyAsyncWrap( async( req, res, next ) => {
            try {
                const response = await getFunctionForApiVersion( req.version, 'functionToGetSomethingFromScore' )(
                    req,
                    res,
                    this.cacheService,
                    this.overtureService,
                    this.logService
                )

                res.header( 'Cache-Control', 'no-store, no-cache, must-revalidate' )
                res.status( 200 )
                res.send( response )
                next()
            } catch ( e ) {
                await this.logService.warning( `${this.config.endpoint} ${e.toString()}` )
                next( e )
            }

        } ) )

        super.start()
    }

}
