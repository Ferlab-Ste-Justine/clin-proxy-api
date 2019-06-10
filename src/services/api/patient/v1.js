import errors from 'restify-errors'


const getPatientById = async ( req, res, cacheService, aidboxService ) => {
    const currentCachedData = await cacheService.read( req.token.uid )

    return await aidboxService.getPatientById( req.params.query, currentCachedData.auth.id_token )
}

const fulltextPatientSearch = async ( req, res, cacheService, aidboxService ) => {
    const currentCachedData = await cacheService.read( req.token.uid )

    return await aidboxService.fulltextPatientSearch( req.params.query, currentCachedData.auth.id_token )
}

export default {
    getPatientById,
    fulltextPatientSearch
}
