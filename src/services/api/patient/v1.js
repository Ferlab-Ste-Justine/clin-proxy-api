import errors from 'restify-errors'


const getSessionDataFromToken = async ( token, cacheService ) => {
    return await cacheService.read( token.uid )
}

const getPatientById = async ( req, res, cacheService, elasticService, logService ) => {
    try {
        const sessionData = await getSessionDataFromToken( req.token, cacheService )
        const response = await elasticService.getPatientById( req.params.uid, sessionData.acl.fhir )

        console.log( response )
        if ( response.hits.total < 1 ) {
            return new errors.NotFoundError()
        }

        await logService.debug( `Elastic getPatientById for ${req.params.uid}` )
        return response.hits.hits[ 0 ]
    } catch ( e ) {
        await logService.warning( `Elastic getPatientById ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

const getAllPatients = async ( req, res, cacheService, elasticService, logService ) => {
    try {
        const sessionData = await getSessionDataFromToken( req.token, cacheService )
        const response = await elasticService.getAllPatients( sessionData.acl.fhir )

        if ( !response.hits.total < 1 ) {
            return new errors.NotFoundError()
        }

        await logService.debug( `Elastic getAllPatients for ${req.params.uid}` )
        delete response.hits.max_score
        return {
            total: response.hits.total,
            items: response.hits.hits
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
