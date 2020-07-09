import ApiService from '../service'
import { generateGetFunctionForApiVersion } from '../service'
import ElasticClient from '../../elastic'

import Apiv1 from './v1'
// import validators from '../helpers/validators' @TODO
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
        // Register getStatements
        this.instance.get( {
            path: `${this.config.endpoint}/statement`
        }, restifyAsyncWrap( async( req, res, next ) => {
            try {
                const response = await getFunctionForApiVersion( req.version, 'getStatements' )(
                    req,
                    res,
                    this.elasticService,
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

        // Register createStatement
        this.instance.post( {
            path: `${this.config.endpoint}/statement`
        }, restifyAsyncWrap( async( req, res, next ) => {
            try {
                const response = await getFunctionForApiVersion( req.version, 'createStatement' )(
                    req,
                    res,
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

        // Register deleteStatement with requestBody (old form)
        // TODO To remove after changes in Frontend --  Kept to preserve backward compatibility
        this.instance.del( {
            path: `${this.config.endpoint}/statement`
        }, restifyAsyncWrap( async( req, res, next ) => {
            try {
                await getFunctionForApiVersion( req.version, 'deleteStatement' )(
                    req,
                    res,
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

        // Register deleteStatement with query param (new form) to conform with openApi
        this.instance.del( {
            path: `${this.config.endpoint}/:uid`
        }, restifyAsyncWrap( async( req, res, next ) => {
            try {
                await getFunctionForApiVersion( req.version, 'deleteStatement' )(
                    req,
                    res,
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


        // Register getProfile
        this.instance.get( {
            path: `${this.config.endpoint}/profile`
        }, restifyAsyncWrap( async( req, res, next ) => {
            try {
                const response = await getFunctionForApiVersion( req.version, 'getProfile' )(
                    req,
                    res,
                    this.elasticService,
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

        // Register createProfile
        this.instance.post( {
            path: `${this.config.endpoint}/profile`
        }, restifyAsyncWrap( async( req, res, next ) => {
            try {
                const response = await getFunctionForApiVersion( req.version, 'createProfile' )(
                    req,
                    res,
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

        // Register updateProfile
        this.instance.put( {
            path: `${this.config.endpoint}/profile`
        }, restifyAsyncWrap( async( req, res, next ) => {
            try {
                const response = await getFunctionForApiVersion( req.version, 'updateProfile' )(
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

        // Register deleteProfile  (old form)
        // TODO To remove after changes in Frontend --  Kept to preserve backward compatibility
        this.instance.del( {
            path: `${this.config.endpoint}/profile`
        }, restifyAsyncWrap( async( req, res, next ) => {
            try {
                await getFunctionForApiVersion( req.version, 'deleteProfile' )(
                    req,
                    res,
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

        // Register deleteProfile (new form) conform to OpenApi 3.0
        this.instance.del( {
            path: `${this.config.endpoint}/profile/:uid`
        }, restifyAsyncWrap( async( req, res, next ) => {
            try {
                await getFunctionForApiVersion( req.version, 'deleteProfile' )(
                    req,
                    res,
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
