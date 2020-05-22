/* eslint-disable */

// @TODO NotImplemented

import { isArray } from 'lodash'

import {
    OPERATOR_TYPE_AND,
    OPERATOR_TYPE_OR,
    OPERATOR_TYPE_AND_NOT,
    OPERAND_TYPE_ALL,
    OPERATOR_TYPE_ONE_OF,
    OPERATOR_TYPE_NONE,
    COMPARATOR_TYPE_GREATER_THAN,
    COMPARATOR_TYPE_GREATER_THAN_OR_EQUAL,
    COMPARATOR_TYPE_LOWER_THAN,
    COMPARATOR_TYPE_LOWER_THAN_OR_EQUAL,
    findAllOperatorInstructions,
    instructionIsOperator,
    FILTER_TYPE_GENERIC_BOOLEAN,
    FILTER_TYPE_COMPOSITE,
    FILTER_TYPE_NUMERICAL_COMPARISON,
    FILTER_TYPE_SPECIFIC,
    FILTER_TYPE_GENERIC,
    instructionIsFilter,
    getInstructionType,
    FILTER_TYPE_AUTOCOMPLETE
} from '../index'


export const DIALECT_LANGUAGE_GRAPHQL = 'gql'
export const EMPTY_GRAPHQL_DIALECT_OPTIONS = {}


const getVerbFromOperator = ( operator ) => {
    switch ( operator ) {
        default:
        case OPERATOR_TYPE_AND:
            return 'and'
        case OPERATOR_TYPE_OR:
            return 'or'
        case OPERATOR_TYPE_AND_NOT:
            return 'not'
    }
}

const getVerbFromOperand = ( operand ) => {
    switch ( operand ) {
        default:
        case OPERAND_TYPE_ALL:
            return 'and'
        case OPERATOR_TYPE_ONE_OF:
            return 'or'
        case OPERATOR_TYPE_NONE:
            return 'not'
    }
}

const getVerbFromNumericalComparator = ( comparator ) => {
    switch ( comparator ) {
        default:
        case COMPARATOR_TYPE_GREATER_THAN:
            return '>'
        case COMPARATOR_TYPE_GREATER_THAN_OR_EQUAL:
            return '>='
        case COMPARATOR_TYPE_LOWER_THAN:
            return '<'
        case COMPARATOR_TYPE_LOWER_THAN_OR_EQUAL:
            return '<='
    }
}

const mapGenericFilterInstruction = ( instruction, fieldMap, facetMap, subtypeMap ) => {
    return {}
}

const mapSpecificFilterInstruction = ( instruction, fieldMap, facetMap, subtypeMap ) => {
    return {}
}

const mapNumericalComparisonFilterInstruction = ( instruction, fieldMap, facetMap, subtypeMap ) => {
    return {}
}

const mapGenericBooleanFilterInstruction = ( instruction, fieldMap, facetMap, subtypeMap ) => {
    return {}
}

const mapCompositeFilterInstruction = ( instruction, fieldMap, facetMap, subtypeMap ) => {
    const group = instruction.data
    const isNumericalComparison = !!group.comparator

    if ( isNumericalComparison ) {
        return {}
    }

    return {}
}

const mapAutocompleteFilterInstruction = ( instruction, fieldMap, facetMap, subtypeMap ) => {
    return {}
}


const translateToGraphQl = ( query, options, getFieldSearchNameFromId, getFieldFacetNameFromId, getFieldSubtypeFromId ) => {

    const mapPartFromFilter = ( instruction, fieldId ) => {
        const type = getInstructionType( instruction )
        const fieldMap = getFieldSearchNameFromId( fieldId )
        const facetMap = getFieldFacetNameFromId( fieldId )
        const subtypeMap = getFieldSubtypeFromId( fieldId )

        switch ( type ) {
            default:
            case FILTER_TYPE_GENERIC:
                return mapGenericFilterInstruction( instruction, fieldMap, facetMap, subtypeMap )
            case FILTER_TYPE_SPECIFIC:
                return mapSpecificFilterInstruction( instruction, fieldMap, facetMap, subtypeMap )
            case FILTER_TYPE_NUMERICAL_COMPARISON:
                return mapNumericalComparisonFilterInstruction( instruction, fieldMap, facetMap, subtypeMap )
            case FILTER_TYPE_GENERIC_BOOLEAN:
                return mapGenericBooleanFilterInstruction( instruction, fieldMap, facetMap, subtypeMap )
            case FILTER_TYPE_COMPOSITE:
                return mapCompositeFilterInstruction( instruction, fieldMap, facetMap, subtypeMap )
            case FILTER_TYPE_AUTOCOMPLETE:
                return mapAutocompleteFilterInstruction( instruction, fieldMap, facetMap, subtypeMap )
        }
    }

    const mapPartFromComposite = ( instruction, bools ) => {
        const type = getInstructionType( instruction )
        const verb = getVerbFromOperator( type )

        return {
            [ verb ]: bools.reduce( ( accumulator, bool ) => {
                accumulator.push( bool )
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
        return instructions
    }

    const instructions = mapInstructions( query.instructions )
    const translation = postMapInstructions( instructions )

    return { translation }
}

export const graphQlSearchTranslator = {
    translate: translateToGraphQl,
    emptyTranslation: {}
}
