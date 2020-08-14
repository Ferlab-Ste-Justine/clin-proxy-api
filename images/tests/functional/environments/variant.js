const serviceConfig = JSON.parse( process.env.VARIANT_API_SERVICE )
const serviceHostname = process.env.TEST_API_SERVICE_HOSTNAME


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
            key: 'inexistentPatientId',
            value: 'PA00000',
            enabled: true
        },
        {
            key: 'allowedPatientId',
            value: 'PA00002',
            enabled: true
        },
        {
            key: 'disallowedPatientId',
            value: 'PA14938',
            enabled: true
        }
    ]
}
