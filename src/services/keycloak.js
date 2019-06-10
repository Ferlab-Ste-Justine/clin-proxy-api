import rp from 'request-promise-native'


export default class KeycloakClient {

    constructor( config ) {
        this.host = config.host
        this.clientId = config.clientId
        this.clientSecret = config.clientSecret
    }

    async ping() {
        return rp( {
            method: 'GET',
            uri: `${this.host}`
        } )
    }

    async authenticate( username, password ) {
        return rp( {
            method: 'POST',
            uri: `${this.host}/protocol/openid-connect/token`,
            form: {
                username: username,
                password: password,
                grant_type: 'password',
                scope: 'openid',
                client_id: this.clientId,
                client_secret: this.clientSecret
            }
        } )
    }

    async refresh( token ) {
        return rp( {
            method: 'POST',
            uri: `${this.host}/protocol/openid-connect/token`,
            form: {
                grant_type: 'refresh_token',
                refresh_token: token,
                client_id: this.clientId,
                client_secret: this.clientSecret
            }
        } )
    }

}
