require( 'dotenv' ).config()
import newman from 'newman'


const boilerplateServiceConfig = JSON.parse( process.env.BOILERPLATE_API_SERVICE )

newman.run( {
    collection: require( `${__dirname}/collections/common.json` ),

    globals: {},
    environment: {
        name: 'Local',
        values: [
            {
                enabled: true,
                key: 'serviceUrl',
                value: 'http://localhost',
                type: 'text'
            },
            {
                enabled: true,
                key: 'boilerplateServiceEndpointPrefix',
                value: boilerplateServiceConfig.endpoint,
                type: 'text'
            },
            {
                enabled: true,
                key: 'boilerplateServicePort',
                value: boilerplateServiceConfig.port,
                type: 'text'
            }
        ] },
    reporters: 'cli'
}, ( err ) => {
    if ( err ) {
        console.error( `Common Collection Error ${ err.toString()}` )
    }
    console.info( 'Common Collection Complete' )
} )
