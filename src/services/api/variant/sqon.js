/* eslint-disable */

import { cloneDeep, isArray, isObject, filter, find, findIndex, isNil, omit, set, get, some, pullAllBy } from 'lodash';


export const validate = (statement) => {
    if (!(statement instanceof Array) || !statement[0] || !statement[0].instructions || statement[0].instructions.length < 1) {
        return false;
    }

    return true;
}

export const denormalize = (statement = []) => {
    const denormalizeNestedQueries = (list) => {
        return list.forEach( ( item ) => {
            const nested = filter(item.instructions, { type: 'subquery' })
            if (nested.length) {
                let instructions = item.instructions.map( ( instruction ) => {
                    return ( instruction.type !== 'subquery' ) ? instruction : find( statement, { 'key': instruction.data.query } ).instructions
                })
                item.instructions = instructions
            }
            denormalizedStatement.push(item)
        } )
    }

    const denormalizedStatement = []
    denormalizeNestedQueries(statement)
    return denormalizedStatement
}

export const groupByPriorities = (query) => {
    const flattenByDepth = (list, depth = 0) => {
        list.forEach( ( item ) => {
            if (!isArray( item )) {
                if (!flattenedStatement[depth]) {
                    flattenedStatement[depth] = []
                }
                flattenedStatement[depth].push(item)
            } else {
                flattenByDepth( item, (depth+1) )
            }
        })
    }

    const flattenedStatement = []
    flattenByDepth(query.instructions)
    return flattenedStatement.reverse()
}

export const translateToElasticSearch = (query, index, limit) => {

    /*
    GET /mutations/_search
    {
        "size": 10,
        "query": {
        "bool": {
            "must": {
                "bool" : {
                    "must": [ {
                        "match": { "functionalAnnotations.impact":   "HIGH" }},
                        { "match": { "chrom":   "1" }}]
                }
            },
            "should": { "match" : {"functionalAnnotations.consequence" : "upstream_gene_variant"} } ,
            "must_not": [ { "match": { "type":   "SNV" }} ],
                "filter": {
                "bool" : {
                    "must" : [
                        { "match": { "donors.patientId":   "PA00002" }}
                    ]
                }
            }
        }
    }
    }
    */





    return {
        from: index,
        size: limit,
        query: {}
    }
}



const transform = (statement, queryIndex = 0, index = 0, limit = 25) => {
    if (!isArray(statement)) {
        statement = [ statement ]
    }

    const isValid = validate(statement)
    if (!isValid) {
        return null
    }

    const denormalized = denormalize(statement)
    const priority = groupByPriorities(denormalized[queryIndex])

    console.log('priority by index');
    console.log(priority)
    console.log(JSON.stringify(priority))

   return translateToElasticSearch(priority);
}

export default transform
