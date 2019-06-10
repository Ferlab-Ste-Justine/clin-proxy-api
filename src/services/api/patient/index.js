// http://localhost:8888/static/console.html#/entities/Operation?

import rjwt from 'restify-jwt-community'

import ApiService from '../service'
import { generateGetFunctionForApiVersion } from '../service'
import restifyAsyncWrap from '../helpers/async'
import AidboxClient from '../../aidbox'

import Apiv1 from './v1'


const getFunctionForApiVersion = generateGetFunctionForApiVersion( {
    1: Apiv1
} )

export default class PatientService extends ApiService {
    constructor( config ) {
        config.logService.info( 'Roger that.' )
        super( config )
        this.config.aidbox = config.aidboxConfig
    }


    async init() {
        super.init()

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

        this.instance.get( `${this.config.endpoint}/query/:query`, restifyAsyncWrap( async( req, res, next ) => {
            try {
                console.log('*** fulltextPatientSearch')
                const response = await getFunctionForApiVersion( req.version, 'fulltextPatientSearch' )( req, res, this.aidboxService )

                res.send( response )
                return next()
            } catch ( e ) {
                await this.logService.warning( `${this.config.endpoint} ${e.toString()}` )
                return next( e )
            }

        } ) )

        this.instance.get( `${this.config.endpoint}/:uid`, restifyAsyncWrap( async( req, res, next ) => {
            try {
                console.log('*** getPatientById')
                const response = await getFunctionForApiVersion( req.version, 'getPatientById' )( req, res, this.aidboxService )

                res.send( response )
                return next()
            } catch ( e ) {
                await this.logService.warning( `${this.config.endpoint} ${e.toString()}` )
                return next( e )
            }

        } ) )


        super.start()
    }

}
