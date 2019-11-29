import fs from 'fs'

function get_certificate(logger) {
    let sslCertificate = null
    let sslCertificateKey = null

    if ( !process.env.SSL_CERTIFICATE_PATH || !process.env.SSL_CERTIFICATE_KEY_PATH ) {
        logger.warning( 'No SSL_CERTIFICATE_PATH or SSL_CERTIFICATE_KEY_PATH defined in environment.' )
    } else {
        try {
            sslCertificate = fs.readFileSync( process.env.SSL_CERTIFICATE_PATH )
            sslCertificateKey = fs.readFileSync( process.env.SSL_CERTIFICATE_KEY_PATH )
        } catch ( e ) {
            logger.error( 'SSL_CERTIFICATE_PATH or SSL_CERTIFICATE_KEY_PATH could not be read.' )
            process.exit( 1 )
        }
    }

    return { sslCertificate, sslCertificateKey }
}

export default get_certificate