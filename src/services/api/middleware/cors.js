import corsMiddleware from 'restify-cors-middleware'


export default ( server, config ) => {

    const cors = corsMiddleware({
        origins: ['http://localhost:2000'],
        allowHeaders: ['Origin', 'X-Requested-With', 'Authorization', 'Content-Type', 'Accept']
    })

    server.pre(cors.preflight)
    server.pre(cors.actual)

}
