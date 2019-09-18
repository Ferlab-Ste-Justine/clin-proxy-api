/* eslint-disable */

import { cloneDeep, isArray, isObject, filter, find, findIndex, merge, isNil, omit, set, get, some, pullAllBy, has, mergeWith } from 'lodash';


export const validate = (statement) => {
    if (!(statement instanceof Array) || !statement[0] || !statement[0].instructions || statement[0].instructions.length < 1) {
        return false;
    }

    return true;
}

const instructionIsSubquery = (instruction) => {
    return (instruction.type === 'subquery')
}

const instructionIsFilter = (instruction) => {
    return (instruction.type === 'filter')
}

const instructionIsOperator = (instruction) => {
    return (instruction.type === 'operator')
}

const getQueryByKey = (statement, key) => {
    return find( statement, { key } )
}

export const denormalize = (statement = []) => {
    const denormalizeNestedQueries = (list) => {
        return list.forEach( ( item ) => {
            const nested = filter(item.instructions, { type: 'subquery' })
            if (nested.length) {
                let instructions = item.instructions.map( ( instruction ) => {
                    return ( !instructionIsSubquery(instruction) ) ? instruction : getQueryByKey(statement, instruction.data.query).instructions
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

export const translateToElasticSearch = (query) => {
    console.log('----- translateToElasticSearch -----');
    console.log(query.instructions)


    const getVerbFromOperator = (operator) => {
        switch(operator) {
            default:
            case 'and':
                return 'must'
            case 'or':
                return 'should'
            case 'and not':
                return 'must_not'
        }
    }

    const getVerbFromOperand = (operand) => {
        switch(operand) {
            default:
            case 'all':
                return 'must'
            case 'one':
                return 'should'
            case 'none':
                return 'must_not'
        }
    }

    const getFieldNameFromSchema = (id, schema) => {
        return 'MAP_FIELD_' + id
    }

    const getQueryFromGenericFilter = (instruction) => {
        return instruction.data.values.reduce((accumulator, value) => {
            accumulator.push({ match: { [getFieldNameFromSchema(instruction.data.id)]: value } })
            return accumulator
        }, [])
    }


    console.log(JSON.stringify(query))


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

    console.log('..... translating .....');

    const paths = {
        must: [],
        should: [],
        must_not: [],
        filter: ['must']
    }

    const filteredQuery = {
        size: 1,
        query: {
            bool : {
                must: [],
                filter: {
                    bool : {
                        must : [
                            { match: { 'donors.patientId': 'PA00002' } },
                            { match: { 'donors.practitionerId': 'PR000102' } }, // @NOTE only if role is practitioner
                            { match: { 'donors.organizationId': 'OR00202' } },   // @NOTE only if role is genetician
                        ]
                    }
                }
            },
        },
        sort: [
            { '_score': { order: 'desc' } }
        ],
    }

    /*
    const operator = find( query.instructions, { type: 'operator' } ) || { type: 'operator', data: { type: 'and' } }
    const verb = getVerbFromOperator(operator)
    paths[verb].push(verb)
    filteredQuery.query.bool[verb] = []
    */

    const generateGroup = (instructions) => {
        const groupOperator = find( instructions, { type: 'operator' } ) || { type: 'operator', data: { type: 'and' } }
        const groupVerb = getVerbFromOperator(groupOperator.type)



        console.log('===check');
        console.log(instructions)


        return filter(instructions, { type: 'filter' }).reduce((accumulator, filterInstruction) => {


            console.log('Starting FROM')
            console.log(JSON.stringify(filterInstruction))

            // @NOTE Filter Type Logic
            switch (filterInstruction.data.type) {
                default:

                case 'generic':
                    const operandVerb = getVerbFromOperand(filterInstruction.data.operand)
                        const path = [groupVerb, 'bool', operandVerb]
                        if (!has(accumulator.bool, path)) {
                            set(accumulator.bool, path, [])
                        }
                        filterInstruction.data.values.forEach((value) => {
                            accumulator.bool[groupVerb].bool[operandVerb].push({ match: value })
                        })
                    break;
            }

            console.log('Converted TO')
            console.log(JSON.stringify(accumulator))

            return accumulator
        }, {
            bool: {}
        })
    }

    if (!isArray(query.instructions[0])) {
        query.instructions = [ query.instructions ]
    }

    return query.instructions.reduce((accumulator, instruction) => {




        //let group = {};

       // if (!isArray(instruction)) {
       //     instruction = [ instruction ]
       // }




        // works with C
            const group = generateGroup(instruction)
            accumulator.query.bool.must.push(group)



        /*
            const innerGroupOperator = find( instruction, { type: 'operator' } ) || { type: 'operator', data: { type: 'and' } }
            const innerGroupVerb = getVerbFromOperator(innerGroupOperator.type)

            const path = ['bool', 'bool', operandVerb]
            if (!has(accumulator.bool, path)) {
                set(accumulator.bool, path, [])
            }



            console.log('== innerGroupOperator')
            console.log(innerGroupOperator)


            instruction.forEach((innerOperation) => {

                accumulator.query.bool.must.push(group)



            })
        }
*/


        //console.log(JSON.stringify(accumulator));


        return accumulator



                // {"bool":{"must":[{"match":"VARIANT_TYPE_1"},{"match":"VARIANT_TYPE_2"}]}}



                // bool: { [groupVerb]: [ {match} ]



                //query.bool[eval(paths[verb].join('.'))] = group



        /*

        if ( !instructionIsOperator(instruction.type) ) {
            console.log('---  Query Step - Not Operator ---');
            console.log(instruction.type)
            console.log(JSON.stringify(instruction))

            const group = generateGroup(instruction)

            console.log('--- GROUP RESULT === ')
            console.log(group)
        } else {
            console.log('---  Query Step - IS Operator ---');
        }
*/



        //console.log(paths)
        //console.log(filteredQuery)

        //if (!isArray(instruction)) {
        //    instruction = [instruction]
       // }

      // if (isArray(instruction)) {

           //const nestedOperator = find( instruction.instructions, { type: 'operator' } ) || { type: 'operator', data: { type: 'and' } }
           //const nestedVerb = getVerbFromOperator(nestedOperator)


           /*

            paths[nestedVerb].push(nestedVerb, 'bool')
            const newNestedFilter = filter(instruction, { type: 'filter' }).reduce((nestedAccumulator, nestedInstruction) => {
                const newNestedInstruction = getQueryFromGenericFilter(nestedInstruction)
                return [...nestedAccumulator, ...newNestedInstruction]
            }, [])

*/
           /*
            const current = get(accumulator, paths[nestedVerb]) || []
            console.log('dddd ++++')
            console.log(paths[nestedVerb])
            console.log(current)
            console.log('newNestedFilter ++++')
            console.log(newNestedFilter)
            set( accumulator, paths[nestedVerb], [...current, ...newNestedFilter] )
*/

       // } else if (instruction.type === 'filter') {
         //   const newFilter = getQueryFromGenericFilter(instruction)
       //     const current = get(accumulator, ['query', 'bool', verb, 'bool']) || []
         //   set( accumulator, paths[verb], [...current, ...newFilter] )
       // }
        //return accumulator
    }, filteredQuery )
}

const translate = (statement, queryKey) => {
    if (!isArray(statement)) {
        statement = [ statement ]
    }

    const isValid = validate(statement)
    if (!isValid) {
        return null
    }

    const denormalizedStatement = denormalize(statement)
    const denormalizedQuery = getQueryByKey( denormalizedStatement, queryKey )

    return translateToElasticSearch(denormalizedQuery);
}

export default translate
