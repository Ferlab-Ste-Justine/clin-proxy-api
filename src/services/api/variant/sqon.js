/* eslint-disable no-case-declarations */

import { isArray, filter, find, map, flatten } from 'lodash'


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
    const flattenedSchema = flatten(
        map( schema.categories, 'filters' )
    )

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

        return schemaFilter.search
    }

    const mapPartFromFilter = ( instruction, fieldId ) => {
        const type = instruction.data.type
        const fieldMap = getFieldNameFromSchema( fieldId )

        // @NOTE Logic based on filter type
        // @NOTE Only numcomparison and genericbool are groupeable right now
        switch ( type ) {
            default:
            case 'generic':
                return {
                    [ getVerbFromGenericOperand( instruction.data.operand ) ]: instruction.data.values.reduce(
                        ( accumulator, value ) => {
                            accumulator.push( { match: { [ fieldMap ]: value } } )
                            return accumulator
                        }, [] )
                }

            case 'numcomparison':
                if ( !instruction.data.values ) {
                    return {
                        must: {
                            range: {
                                [ fieldMap ]: {
                                    [ getVerbFromNumericalComparator( instruction.data.comparator ) ]: instruction.data.value
                                }
                            }
                        }
                    }
                }
                return {
                    must: instruction.data.values.reduce( ( accumulator, group ) => {
                        accumulator.push( {
                            range: {
                                [ fieldMap[ group.id ] ]: {
                                    [ getVerbFromNumericalComparator( group.comparator ) ]: instruction.data.value
                                }
                            }
                        } )
                        return accumulator
                    }, [] )
                }

            case 'genericbool':
                if ( !instruction.data.values ) {
                    return {
                        must: {
                            match: { [ fieldMap ]: true }
                        }
                    }
                }
                return {
                    must: instruction.data.values.reduce( ( accumulator, group ) => {
                        accumulator.push( { match: { [ fieldMap[ group.id ] ]: true } } )
                        return accumulator
                    }, [] )
                }

            case 'composite':
                const isNumericalComparison = !!( instruction.data.value.comparator && instruction.data.value.score )

                if ( isNumericalComparison ) {
                    return {
                        must: {
                            range: { [ fieldMap.score ]: { [ getVerbFromNumericalComparator( instruction.data.value.comparator ) ]: instruction.data.value.score } }
                        }
                    }
                }

                const isQualityComparison = !!instruction.data.value.quality

                if ( isQualityComparison ) {
                    return {
                        must: {
                            match: { [ fieldMap.quality ]: instruction.data.value.quality }
                        }
                    }
                }

                return {}
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
