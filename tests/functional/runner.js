/* eslint-disable global-require */
// https://github.com/postmanlabs/newman#newmanrunoptions-object--callback-function--run-eventemitter

require( 'dotenv' ).config()
import newman from 'newman'


const enabledServices = JSON.parse( process.env.API_SERVICES )

enabledServices.forEach( ( service ) => {

    const configPath = `${service.toUpperCase()}_API_SERVICE`

    try {
        const collection = require( `${__dirname}/collections/${service}.json` )
        const environment = require( `${__dirname}/environments/${service}.js` )

        newman.run( {
            collection,
            environment,

            // @NOTE insecure or set both sslClientCert and sslClientKey
            insecure: true,
            // sslClientCert: process.env.SSL_CERTIFICATE_PATH,
            // sslClientKey: process.env.SSL_CERTIFICATE_KEY_PATH,

            reporters: 'cli'
        }, ( ee ) => {
            if ( ee ) {
                console.error( `Collection Error ${ee}` )
            }
            console.info( 'Collection Complete' )
        } )

    } catch ( e ) {
        console.error( `${configPath} ${e}` )
    }

} )
