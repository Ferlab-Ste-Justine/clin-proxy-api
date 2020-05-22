import { isArray, filter, find, cloneDeep } from 'lodash'

import {
    elasticSearchTranslator,
    DIALECT_LANGUAGE_ELASTIC_SEARCH,
    EMPTY_ELASTIC_SEARCH_DIALECT_OPTIONS
} from './dialect/es'
import { graphQlSearchTranslator, DIALECT_LANGUAGE_GRAPHQL, EMPTY_GRAPHQL_DIALECT_OPTIONS } from './dialect/gql'

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
        values: [
            { value: 'T' }
        ]
    }
} */
/* By Numerical Comparison
{
    type: 'composite,
    data: {
        values: [
            { comparator: '<=', value: 0 }
        ]
    }
} */
export const FILTER_TYPE_AUTOCOMPLETE = 'autocomplete'
// @NOTE Data Structure Example
/*
{
    type: 'autocomplete',
    data: {
        id: 'gene_symbol',
        subtype: {
            type: 'generic',
            operand: 'one'
        }
        query: 'BRA',
        matches: ['BRAA', 'BRAF', 'BRAZ'],
        selection: ['BRAF']
    }
} */

// @NOTE Used by INSTRUCTION_TYPE_OPERATOR and INSTRUCTION_TYPE_SUBQUERY
export const OPERATOR_TYPE_AND = 'and'
export const OPERATOR_TYPE_OR = 'or'
export const OPERATOR_TYPE_AND_NOT = 'and not'

// @NOTE Used by INSTRUCTION_TYPE_FILTER
export const OPERAND_TYPE_ALL = 'all'
export const OPERATOR_TYPE_ONE_OF = 'one'
export const OPERATOR_TYPE_NONE = 'none'

// @NOTE Used by INSTRUCTION_TYPE_FILTER
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

export const findAllFilterInstructions = ( instructions ) => {
    return filter( instructions, { type: INSTRUCTION_TYPE_FILTER } )
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

export const traverseArrayAndApplyFunc = ( a, fn ) => {
    for ( let i = 0; i < a.length; i++ ) {
        fn.apply( this, [ i, a[ i ] ] )
        if ( isArray( a[ i ] ) && a[ i ].length > 0 ) {
            a[ i ] = traverseArrayAndApplyFunc( a[ i ], fn )
        }
    }
    return a
}

const flattenSchema = ( schema ) => {
    return schema.categories.reduce( ( categoryAccumulator, category ) => {
        return Object.assign( categoryAccumulator, ( category.filters ? category.filters.reduce( ( filterAccumulator, filterConfig ) => {
            return Object.assign( filterAccumulator, { [ filterConfig.id ]: filterConfig } )
        }, {} ) : {} ) )
    }, {} )
}

export const getFieldSearchNameFromFieldIdMappingFunction = ( schema ) => {
    const flattenedSchema = flattenSchema( schema )

    return ( id ) => {
        const normalizedId = id.replace( '_min', '' ).replace( '_max', '' )
        const schemaFilter = find( flattenedSchema, { id: normalizedId } )

        return schemaFilter.search ? schemaFilter.search[ [ id ] ] || schemaFilter.search : null
    }
}

export const getFieldFacetNameFromFieldIdMappingFunction = ( schema ) => {
    const flattenedSchema = flattenSchema( schema )

    return ( id ) => {
        const normalizedId = id.replace( '_min', '' ).replace( '_max', '' )
        const schemaFilter = find( flattenedSchema, { id: normalizedId } )

        return schemaFilter.facet ? schemaFilter.facet[ [ id ] ] || schemaFilter.facet : null
    }
}

export const getFieldSubtypeFromFieldIdMappingFunction = ( schema ) => {
    const flattenedSchema = flattenSchema( schema )

    return ( id ) => {
        const normalizedId = id.replace( '_min', '' ).replace( '_max', '' )
        const schemaFilter = find( flattenedSchema, { id: normalizedId } )

        if ( !schemaFilter ) {
            return null
        }

        return schemaFilter.subtype ? schemaFilter.subtype[ [ id ] ] || schemaFilter.subtype : null
    }
}

export const getInstructionType = ( instruction ) => {
    return instruction.data.type
}

const translate = ( statement, queryKey, schema, dialect, dialectOptions ) => {

    let translator = null
    let options = null

    // @NOTE Determine correct translator
    if ( dialect === DIALECT_LANGUAGE_ELASTIC_SEARCH ) {
        translator = elasticSearchTranslator
        options = dialectOptions ? dialectOptions : EMPTY_ELASTIC_SEARCH_DIALECT_OPTIONS
    } else if ( dialect === DIALECT_LANGUAGE_GRAPHQL ) {
        translator = graphQlSearchTranslator
        options = dialectOptions ? dialectOptions : EMPTY_GRAPHQL_DIALECT_OPTIONS
    }

    if ( translator ) {
        const isValid = validateStatement( isArray( statement ) ? statement : [ statement ] )

        if ( !isValid ) {
            return cloneDeep( translator.emptyTranslation )
        }
        const denormalizedStatement = denormalize( statement )
        const denormalizedQuery = getQueryByKey( denormalizedStatement, queryKey )
        const getFieldSearchNameFromFieldId = getFieldSearchNameFromFieldIdMappingFunction( schema )
        const getFieldFacetNameFromFieldId = getFieldFacetNameFromFieldIdMappingFunction( schema )
        const getFieldSubtypeFromFieldId = getFieldSubtypeFromFieldIdMappingFunction( schema )

        return translator.translate( denormalizedQuery, options, getFieldSearchNameFromFieldId, getFieldFacetNameFromFieldId, getFieldSubtypeFromFieldId )
    }

    return null
}

export default translate
