import errors from 'restify-errors'
import { getACL } from '../helpers/acl'
import get from 'lodash/get'

const SEARCH_TYPE_PRESCRIPTIONS = 'prescriptions'
const SEARCH_TYPE_PATIENTS = 'patients'

const canEdit = async ( req, res, elasticService, logService ) => {
    try {
        const params = req.body
        const ids = get( params, 'ids', [] )

        if ( ids.length === 0 ) {
            throw new Error( 'Invalid ids' )
        }

        const response = await elasticService.getPatientsByIds( ids )
        const hits = response.hits.hits

        const hasSubmittedPrescriptions = ( patient ) =>
            patient.requests.some( ( request ) => request.status === 'active' || request.status === 'completed' )

        const result = hits.map( ( hit ) => hit._source ).some( hasSubmittedPrescriptions )

        return {
            result: !result
        }

    } catch ( e ) {
        await logService.error( `canEdit ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

const getGenderAndPosition = async ( req, res, elasticService, logService ) => {
    try {
        const params = req.body
        const ids = get( params, 'ids', [] )

        if ( ids.length === 0 ) {
            throw new Error( 'Invalid ids.' )
        }

        const response = await elasticService.searchGenderAndPosition( ids )

        return {
            total: response.hits.total.value,
            hits: response.hits.hits
        }
    } catch ( e ) {
        await logService.error( `getGenderAndPosition ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

const getPatientById = async ( req, res, elasticService, logService ) => {
    try {
        const response = await elasticService.searchPatients( getACL( req ), [], [ { match: { _id: req.params.uid } } ], [] )

        if ( response.hits.total.value < 1 ) {
            return new errors.NotFoundError()
        }

        await logService.debug( `Elastic getPatientById for ${req.params.uid}` )
        return response.hits.hits[ 0 ]._source
    } catch ( e ) {
        await logService.warning( `Elastic getPatientById ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

const searchPatients = async ( req, res, elasticService, logService ) => {
    try {
        const params = req.query || req.params || req.body
        const limit = params.size || 25
        const index = ( params.page ? ( params.page - 1 ) : 0 ) * limit
        const type = params.type || 'patient'

        if ( type === SEARCH_TYPE_PRESCRIPTIONS ) {
            const response = await elasticService.searchPrescriptions( getACL( req ), [], [], [], index, limit )

            await logService.debug( `Elastic searchPrescriptions [${index},${limit}] returns ${response.hits.total.value} matches` )
            return {
                total: response.hits.total.value,
                hits: response.hits.hits
            }
        } else if ( type === SEARCH_TYPE_PATIENTS ) {

            const response = await elasticService.searchPatients( getACL( req ), [], [], [], index, limit )

            await logService.debug( `Elastic searchPatients [${index},${limit}] returns ${response.hits.total.value} matches` )
            return {
                total: response.hits.total.value,
                hits: response.hits.hits
            }

        }

        throw new Error( `Invalid search type [${type}]` )
    } catch ( e ) {
        await logService.warning( `Elastic searchPatients ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

const searchPatientsByAutoComplete = async ( req, res, elasticService, logService ) => {
    try {
        const params = req.query || req.params
        const query = params.query
        const type = params.type || 'partial'
        const gender = params.gender
        const limit = params.size || 25
        const position = params.position
        const idsToExclude = params.idsToExclude || []
        const index = ( params.page ? ( params.page - 1 ) : 0 ) * limit

        const mustMatchGenderFilter = gender ? [ { match: {
            gender
        } } ] : []

        const mustMatchPositionFilter = position ? [ { match: {
            position
        } } ] : []

        const mustNotMatchIdFilters = idsToExclude.length > 0 ? idsToExclude.map( ( idToExclude ) => ( {
            match: {
                id: idToExclude
            } }
        ) ) : []

        const filters = {
            must: [ ...mustMatchGenderFilter, ...mustMatchPositionFilter ],
            mustNot: [ ...mustNotMatchIdFilters ]
        }

        const fields = type === 'partial' ? [ 'id', 'lastName', 'firstName', 'mrn', 'gender', 'ramq' ] : []

        const matches = [
            {
                multi_match: {
                    query: query,
                    type: 'phrase_prefix',
                    fields: [
                        'cidText',
                        'lastNameText',
                        'firstNameText',
                        'mrnText',
                        'ramqText'
                    ]
                }
            }
        ]

        const response = await elasticService.autoCompletePatients( getACL( req ), fields, filters, matches, index, limit )

        await logService.debug(
            `Elastic searchPatientsByAutoComplete
             using ${params.type}/${params.query} [${index},${limit}] returns ${response.hits.total.value} matches` )
        return {
            total: response.hits.total.value,
            hits: response.hits.hits
        }
    } catch ( e ) {
        await logService.warning( `Elastic searchPatientsByAutoComplete ${e.toString()}` )
        return new errors.InternalServerError()
    }
}


const searchPrescriptionsByAutoComplete = async ( req, res, elasticService, logService ) => {
    try {
        const params = req.query || req.params
        const query = params.query
        const limit = params.size || 25
        const index = ( params.page ? ( params.page - 1 ) : 0 ) * limit

        const matches = [
            {
                multi_match: {
                    query: query,
                    type: 'phrase_prefix',
                    fields: [
                        'id',
                        'patientInfo.lastName',
                        'patientInfo.firstName',
                        'patientInfo.ramq',
                        'patientInfo.mrn',
                        'familyInfo.id'
                    ]
                }
            }
        ]

        const response = await elasticService.autoCompletePrescriptions( getACL( req ), matches, index, limit )

        await logService.debug( `Elastic searchPatientsByAutoComplete using ${params.type}/${params.query} [${index},${limit}] returns ${response.hits.total.value} matches` )
        return {
            total: response.hits.total.value,
            hits: response.hits.hits
        }
    } catch ( e ) {
        await logService.warning( `Elastic searchPatientsByAutoComplete ${e.toString()}` )
        return new errors.InternalServerError()
    }
}


export default {
    canEdit,
    getGenderAndPosition,
    getPatientById,
    searchPatients,
    searchPatientsByAutoComplete,
    searchPrescriptionsByAutoComplete
}
