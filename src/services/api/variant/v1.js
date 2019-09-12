/* eslint-disable */

import errors from 'restify-errors'
import { readFileSync } from 'fs'

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

const getFilters = async ( req, res, cacheService, elasticService, logService ) => {
    try {
        //const sessionData = await getSessionDataFromToken( req.token, cacheService )
        const params = req.body
        //const patient = params.patient
        //const filters = params.filters
        //const query = params.query || null

        console.log(params)


        const patient = 'PA00002';
        const filters = ['variant_type', 'gene_type'];
        const query = {};
        const sessionData = { acl: { fhir: { role: 'administrator' } }};







        const response = await elasticService.getVariantAggregationForPatientId( patient, filters, query, sessionData.acl.fhir, schema )
        const hits = []
        let total = 0;
        Object.keys(response.aggregations).map((filter) => {
            const results = response.aggregations[filter].buckets.reduce((accumulator, bucket) => {
                total += bucket.doc_count
                return [...accumulator, { value: bucket.key, total: bucket.doc_count }]
            }, [])
            hits.push({
                filter,
                results
            })
        })

        await logService.debug( `Elastic getVariantAggregationForPatientId using ${filters} returns ${total} matches` )
        return {
            total,
            hits
        }
    } catch ( e ) {
        await logService.warning( `Elastic getVariantAggregationForPatientId ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

const getVariants = async ( req, res, cacheService, elasticService, logService ) => {
    try {
        const sessionData = await getSessionDataFromToken( req.token, cacheService )
        const params = req.query || req.params
        const patient = params.patient
        const variant = params.variant
        const query = params.query || null
        const limit = params.size || 25
        const index = ( params.page ? ( params.page - 1 ) : 0 ) * limit
        const response = await elasticService.getVariantResultsForPatientId( patient, variant, query, sessionData.acl.fhir, schema, index, limit )

        if ( response.hits.total < 1 ) {
            return new errors.NotFoundError()
        }

        await logService.debug( `Elastic getVariantResultsForPatientId using ${variant}/${patient}/${query} [${index},${limit}] returns ${response.hits.total} matches` )
        return {
            total: response.hits.total,
            hits: response.hits.hits
        }
    } catch ( e ) {
        await logService.warning( `Elastic getVariantResultsForPatientId ${e.toString()}` )
        return new errors.InternalServerError()
    }
}

export default {
    getSchema,
    getFilters,
    getVariants,
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
