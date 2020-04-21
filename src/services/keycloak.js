import rp from 'request-promise-native'


export default class KeycloakClient {

    constructor( config, logger = null ) {
        this.host = config.host
        this.clientId = config.clientId
        this.clientSecret = config.clientSecret
        this.extraOptions = config.extraOptions || {}
        this.logger = logger
    }

    async ping() {
        const uri = `${this.host}`

        if ( this.logger ) {
            await this.logger.debug( `KeycloakClient: GET ${uri}` )
        }
        return rp( Object.assign( this.extraOptions, {
            method: 'GET',
            uri
        } ) )
    }

    async authenticate( username, password ) {
        const uri = `${this.host}/protocol/openid-connect/token`

        if ( this.logger ) {
            await this.logger.debug( `KeycloakClient: POST ${uri}, context: { grant_type: password, username: ${username}, clientId: ${this.clientId} }` )
        }
        try {
            const response = await rp( Object.assign( this.extraOptions, {
                method: 'POST',
                uri,
                form: {
                    username: username,
                    password: password,
                    grant_type: 'password',
                    scope: 'profile',
                    client_id: this.clientId,
                    client_secret: this.clientSecret
                }
            } ) )

            return response

        } catch ( e ) {
            if ( e.statusCode === 401 ) {

                return JSON.stringify( { error: {
                    code: e.statusCode,
                    message: e.error
                } } )
            }
            throw ( e )
        }
    }

    async refresh( token ) {
        const uri = `${this.host}/protocol/openid-connect/token`

        if ( this.logger ) {
            await this.logger.debug( `KeycloakClient: POST ${uri}, context: { grant_type: refresh_token, clientId: ${this.clientId} }` )
        }
        return rp( Object.assign( this.extraOptions, {
            method: 'POST',
            uri: `${this.host}/protocol/openid-connect/token`,
            form: {
                grant_type: 'refresh_token',
                refresh_token: token,
                client_id: this.clientId,
                client_secret: this.clientSecret
            }
        } ) )
    }

}
