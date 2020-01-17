import { isArray, filter, find } from 'lodash'

import { elasticSearchTranslator, DIALECT_LANGUAGE_ELASTIC_SEARCH, EMPTY_ELASTIC_SEARCH_DIALECT_OPTIONS } from './dialect/es'

const INSTRUCTION_TYPE_OPERATOR = 'operator'
const INSTRUCTION_TYPE_FILTER = 'filter'
const INSTRUCTION_TYPE_SUBQUERY = 'subquery'

export const FILTER_TYPE_GENERIC = 'generic'
// @NOTE Data Structure Example
/*
{
    type: 'generic',
    data: {
        id: 'variant_type',
        operand: 'all',
        values: ['SNP', 'deletion']
    }
} */
export const FILTER_TYPE_SPECIFIC = 'specific'
// @NOTE Data Structure Example
/*
{
    type: 'specific',
    data: {
        id: 'variant_type',
        operand: 'all',
        values: ['SNP', 'deletion']
    }
} */
export const FILTER_TYPE_NUMERICAL_COMPARISON = 'numcomparison'
// @NOTE Data Structure Example
/* Single or Multiple Comparison
{
    type: 'numcomparison,
    data: {
        id: 'phylop'
        values: [
            {
                comparator: '<',
                value: 10
            }
            {
                comparator: '>=',
                value: 0
            }
        ]
    }
} */
export const FILTER_TYPE_GENERIC_BOOLEAN = 'genericbool'
// @NOTE Data Structure Example
/*
{
    type: 'genericbool,
    data: {
        values: ['pubmed', 'clinvar']
    }
} */
export const FILTER_TYPE_COMPOSITE = 'composite'
// @NOTE Data Structure Example
/* By Value
{
    type: 'composite,
    data: {
        value: 'T'
    }
} */
/* By Numerical Comparison
{
    type: 'composite,
    data: {
        comparator: '<='
        value: '0'
    }
} */

export const OPERATOR_TYPE_AND = 'and'
export const OPERATOR_TYPE_OR = 'or'
export const OPERATOR_TYPE_AND_NOT = 'and not'

export const OPERAND_TYPE_ALL = 'all'
export const OPERATOR_TYPE_ONE_OF = 'one'
export const OPERATOR_TYPE_NONE = 'none'

export const COMPARATOR_TYPE_GREATER_THAN = '>'
export const COMPARATOR_TYPE_GREATER_THAN_OR_EQUAL = '>='
export const COMPARATOR_TYPE_LOWER_THAN = '<'
export const COMPARATOR_TYPE_LOWER_THAN_OR_EQUAL = '<='

export const instructionIsSubquery = ( instruction ) => {
    return ( instruction.type === INSTRUCTION_TYPE_SUBQUERY )
}

export const instructionIsFilter = ( instruction ) => {
    return ( instruction.type === INSTRUCTION_TYPE_FILTER )
}

export const instructionIsOperator = ( instruction ) => {
    return ( instruction.type === INSTRUCTION_TYPE_OPERATOR )
}

export const getQueryByKey = ( statement, key ) => {
    return find( statement, { key } )
}

export const findAllSubqueryInstructions = ( instructions ) => {
    return filter( instructions, { type: INSTRUCTION_TYPE_SUBQUERY } )
}

export const findAllOperatorInstructions = ( instructions ) => {
    return filter( instructions, { type: INSTRUCTION_TYPE_OPERATOR } )
}

export const hasSubqueries = ( query ) => {
    const nested = findAllSubqueryInstructions( query.instructions )

    return ( nested && nested.length > 0 )
}

export const validateStatement = ( statement ) => {
    if ( !( statement instanceof Array ) || !statement[ 0 ] || !statement[ 0 ].instructions || statement[ 0 ].instructions.length < 1 ) {
        return false
    }

    return true
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

export const traverseObjectAndApplyFunc = ( o, fn ) => {
    for ( let i in o ) {
        fn.apply( this, [ i, o[ i ] ] )
        if ( o[ i ] !== null && typeof ( o[ i ] ) == 'object' ) {
            o[ i ] = traverseObjectAndApplyFunc( o[ i ], fn )
        }
    }
    return o
}

const flattenSchema = ( schema ) => {
    return schema.categories.reduce( ( categoryAccumulator, category ) => {
        return Object.assign( categoryAccumulator, ( category.filters ? category.filters.reduce( ( filterAccumulator, filterConfig ) => {
            return Object.assign( filterAccumulator, { [ filterConfig.id ]: filterConfig } )
        }, {} ) : {} ) )
    }, {} )
}

const getFieldNameFromFieldIdMappingFunction = ( schema ) => {
    const flattenedSchema = flattenSchema( schema )

    return ( id ) => {
        const schemaFilter = find( flattenedSchema, { id } )

        return schemaFilter.search[ [ id ] ] || schemaFilter.search
    }
}

export const getInstructionType = ( instruction ) => {
    return instruction.data.type
}

const translate = ( statement, queryKey, schema, dialect = DIALECT_LANGUAGE_ELASTIC_SEARCH, dialectOptions = EMPTY_ELASTIC_SEARCH_DIALECT_OPTIONS ) => {

    let translator = null

    // @NOTE Determine correct translator
    if ( dialect === DIALECT_LANGUAGE_ELASTIC_SEARCH ) {
        translator = elasticSearchTranslator
    }

    if ( translator ) {
        const isValid = validateStatement( isArray( statement ) ? statement : [ statement ] )

        if ( !isValid ) {
            return translator.emptyTranslation
        }

        const denormalizedStatement = denormalize( statement )
        const denormalizedQuery = getQueryByKey( denormalizedStatement, queryKey )
        const getFieldNameFromFieldId = getFieldNameFromFieldIdMappingFunction( schema )

        return translator.translate( denormalizedQuery, dialectOptions, getFieldNameFromFieldId )
    }

    return null
}

export default translate
