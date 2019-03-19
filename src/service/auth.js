const restify = require('restify')
const errors = require('restify-errors')
const rjwt = require('restify-jwt-community')

module.exports = {
    start: (config) => {
        const server = restify.createServer(config.options)

        server.use(rjwt(config.jwt).unless({
            path: [
                { url: `${config.prefix}/health`, methods: ['GET'] },
                { url: `${config.prefix}`, methods: ['POST'] },
            ]
        }))

        // Login
        server.post(`${config.prefix}`, (req, res, next) => {
            next(new errors.NotImplementedError())
        })

        // Logout
        server.del(`${config.prefix}`, (req, res, next) => {
            next(new errors.NotImplementedError())
        })

        return server
    },
}
