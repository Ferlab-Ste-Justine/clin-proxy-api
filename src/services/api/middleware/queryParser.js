import { plugins } from 'restify'


export default ( server ) => {
    server.use( plugins.queryParser() )
}
