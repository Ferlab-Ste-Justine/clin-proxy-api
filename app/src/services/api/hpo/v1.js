const searchHPODescendants = async( req, res, elasticService, logService ) => {
    try {
        
        const { parentHpoId } = req.params
        const response = await elasticService.searchHPODescendants( parentHpoId )

        return {
            total: response.hits.total.value,
            hits: response.hits.hits
        }
    } catch ( error ) {
        await logService.warning( `Elastic searchHPODescendants ${error.toString()}` )
    }
}

const searchHPOAutocomplete = async( req, res, elasticService, logService ) => {
    try {
        console.log( 'Here' )
        const { prefix } = req.params
        const response = await elasticService.searchHPOAutocomplete( prefix )

        return {
            total: response.hits.total.value,
            hits: response.hits.hits
        }
    } catch ( error ) {
        await logService.warning( `Elastic searchHPOAutocomplete ${error.toString()}` )
    }
}


export default {
    searchHPODescendants,
    searchHPOAutocomplete
}
