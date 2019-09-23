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

    const getVerbFromOperand = ( operand ) => {
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

    const getFieldNameFromSchema = ( id ) => {
        const schemaFilter = find( flattenedSchema, { id } )

        return schemaFilter.search
    }

    const mapPartFromFilter = ( instruction, fieldId ) => {
        const operand = instruction.data.operand
        const verb = getVerbFromOperand( operand )

        return {
            [ verb ]: instruction.data.values.reduce( ( accumulator, value ) => {
                const fieldName = getFieldNameFromSchema( fieldId )

                accumulator.push( { match: { [ fieldName ]: value } } )
                return accumulator
            }, [] )
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

    console.log(JSON.stringify({ query: { bool: translation } }))

    return { query: { bool: translation } }
}

const translate = ( statement, queryKey, dialect = 'es', dialectOptions ) => {
    const isValid = validate( isArray( statement ) ? statement : [ statement ] )

    if ( !isValid ) {
        return null
    }

    const denormalizedStatement = denormalize( statement )
    const denormalizedQuery = getQueryByKey( denormalizedStatement, queryKey )

    if ( dialect === 'es' ) {
        return translateToElasticSearch( denormalizedQuery, dialectOptions )
    }

    return null
}

export default translate
