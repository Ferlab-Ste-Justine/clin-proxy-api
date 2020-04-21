const serviceConfig = JSON.parse( process.env.PATIENT_API_SERVICE )
const serviceHostname = process.env.API_SERVICE_HOSTNAME || 'https://localhost'
const authServiceConfig = JSON.parse( process.env.AUTH_API_SERVICE )
const authServiceHostname = process.env.API_SERVICE_HOSTNAME || 'https://localhost'

module.exports = {
    service: 'Patient Service',
    name: 'patient',
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
            key: 'patient',
            value: 'PA00002',
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
            value: 'practitioner@cr-ste-justine.xyz',
            enabled: true
        },
        {
            key: 'authPassword',
            value: 'qwerty123',
            enabled: true
        }
    ]
}
