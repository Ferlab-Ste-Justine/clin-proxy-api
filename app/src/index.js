import fs from 'fs'

try { require( 'babel-polyfill' ) } catch ( e ) {} /* eslint-disable-line */
require( 'dotenv' ).config()

const args = require( 'yargs' ).argv

import uniqid from 'uniqid'
import payloadFormatter from './services/api/helpers/payload'

if ( !process.env.LOGGER ) {
    console.log( 'No LOGGER defined in environment, using default: console.' )
    process.env.LOGGER = 'console'
}
const LogService = require( `./loggers/${process.env.LOGGER}` )
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

let elasticServiceConfig = null

try {
    elasticServiceConfig = JSON.parse( process.env.ELASTIC_SERVICE )
} catch ( e ) {
    launcherLog.error( 'Invalid JSON value or missing ELASTIC_SERVICE in environment.' )
    process.exit( 1 )
}

if ( !process.env.CONTAINER_ID ) {
    process.env.CONTAINER_ID = uniqid()
    launcherLog.warning( 'No CONTAINER_ID specified in environment, auto-generated.' )
}
const containerId = process.env.CONTAINER_ID

const serviceToLaunch = args.service || null

const generateApiConfig = ( serviceName ) => {
    const serviceConfig = JSON.parse( process.env[ `${serviceName.toUpperCase()}_API_SERVICE` ] )
    const logService = new LogService( `${serviceConfig.name} Service`, logLevel )
    const jwtConfig = JSON.parse( process.env.KEYCLOAK_CONFIG )

    return {
        id: serviceName,
        name: serviceConfig.name,
        port: serviceConfig.port,
        packageVersion: launcherVersion,
        defaultApiVersion: serviceConfig.defaultVersion,
        availableApiVersions: serviceConfig.availableVersions,
        endpoint: serviceConfig.endpoint,
        options: {
            formatters: {
                'application/json': payloadFormatter
            },
            ignoreTrailingSlash: false
        },
        cors: {
            preflightMaxAge: 5,
            origins: serviceCorsOrigins
        },
        jwt: jwtConfig,
        serviceId: uniqid(),
        containerId,
        logService,
        parentLogService: launcherLog,
        elasticConfig: elasticServiceConfig
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
                const ServiceClass = require( `./services/api/${serviceName}` ) // eslint-disable-line global-require
                const service = new ServiceClass.default( config ) // eslint-disable-line new-cap

                await service.init()
                await service.start()

                launcherLog.success( `It's a Go for ${config.name} API Service using HTTP${service.instance.secure ? 'S' : ''} on port ${config.port}!` )
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
