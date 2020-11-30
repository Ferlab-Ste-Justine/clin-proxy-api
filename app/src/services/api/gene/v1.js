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
                'symbol',
            )
        }

        const matches = [
            {
                multi_match: {
                    query: query,
                    type: 'phrase_prefix',
                    fields: [
                        'symbol^7',
                        'alias^6',
                        'ensembl_gene_id^5',
                        'name^4',
                        'omim^3',
                        'hgnc^2',
                        'entrez_gene_id'
                    ]
                }
            }
        ]

        const highlight = {
            pre_tags: [ '{{' ],
            post_tags: [ '}}' ],
            order: 'score',
            fields: [
                { symbol: {} },
                { alias: {} },
                { ensembl_gene_id: {} },
                { name: {} },
                { omim: {} },
                { hgnc: {} },
                { entrez_gene_id: {} }
            ]
        }

        const response = await elasticService.searchGenes( fields, [], matches, index, limit, highlight )

        await logService.debug( `Elastic searchGenesByAutoComplete using ${params.type}/${params.query} [${index},${limit}] returns ${response.hits.total.value} matches` )
        return {
            total: response.hits.total.value,
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
