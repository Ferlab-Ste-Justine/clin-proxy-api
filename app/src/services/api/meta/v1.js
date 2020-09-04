import errors from 'restify-errors'
import { getACL } from '../helpers/acl'

const META_TYPE_STATEMENT = 'statement'
const META_TYPE_PROFILE = 'profile'

const getStatements = async ( req, res, elasticService, logService ) => {
    try {
        const params = req.query || req.params || req.body
        const limit = params.size || 25
        const index = ( params.page ? ( params.page - 1 ) : 0 ) * limit
        const response = await elasticService.searchMeta( getACL( req ), META_TYPE_STATEMENT, [], [], [], index, limit )

        await logService.debug( `Elastic getStatements [${index},${limit}] returns ${response.hits.total.value} matches` )
        return {
            total: response.hits.total.value,
            hits: response.hits.hits
        }
    } catch ( e ) {
        await logService.warning( `Elastic getStatements ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

const createStatement = async ( req, res, elasticService, logService ) => {
    try {
        const params = req.body
        const title = params.title || ''
        const description = params.description || ''
        const queries = params.queries || []
        const isDefault = params.isDefault || false
        const struct = {
            title,
            description,
            queries: JSON.stringify( queries ),
            isDefault,
            lastUpdatedOn: new Date().getTime()
        }
        const response = await elasticService.createMeta( getACL( req ), META_TYPE_STATEMENT, struct )

        if ( response.result !== 'created' ) {
            return new errors.InvalidContentError()
        }

        struct.uid = response._id
        await logService.debug( `Elastic createStatement returned '${response.result}' with ${response._id}` )
        return struct
    } catch ( e ) {
        await logService.warning( `Elastic createStatement ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

const updateStatement = async ( req, res, elasticService, logService ) => {
    try {
        const params = req.body
        const uid = params.uid
        const title = params.title || ''
        const description = params.description || ''
        const queries = params.queries || []
        const struct = {
            uid,
            title,
            description,
            queries: JSON.stringify( queries ),
            lastUpdatedOn: new Date().getTime()
        }
        const response = await elasticService.updateMeta( getACL( req ), META_TYPE_STATEMENT, uid, struct )

        if ( !response.updated ) {
            return new errors.ResourceNotFoundError()
        }

        await logService.debug( `Elastic updateStatement returned '${JSON.stringify( response.updated )}' for ${uid}` )
        return struct
    } catch ( e ) {
        await logService.warning( `Elastic updateStatement ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

const deleteStatement = async ( req, res, elasticService, logService ) => {
    try {
        const params = req.body
        const uid = params.uid
        const response = await elasticService.deleteMeta( getACL( req ), META_TYPE_STATEMENT, uid )

        if ( !response.deleted ) {
            return new errors.ResourceNotFoundError()
        }

        await logService.debug( `Elastic deleteStatement returned '${response.deleted}' for ${uid}` )
        return null
    } catch ( e ) {
        await logService.warning( `Elastic deleteStatement ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

const getProfile = async ( req, res, elasticService, logService ) => {
    try {
        const response = await elasticService.searchMeta( getACL( req ), META_TYPE_PROFILE, [], [], [], 0, 1 )

        await logService.debug( `Elastic getProfile returns ${response.hits.total.value} matches` )
        return {
            total: response.hits.total.value,
            hits: response.hits.hits
        }
    } catch ( e ) {
        await logService.warning( `Elastic getProfile ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

const createProfile = async ( req, res, elasticService, logService ) => {
    try {
        const params = req.body
        const defaultStatement = params.defaultStatement || ''
        const patientTableConfig = params.patientTableConfig || {}
        const variantTableConfig = params.variantTableConfig || {}
        const struct = {
            defaultStatement,
            patientTableConfig: JSON.stringify( patientTableConfig ),
            variantTableConfig: JSON.stringify( variantTableConfig ),
            lastUpdatedOn: new Date().getTime()
        }
        const response = await elasticService.createMeta( getACL( req ), META_TYPE_PROFILE, struct )

        if ( response.result !== 'created' ) {
            return new errors.InvalidContentError()
        }

        struct.uid = response._id
        await logService.debug( `Elastic createProfile returned '${response.result}' with ${response._id}` )
        return struct
    } catch ( e ) {
        await logService.warning( `Elastic createProfile ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

const updateProfile = async ( req, res, elasticService, logService ) => {
    try {
        const params = req.body
        const uid = params.uid
        const defaultStatement = params.defaultStatement || ''
        const patientTableConfig = params.patientTableConfig || {}
        const variantTableConfig = params.variantTableConfig || {}
        const struct = {
            uid,
            defaultStatement,
            patientTableConfig: JSON.stringify( patientTableConfig ),
            variantTableConfig: JSON.stringify( variantTableConfig ),
            lastUpdatedOn: new Date().getTime()
        }
        const response = await elasticService.updateMeta( getACL( req ), META_TYPE_PROFILE, uid, struct )

        if ( !response.updated ) {
            return new errors.ResourceNotFoundError()
        }

        await logService.debug( `Elastic updateProfile returned '${JSON.stringify( response.updated )}' for ${uid}` )
        return struct
    } catch ( e ) {
        await logService.warning( `Elastic updateProfile ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

const deleteProfile = async ( req, res, elasticService, logService ) => {
    try {
        const params = req.body
        const uid = params.uid
        const response = await elasticService.deleteMeta( getACL( req ), META_TYPE_PROFILE, uid )

        if ( !response.deleted ) {
            return new errors.ResourceNotFoundError()
        }

        await logService.debug( `Elastic deleteProfile returned '${response.deleted}' for ${uid}` )
        return null
    } catch ( e ) {
        await logService.warning( `Elastic deleteProfile ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

export default {
    getStatements,
    createStatement,
    updateStatement,
    deleteStatement,
    getProfile,
    createProfile,
    updateProfile,
    deleteProfile
}
