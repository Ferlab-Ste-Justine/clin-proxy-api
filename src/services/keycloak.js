import rp from 'request-promise-native'


export default class KeycloakClient {

    constructor( config ) {
        this.host = config.host
        this.clientId = config.clientId
        this.clientSecret = config.clientSecret
        this.extraOptions = config.extraOptions || {}
    }

    async ping() {
        return rp( Object.assign(this.extraOptions, {
            method: 'GET',
            uri: `${this.host}`
        }) )
    }

    async authenticate( username, password ) {
        return rp( Object.assign(this.extraOptions, {
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
        }) )
    }

    async refresh( token ) {
        return rp( Object.assign(this.extraOptions, {
            method: 'POST',
            uri: `${this.host}/protocol/openid-connect/token`,
            form: {
                grant_type: 'refresh_token',
                refresh_token: token,
                client_id: this.clientId,
                client_secret: this.clientSecret
            }
        }) )
    }

}
