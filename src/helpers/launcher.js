const args = require('yargs').argv

const logger = require(`./../loggers/${process.env.LOGGER}`)
const formatter = require('./payload')

const serviceToLaunch = args.service || null

const launcherVersion = process.env.npm_package_version
const services = JSON.parse(process.env.SERVICES)
const serviceCorsConfig = process.env.CORS_ORIGINS
const serviceJwtSecret = process.env.JWT_SECRET
const serviceJwtPropertyName = process.env.JWT_PROPERTY_NAME

const launcherLog = new logger('LAUNCHER')

const generateConfig = (serviceName) => {
    const serviceConfig = JSON.parse(process.env[`${serviceName.toUpperCase()}_SERVICE`])
    const serviceLog = new logger(`${serviceConfig.name} Service`)
    return {
        id: serviceName,
        name: serviceConfig.name,
        port: serviceConfig.port,
        version: launcherVersion,
        serviceLog: serviceLog,
        prefix: serviceConfig.endpointPrefix,
        options: {
            formatters: { 'application/json': formatter },
            ignoreTrailingSlash: false,
            // @TODO key: fs.readFileSync(path.resolve(__dirname, './../server.key')),
            // @TODO certificate: fs.readFileSync(path.resolve(__dirname, './../server.crt'))
        },
        cors: {
            preflightMaxAge: 5,
            origins: JSON.parse(serviceCorsConfig),
        },
        jwt: {
            secret: Buffer.from(serviceJwtSecret, 'base64'),
            credentialsRequired: true,
            requestProperty: serviceJwtPropertyName,
            getToken: (req) => {
                if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
                    return req.headers.authorization.split(' ')[1]
                }
                return null
            }
        },
    }
}

try {
    const serviceList = !serviceToLaunch ? services : [serviceToLaunch]
    if (serviceToLaunch && services.indexOf(serviceToLaunch) === -1) {
        throw new Error(`Service '${serviceToLaunch}' not defined in SERVICES`)
    }

    for (let serviceIdx in serviceList) {
        const serviceName = serviceList[serviceIdx]

        try {
            const service = require(`./../service/${serviceName}`)
            const config = generateConfig(serviceName)
            service.start(config)
            launcherLog.info(`Initializing ${serviceName}...`)
        } catch (e) {
            launcherLog.error(`Error starting ${serviceName} service: ${e.message}`)
        }
    }

} catch (e) {
    launcherLog.error(e.message)
}
