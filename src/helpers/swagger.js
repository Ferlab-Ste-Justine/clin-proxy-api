// @NOTE https://www.npmjs.com/package/swagger-jsdoc
// @NOTE https://swagger.io/tools/swagger-editor

const restifySwaggerJsdoc = require('restify-swagger-jsdoc')

module.exports = (server, config) => {
    restifySwaggerJsdoc.createSwaggerPage({
        title: `${config.name[0].toUpperCase() + config.name.slice(1)} Service Documentation`,
        version: config.version,
        server: server,
        path: `${config.prefix}/docs`,
        schemes: [],
        apis: [`${__dirname}/../service/${config.id}.js`],
        //definitions: {myObject: require(`${__dirname}/../service/${config.id}.json`)},
        //forceSecure: false // force swagger-ui to use https protocol to load JSON file (default: false)
    })
}
