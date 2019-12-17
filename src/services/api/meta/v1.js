import errors from 'restify-errors'


const getSessionDataFromToken = async ( token, cacheService ) => {
    return await cacheService.read( token.uid )
}

const searchStatements = async ( req, res, cacheService, elasticService, logService ) => {
    try {
        const sessionData = await getSessionDataFromToken( req.token, cacheService )
        const params = req.query || req.params || req.body
        const limit = params.size || 25
        const index = ( params.page ? ( params.page - 1 ) : 0 ) * limit
        const response = await elasticService.searchMeta( sessionData.acl.fhir, 'statement', [], [], [], index, limit )

        // @TODO implement same logic across other services
        if ( response.hits.total < 0 ) {
            await logService.info( `Elastic searchStatements [${index},${limit}] returns ${response.hits.total} matches` )
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
        const params = req.body
        const title = params.title || ''
        const description = params.description || ''
        const queries = params.queries || {}
        const isDefault = params.isDefault || false

        const struct = {
            title,
            description,
            queries: JSON.stringify( queries ),
            isDefault,
            lastUpdatedOn: new Date().getTime()
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
        const params = req.body
        const uid = params.uid
        const title = params.title || ''
        const description = params.description || ''
        const queries = params.queries || {}
        const isDefault = params.isDefault || false

        const struct = {
            title,
            description,
            queries: JSON.stringify( queries ),
            isDefault,
            lastUpdatedOn: new Date().getTime()
        }

        if ( isDefault ) {
            //  need to set all previous default filter to false ans set only the new one
            const sourceScript = "if (ctx._id == params.uid) { ctx._source = params.data } else { ctx._source.isDefault = false }"
            await logService.debug(`removing all previous default SQON in Elastic & updating ${uid}`)
            const response = await elasticService.updateMeta( sessionData.acl.fhir, 'statement', uid, struct, sourceScript )

            if ( !response.updated ) {
                return new errors.ResourceNotFoundError()
            }
            await logService.debug( `Elastic updateStatement removed all previous default SQON and
            returned ${JSON.stringify(response)}` )

        } else {
            const response = await elasticService.updateMeta(sessionData.acl.fhir, 'statement', uid, struct)

            if (!response.updated) {
                return new errors.ResourceNotFoundError()
            }
            await logService.debug(`Elastic updateStatement returned '${JSON.stringify(response)}' for ${uid}`)
        }
        return struct
    } catch ( e ) {
        await logService.warning( `Elastic updateStatement ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

const deleteStatement = async ( req, res, cacheService, elasticService, logService ) => {
    try {
        const sessionData = await getSessionDataFromToken( req.token, cacheService )
        const params = req.body
        const uid = params.uid
        const response = await elasticService.deleteMeta( sessionData.acl.fhir, 'statement', uid )

        if ( !response.deleted ) {
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
