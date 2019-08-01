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
