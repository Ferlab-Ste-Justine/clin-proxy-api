// https://github.com/graphql-compose/graphql-compose-elasticsearch

const restify = require('restify')
const errors = require('restify-errors')
const rjwt = require('restify-jwt-community')

module.exports = {
    start: (config) => {
        const server = restify.createServer(config.options)

        server.use(rjwt(config.jwt).unless({
            path: [
                { url: `${config.prefix}/health`, methods: ['GET'] }
            ]
        }))

        server.get(`${config.prefix}`, (req, res, next) => {
            next(new errors.NotImplementedError())
        })

        return server
    },
}
