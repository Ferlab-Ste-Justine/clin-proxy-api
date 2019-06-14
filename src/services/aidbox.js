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

    async getPatientById( uid, jwtIdToken ) {
        return rp( {
            method: 'GET',
            uri: `${this.host}/Patient?id=${uid}`,
            json: true,
            headers: {
                Authorization: `Bearer ${jwtIdToken}`
            }
        } )
    }

    async getClinicalImpressionsByPatientId( uid, jwtIdToken ) {
        return rp( {
            method: 'GET',
            uri: `${this.host}/ClinicalImpression?subject:Patient._id=${uid}`,
            json: true,
            headers: {
                Authorization: `Bearer ${jwtIdToken}`
            }
        } )
    }

    async getObservationsByPatientId( uid, type, jwtIdToken ) {
        const typeCode = ( type === 'phenotype' ) ? 'phenotype observation' : 'Medicale note'

        return rp( {
            method: 'GET',
            uri: `${this.host}/Observation?patient:Patient._id=${uid}&.code.text=${typeCode}`,
            json: true,
            headers: {
                Authorization: `Bearer ${jwtIdToken}`
            }
        } )
    }

    async getServiceRequestByPatientId( uid, jwtIdToken ) {
        return rp( {
            method: 'GET',
            uri: `${this.host}/ServiceRequest?subject:Patient._id=${uid}`,
            json: true,
            headers: {
                Authorization: `Bearer ${jwtIdToken}`
            }
        } )
    }

    async getSpecimensByPatientId( uid, jwtIdToken ) {
        return rp( {
            method: 'GET',
            uri: `${this.host}/Specimen?subject:Patient._id=${uid}`,
            json: true,
            headers: {
                Authorization: `Bearer ${jwtIdToken}`
            }
        } )
    }

    async getFamilyMemberHistoryByPatientId( uid, jwtIdToken ) {
        return rp( {
            method: 'GET',
            uri: `${this.host}/FamilyMemberHistory?patient:Patient._id=${uid}`,
            json: true,
            headers: {
                Authorization: `Bearer ${jwtIdToken}`
            }
        } )
    }

    // @TODO
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
