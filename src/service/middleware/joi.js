const validator = require('restify-joi-middleware')

module.exports = (server) => {
    server.use(validator())
}
