// https://github.com/elastic/elasticsearch-js

import rjwt from 'restify-jwt-community'

import ApiService from '../service'
import { generateGetFunctionForApiVersion } from '../service'
import restifyAsyncWrap from '../helpers/async'

import Apiv1 from './v1'

const getFunctionForApiVersion = generateGetFunctionForApiVersion( {
    1: Apiv1
} )

export default class PatientService extends ApiService {
    constructor( config ) {
        config.logService.info( 'Roger that.' )
        super( config )
    }

    async start() {
        // JWT Endpoint Exceptions
        this.instance.use( rjwt( this.config.jwt ).unless( {
            path: [
                { methods: [ 'GET' ], url: `${this.config.endpoint}/docs` },
                { methods: [ 'GET' ], url: `${this.config.endpoint}/health` }
            ]
        } ) )

        this.instance.get( `${this.config.endpoint}/:uid`, restifyAsyncWrap( async( req, res, next ) => {
            try {
                const response = await getFunctionForApiVersion( req.version, 'getPatient' )( req, res )

                res.send( response )
                return next()
            } catch ( e ) {
                await this.logService.warning( `${this.config.endpoint} ${e.toString()}` )
                return next( e )
            }

        } ) )

        this.instance.post( `${this.config.endpoint}/search`, restifyAsyncWrap( async( req, res, next ) => {
            try {
                const response = await getFunctionForApiVersion( req.version, 'searchPatients' )( req, res )

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
