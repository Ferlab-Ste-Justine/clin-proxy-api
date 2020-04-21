import rp from 'request-promise-native'


export default class KeycloakClient {

    constructor( config ) {
        this.host = config.host
        this.clientId = config.clientId
        this.clientSecret = config.clientSecret
        this.extraOptions = config.extraOptions || {}
    }

    async ping() {
        return rp( Object.assign( this.extraOptions, {
            method: 'GET',
            uri: `${this.host}`
        } ) )
    }

    async authenticate( username, password ) {

        try {
            const response = await rp( Object.assign( this.extraOptions, {
                method: 'POST',
                uri: `${this.host}/protocol/openid-connect/token`,
                form: {
                    username: username,
                    password: password,
                    grant_type: 'password',
                    scope: 'profile',
                    client_id: this.clientId,
                    client_secret: this.clientSecret
                }
            } ) )

            console.log( ` response=${JSON.stringify( response )}` )

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
