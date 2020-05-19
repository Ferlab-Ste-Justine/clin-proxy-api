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
export const FILTER_SUBTYPE_NESTED = 'nested'

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

const filterSubtypeIsNested = ( subtypeMap ) => {
    return subtypeMap && subtypeMap.type === FILTER_SUBTYPE_NESTED
}

const mutateMappedInstructionIntoNestedSubtype = ( mappedInstruction, subtypeMap ) => {
    const filters = []

    if ( subtypeMap.config.field ) {
        filters.push( { term: { [ `${subtypeMap.config.path}.${subtypeMap.config.field}` ]: `%${subtypeMap.config.field}%` } } )
    }

    return { must: [ {
        nested: {
            path: subtypeMap.config.path,
            query: {
                bool: {
                    filter: filters.concat( [ { bool: mappedInstruction } ] )
                }
            }
        }
    } ] }
}

const mapGenericFilterInstruction = ( instruction, fieldMap ) => {
    return {
        [ getVerbFromOperand( instruction.data.operand ) ]: instruction.data.values.reduce(
            ( accumulator, value ) => {
                accumulator.push(
                    { term: { [ fieldMap ]: value } }
                )
                return accumulator
            }, [] )
    }
}

const mapSpecificFilterInstruction = ( instruction, fieldMap ) => {
    return {
        [ getVerbFromOperand( instruction.data.operand ) ]: instruction.data.values.reduce(
            ( accumulator, value ) => {
                accumulator.push(
                    { term: { [ fieldMap ]: value } }
                )
                return accumulator
            }, [] )
    }
}

const mapNumericalComparisonFilterInstruction = ( instruction, fieldMap ) => {
    return {
        must: instruction.data.values.reduce( ( accumulator, group ) => {
            accumulator.range[ fieldMap ][ getVerbFromNumericalComparator( group.comparator ) ] = group.value
            return accumulator
        }, { range: { [ fieldMap ]: {} } } )
    }
}

const mapGenericBooleanFilterInstruction = ( instruction, fieldMap ) => {
    return {
        should: instruction.data.values.reduce( ( accumulator, group ) => {
            accumulator.push(
                { term: { [ fieldMap[ group ] ]: true } }
            )
            return accumulator
        }, [] )
    }
}

const mapCompositeFilterInstruction = ( instruction, fieldMap ) => {
    const termComparisons = []
    const numericalComparisons = {}
    const query = {}

    instruction.data.values.forEach( ( composition ) => {
        const isTermComparison = composition.comparator === undefined

        if ( isTermComparison ) {
            termComparisons.push(
                { term: { [ ( fieldMap.quality || fieldMap[ composition.id ].quality ) ]: composition.value } }
            )
        } else {
            if ( !numericalComparisons.range ) {
                numericalComparisons.range = { [ ( fieldMap.score || fieldMap[ composition.id ].score ) ]: {} }
            }
            numericalComparisons.range[ ( fieldMap.score || fieldMap[ composition.id ].score ) ][ getVerbFromNumericalComparator( composition.comparator ) ] = composition.value
        }
    } )

    // @NOTE Either one or the other but not both at the same time!
    if ( termComparisons.length > 0 ) {
        query.should = termComparisons
    } else if ( numericalComparisons.range !== undefined ) {
        query.must = numericalComparisons
    }

    return query
}

const translateToElasticSearch = ( query, options, getFieldSearchNameFromId, getFieldFacetNameFromId, getFieldSubtypeFromId ) => {

    const mapPartFromFilter = ( instruction, fieldId ) => {
        const type = getInstructionType( instruction )
        const fieldMap = getFieldSearchNameFromId( fieldId )
        const subtypeMap = getFieldSubtypeFromId( fieldId )

        let translatedInstruction = null

        switch ( type ) {
            default:
            case FILTER_TYPE_GENERIC:
                translatedInstruction = mapGenericFilterInstruction( instruction, fieldMap )
                break
            case FILTER_TYPE_SPECIFIC:
                translatedInstruction = mapSpecificFilterInstruction( instruction, fieldMap )
                break
            case FILTER_TYPE_NUMERICAL_COMPARISON:
                translatedInstruction = mapNumericalComparisonFilterInstruction( instruction, fieldMap )
                break
            case FILTER_TYPE_GENERIC_BOOLEAN:
                translatedInstruction = mapGenericBooleanFilterInstruction( instruction, fieldMap )
                break
            case FILTER_TYPE_COMPOSITE:
                translatedInstruction = mapCompositeFilterInstruction( instruction, fieldMap )
                break
        }

        if ( filterSubtypeIsNested( subtypeMap ) ) {
            translatedInstruction = mutateMappedInstructionIntoNestedSubtype( translatedInstruction, subtypeMap )
        }

        return translatedInstruction
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

    return { query: { bool: { filter: [ translation ] } } }
}

export const elasticSearchTranslator = {
    translate: translateToElasticSearch,
    emptyTranslation: { query: { bool: { filter: [] } } }
}
