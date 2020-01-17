import { isArray } from 'lodash'

import {
    OPERATOR_TYPE_AND, OPERATOR_TYPE_OR, OPERATOR_TYPE_AND_NOT,
    OPERAND_TYPE_ALL, OPERATOR_TYPE_ONE_OF, OPERATOR_TYPE_NONE,
    COMPARATOR_TYPE_GREATER_THAN, COMPARATOR_TYPE_GREATER_THAN_OR_EQUAL, COMPARATOR_TYPE_LOWER_THAN, COMPARATOR_TYPE_LOWER_THAN_OR_EQUAL,
    findAllOperatorInstructions,
    instructionIsOperator,
    FILTER_TYPE_GENERIC_BOOLEAN, FILTER_TYPE_COMPOSITE, FILTER_TYPE_NUMERICAL_COMPARISON, FILTER_TYPE_SPECIFIC, FILTER_TYPE_GENERIC,
    instructionIsFilter,
    traverseObjectAndApplyFunc,
    getInstructionType
} from '../index'


export const DIALECT_LANGUAGE_ELASTIC_SEARCH = 'es'
export const EMPTY_ELASTIC_SEARCH_DIALECT_OPTIONS = {}

const getVerbFromOperator = ( operator ) => {
    switch ( operator ) {
        default:
        case OPERATOR_TYPE_AND:
            return 'must'
        case OPERATOR_TYPE_OR:
            return 'should'
        case OPERATOR_TYPE_AND_NOT:
            return 'must_not'
    }
}

const getVerbFromOperand = ( operand ) => {
    switch ( operand ) {
        default:
        case OPERAND_TYPE_ALL:
            return 'must'
        case OPERATOR_TYPE_ONE_OF:
            return 'should'
        case OPERATOR_TYPE_NONE:
            return 'must_not'
    }
}

const getVerbFromNumericalComparator = ( comparator ) => {
    switch ( comparator ) {
        default:
        case COMPARATOR_TYPE_GREATER_THAN:
            return 'gt'
        case COMPARATOR_TYPE_GREATER_THAN_OR_EQUAL:
            return 'gte'
        case COMPARATOR_TYPE_LOWER_THAN:
            return 'lt'
        case COMPARATOR_TYPE_LOWER_THAN_OR_EQUAL:
            return 'lte'
    }
}

const mapGenericFilterInstruction = ( instruction, fieldMap ) => {
    return {
        [ getVerbFromOperand( instruction.data.operand ) ]: instruction.data.values.reduce(
            ( accumulator, value ) => {
                accumulator.push( { match: { [ fieldMap ]: value } } )
                return accumulator
            }, [] )
    }
}

const mapSpecificFilterInstruction = ( instruction, fieldMap ) => {
    return {
        [ getVerbFromOperand( instruction.data.operand ) ]: instruction.data.values.reduce(
            ( accumulator, value ) => {
                accumulator.push( { match: { [ fieldMap ]: value } } )
                return accumulator
            }, [] )
    }
}

const mapNumericalComparisonFilterInstruction = ( instruction, fieldMap ) => {
    return {
        must: instruction.data.values.reduce( ( accumulator, group ) => {
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
}

const mapGenericBooleanFilterInstruction = ( instruction, fieldMap ) => {
    return {
        must: instruction.data.values.reduce( ( accumulator, group ) => {
            accumulator.push( { match: { [ fieldMap[ group ] ]: true } } )
            return accumulator
        }, [] )
    }
}

const mapCompositeFilterInstruction = ( instruction, fieldMap ) => {
    const group = instruction.data
    const isNumericalComparison = !!group.comparator

    if ( isNumericalComparison ) {
        return { must: {
            range: {
                [( fieldMap.score || fieldMap[ group.id ].score )]: {
                    [ getVerbFromNumericalComparator( group.comparator ) ]: group.value
                }

            } }
        }
    }
    return { must: {
        match: { [ ( fieldMap.quality || fieldMap[ group.id ].quality ) ]: group.value }
    } }
}

const translateToElasticSearch = ( query, options, getFieldNameFromId ) => {

    const mapPartFromFilter = ( instruction, fieldId ) => {
        const type = getInstructionType( instruction )
        const fieldMap = getFieldNameFromId( fieldId )

        switch ( type ) {
            default:
            case FILTER_TYPE_GENERIC:
                return mapGenericFilterInstruction( instruction, fieldMap )
            case FILTER_TYPE_SPECIFIC:
                return mapSpecificFilterInstruction( instruction, fieldMap )
            case FILTER_TYPE_NUMERICAL_COMPARISON:
                return mapNumericalComparisonFilterInstruction( instruction, fieldMap )
            case FILTER_TYPE_GENERIC_BOOLEAN:
                return mapGenericBooleanFilterInstruction( instruction, fieldMap )
            case FILTER_TYPE_COMPOSITE:
                return mapCompositeFilterInstruction( instruction, fieldMap )
        }
    }

    const mapPartFromComposite = ( instruction, bools ) => {
        const type = getInstructionType( instruction )
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

    const postMapInstructions = ( instructions ) => {
        let mappedInstructions = { bool: instructions }
        let withNestedShouldCount = traverseObjectAndApplyFunc( mappedInstructions, ( key, group ) => {
            if ( key === 'bool' ) {
                if ( group.should ) {
                    group.minimum_should_match = 1
                }
            }

            return group
        } )

        return withNestedShouldCount
    }

    const instructions = mapInstructions( query.instructions )
    const translation = postMapInstructions( instructions )

    return { query: translation }
}

export const elasticSearchTranslator = {
    translate: translateToElasticSearch,
    emptyTranslation: { query: { bool: {} } }
}
