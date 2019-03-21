// https://github.com/request/request-promise
import rp from 'request-promise-native'

class KeycloakClient {

    constructor( config ) {
        this.host = config.host
        this.clientId = config.clientId
        this.clientSecret = config.clientSecret
    }

    authenticate( username, password ) {
        return rp( {
            method: 'POST',
            uri: `${this.host}/token`,
            form: {
                username: username,
                password: password,
                grant_type: 'password',
                client_id: this.clientId,
                client_secret: this.clientSecret
            }
        } )
    }

}

export default KeycloakClient
