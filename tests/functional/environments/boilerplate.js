const serviceConfig = JSON.parse( process.env.BOILERPLATE_API_SERVICE )
const serviceHostname = process.env.API_SERVICE_HOSTNAME || 'https://localhost'


module.exports = {
    service: 'Boilerplate Service',
    name: 'boilerplate',
    values: [
        {
            enabled: true,
            key: 'hostname',
            value: serviceHostname
        },
        {
            enabled: true,
            key: 'path',
            value: serviceConfig.endpoint[ 0 ] === '/' ? serviceConfig.endpoint.substr( 1 ) : serviceConfig.endpoint
        },
        {
            enabled: true,
            key: 'port',
            value: serviceConfig.port
        }
    ]
}
