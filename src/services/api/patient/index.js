import rjwt from 'restify-jwt-community'

import ApiService from '../service'
import { generateGetFunctionForApiVersion } from '../service'
import restifyAsyncWrap from '../helpers/async'
import CacheClient from '../../cache'
import AidboxClient from '../../aidbox'
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
    }

    async init() {
        super.init()

        await this.logService.debug( 'Cache Service Client appears functional ... checking connectivity.' )
        this.cacheService = new CacheClient( this.config.cache )
        await this.cacheService.create( 'patientService', new Date().getTime() )

        await this.logService.debug( 'Aidbox Service Client appears functional ... checking connectivity.' )
        this.aidboxService = new AidboxClient( this.config.aidbox )
        const pingResult = await this.aidboxService.ping()

        if ( pingResult.status !== 'pass' ) {
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
                    this.aidboxService,
                    this.logService
                )

                res.send( response )
                next()
            } catch ( e ) {
                await this.logService.warning( `${this.config.endpoint} ${e.toString()}` )
                next( e )
            }

        } ) )

        // Register getAllResourcesByPatientId Route
        this.instance.get( {
            path: `${this.config.endpoint}/:uid/resources`,
            validation: validators.byPatientId
        }, restifyAsyncWrap( async( req, res, next ) => {
            try {
                const response = await getFunctionForApiVersion( req.version, 'getAllResourcesByPatientId' )(
                    req,
                    res,
                    this.cacheService,
                    this.aidboxService,
                    this.logService
                )

                res.send( response )
                next()
            } catch ( e ) {
                await this.logService.warning( `${this.config.endpoint} ${e.toString()}` )
                next( e )
            }

        } ) )

        // Register getClinicalImpressionsByPatientId Route
        this.instance.get( {
            path: `${this.config.endpoint}/:uid/clinicalImpressions`,
            validation: validators.byPatientId
        }, restifyAsyncWrap( async( req, res, next ) => {
            try {
                const response = await getFunctionForApiVersion( req.version, 'getClinicalImpressionsByPatientId' )(
                    req,
                    res,
                    this.cacheService,
                    this.aidboxService,
                    this.logService
                )

                res.send( response )
                next()
            } catch ( e ) {
                await this.logService.warning( `${this.config.endpoint} ${e.toString()}` )
                next( e )
            }

        } ) )

        // Register getObservationsByPatientId Route
        this.instance.get( {
            path: `${this.config.endpoint}/:uid/observations/:type`,
            validation: validators.byPatientIdAndObservationType
        }, restifyAsyncWrap( async( req, res, next ) => {
            try {
                const response = await getFunctionForApiVersion( req.version, 'getObservationsByPatientId' )(
                    req,
                    res,
                    this.cacheService,
                    this.aidboxService,
                    this.logService
                )

                res.send( response )
                next()
            } catch ( e ) {
                await this.logService.warning( `${this.config.endpoint} ${e.toString()}` )
                next( e )
            }

        } ) )

        // Register getServiceRequestByPatientId Route
        this.instance.get( {
            path: `${this.config.endpoint}/:uid/serviceRequests`,
            validation: validators.byPatientId
        }, restifyAsyncWrap( async( req, res, next ) => {
            try {
                const response = await getFunctionForApiVersion( req.version, 'getServiceRequestByPatientId' )(
                    req,
                    res,
                    this.cacheService,
                    this.aidboxService,
                    this.logService
                )

                res.send( response )
                next()
            } catch ( e ) {
                await this.logService.warning( `${this.config.endpoint} ${e.toString()}` )
                next( e )
            }

        } ) )

        // Register getSpecimensByPatientId Route
        this.instance.get( {
            path: `${this.config.endpoint}/:uid/specimens`,
            validation: validators.byPatientId
        }, restifyAsyncWrap( async( req, res, next ) => {
            try {
                const response = await getFunctionForApiVersion( req.version, 'getSpecimensByPatientId' )(
                    req,
                    res,
                    this.cacheService,
                    this.aidboxService,
                    this.logService
                )

                res.send( response )
                next()
            } catch ( e ) {
                await this.logService.warning( `${this.config.endpoint} ${e.toString()}` )
                next( e )
            }

        } ) )

        // Register getFamilyMemberHistoryByPatientId Route
        this.instance.get( {
            path: `${this.config.endpoint}/:uid/familyMemberHistory`,
            validation: validators.byPatientId
        }, restifyAsyncWrap( async( req, res, next ) => {
            try {
                const response = await getFunctionForApiVersion( req.version, 'getFamilyMemberHistoryByPatientId' )(
                    req,
                    res,
                    this.cacheService,
                    this.aidboxService,
                    this.logService
                )

                res.send( response )
                next()
            } catch ( e ) {
                await this.logService.warning( `${this.config.endpoint} ${e.toString()}` )
                next( e )
            }

        } ) )

        // @TODO
        this.instance.get( `${this.config.endpoint}/query/:query`, restifyAsyncWrap( async( req, res, next ) => {
            try {
                const response = await getFunctionForApiVersion( req.version, 'fulltextPatientSearch' )(
                    req,
                    res,
                    this.cacheService,
                    this.aidboxService,
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
