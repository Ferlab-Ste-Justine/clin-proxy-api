import restify from 'restify'

import addAcceptMiddleware from './middleware/accept'
import addBodyParserMiddleware from './middleware/bodyParser'
import addCorsMiddleware from './middleware/cors'
import addGzipMiddleware from './middleware/gzip'
import addJoiValidatorMiddleware from './middleware/joi'
import addQueryParserMiddleware from './middleware/queryParser'


export default class ApiService {
    constructor( config ) {
        this.logService = config.logService
        this.parentLogService = config.parentLogService || config.logService
        this.config = {
            uid: config.serviceId,
            cuid: config.containerId,
            version: config.version,
            name: config.name,
            port: config.port,
            cors: config.cors,
            jwt: config.jwt,
            prefix: config.endpointPrefix,
            options: config.options
        }
        this.instance = null
        this.initTimestamp = null
        this.startTimestamp = null
        this.requestsServed = 0
    }

    async init() {
        this.initTimestamp = new Date().getTime()
        this.instance = restify.createServer( this.config.options )
        this.logService.debug( 'API Service appears functional ... Testing.' )
    }

    async start( ) {
        let requestsServed = 0
        const startDate = new Date().getTime()
        const uid = this.config.uid
        const cuid = this.config.cuid
        const version = this.config.version

        this.startTimestamp = startDate
        addCorsMiddleware( this.instance, this.config )
        addQueryParserMiddleware( this.instance )
        addBodyParserMiddleware( this.instance )
        addGzipMiddleware( this.instance )
        addJoiValidatorMiddleware( this.instance )
        addAcceptMiddleware( this.instance )

        this.instance.get( `${this.config.prefix}/health`, ( req, res ) => {
            requestsServed++
            res.send( {
                uid,
                cuid,
                version,
                uptime: ( new Date().getTime() - startDate ),
                served: requestsServed
            } )
        } )

        await this.instance.listen( this.config.port )
        this.logService.debug( `${this.config.name} API Service launched.` )
    }

    async stop() {
        this.logService.debug( `${this.config.name} API Service attempting to land ...` )
        await this.instance.close()
        this.parentLogService.success( `${this.config.name} API Service has landed.` )
    }

}
