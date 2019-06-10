import errors from 'restify-errors'


const getPatientById = async ( req, res, aidboxService ) => {
    return await aidboxService.getPatientById( req.params.query, req.token )
}

const fulltextPatientSearch = async ( req, res, aidboxService ) => {
    return await aidboxService.fulltextPatientSearch( req.params.query, req.token )
}

export default {
    getPatientById,
    fulltextPatientSearch
}
