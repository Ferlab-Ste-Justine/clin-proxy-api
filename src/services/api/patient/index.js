import rjwt from 'restify-jwt-community'

import ApiService from '../service'
import { generateGetFunctionForApiVersion } from '../service'
import restifyAsyncWrap from '../helpers/async'
import CacheClient from '../../cache'
import AidboxClient from '../../aidbox'
import ElasticClient from '../../elastic'
import validators from '../helpers/validators'

import Apiv1 from './v1'


const getFunctionForApiVersion = generateGetFunctionForApiVersion( {
    1: Apiv1
} )

export default class PatientService extends ApiService {
    constructor( config ) {
        config.logService.info( 'Roger that.' )
        super( config )
        this.config.cache = config.cacheConfig
        this.config.aidbox = config.aidboxConfig
        this.config.elastic = config.elasticConfig
    }

    async init() {
        super.init()

        await this.logService.debug( 'Cache Service Client appears functional ... checking connectivity.' )
        this.cacheService = new CacheClient( this.config.cache )
        await this.cacheService.create( 'patientService', new Date().getTime() )

        await this.logService.debug( 'Elastic Search Client appears functional ... checking connectivity.' )
        this.elasticService = new ElasticClient( this.config.elastic )
        const elasticPingResult = await this.elasticService.ping()

        if ( !elasticPingResult.name ) {
            throw new Error( 'Elastic Search Client health check failed' )
        }

        await this.logService.debug( 'Aidbox Service Client appears functional ... checking connectivity.' )
        this.aidboxService = new AidboxClient( this.config.aidbox )
        const aidboxPingResult = await this.aidboxService.ping()

        if ( aidboxPingResult.status !== 'pass' ) {
            throw new Error( 'Aidbox Service Client health check failed' )
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

        // Register getAllPatients Route
        this.instance.get( {
            path: `${this.config.endpoint}/search`
        }, restifyAsyncWrap( async( req, res, next ) => {
            try {
                const response = await getFunctionForApiVersion( req.version, 'getAllPatients' )(
                    req,
                    res,
                    this.cacheService,
                    this.elasticService,
                    this.logService
                )

                res.send( response )
                next()
            } catch ( e ) {
                await this.logService.warning( `${this.config.endpoint} ${e.toString()}` )
                next( e )
            }

        } ) )

        // Register searchPatientsByFilters Route
        this.instance.post( {
            path: `${this.config.endpoint}/search`
        }, restifyAsyncWrap( async( req, res, next ) => {
            try {
                const response = await getFunctionForApiVersion( req.version, 'searchPatientsByFilters' )(
                    req,
                    res,
                    this.cacheService,
                    this.elasticService,
                    this.logService
                )

                res.send( response )
                next()
            } catch ( e ) {
                await this.logService.warning( `${this.config.endpoint} ${e.toString()}` )
                next( e )
            }

        } ) )

        // Register getPatientsByAutoComplete Route
        this.instance.get( {
            path: `${this.config.endpoint}/autocomplete/:type/:query`
        }, restifyAsyncWrap( async( req, res, next ) => {
            try {
                const response = await getFunctionForApiVersion( req.version, 'getPatientsByAutoComplete' )(
                    req,
                    res,
                    this.cacheService,
                    this.elasticService,
                    this.logService
                )

                res.send( response )
                next()
            } catch ( e ) {
                await this.logService.warning( `${this.config.endpoint} ${e.toString()}` )
                next( e )
            }

        } ) )

        // Register getPatientById Route
        this.instance.get( {
            path: `${this.config.endpoint}/:uid`,
            validation: validators.byPatientId
        }, restifyAsyncWrap( async( req, res, next ) => {
            try {
                const response = await getFunctionForApiVersion( req.version, 'getPatientById' )(
                    req,
                    res,
                    this.cacheService,
                    this.elasticService,
                    this.logService
                )

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
