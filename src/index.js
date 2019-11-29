import errors from 'restify-errors'

const R = require('ramda');

try {
    require( 'babel-polyfill' )
} catch ( e ) {}
require( 'dotenv' ).config()

const args = require( 'yargs' ).argv

import uniqid from 'uniqid'
import cookie from 'cookie'
import jwt from 'jsonwebtoken'

import payloadFormatter from './services/api/helpers/payload'
import { refreshTokenMiddlewareGenerator } from './services/api/auth'

import { load_env, json_err_handler, fixed_msg_err_handler, fixed_msg_warn_handler } from './env_utils'
import { get_certificate } from './certificate_utils'

if ( !process.env.LOGGER ) {
    console.log( 'No LOGGER defined in environment, using default: console.' )
    process.env.LOGGER = 'console'
}
const LogService = require( `./loggers/${process.env.LOGGER}` )
const logLevel = process.env.LOG_LEVEL || 'debug'
const launcherLog = new LogService( 'Kennedy Space Center', logLevel )

let load_launcher_json_env = load_env(R._, JSON.parse, launcherLog, json_err_handler);
let load_launcher_string_env = load_string_env(R._, R.identity, launcherLog, R._);

const launcherVersion = load_launcher_string_env(
    'npm_package_version', 
    fixed_msg_err_handler(
        'Version missing from package.json file. Exiting...'
    )
)
const serviceJwtSecret = load_launcher_string_env(
    'JWT_SECRET',
    fixed_msg_err_handler(
        'No JWT_SECRET specified in environment'
    )
)
const containerId = load_launcher_string_env(
    'CONTAINER_ID',
    fixed_msg_warn_handler(
        'No CONTAINER_ID specified in environment, auto-generated.',
        uniqid
    )
)
const serviceJwtPropertyName = load_launcher_string_env(
    'JWT_PROPERTY_NAME',
    fixed_msg_warn_handler(
        'No JWT_PROPERTY_NAME defined in environment, using default: token.',
        () => 'token'
    )
)


let apiServices = load_launcher_json_env('API_SERVICES')
let serviceCorsOrigins = load_launcher_json_env('CORS_ORIGINS')
let cacheServiceConfig = load_launcher_json_env('MEMCACHE_SERVICE')
let keycloakServiceConfig = load_launcher_json_env('KEYCLOAK_SERVICE')
let aidboxServiceConfig = load_launcher_json_env('AIDBOX_SERVICE')
let elasticServiceConfig = load_launcher_json_env('ELASTIC_SERVICE')

const { sslCertificate, sslCertificateKey } = get_certificate(launcherLog)

const serviceToLaunch = args.service || null

let refreshTokenMiddleware = () => {
    return null
}

try {
    const authServiceConfig = JSON.parse( process.env.AUTH_API_SERVICE )

    refreshTokenMiddleware = refreshTokenMiddlewareGenerator( authServiceConfig )
} catch ( e ) {
    launcherLog.warning( 'No Token Refresh Middleware will be available for API Services launched.' )
}

const generateApiConfig = ( serviceName ) => {
    const serviceConfig = JSON.parse( process.env[ `${serviceName.toUpperCase()}_API_SERVICE` ] )
    const logService = new LogService( `${serviceConfig.name} Service`, logLevel )
    const jwtSecret = Buffer.from( serviceJwtSecret, 'base64' )

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
            ignoreTrailingSlash: false,
            certificate: sslCertificate,
            key: sslCertificateKey
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
                    let token = cookieJar[ serviceJwtPropertyName ] || null

                    if ( token ) {
                        req.jwt = jwt.decode( token, jwtSecret )

                        // Signed JWT Token Version Should Match Package Version
                        if ( req.jwt.version !== launcherVersion ) {
                            return new errors.InvalidCredentialsError( 'The token version is outdated' )
                        }

                        // Signed JWT Token Is Expired
                        const currentTimeInSeconds = Math.round( new Date().getTime() / 1000 )

                        if ( req.jwt.expiry <= currentTimeInSeconds ) {
                            const refreshPayload = refreshTokenMiddleware( req )

                            token = refreshPayload.data.token.value
                            req.jwt = jwt.decode( token, jwtSecret )
                            req.newAccessTokenIssued = token
                        }

                        return token
                    }
                }
                return null
            }
            // isRevoked: ( req, payload, done ) => {}
        },
        serviceId: uniqid(),
        containerId,
        logService,
        parentLogService: launcherLog,
        cacheConfig: cacheServiceConfig,
        keycloakConfig: keycloakServiceConfig,
        aidboxConfig: aidboxServiceConfig,
        elasticConfig: elasticServiceConfig,
        docsBranch: process.env.NODE_ENV === 'production' ? 'master' : 'dev'
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
