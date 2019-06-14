import errors from 'restify-errors'


const getSessionDataFromToken = async ( token, cacheService ) => {
    return await cacheService.read( token.uid )
}

const getPatientById = async ( req, res, cacheService, aidboxService, logService ) => {
    try {
        const sessionData = await getSessionDataFromToken( req.token, cacheService )
        const response = await aidboxService.getPatientById( req.params.uid, sessionData.auth.id_token )

        if ( !response.id ) {
            return new errors.NotFound()
        }

        await logService.debug( `Aidbox getPatientById for ${req.params.uid}` )
        return response
    } catch ( e ) {
        await logService.warning( `Aidbox getPatientById ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

const getAllResourcesByPatientId = async ( req, res, cacheService, aidboxService, logService ) => {
    try {
        const sessionData = await getSessionDataFromToken( req.token, cacheService )
        const response = await aidboxService.getAllResourcesByPatientId( req.params.uid, sessionData.auth.id_token )

        if ( response.total === 0 ) {
            return new errors.NotFound()
        }

        await logService.debug( `Aidbox getAllResourcesByPatientId for ${req.params.uid}` )
        return response.entry
    } catch ( e ) {
        await logService.warning( `Aidbox getAllResourcesByPatientId ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

const getClinicalImpressionsByPatientId = async ( req, res, cacheService, aidboxService, logService ) => {
    try {
        const sessionData = await getSessionDataFromToken( req.token, cacheService )
        const response = await aidboxService.getClinicalImpressionsByPatientId( req.params.uid, sessionData.auth.id_token )

        await logService.debug( `Aidbox getClinicalImpressionsByPatientId for ${req.params.uid}` )
        return response
    } catch ( e ) {
        await logService.warning( `Aidbox getClinicalImpressionsByPatientId ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

const getObservationsByPatientId = async ( req, res, cacheService, aidboxService, logService ) => {
    try {
        const sessionData = await getSessionDataFromToken( req.token, cacheService )
        const response = await aidboxService.getObservationsByPatientId( req.params.uid, req.params.type, sessionData.auth.id_token )

        await logService.debug( `Aidbox getObservationsByPatientId of type ${req.params.type} for ${req.params.uid}` )
        return response
    } catch ( e ) {
        await logService.warning( `Aidbox getObservationsByPatientId ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

const getServiceRequestByPatientId = async ( req, res, cacheService, aidboxService, logService ) => {
    try {
        const sessionData = await getSessionDataFromToken( req.token, cacheService )
        const response = await aidboxService.getServiceRequestByPatientId( req.params.uid, sessionData.auth.id_token )

        await logService.debug( `Aidbox getServiceRequestByPatientId for ${req.params.uid}` )
        return response
    } catch ( e ) {
        await logService.warning( `Aidbox getServiceRequestByPatientId ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

const getSpecimensByPatientId = async ( req, res, cacheService, aidboxService, logService ) => {
    try {
        const sessionData = await getSessionDataFromToken( req.token, cacheService )
        const response = await aidboxService.getSpecimensByPatientId( req.params.uid, sessionData.auth.id_token )

        await logService.debug( `Aidbox getSpecimensByPatientId for ${req.params.uid}` )
        return response
    } catch ( e ) {
        await logService.warning( `Aidbox getSpecimensByPatientId ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

const getFamilyMemberHistoryByPatientId = async ( req, res, cacheService, aidboxService, logService ) => {
    try {
        const sessionData = await getSessionDataFromToken( req.token, cacheService )
        const response = aidboxService.getFamilyMemberHistoryByPatientId( req.params.uid, sessionData.auth.id_token )

        await logService.debug( `Aidbox getFamilyMemberHistoryByPatientId for ${req.params.uid}` )
        return response
    } catch ( e ) {
        await logService.warning( `Aidbox getFamilyMemberHistoryByPatientId ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

// @TODO
const fulltextPatientSearch = async ( req, res, cacheService, aidboxService, logService ) => {
    try {
        const currentCachedData = await cacheService.read( req.token.uid )
        const response = await aidboxService.fulltextPatientSearch( req.params.query, currentCachedData.auth.id_token )

        await logService.debug( `Aidbox fulltextPatientSearch for ${req.params.query}` )
        return response
    } catch ( e ) {
        await logService.warning( `Aidbox fulltextPatientSearch ${e.toString()}` )
        return new errors.InternalServerError()
    }
}


export default {
    getPatientById,
    getAllResourcesByPatientId,
    getClinicalImpressionsByPatientId,
    getObservationsByPatientId,
    getServiceRequestByPatientId,
    getSpecimensByPatientId,
    getFamilyMemberHistoryByPatientId,
    fulltextPatientSearch
}
