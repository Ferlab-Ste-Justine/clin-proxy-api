const serviceConfig = JSON.parse( process.env.GENE_API_SERVICE )
const serviceHostname = process.env.TEST_API_SERVICE_HOSTNAME
const authServiceConfig = JSON.parse( process.env.AUTH_API_SERVICE )
const authServiceHostname = process.env.TEST_AUTH_SERVICE_HOSTNAME
const authUsername = process.env.TEST_AUTH_SERVICE_USERNAME
const authPassword = process.env.TEST_AUTH_SERVICE_PASSWORD


module.exports = {
    service: 'Variant Service',
    name: 'variant',
    values: [
        {
            key: 'port',
            value: serviceConfig.port,
            enabled: true
        },
        {
            key: 'path',
            value: serviceConfig.endpoint[ 0 ] === '/' ? serviceConfig.endpoint.substr( 1 ) : serviceConfig.endpoint,
            enabled: true
        },
        {
            key: 'hostname',
            value: serviceHostname,
            enabled: true
        },
        {
            key: 'authPort',
            value: authServiceConfig.port,
            enabled: true
        },
        {
            key: 'authPath',
            value: authServiceConfig.endpoint[ 0 ] === '/' ? authServiceConfig.endpoint.substr( 1 ) : authServiceConfig.endpoint,
            enabled: true
        },
        {
            key: 'authHostname',
            value: authServiceHostname,
            enabled: true
        },
        {
            key: 'authUsername',
            value: authUsername,
            enabled: true
        },
        {
            key: 'authPassword',
            value: authPassword,
            enabled: true
        }
    ]
}
