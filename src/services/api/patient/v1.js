import errors from 'restify-errors'


const getSessionDataFromToken = async ( token, cacheService ) => {
    return await cacheService.read( token.uid )
}

const getPatientById = async ( req, res, cacheService, elasticService, logService ) => {
    try {
        const sessionData = await getSessionDataFromToken( req.token, cacheService )
        const response = await elasticService.getPatientById( req.params.uid, sessionData.acl.fhir )

        if ( response.hits.total < 1 ) {
            return new errors.NotFoundError()
        }

        await logService.debug( `Elastic getPatientById for ${req.params.uid}` )
        return response.hits.hits[ 0 ]._source
    } catch ( e ) {
        await logService.warning( `Elastic getPatientById ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

const getPatientsByAutoComplete = async ( req, res, cacheService, elasticService, logService ) => {
    try {
        const sessionData = await getSessionDataFromToken( req.token, cacheService )
        const limit = req.size || 25
        const index = ( req.page ? ( req.page - 1 ) : 0 ) * limit
        const response = await elasticService.getPatientsByAutoComplete( req.params.type, req.params.query, sessionData.acl.fhir, index, limit )

        if ( response.hits.total < 1 ) {
            return new errors.NotFoundError()
        }

        await logService.debug( `Elastic getPatientsByAutoComplete using ${req.params.query} [${index},${limit}] returns ${response.hits.total} matches` )
        return {
            total: response.hits.total,
            hits: response.hits.hits
        }
    } catch ( e ) {
        await logService.warning( `Elastic getPatientsByAutoComplete ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

const searchPatients = async ( req, res, cacheService, elasticService, logService ) => {
    try {
        const sessionData = await getSessionDataFromToken( req.token, cacheService )
        const limit = req.size || 25
        const index = ( req.page ? ( req.page - 1 ) : 0 ) * limit
        const response = await elasticService.searchPatients( sessionData.acl.fhir, index, limit )

        if ( response.hits.total < 1 ) {
            return new errors.NotFoundError()
        }

        await logService.debug( `Elastic searchPatients [${index},${limit}] returns ${response.hits.total} matches` )
        return {
            total: response.hits.total,
            hits: response.hits.hits
        }
    } catch ( e ) {
        await logService.warning( `Elastic searchPatients ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

export default {
    getPatientById,
    getPatientsByAutoComplete,
    searchPatients,
}
