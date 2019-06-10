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

    async getPatientById( id, jwtIdToken ) {
        return rp( {
            method: 'GET',
            uri: `${this.host}/Patient/${id}`,
            json: true,
            headers: {
                Authorization: `Bearer ${jwtIdToken}`
            }
        } )
    }

    async fulltextPatientSearch( param, jwtIdToken ) {
        return rp( {
            method: 'GET',
            uri: `${this.host}/Patient?_content=${param}`,
            json: true,
            headers: {
                Authorization: `Bearer ${jwtIdToken}`
            }
        } )
    }

}
