const args = require('yargs').argv
const formatter = require('./payload')
const logService = require(`./../loggers/${process.env.LOGGER}`)

const serviceName = args.service || null
const log = new logService('LAUNCHER')

try {
    let serviceIds = []
    if (serviceName !== null) {
        serviceIds.push(serviceName)
    } else {
        serviceIds.push('auth')
    }

    for (let id in serviceIds) {
        let serviceId = serviceIds[id]
        log.info(`Initializing ${serviceId}...`)
        const service = require(`./../service/${serviceId}`)
        const config = {
            log: log,
            port: process.env[`PORT_${serviceId.toUpperCase()}`],
            options: {
                formatters: { 'application/json': formatter },
                ignoreTrailingSlash: true,
                // key: fs.readFileSync(path.resolve(__dirname, 'server.key')),
                // certificate: fs.readFileSync(path.resolve(__dirname, 'server.crt'))
            },
            cors: {
                preflightMaxAge: 5,
                origins: JSON.parse(process.env.CORS_ORIGINS),
            },
            jwt: {
                secret: Buffer.from(process.env.JWT_SECRET, 'base64'),
                credentialsRequired: true,
                requestProperty: 'token',
                getToken: (req) => {
                    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
                        return req.headers.authorization.split(' ')[1]
                    }
                    return null
                }
            },
        }
        service.start(config)
    }

} catch (e) {
    log.error(`${e}`)
}
