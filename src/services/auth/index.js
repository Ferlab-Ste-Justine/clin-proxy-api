const restify = require('restify')
const errors = require('restify-errors')
const rjwt = require('restify-jwt-community')

const validators = require('./../../helpers/validators')


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
        server.post({ path: `${config.prefix}`, validation: validators.login}, (req, res, next) => {
            return next(new errors.NotImplementedError())
        })

        // Logout
        server.del(`${config.prefix}`, (req, res, next) => {
            return next(new errors.NotImplementedError())
        })

        return server
    },
}
