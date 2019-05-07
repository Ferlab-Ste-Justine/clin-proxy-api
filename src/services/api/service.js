import restify from 'restify'
import errors from 'restify-errors'

import addAcceptMiddleware from './middleware/accept'
import addBodyParserMiddleware from './middleware/bodyParser'
import addCorsMiddleware from './middleware/cors'
import addGzipMiddleware from './middleware/gzip'
import addJoiValidatorMiddleware from './middleware/joi'
import addQueryParserMiddleware from './middleware/queryParser'
import addVersionMiddleware from './middleware/version'


export default class ApiService {
    constructor( config ) {
        this.logService = config.logService
        this.parentLogService = config.parentLogService || config.logService
        this.config = {
            uid: config.serviceId,
            cuid: config.containerId,
            packageVersion: config.packageVersion,
            defaultApiVersion: config.defaultApiVersion,
            availableApiVersions: config.availableApiVersions,
            docsBranch: config.docsBranch,
            id: config.id,
            name: config.name,
            port: config.port,
            cors: config.cors,
            jwt: config.jwt,
            endpoint: config.endpoint,
            options: config.options
        }

        this.instance = null
        this.initTimestamp = null
        this.startTimestamp = null
    }

    async init() {
        this.initTimestamp = new Date().getTime()
        this.instance = restify.createServer( this.config.options )

        await this.logService.debug( 'API Service appears functional ... Testing.' )
    }

    async start() {
        let requestsServed = 0
        const startDate = new Date().getTime()
        const uid = this.config.uid
        const cuid = this.config.cuid
        const packageVersion = this.config.packageVersion
        const defaultApiVersion = this.config.defaultApiVersion
        const apiVersions = this.config.availableApiVersions

        this.startTimestamp = startDate
        addVersionMiddleware( this.instance, apiVersions, defaultApiVersion )
        addCorsMiddleware( this.instance, this.config )
        addQueryParserMiddleware( this.instance )
        addBodyParserMiddleware( this.instance )
        addGzipMiddleware( this.instance )
        addJoiValidatorMiddleware( this.instance )
        addAcceptMiddleware( this.instance )

        this.instance.get( `${this.config.endpoint}/health`, ( req, res ) => {
            requestsServed++
            res.send( {
                uid,
                cuid,
                packageVersion,
                defaultApiVersion,
                currentApiVersion: req.version,
                apiVersions,
                uptime: ( new Date().getTime() - startDate ),
                served: requestsServed
            } )
        } )

        this.instance.get( `${this.config.endpoint}/docs`, ( req, res ) => {
            res.end( `
                <html>
                  <body>
                    <div id='root'></div>
                    <script src='https://cdn.jsdelivr.net/npm/redoc@next/bundles/redoc.standalone.js'></script>
                    <script>
                      Redoc.init('https://raw.githubusercontent.com/cr-ste-justine/clin-proxy-api/${this.config.docsBranch}/src/services/api/${this.config.id}/docs.yaml', {
                        hideDownloadButton: true
                      }, document.getElementById('root'))
                    </script>
                  </body>
                </html>` )
        } )

        await this.instance.listen( this.config.port )
        await this.logService.debug( `${this.config.name} API Service launched.` )
    }

    async stop() {
        await this.logService.debug( `${this.config.name} API Service attempting to land ...` )
        await this.instance.close()
        await this.parentLogService.success( `${this.config.name} API Service has landed.` )
    }

}

export const generateGetFunctionForApiVersion = ( apiVersions ) => {
    return ( version, functionName ) => {
        if ( apiVersions[ version ] && apiVersions[ version ][ functionName ] ) {
            return apiVersions[ version ][ functionName ]
        }

        throw new Error( `API v${version} does not implement ${functionName}` )
    }
}
