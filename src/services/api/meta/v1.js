import errors from 'restify-errors'


const getSessionDataFromToken = async ( token, cacheService ) => {
    return await cacheService.read( token.uid )
}

const searchStatements = async ( req, res, cacheService, elasticService, logService ) => {
    try {
        const sessionData = await getSessionDataFromToken( req.token, cacheService )
        const params = req.query || req.params || req.body
        const patient = params.patient || null
        const limit = params.size || 25
        const index = ( params.page ? ( params.page - 1 ) : 0 ) * limit
        const filters = patient ? [ { match: { patientId: patient } } ] : []
        const response = await elasticService.searchMeta( sessionData.acl.fhir, 'statement', [], filters, [], index, limit )

        if ( response.hits.total < 1 ) {
            return new errors.NotFoundError()
        }

        await logService.debug( `Elastic searchStatements [${index},${limit}] returns ${response.hits.total} matches` )
        return {
            total: response.hits.total,
            hits: response.hits.hits
        }
    } catch ( e ) {
        await logService.warning( `Elastic searchStatements ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

const createStatement = async ( req, res, cacheService, elasticService, logService ) => {
    try {
        const sessionData = await getSessionDataFromToken( req.token, cacheService )
        const params = req.query || req.params || req.body
        const patientId = params.patient || null
        const title = params.title || ''
        const description = params.description || ''
        const defaultQueries = params.defaultQueries || {}
        const researchQueries = params.researchQueries || {}

        const struct = {
            patientId,
            title,
            description,
            defaultQueries,
            researchQueries
        }

        const response = await elasticService.createMeta( sessionData.acl.fhir, 'statement', struct )

        if ( response.result !== 'created' ) {
            return new errors.InvalidContentError()
        }

        struct.id = response._id
        await logService.debug( `Elastic createStatement returned '${response.result}' with ${response._id}` )
        return struct
    } catch ( e ) {
        await logService.warning( `Elastic createStatement ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

const updateStatement = async ( req, res, cacheService, elasticService, logService ) => {
    try {
        const sessionData = await getSessionDataFromToken( req.token, cacheService )
        const params = req.query || req.params || req.body
        const uid = params.uid
        const patientId = params.patient || null
        const title = params.title || ''
        const description = params.description || ''
        const defaultQueries = params.defaultQueries || {}
        const researchQueries = params.researchQueries || {}

        const struct = {
            patientId,
            title,
            description,
            defaultQueries,
            researchQueries
        }

        const response = await elasticService.updateMeta( sessionData.acl.fhir, 'statement', uid, struct )

        if ( response.result !== 'updated' ) {
            return new errors.ResourceNotFoundError()
        }

        await logService.debug( `Elastic updateStatement returned '${response.result}' for ${uid}` )
        return struct
    } catch ( e ) {
        await logService.warning( `Elastic updateStatement ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

const deleteStatement = async ( req, res, cacheService, elasticService, logService ) => {
    try {
        const sessionData = await getSessionDataFromToken( req.token, cacheService )
        const params = req.query || req.params || req.body
        const uid = params.uid
        const response = await elasticService.deleteMeta( sessionData.acl.fhir, 'statement', uid )

        if ( response.result !== 'deleted' ) {
            return new errors.ResourceNotFoundError()
        }

        await logService.debug( `Elastic deleteStatement returned '${response.result}' for ${uid}` )
        return null
    } catch ( e ) {
        await logService.warning( `Elastic deleteStatement ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

export default {
    searchStatements,
    createStatement,
    updateStatement,
    deleteStatement
}
