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
        const response = await elasticService.searchStatements( sessionData.acl.fhir, [], filters, [], index, limit )

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


export default {
    searchStatements
}
