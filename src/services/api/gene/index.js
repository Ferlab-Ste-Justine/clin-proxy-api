import rjwt from 'restify-jwt-community'

import ApiService from '../service'
import { generateGetFunctionForApiVersion } from '../service'
import restifyAsyncWrap from '../helpers/async'
import CacheClient from '../../cache'
import ElasticClient from '../../elastic'
import validators from '../helpers/validators'

import Apiv1 from './v1'


const getFunctionForApiVersion = generateGetFunctionForApiVersion( {
    1: Apiv1
} )

export default class GeneService extends ApiService {
    constructor( config ) {
        config.logService.info( 'Roger that.' )
        super( config )
        this.config.cache = config.cacheConfig
        this.config.elastic = config.elasticConfig
        this.runServicesHealthCheck = async () => {
            try {
                try {
                    await this.cacheService.ping()
                } catch ( cacheException ) {
                    throw new Error( `Cache Service Client health check failed with ${ cacheException.message}` )
                }
                await this.logService.debug( 'Cache Service is healthy.' )

                try {
                    const elasticPingResult = await this.elasticService.ping()

                    if ( !elasticPingResult.name ) {
                        throw new Error( 'Elastic Search Service is dead.' )
                    }
                } catch ( elasticException ) {
                    throw new Error( `Elastic Service Client health check failed with ${ elasticException.message}` )
                }
                await this.logService.debug( 'Elastic Search Service is healthy.' )
            } catch ( e ) {
                throw new Error( `NOK with ${e.toString()}` )
            }
        }
    }

    async init() {
        super.init()

        await this.logService.debug( 'Initializing service dependencies...' )

        this.cacheService = new CacheClient( this.config.cache )
        this.elasticService = new ElasticClient( this.config.elastic )

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

        // Register searchGenesByAutoComplete Route
        this.instance.get( {
            path: `${this.config.endpoint}/autocomplete`,
            validation: validators.searchGenesByAutoComplete
        }, restifyAsyncWrap( async( req, res, next ) => {
            try {
                const response = await getFunctionForApiVersion( req.version, 'searchGenesByAutoComplete' )(
                    req,
                    res,
                    this.cacheService,
                    this.elasticService,
                    this.logService
                )

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
