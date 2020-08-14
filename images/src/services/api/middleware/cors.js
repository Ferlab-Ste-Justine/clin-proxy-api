import corsMiddleware from 'restify-cors-middleware'

export default ( server, config ) => {

    const cors = corsMiddleware( {
        origins: config.cors.origins,
        allowHeaders: [ 'Origin', 'X-Requested-With', 'Authorization', 'Content-Type', 'Accept' ]
    } )

    server.pre( cors.preflight )
    server.use( cors.actual )
}
