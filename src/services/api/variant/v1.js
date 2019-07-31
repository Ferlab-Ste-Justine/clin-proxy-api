import errors from 'restify-errors'
import { readFileSync } from 'fs'


const schema = JSON.parse( readFileSync( `${__dirname}/schema/1.json`, 'utf8' ) )

const getSchema = async ( logService ) => {
    try {
        await logService.debug( `getSchema returned version ${schema.version}` )
        return schema
    } catch ( e ) {
        await logService.warning( 'getSchema could not find version identifier' )
        return new errors.InternalServerError()
    }
}

/* eslint-disable-next-line */
const getVariantsFromSqon = async ( req, res, cacheService, elasticService, logService ) => {
    return new errors.NotImplementedError()
}

export default {
    getSchema,
    getVariantsFromSqon
}
