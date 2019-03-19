const args = require('yargs').argv
const uniqid = require('uniqid')

const addCorsMiddleware = require('../services/middleware/cors')
const addGzipMiddleware = require('../services/middleware/gzip')
const addAcceptMiddleware = require('../services/middleware/accept')
const addBodyParserMiddleware = require('../services/middleware/bodyParser')
const addQueryParserMiddleware = require('../services/middleware/queryParser')
const addJoiValidatorMiddleware = require('../services/middleware/joi')

const formatter = require('./payload')
const logger = require(`./../loggers/${process.env.LOGGER}`)

const launcherVersion = process.env.npm_package_version
const services = JSON.parse(process.env.SERVICES)
const containerId = process.env.CONTAINER_ID || uniqid()
const serviceCorsConfig = process.env.CORS_ORIGINS
const serviceJwtSecret = process.env.JWT_SECRET
const serviceJwtPropertyName = process.env.JWT_PROPERTY_NAME
const serviceToLaunch = args.service || null
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
        let config = null
        try {
            config = generateConfig(serviceName)
            const service = require(`./../services/${serviceName}`)
            const instance = service.start(config)
            let startDate = new Date().getTime()
            let requestsServed = 0
            addCorsMiddleware(instance, config)
            addQueryParserMiddleware(instance)
            addBodyParserMiddleware(instance)
            addGzipMiddleware(instance)
            addAcceptMiddleware(instance)
            addJoiValidatorMiddleware(instance)
            instance.get(`${config.prefix}/health`, (req, res) => {
                requestsServed++
                res.send({
                    uid: containerId,
                    version: config.version,
                    uptime: (new Date().getTime() - startDate),
                    served: requestsServed,
                })
            })
            instance.listen(config.port, () => {
                launcherLog.success(`${config.name} Service: Launched on port ${config.port}`)
            })
        } catch (e) {
            launcherLog.error(`${config.name} Service: ${e.message}`)
        }
    }

} catch (e) {
    launcherLog.error(e.message)
}
