import rjwt from 'restify-jwt-community'

import ApiService from '../service'
import { generateGetFunctionForApiVersion } from '../service'
// import restifyAsyncWrap from '../helpers/async'
import CacheClient from '../../cache'
import ElasticClient from '../../elastic'
// import validators from '../helpers/validators'

// import Apiv1 from './v1'


// const getFunctionForApiVersion = generateGetFunctionForApiVersion( {
//    1: Apiv1
// } )

export default class VariantService extends ApiService {
    constructor( config ) {
        config.logService.info( 'Roger that.' )
        super( config )
        this.config.cache = config.cacheConfig
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
    }

    async start() {
        // JWT Endpoint Exceptions
        this.instance.use( rjwt( this.config.jwt ).unless( {
            path: [
                { methods: [ 'GET' ], url: `${this.config.endpoint}/docs` },
                { methods: [ 'GET' ], url: `${this.config.endpoint}/health` }
            ]
        } ) )

        super.start()
    }

}
