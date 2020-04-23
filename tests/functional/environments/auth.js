const serviceConfig = JSON.parse( process.env.AUTH_API_SERVICE )
const serviceHostname = process.env.TEST_API_SERVICE_HOSTNAME
const username = process.env.TEST_AUTH_SERVICE_USERNAME
const password = process.env.TEST_AUTH_SERVICE_PASSWORD


module.exports = {
    service: 'Auth Service',
    name: 'auth',
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
        },
        {
            enabled: true,
            key: 'username',
            value: username
        },
        {
            enabled: true,
            key: 'password',
            value: password
        }
    ]
}
