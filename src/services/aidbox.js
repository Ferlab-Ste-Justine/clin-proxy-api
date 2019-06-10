import rp from 'request-promise-native'


export default class AidboxClient {

    constructor( config ) {
        this.host = config.host
    }

    async ping() {
        return rp( {
            method: 'GET',
            uri: `${this.host}/health`,
            json: true
        } )
    }

    async getPatientById( id, jwt ) {
        return rp( {
            method: 'GET',
            uri: `${this.host}/Patient/${id}`,
            json: true,
            headers: {
                Authorization: `Bearer ${jwt}`
            }
        } )
    }

    async fulltextPatientSearch( param, jwt ) {
        return rp( {
            method: 'GET',
            uri: `${this.host}/Patient?_content=${param}`,
            json: true,
            headers: {
                Authorization: `Bearer ${jwt}`
            }
        } )
    }

}
