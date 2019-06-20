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

const getAllPatients = async ( req, res, cacheService, elasticService, logService ) => {
    try {
        const sessionData = await getSessionDataFromToken( req.token, cacheService )
        const index = req.index || 0
        const limit = req.limit || 1000
        const response = await elasticService.getAllPatients( sessionData.acl.fhir, index, limit )

        if ( response.hits.total < 1 ) {
            return new errors.NotFoundError()
        }

        await logService.debug( `Elastic getAllPatients returns ${response.hits.total} matches` )
        return {
            total: response.hits.total,
            hits: response.hits.hits
        }
    } catch ( e ) {
        await logService.warning( `Elastic getAllPatients ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

export default {
    getPatientById,
    getAllPatients
}
