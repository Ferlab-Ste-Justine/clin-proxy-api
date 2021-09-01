import ApiService from '../service'
import { generateGetFunctionForApiVersion } from '../service'
import restifyAsyncWrap from '../helpers/async'
import ElasticClient from '../../elastic'
import validators from '../helpers/validators'

import Apiv1 from './v1'


const getFunctionForApiVersion = generateGetFunctionForApiVersion( {
    1: Apiv1
} )

export default class HPOService extends ApiService {
    constructor( config ) {
        config.logService.info( 'Roger that.' )
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
        this.instance.get( {
            path: `${this.config.endpoint}/descendants`,
            validation: validators.requieredParentHpoId
        }, restifyAsyncWrap( async ( req, res, next ) => {
            try {
                const result = await getFunctionForApiVersion( req.version, 'searchHPODescendants' )(
                    req,
                    res,
                    this.elasticService,
                    this.logService
                )

                res.status( 200 )
                res.send( result )
                next()
            } catch ( e ) {
                await this.logService.warning( `${this.config.endpoint} ${e.toString()}` )
                next( e )
            }
        } ) )


        this.instance.get( {
            path: `${this.config.endpoint}/autocomplete`
        }, restifyAsyncWrap( async ( req, res, next ) => {
            try {
                const result = await getFunctionForApiVersion( req.version, 'searchHPOAutocomplete' )(
                    req,
                    res,
                    this.elasticService,
                    this.logService
                )

                res.status( 200 )
                res.send( result )
                next()
            } catch ( e ) {
                await this.logService.warning( `${this.config.endpoint} ${e.toString()}` )
                next( e )
            }
        } ) )

        this.instance.get( {
            path: `${this.config.endpoint}/ancestors`
        }, restifyAsyncWrap( async ( req, res, next ) => {
            try {
                const result = await getFunctionForApiVersion( req.version, 'searchHPOByAncestorId' )(
                    req,
                    res,
                    this.elasticService,
                    this.logService
                )

                res.status( 200 )
                res.send( result )
                next()
            } catch ( e ) {
                await this.logService.warning( `${this.config.endpoint} ${e.toString()}` )
                next( e )
            }
        } ) )

        super.start()
    }

}
