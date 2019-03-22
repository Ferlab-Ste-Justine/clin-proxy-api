require( 'dotenv' ).config()

const args = require( 'yargs' ).argv

import uniqid from 'uniqid'
import cookie from 'cookie'
import jwt from 'jsonwebtoken'

import payloadFormatter from './src/services/api/helpers/payload'

const LogService = require( `./src/loggers/${process.env.LOGGER}` )

const launcherVersion = process.env.npm_package_version
const apiServices = JSON.parse( process.env.API_SERVICES )
const containerId = process.env.CONTAINER_ID || uniqid()
const serviceCorsOrigins = JSON.parse( process.env.CORS_ORIGINS )
const serviceJwtSecret = process.env.JWT_SECRET
const serviceJwtPropertyName = process.env.JWT_PROPERTY_NAME
const cacheServiceConfig = JSON.parse( process.env.MEMCACHE_SERVICE )
const keycloakServiceConfig = JSON.parse( process.env.KEYCLOAK_SERVICE )
const serviceToLaunch = args.service || null
const logLevel = process.env.LOG_LEVEL
const launcherLog = new LogService( 'Kennedy Space Center', logLevel )


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
    }
}

const launchServices = async() => {
    await launchApiServices()
}

launchServices()
