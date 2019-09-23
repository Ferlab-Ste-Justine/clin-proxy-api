/* eslint-disable */

import { cloneDeep, isArray, isObject, every, filter, find, findIndex, merge, isNil, omit, set, get, some, pullAllBy, has, mergeWith } from 'lodash';


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

const findAllSubqueryInstructions = (instructions) => {
    return filter(instructions, { type: 'subquery' })
}

const findAllOperatorInstructions = (instructions) => {
    return filter(instructions, { type: 'operator' })
}

const findAllFilterInstructions = (instructions) => {
    return filter(instructions, { type: 'filter' })
}

const hasSubqueries = (query) => {
    const nested = findAllSubqueryInstructions(query.instructions)
    return (nested && nested.length > 0)
}

export const denormalize = (statement = []) => {
    const denormalizeNestedQueries = (list) => {
        return list.forEach( ( item ) => {
            if (hasSubqueries(item)) {
                let instructions = item.instructions.map( ( instruction ) => {
                    return ( !instructionIsSubquery( instruction ) ) ? instruction : getQueryByKey( statement, instruction.data.query ).instructions
                } )
                item.instructions = instructions
            }
            denormalizedStatement.push(item)
        } )
    }

    const denormalizedStatement = []
    denormalizeNestedQueries(statement)
    return denormalizedStatement
}

export const translateToElasticSearch = ( denormalizedQuery ) => {

    const getVerbFromOperator = ( operator ) => {
        switch (operator) {
            default:
            case 'and':
                return 'must'
            case 'or':
                return 'should'
            case 'and not':
                return 'must_not'
        }
    }

    const getVerbFromOperand = ( operand ) => {
        switch (operand) {
            default:
            case 'all':
                return 'must'
            case 'one':
                return 'should'
            case 'none':
                return 'must_not'
        }
    }

    const getFieldNameFromSchema = ( id, schema ) => {
        return 'MAP_FIELD_' + id
    }

    const mapPartFromFilter = (filter, fieldId) => {
        const operand = filter.data.operand;
        const verb = getVerbFromOperand(operand);
        return {
            [verb]: filter.data.values.reduce((accumulator, value) => {
                const fieldName = getFieldNameFromSchema(fieldId)
                accumulator.push( { match : { [fieldName]: value } } )
                return accumulator;
            }, [])
        }
    }

    const mapPartFromComposite = (operator, bools) => {

        console.log('+++ mapPartFromComposite')

        const type = operator.data.type;
        const verb = getVerbFromOperator(type);

        console.log(operator)
        console.log('verb (' + type + ')' + verb)
        console.log(bools)

        return {
            [verb]: bools.reduce((accumulator, bool) => {
                accumulator.push( [ bool ] )
                return accumulator;
            }, [])
        }
    }

    const mapInstructions = ( instructions ) => {

        console.log(' -- instructions -- needs tobe an array always! it is ' + isArray(instructions))

        const isFilterOnly = ( !isArray( instructions[0] ) && Object.keys(instructions).length === 1 )
        const instructionsLength = instructions.length || 0
        const isComposite = ( instructionsLength === 1 && isArray( instructions[ 0 ] ) )
        const isMultiComposite = ( instructionsLength > 1 )
        //const isFilterGroup = ( isMultiComposite && isObject( instructions[ 0 ] ) )

        console.log('== isFilterOnly ' + isFilterOnly)
        console.log('== isComposite ' + isComposite)
        console.log('== isMultiComposite ' + isMultiComposite)

        if (isComposite || isMultiComposite) {

            const operators = findAllOperatorInstructions(instructions)



            console.log('operators on what?')
            console.log(instructions)
            console.log(operators)



            if (operators.length > 0) {

                /*
                if (isFilterGroup) {
                    console.log('ding the funk')
                    return mapInstructions(  [instructions] )
                }
                */

                const composites = instructions.reduce((accumulator, composite) => {
                    if (!instructionIsOperator(composite)) {
                        console.log('==_+_+_ COMPOSITE')
                        console.log(composite)


                        if (!isArray(composite)) {
                            composite = [composite]
                        }

                        const part = mapInstructions( composite )

                        console.log( part )

                        accumulator.push( part )
                    }

                    return accumulator
                }, [])

                console.log('the final composites')
                console.log(composites)

                return mapPartFromComposite( operators[0], composites )
            }

        } else if (isFilterOnly) {


            const instruction = instructions[0]
            if (instructionIsFilter( instruction )) {
                return mapPartFromFilter( instruction, 'variant_type' )
            }


        }

        return {};
    }




    // should we wrap an array
    /*
    let yesOrNo = false
    instructions.forEach((instruction) => {

        if () {

        }

    })


    if (every(denormalizedQuery.instructions, Object)) {

        if (Object.keys(denormalizedQuery.instructions).length > 1) {
            console.log('FUCKING DERNORMALIXKEJKH')

            denormalizedQuery.instructions = [ denormalizedQuery.instructions ]
        }
    }*/





    console.log('\n\n\n\n\n\n\n\ndenormalzied -===0-i9uog')
    console.log(every(denormalizedQuery.instructions, isObject))
    console.log(JSON.stringify(denormalizedQuery.instructions))

    const translation = mapInstructions( denormalizedQuery.instructions );
    return { query: { bool : translation } }
}

const translate = (statement, queryKey, dialect = 'es') => {
    if (!isArray(statement)) {
        statement = [ statement ]
    }

    const isValid = validate(statement)
    if (!isValid) {
        return null
    }

    const denormalizedStatement = denormalize(statement)
    const denormalizedQuery = getQueryByKey( denormalizedStatement, queryKey )

    console.log('+++++ denormalizedQuery');
    console.log(denormalizedQuery)








    if (dialect === 'es') {
        return translateToElasticSearch( denormalizedQuery );
    }

    return null;
}

export default translate





/*

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





