import errors from 'restify-errors'


const getSessionDataFromToken = async ( token, cacheService ) => {
    return await cacheService.read( token.uid )
}

const test = async ( req, res, cacheService, overtureService, logService ) => {
    try {
        const sessionData = await getSessionDataFromToken( req.token, cacheService )
        const params = req.query || req.params || req.body

        // somewhere in sessionData
        const keycloakToken = null;
        console.log(sessionData)

        const response = await elasticService.getSomethingFromScore(keycloakToken)

        await logService.debug( `Overture getSomethingFromScore returned something` )
        return {
            response
        }
    } catch ( e ) {
        await logService.warning( `Overture getSomethingFromScore ${e.toString()}` )
        return new errors.InternalServerError()
    }


export default {
    test,
}
