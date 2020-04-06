import rp from 'request-promise-native'


export default class OvertureClient {

    constructor( config ) {
        this.host = config.host
        this.clientId = config.clientId
        this.clientSecret = config.clientSecret
        this.extraOptions = config.extraOptions || {}
    }

    async ping() {
        // @NOTE Might need to ping 2 services song+score ?
        // This is used when "starting" a service to detect if its "alive".
        return rp( Object.assign( this.extraOptions, {
            method: 'GET',
            uri: `${this.host}`
        } ) )
    }

    async getSomethingFromScore() {
        return rp( Object.assign( this.extraOptions, {
            method: 'GET',
            uri: `${this.host}`
        } ) )
    }

}
