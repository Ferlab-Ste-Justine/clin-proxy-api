require( 'dotenv' ).config()

const args = require( 'yargs' ).argv
const uniqid = require( 'uniqid' )
const cookie = require( 'cookie' )
const jwt = require( 'jsonwebtoken' )

import addCorsMiddleware from '../services/middleware/cors'
import addGzipMiddleware from '../services/middleware/gzip'
import addAcceptMiddleware from '../services/middleware/accept'
import addBodyParserMiddleware from '../services/middleware/bodyParser'
import addQueryParserMiddleware from '../services/middleware/queryParser'
import addJoiValidatorMiddleware from '../services/middleware/joi'

import formatter from './payload'
const Logger = require( `../loggers/${process.env.LOGGER}` )

const launcherVersion = process.env.npm_package_version
const services = JSON.parse( process.env.SERVICES )
const containerId = process.env.CONTAINER_ID || uniqid()
const serviceCorsOrigins = JSON.parse( process.env.CORS_ORIGINS )
const serviceJwtSecret = process.env.JWT_SECRET
const serviceJwtPropertyName = process.env.JWT_PROPERTY_NAME
const cacheServiceConfig = JSON.parse( process.env.MEMCACHE_CONFIG )
const keycloakServiceConfig = JSON.parse( process.env.KEYCLOAK_CONFIG )
const serviceToLaunch = args.service || null
const logLevel = process.env.LOG_LEVEL
const launcherLog = new Logger( 'Kennedy Space Center', logLevel )

const generateConfig = ( serviceName ) => {
    const serviceConfig = JSON.parse( process.env[ `${serviceName.toUpperCase()}_SERVICE` ] )
    const serviceLog = new Logger( `${serviceConfig.name} Service`, logLevel )
    const jwtSecret = Buffer.from( serviceJwtSecret, 'base64' )

    return {
        id: serviceName,
        name: serviceConfig.name,
        port: serviceConfig.port,
        version: launcherVersion,
        prefix: serviceConfig.endpointPrefix,
        options: {
            formatters: { 'application/json': formatter },
            ignoreTrailingSlash: false
            // @TODO key: fs.readFileSync(path.resolve(__dirname, './../server.key')),
            // @TODO certificate: fs.readFileSync(path.resolve(__dirname, './../server.crt'))
        },
        cors: {
            preflightMaxAge: 5,
            origins: serviceCorsOrigins
        },
        jwt: {
            secret: jwtSecret,
            credentialsRequired: true,
            requestProperty: serviceJwtPropertyName,
            getToken: ( req ) => {
                if ( req.headers && req.headers.cookie ) {
                    const cookieJar = cookie.parse( req.headers.cookie )
                    const token = cookieJar[ serviceJwtPropertyName ] || null

                    if ( token ) {
                        req.jwt = jwt.decode( token, jwtSecret )
                        return token
                    }
                }
                return null
            }
        },
        serviceLog: serviceLog,
        cacheConfig: cacheServiceConfig,
        keycloakConfig: keycloakServiceConfig
    }
}

const bootstrap = () => {

    const serviceList = !serviceToLaunch ? services : [ serviceToLaunch ]

    if ( serviceToLaunch && services.indexOf( serviceToLaunch ) === -1 ) {
        return launcherLog.error( `Service '${serviceToLaunch}' not defined in SERVICES` )
    }

    for ( let serviceIdx in serviceList ) {
        const serviceName = serviceList[ serviceIdx ]

        try {
            const config = generateConfig( serviceName )

            launcherLog.info( `Requesting launch procedures from ${config.name} Service ...` )
            const service = require( `./../services/${serviceName}` ) // eslint-disable-line
            service.start( config )
                .then( ( instance ) => {
                    const startDate = new Date().getTime()
                    let requestsServed = 0

                    addCorsMiddleware( instance, config )
                    addQueryParserMiddleware( instance )
                    addBodyParserMiddleware( instance )
                    addGzipMiddleware( instance )
                    addJoiValidatorMiddleware( instance )
                    addAcceptMiddleware( instance )
                    instance.get( `${config.prefix}/health`, ( req, res ) => {
                        requestsServed++
                        res.send( {
                            uid: containerId,
                            version: config.version,
                            uptime: ( new Date().getTime() - startDate ),
                            served: requestsServed
                        } )
                    } )
                    instance.listen( config.port, () => {
                        launcherLog.success( `It's a Go for ${config.name} Service on port ${config.port}!` )
                    } )
                } )
                .catch( ( e ) => {
                    launcherLog.error( `Houston, we have a problem! ${config.name} Service ${e}` )
                } )
        } catch ( e ) {
            launcherLog.error( e.message )
        }
    }
}

export default bootstrap()
