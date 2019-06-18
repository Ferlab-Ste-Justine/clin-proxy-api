import rp from 'request-promise-native'


export default class AidboxClient {

    constructor( config ) {
        this.host = config.host
        this.token = Buffer.from( `${config.username}:${config.password}` ).toString( 'base64' )
    }

    async ping() {
        return rp( {
            method: 'GET',
            uri: `${this.host}/health`,
            json: true
        } )
    }

    async getPatientById( uid ) {
        return rp( {
            method: 'GET',
            uri: `${this.host}/Patient/${uid}`,
            json: true,
            headers: {
                Authorization: `Basic ${this.token}`
            }
        } )
    }

    async getAllResourcesByPatientId( uid ) {
        return rp( {
            method: 'GET',
            uri: `${this.host}/Patient/${uid}/$everything`,
            json: true,
            headers: {
                Authorization: `Basic ${this.token}`
            }
        } )
    }

    async getClinicalImpressionsByPatientId( uid ) {
        return rp( {
            method: 'GET',
            uri: `${this.host}/ClinicalImpression?subject:Patient._id=${uid}`,
            json: true,
            headers: {
                Authorization: `Basic ${this.token}`
            }
        } )
    }

    async getObservationsByPatientId( uid, type ) {
        const typeCode = ( type === 'phenotype' ) ? 'phenotype observation' : 'Medicale note'

        return rp( {
            method: 'GET',
            uri: `${this.host}/Observation?patient:Patient._id=${uid}&.code.text=${typeCode}`,
            json: true,
            headers: {
                Authorization: `Basic ${this.token}`
            }
        } )
    }

    async getServiceRequestByPatientId( uid ) {
        return rp( {
            method: 'GET',
            uri: `${this.host}/ServiceRequest?subject:Patient._id=${uid}`,
            json: true,
            headers: {
                Authorization: `Basic ${this.token}`
            }
        } )
    }

    async getSpecimensByPatientId( uid ) {
        return rp( {
            method: 'GET',
            uri: `${this.host}/Specimen?subject:Patient._id=${uid}`,
            json: true,
            headers: {
                Authorization: `Basic ${this.token}`
            }
        } )
    }

    async getFamilyMemberHistoryByPatientId( uid ) {
        return rp( {
            method: 'GET',
            uri: `${this.host}/FamilyMemberHistory?patient:Patient._id=${uid}`,
            json: true,
            headers: {
                Authorization: `Basic ${this.token}`
            }
        } )
    }

    async getPractitionerById( uid ) {
        return rp( {
            method: 'GET',
            uri: `${this.host}/Practitioner/${uid}`,
            json: true,
            headers: {
                Authorization: `Basic ${this.token}`
            }
        } )
    }

    async getOrganizationById( uid ) {
        return rp( {
            method: 'GET',
            uri: `${this.host}/Organization/${uid}`,
            json: true,
            headers: {
                Authorization: `Basic ${this.token}`
            }
        } )
    }

    // @TODO
    async fulltextPatientSearch( param ) {
        return rp( {
            method: 'GET',
            uri: `${this.host}/Patient?_content=${param}`,
            json: true,
            headers: {
                Authorization: `Basic ${this.token}`
            }
        } )
    }

}
