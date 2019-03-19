const corsMiddleware = require('restify-cors-middleware')

module.exports = (server, config) => {
    const cors = corsMiddleware(config.cors)
    server.pre(cors.preflight)
    server.use(cors.actual)
}
