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
        const response = await elasticService.getPatientsByAutoComplete( req.params.type, req.params.query, sessionData.acl.fhir, 25 )

        if ( response.hits.total < 1 ) {
            return new errors.NotFoundError()
        }

        await logService.debug( `Elastic getPatientsByAutoComplete using ${req.params.query} returns ${response.hits.total} matches` )
        return {
            total: response.hits.total,
            hits: response.hits.hits
        }
    } catch ( e ) {
        await logService.warning( `Elastic getPatientsByAutoComplete ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

const searchPatientsByFilters = async ( req, res, cacheService, elasticService, logService ) => {
    try {
        const sessionData = await getSessionDataFromToken( req.token, cacheService )
        const response = await elasticService.searchPatientsByFilters( req.body.filters, sessionData.acl.fhir )

        if ( response.hits.total < 1 ) {
            return new errors.NotFoundError()
        }

        await logService.debug( `Elastic searchPatients using ${req.params.query} returns ${response.hits.total} matches` )
        return {
            total: response.hits.total,
            hits: response.hits.hits
        }
    } catch ( e ) {
        await logService.warning( `Elastic searchPatients ${e.toString()}` )
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
    getPatientsByAutoComplete,
    getAllPatients,
    searchPatientsByFilters
}
