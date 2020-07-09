const serviceConfig = JSON.parse( process.env.GENE_API_SERVICE )
const serviceHostname = process.env.TEST_API_SERVICE_HOSTNAME

module.exports = {
    service: 'Gene Service',
    name: 'gene',
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
            key: 'geneQuery',
            value: 'BRAF',
            enabled: true
        }
    ]
}
