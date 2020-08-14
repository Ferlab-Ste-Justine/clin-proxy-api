const serviceConfig = JSON.parse( process.env.META_API_SERVICE )
const serviceHostname = process.env.TEST_API_SERVICE_HOSTNAME


module.exports = {
    service: 'Meta Service',
    name: 'meta',
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
            key: 'schemaName',
            value: 'statement',
            enabled: true
        },
        {
            key: 'practitionerId',
            value: 'PR00601',
            enabled: true
        }
    ]
}
