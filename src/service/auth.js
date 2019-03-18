const restify = require('restify')
const errors = require('restify-errors')
const restifyPlugins = require('restify').plugins
const rjwt = require('restify-jwt-community')
const validator = require('restify-joi-middleware')
const corsMiddleware = require('restify-cors-middleware')

let server = null
let logger = null
module.exports = {
    name: 'Authentication',
    start: (config, callback = null) => {
        server = restify.createServer(config.options)
        logger = config.log
        const cors = corsMiddleware(config.cors)
        server.pre(cors.preflight)
        server.use(cors.actual)
        server.use(restifyPlugins.acceptParser(server.acceptable))
        server.use(restifyPlugins.queryParser())
        server.use(restifyPlugins.bodyParser({mapParams: false}))
        server.use(restifyPlugins.gzipResponse())
        server.use(validator())

        /* Endpoints */
        server.get('/api/auth/health', (req, res) => {
            return res.send({
                'status': 'OK',
                'version': '1.0.0'
            })
        })

        server.post('/api/auth', (req, res, next) => {
            return next(new errors.UnauthorizedError())
        })

        server.use(rjwt(config.jwt).unless({
            path: [
                { url: '/api/auth/health', methods: ['GET'] },
                { url: '/api/auth', methods: ['POST'] }
            ]
        }))

        server.listen(config.port, () => {
            logger.success(`Service listening on port ${config.port}`)
            if (callback) {
                callback(server, config)
            }
        })
    },
    stop: (callback = null) => {
        server.close(() => {
            logger.warning('Service stopped')
            if (callback) {
                callback()
            }
        })
    },
}
