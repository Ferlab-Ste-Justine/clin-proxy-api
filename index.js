require( 'dotenv' ).config()

const args = require( 'yargs' ).argv

import uniqid from 'uniqid'
import cookie from 'cookie'
import jwt from 'jsonwebtoken'

import payloadFormatter from './src/services/api/helpers/payload'


if ( !process.env.LOGGER ) {
    console.log( 'No LOGGER defined in environment, using default: console.' )
    process.env.LOGGER = 'console'
}
const LogService = require( `./src/loggers/${process.env.LOGGER}` )
const logLevel = process.env.LOG_LEVEL || 'debug'
const launcherLog = new LogService( 'Kennedy Space Center', logLevel )

if ( !process.env.npm_package_version ) {
    console.log( 'Version missing from package.json file. Exiting...' ) // eslint-disable-line
    process.exit( 1 )
}
const launcherVersion = process.env.npm_package_version

let apiServices = null

try {
    apiServices = JSON.parse( process.env.API_SERVICES )
} catch ( e ) {
    launcherLog.error( 'Invalid JSON value or missing API_SERVICES in environment.' )
    process.exit( 1 )
}

let serviceCorsOrigins = null

try {
    serviceCorsOrigins = JSON.parse( process.env.CORS_ORIGINS )
} catch ( e ) {
    launcherLog.error( 'Invalid JSON value or missing CORS_ORIGINS in environment.' )
    process.exit( 1 )
}

if ( !process.env.JWT_SECRET ) {
    launcherLog.error( 'No JWT_SECRET specified in environment' )
    process.exit( 1 )
}
const serviceJwtSecret = process.env.JWT_SECRET

let cacheServiceConfig = null

try {
    cacheServiceConfig = JSON.parse( process.env.MEMCACHE_SERVICE )
} catch ( e ) {
    launcherLog.error( 'Invalid JSON value or missing MEMCACHE_SERVICE in environment.' )
    process.exit( 1 )
}

let keycloakServiceConfig = null

try {
    keycloakServiceConfig = JSON.parse( process.env.KEYCLOAK_SERVICE )
} catch ( e ) {
    launcherLog.error( 'Invalid JSON value or missing KEYCLOAK_SERVICE in environment.' )
    process.exit( 1 )
}

if ( !process.env.CONTAINER_ID ) {
    process.env.CONTAINER_ID = uniqid()
    launcherLog.warning( 'No CONTAINER_ID specified in environment, auto-generated.' )
}
const containerId = process.env.CONTAINER_ID

if ( !process.env.JWT_PROPERTY_NAME ) {
    launcherLog.warning( 'No JWT_PROPERTY_NAME defined in environment, using default: token.' )
    process.env.JWT_PROPERTY_NAME = 'token'
}
const serviceJwtPropertyName = process.env.JWT_PROPERTY_NAME

const serviceToLaunch = args.service || null


const generateApiConfig = ( serviceName ) => {
    const serviceConfig = JSON.parse( process.env[ `${serviceName.toUpperCase()}_API_SERVICE` ] )
    const logService = new LogService( `${serviceConfig.name} Service`, logLevel )
    const jwtSecret = Buffer.from( serviceJwtSecret, 'base64' )

    return {
        id: serviceName,
        name: serviceConfig.name,
        port: serviceConfig.port,
        version: launcherVersion,
        endpointPrefix: serviceConfig.endpointPrefix,
        options: {
            formatters: { 'application/json': payloadFormatter },
            ignoreTrailingSlash: false
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
        serviceId: uniqid(),
        containerId,
        logService,
        parentLogService: launcherLog,
        cacheConfig: cacheServiceConfig,
        keycloakConfig: keycloakServiceConfig
    }
}

const launchApiServices = async() => {

    const serviceList = !serviceToLaunch ? apiServices : [ serviceToLaunch ]

    if ( serviceToLaunch && apiServices.indexOf( serviceToLaunch ) === -1 ) {
        return launcherLog.error( `API Service '${serviceToLaunch}' not defined in API_SERVICES` )
    }

    for ( let serviceIdx in serviceList ) {
        const serviceName = serviceList[ serviceIdx ]

        if ( process.env[ `${serviceName.toUpperCase()}_API_SERVICE` ] ) {

            const config = generateApiConfig( serviceName )

            try {

                launcherLog.info( `Requesting launch procedures from ${config.name} Service ...` )
                const ServiceClass = require( `./src/services/api/${serviceName}` ) // eslint-disable-line global-require
                const service = new ServiceClass.default( config ) // eslint-disable-line new-cap

                await service.init()
                await service.start()

                launcherLog.success( `It's a Go for ${config.name} API Service on port ${config.port}!` )
            } catch ( e ) {
                launcherLog.error( `Houston, we have a problem! ${config.name} API Service ${e}` )
            }

        } else {
            launcherLog.error( `No ${serviceName.toUpperCase()}_API_SERVICE exists in environment. Skipping ...` )
        }
    }
}

const launchServices = async() => {
    await launchApiServices()
}

launchServices()
