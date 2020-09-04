import ApiService from '../service'
import { generateGetFunctionForApiVersion } from '../service'
import ElasticClient from '../../elastic'

import Apiv1 from './v1'
import validators from '../helpers/validators'
import restifyAsyncWrap from '../helpers/async'


const getFunctionForApiVersion = generateGetFunctionForApiVersion( {
    1: Apiv1
} )

export default class VariantService extends ApiService {
    constructor( config ) {
        config.logService.info( 'On it!' )
        super( config )
        this.config.cache = config.cacheConfig
        this.config.elastic = config.elasticConfig
        this.runServicesHealthCheck = async () => {
            try {
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

        this.elasticService = new ElasticClient( this.config.elastic )

        await this.runServicesHealthCheck()
    }

    async start() {
        // Register Schema Route
        this.instance.get( {
            path: `${this.config.endpoint}/schema`
        }, restifyAsyncWrap( async( req, res, next ) => {
            try {
                const response = await getFunctionForApiVersion( req.version, 'getSchema' )( this.logService )

                res.status( 200 )
                res.send( response )
                next()
            } catch ( e ) {
                await this.logService.warning( `${this.config.endpoint} ${e.toString()}` )
                next( e )
            }

        } ) )

        // Register Search Route
        this.instance.post( {
            path: `${this.config.endpoint}/search`,
            validation: validators.searchVariantsForPatient
        }, restifyAsyncWrap( async( req, res, next ) => {
            try {
                const response = await getFunctionForApiVersion( req.version, 'getVariants' )(
                    req,
                    res,
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

        // Register Facet Route
        this.instance.post( {
            path: `${this.config.endpoint}/facet`,
            validation: validators.searchFacetsForPatient
        }, restifyAsyncWrap( async( req, res, next ) => {
            try {
                const response = await getFunctionForApiVersion( req.version, 'getFacets' )(
                    req,
                    res,
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

        // Register Count Route
        this.instance.post( {
            path: `${this.config.endpoint}/count`,
            validation: validators.countVariantsForPatient
        }, restifyAsyncWrap( async( req, res, next ) => {
            try {
                const response = await getFunctionForApiVersion( req.version, 'countVariants' )(
                    req,
                    res,
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

        // Register Variant Route
        this.instance.get( {
            path: `${this.config.endpoint}/:vid`,
            validation: validators.searchVariantById
        }, restifyAsyncWrap( async( req, res, next ) => {
            try {
                const response = await getFunctionForApiVersion( req.version, 'getVariantById' )(
                    req,
                    res,
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

        // Generate excel file for list of variants
        this.instance.post( {
            path: `${this.config.endpoint}/xl`
            // eslint-disable-next-line no-unused-vars
        }, async ( req, res, next ) => {
            try {
                const response = await getFunctionForApiVersion( req.version, 'sendDataAsExcel' )(
                    req,
                    res,
                    this.elasticService,
                    this.logService
                )

                if ( response ) {
                    res.status( 400 )
                    res.end()
                }
            } catch ( e ) {
                await this.logService.warning( `${this.config.endpoint} ${e.toString()}` )
                next( e )
            }
        } )

        super.start()
    }

}
