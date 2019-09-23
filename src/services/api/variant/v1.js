import errors from 'restify-errors'
import { readFileSync } from 'fs'

import translate from './sqon'


const schema = JSON.parse( readFileSync( `${__dirname}/schema/1.json`, 'utf8' ) )

const getSessionDataFromToken = async ( token, cacheService ) => {
    return await cacheService.read( token.uid )
}

const getSchema = async ( logService ) => {
    try {
        await logService.debug( `Returned schema version ${schema.version}` )
        return schema
    } catch ( e ) {
        await logService.warning( 'Could not locate schema version' )
        return new errors.InternalServerError()
    }
}

const getVariants = async ( req, res, cacheService, elasticService, logService ) => {
    try {
        const sessionData = await getSessionDataFromToken( req.token, cacheService )
        const params = req.query || req.params || req.body
        // const patient = params.patient
        // const statement = params.statement || null
        // const query = params.query || null
        const group = params.group || null
        const limit = params.size || 25
        const index = ( params.page ? ( params.page - 1 ) : 0 ) * limit


        const TEST = {
            patient: 'PA00002',
            statement: [
                {
                    key: 'A',
                    instructions: [
                        {
                            type: 'filter',
                            data: {
                                id: 'variant_type',
                                type: 'generic',
                                operand: 'all',
                                values: [ 'SNV' ]
                            }
                        },
                        {
                            type: 'operator',
                            data: {
                                type: 'or'
                            }
                        },
                        {
                            type: 'filter',
                            data: {
                                id: 'variant_type',
                                type: 'generic',
                                operand: 'all',
                                values: [ 'SNV' ]
                            }
                        }
                    ]
                }
            ],
            query: 'A'
        }

        const patient = TEST.patient
        const statement = TEST.statement
        const query = TEST.query

        const translatedQuery = translate( statement, query, 'es', schema )
        const response = await elasticService.getVariantsForPatientId( patient, translatedQuery, sessionData.acl.fhir, schema, group, index, limit )

        if ( response.hits.total < 1 ) {
            return new errors.NotFoundError()
        }

        const aggs = Object.keys( response.aggregations ).map( ( aggregation ) => {
            return response.aggregations[ aggregation ].buckets.reduce( ( accumulator, bucket ) => {
                return [ ...accumulator, { value: bucket.key, total: bucket.doc_count } ]
            }, [] )
        } )

        console.log(aggs)


        await logService.debug( `Elastic getVariantsForPatientId using ${patient}/${queryKey} [${index},${limit}] returns ${response.hits.total} matches` )
        return {
            total: response.hits.total,
            hits: response.hits.hits,
            aggs
        }
    } catch ( e ) {
        await logService.warning( `Elastic getVariantsForPatientId ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

export default {
    getSchema,
    getVariants
}


/*
set size to 1 to get a document

curl -XGET "http://localhost:9200/variants/_search" -H 'Content-Type: application/json' -d'
{
   "size": 0,
   "aggs" : {
       "text" : {
           "terms" : {
               "field" : "properties.functionalAnnotations.effet.keyword",
               "order" : { "_count" : "asc" }
           }
       }
   }
}'

curl -XGET "http://localhost:9200/variants/_search" -H 'Content-Type: application/json' -d'
{
   "size": 0,
   "aggs" : {
       "donor" : {
           "terms" : {
               "field" : "properties.donor.phenotypes.keyword",
               "order" : { "_count": "asc" }
           }
       }
   },
   "query": {
    "bool": {
      "must": [
        { "match": { "properties.chrom":   "1" }}
      ]
    }
  }
}'

Kibana version:

GET /variants/_search
{
   "size": 0,
   "aggs" : {
       "donor" : {
           "terms" : {
               "field" : "properties.donor.phenotypes.keyword",
               "order" : { "_count": "asc" }
           }
       }
   },
   "query": {
    "bool": {
      "must": [
        { "match": { "properties.chrom":   "1" }}
      ]
    }
  }
}

 */
