import rjwt from 'restify-jwt-community'

import ApiService from '../service'
import { generateGetFunctionForApiVersion } from '../service'
import CacheClient from '../../cache'
import ElasticClient from '../../elastic'

import Apiv1 from './v1'
// import validators from '../helpers/validators'
import restifyAsyncWrap from '../helpers/async'


const getFunctionForApiVersion = generateGetFunctionForApiVersion( {
    1: Apiv1
} )

export default class MetaService extends ApiService {
    constructor( config ) {
        config.logService.info( 'Oy?' )
        super( config )
        this.config.cache = config.cacheConfig
        this.config.elastic = config.elasticConfig
        this.runServicesHealthCheck = async () => {
            try {
                await this.cacheService.ping()
                await this.logService.debug( 'Cache Service is healthy.' )
                const elasticPingResult = await this.elasticService.ping()

                if ( !elasticPingResult.name ) {
                    throw new Error( 'Elastic Search Service is dead.' )
                }
                await this.logService.debug( 'Elastic Search Service is healthy.' )
            } catch ( e ) {
                throw new Error( `NOK with ${e.toString()}` )
            }
        }
    }

    async init() {
        super.init()

        await this.logService.debug( 'Cache Service Client appears functional ... checking connectivity.' )
        this.cacheService = new CacheClient( this.config.cache )
        await this.cacheService.ping()

        await this.logService.debug( 'Elastic Search Client appears functional ... checking connectivity.' )
        this.elasticService = new ElasticClient( this.config.elastic )
        const elasticPingResult = await this.elasticService.ping()

        // @TODO We probably should also validate that the schema's index is healthy
        if ( !elasticPingResult.name ) {
            throw new Error( 'Elastic Search Client health check failed' )
        }
    }

    async start() {
        // JWT Endpoint Exceptions
        this.instance.use( rjwt( this.config.jwt ).unless( {
            path: [
                { methods: [ 'GET' ], url: `${this.config.endpoint}/docs` },
                { methods: [ 'GET' ], url: `${this.config.endpoint}/health` }
            ]
        } ) )

        // Register searchStatements
        this.instance.get( {
            path: `${this.config.endpoint}/statement`
        }, restifyAsyncWrap( async( req, res, next ) => {
            try {
                const response = await getFunctionForApiVersion( req.version, 'searchStatements' )(
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

        // Register createStatement
        this.instance.post( {
            path: `${this.config.endpoint}/statement`
        }, restifyAsyncWrap( async( req, res, next ) => {
            try {
                const response = await getFunctionForApiVersion( req.version, 'createStatement' )(
                    req,
                    res,
                    this.cacheService,
                    this.elasticService,
                    this.logService
                )

                res.status( 201 )
                res.send( response )
                next()
            } catch ( e ) {
                await this.logService.warning( `${this.config.endpoint} ${e.toString()}` )
                next( e )
            }

        } ) )

        // Register updateStatement
        this.instance.put( {
            path: `${this.config.endpoint}/statement`
        }, restifyAsyncWrap( async( req, res, next ) => {
            try {
                const response = await getFunctionForApiVersion( req.version, 'updateStatement' )(
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

        // Register updateStatement
        this.instance.del( {
            path: `${this.config.endpoint}/statement`
        }, restifyAsyncWrap( async( req, res, next ) => {
            try {
                await getFunctionForApiVersion( req.version, 'deleteStatement' )(
                    req,
                    res,
                    this.cacheService,
                    this.elasticService,
                    this.logService
                )

                res.send( 204 )
                next()
            } catch ( e ) {
                await this.logService.warning( `${this.config.endpoint} ${e.toString()}` )
                next( e )
            }

        } ) )

        super.start()
    }

}
