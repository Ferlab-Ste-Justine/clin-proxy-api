import errors from 'restify-errors'


const searchGenesByAutoComplete = async ( req, res, elasticService, logService ) => {
    try {
        const params = req.query || req.params
        const query = params.query
        const type = params.type || 'partial'
        const limit = params.size || 25
        const index = ( params.page ? ( params.page - 1 ) : 0 ) * limit
        const fields = []

        if ( type === 'partial' ) {
            fields.push(
                'geneSymbol',
            )
        }

        const matches = [
            {
                multi_match: {
                    query: query,
                    type: 'phrase_prefix',
                    fields: [
                        'geneSymbol^7',
                        'alias^6',
                        'ensemblId^5',
                        'name^4',
                        'omim^3',
                        'hgnc^2',
                        'geneId'
                    ]
                }
            }
        ]

        const highlight = {
            pre_tags: [ '<em>' ],
            post_tags: [ '</em>' ],
            order: 'score',
            fields: [
                { geneSymbol: {} },
                { alias: {} },
                { ensemblId: {} },
                { name: {} },
                { omim: {} },
                { hgnc: {} },
                { geneId: {} }
            ]
        }

        const response = await elasticService.searchGenes( fields, [], matches, index, limit, highlight )

        await logService.debug( `Elastic searchGenesByAutoComplete using ${params.type}/${params.query} [${index},${limit}] returns ${response.hits.total} matches` )
        return {
            total: response.hits.total,
            hits: response.hits.hits
        }
    } catch ( e ) {
        await logService.warning( `Elastic searchGenesByAutoComplete ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

export default {
    searchGenesByAutoComplete
}
