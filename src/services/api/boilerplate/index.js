import ApiService from '../service'
import { generateGetFunctionForApiVersion } from '../service'
import restifyAsyncWrap from '../helpers/async'

import Apiv1 from './v1'
import Apiv2 from './v2'
import Apiv3 from './v3'

const getFunctionForApiVersion = generateGetFunctionForApiVersion( {
    1: Apiv1,
    2: Apiv2,
    3: Apiv3
} )

export default class BoilerplateService extends ApiService {

    async start() {

        super.start()
        this.instance.get( `${this.config.endpoint}`, restifyAsyncWrap( async( req, res, next ) => {
            try {
                const response = await getFunctionForApiVersion( req.version, 'example' )( req, res )

                res.send( response )
                return next()
            } catch ( e ) {
                await this.logService.warning( `${this.config.endpoint} ${e.toString()}` )
                return next( e )
            }

        } ) )

    }

}
