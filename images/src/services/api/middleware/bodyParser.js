import { plugins } from 'restify'


export default ( server ) => {
    server.use( plugins.bodyParser( {
        mapParams: false
    } ) )
}
