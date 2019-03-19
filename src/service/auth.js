const restify = require('restify')
const errors = require('restify-errors')
const restifyPlugins = require('restify').plugins
const rjwt = require('restify-jwt-community')
const validator = require('restify-joi-middleware')
const corsMiddleware = require('restify-cors-middleware')

let server = null
let log = null

module.exports = {
    start: (config, callback = null) => {
        log = config.serviceLog
        server = restify.createServer(config.options)
        const cors = corsMiddleware(config.cors)
        server.pre(cors.preflight)
        server.use(cors.actual)
        server.use(restifyPlugins.acceptParser(server.acceptable))
        server.use(restifyPlugins.queryParser())
        server.use(restifyPlugins.bodyParser({mapParams: false}))
        server.use(restifyPlugins.gzipResponse())
        server.use(validator())

        server.get(`${config.prefix}/health`, (req, res) => {
            res.send({
                'version': config.version
            })
        })

        server.post(`${config.prefix}`, (req, res, next) => {
            next(new errors.UnauthorizedError())
        })

        server.use(rjwt(config.jwt).unless({
            path: [
                { url: `${config.prefix}/health`, methods: ['GET'] },
                { url: `${config.prefix}`, methods: ['POST'] },
            ]
        }))

        server.listen(config.port, () => {
            log.success(`Service listening on port ${config.port}`)
            if (callback) {
                callback(server, config)
            }
        })

        return server
    },
    stop: (callback = null) => {
        server.close(() => {
            log.warning('Service stopped')
            if (callback) {
                callback()
            }
        })
    },
}
