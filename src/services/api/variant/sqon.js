/* eslint-disable no-case-declarations */

import { isArray, filter, find } from 'lodash'


export const validate = ( statement ) => {
    if ( !( statement instanceof Array ) || !statement[ 0 ] || !statement[ 0 ].instructions || statement[ 0 ].instructions.length < 1 ) {
        return false
    }

    return true
}

const instructionIsSubquery = ( instruction ) => {
    return ( instruction.type === 'subquery' )
}

const instructionIsFilter = ( instruction ) => {
    return ( instruction.type === 'filter' )
}

const instructionIsOperator = ( instruction ) => {
    return ( instruction.type === 'operator' )
}

const getQueryByKey = ( statement, key ) => {
    return find( statement, { key } )
}

const findAllSubqueryInstructions = ( instructions ) => {
    return filter( instructions, { type: 'subquery' } )
}

const findAllOperatorInstructions = ( instructions ) => {
    return filter( instructions, { type: 'operator' } )
}

const hasSubqueries = ( query ) => {
    const nested = findAllSubqueryInstructions( query.instructions )

    return ( nested && nested.length > 0 )
}

export const denormalize = ( statement = [] ) => {
    const denormalizedStatement = []
    const denormalizeNestedQueries = ( list ) => {
        return list.forEach( ( item ) => {
            if ( hasSubqueries( item ) ) {
                let instructions = item.instructions.map( ( instruction ) => {
                    return ( !instructionIsSubquery( instruction ) ) ? instruction : getQueryByKey( statement, instruction.data.query ).instructions
                } )

                item.instructions = instructions
            }
            denormalizedStatement.push( item )
        } )
    }

    denormalizeNestedQueries( statement )
    return denormalizedStatement
}

export const translateToElasticSearch = ( denormalizedQuery, schema ) => {
    const flattenedSchema = schema.categories.reduce( ( categoryAccumulator, category ) => {
        return Object.assign( categoryAccumulator, ( category.filters ? category.filters.reduce( ( filterAccumulator, filterConfig ) => {
            return Object.assign( filterAccumulator, { [ filterConfig.id ]: filterConfig } )
        }, {} ) : {} ) )
    }, {} )

    const getVerbFromOperator = ( operator ) => {
        switch ( operator ) {
            default:
            case 'and':
                return 'must'
            case 'or':
                return 'should'
            case 'and not':
                return 'must_not'
        }
    }

    const getVerbFromGenericOperand = ( operand ) => {
        switch ( operand ) {
            default:
            case 'all':
                return 'must'
            case 'one':
                return 'should'
            case 'none':
                return 'must_not'
        }
    }

    const getVerbFromNumericalComparator = ( comparator ) => {
        switch ( comparator ) {
            default:
            case '>':
                return 'gt'
            case '>=':
                return 'gte'
            case '<':
                return 'lt'
            case '<=':
                return 'lte'
        }
    }

    const getFieldNameFromSchema = ( id ) => {
        const schemaFilter = find( flattenedSchema, { id } )

        return schemaFilter.search[ [ id ] ] || schemaFilter.search
    }

    const mapPartFromFilter = ( instruction, fieldId ) => {
        const type = instruction.data.type
        const fieldMap = getFieldNameFromSchema( fieldId )

        // @NOTE Logic based on filter type
        // @NOTE Only generic, specific, numcomparison and genericbool are groupeable right now
        switch ( type ) {
            default:
            case 'generic':
            case 'specific':
                // @NOTE Data Structure Example
                /* Grouped
                {
                    type: 'generic',
                    data: {
                        id: 'variant_type',
                        operand: 'all',
                        values: ['SNP', 'deletion']
                    }
                } */
                return {
                    [ getVerbFromGenericOperand( instruction.data.operand ) ]: instruction.data.values.reduce(
                        ( accumulator, value ) => {
                            accumulator.push( { match: { [ fieldMap ]: value } } )
                            return accumulator
                        }, [] )
                }

            case 'numcomparison':
                // @NOTE Data Structure Example
                /* Ungrouped
                {
                    type: 'numcomparison,
                    data: {
                        id: 'phylop'
                        comparator: '>',
                        value: '0.5'
                    }
                } */
                /* Grouped
                {
                    type: 'numcomparison,
                    data: {
                        values: [
                            {
                                id: 'phylop'
                                comparator: '>=',
                                value: 0.1
                            },
                            {
                                id: 'phylop2'
                                comparator: '<',
                                value: 0.1
                            }
                        ]
                    }
                } */
                const comparisons = instruction.data.values ? instruction.data.values : [ instruction.data ]

                return {
                    must: comparisons.reduce( ( accumulator, group ) => {
                        accumulator.push( {
                            range: {
                                [ fieldMap ]: {
                                    [ getVerbFromNumericalComparator( group.comparator ) ]: group.value
                                }
                            }
                        } )
                        return accumulator
                    }, [] )
                }

            case 'genericbool':
                // @NOTE Data Structure Example
                /* Grouped
                {
                    type: 'genericbool,
                    data: {
                        values: ['pubmed', 'clinvar']
                    }
                } */
                return {
                    must: instruction.data.values.reduce( ( accumulator, group ) => {
                        accumulator.push( { match: { [ fieldMap[ group ] ]: true } } )
                        return accumulator
                    }, [] )
                }

            // @NOTE Only supports numerical comparison with aggs value as a quality match
            case 'composite':
                const composites = instruction.data.values ? instruction.data.values : [ instruction.data ]

                return {
                    must: composites.reduce( ( accumulator, group ) => {
                        const isNumericalComparison = !!group.score
                        const isQualitativeComparison = !!group.quality

                        if ( isNumericalComparison ) {
                            // @NOTE Data Structure Example
                            /* Ungrouped
                            {
                                type: 'composite,
                                data: {
                                    score: 'prediction_sift',
                                    comparator: '>=',
                                    value: 0.5
                                }
                            } */
                            /* Grouped
                            {
                                type: 'composite,
                                data: {
                                    values: [
                                        {
                                            score: 'prediction_sift',
                                            comparator: '>=',
                                            value: 0.5
                                        }
                                    ]
                                }
                            } */
                            accumulator.push( {
                                range: {
                                    [ fieldMap[ group.score ] ]: {
                                        [ getVerbFromNumericalComparator( group.comparator ) ]: group.value
                                    }
                                }
                            } )
                        } else if ( isQualitativeComparison ) {
                            // @NOTE Data Structure Example
                            /* Ungrouped
                            {
                                type: 'composite,
                                data: {
                                    quality: 'prediction_sift'
                                    value: 'T'
                                }
                            } */
                            /* Grouped
                            {
                                type: 'composite,
                                data: {
                                    values: [
                                        {
                                            quality: 'prediction_sift'
                                            value: 'T'
                                        }
                                    ]
                                }
                            } */
                            accumulator.push( {
                                match: { [ fieldMap[ group.quality ] ]: group.value }
                            } )
                        }

                        return accumulator
                    }, [] )
                }

        }
    }

    const mapPartFromComposite = ( instruction, bools ) => {
        const type = instruction.data.type
        const verb = getVerbFromOperator( type )

        return {
            [ verb ]: bools.reduce( ( accumulator, bool ) => {
                accumulator.push( { bool: bool } )
                return accumulator
            }, [] )
        }
    }

    const mapInstructions = ( instructions ) => {
        const isFilterOnly = ( !isArray( instructions[ 0 ] ) && Object.keys( instructions ).length === 1 )
        const instructionsLength = instructions.length || 0
        const isComposite = ( instructionsLength === 1 && isArray( instructions[ 0 ] ) )
        const isMultiComposite = ( instructionsLength > 1 )

        if ( isComposite || isMultiComposite ) {
            const operators = findAllOperatorInstructions( instructions )

            if ( operators.length > 0 ) {
                const composites = instructions.reduce( ( accumulator, composite ) => {
                    if ( !instructionIsOperator( composite ) ) {
                        const part = mapInstructions( isArray( composite ) ? composite : [ composite ] )

                        accumulator.push( part )
                    }
                    return accumulator
                }, [] )

                return mapPartFromComposite( operators[ 0 ], composites )
            }

        } else if ( isFilterOnly ) {
            const instruction = instructions[ 0 ]

            if ( instructionIsFilter( instruction ) ) {
                return mapPartFromFilter( instruction, instruction.data.id )
            }
        }

        return {}
    }

    const translation = mapInstructions( denormalizedQuery.instructions )

    return { query: { bool: translation } }
}

const translate = ( statement, queryKey, dialect = 'es', dialectOptions ) => {
    const isValid = validate( isArray( statement ) ? statement : [ statement ] )

    if ( !isValid ) {
        if ( dialect === 'es' ) {
            return { query: { bool: {} } }
        }
    }

    const denormalizedStatement = denormalize( statement )
    const denormalizedQuery = getQueryByKey( denormalizedStatement, queryKey )

    if ( dialect === 'es' ) {
        return translateToElasticSearch( denormalizedQuery, dialectOptions )
    }

    return null
}

export default translate
