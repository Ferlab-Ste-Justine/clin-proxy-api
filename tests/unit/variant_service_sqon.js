/* eslint-disable */

import { expect } from 'chai'

import transform, { groupByPriorities, denormalize, validate } from '../../src/services/api/variant/sqon'

import { cloneDeep } from 'lodash';


describe( 'query helpers', () => {

    it( 'should return NULL on invalid query', () => {
        const INVALID_SQON_MISSING_INSTRUCTIONS = [{}];
        const INVALID_SQON_ZERO_INSTRUCTIONS = [{ 'instructions': [] }];

        expect( validate() ).to.eql( false )
        expect( validate( {} ) ).to.eql( false )
        expect( validate( [] ) ).to.eql( false )
        expect( validate(INVALID_SQON_MISSING_INSTRUCTIONS) ).to.eql( false )
        expect( validate(INVALID_SQON_ZERO_INSTRUCTIONS) ).to.eql( false )
    } )

    /*
    it( 'should denormalize subqueries', () => {
        const queryA = {
            'key': 'A',
            'instructions': [
                {
                    'type': 'filter',
                    'data': {
                        'id': 'variant_type',
                        'type': 'generic',
                        'operand': 'all',
                        'values': ['SNP']
                    }
                }
            ]
        };
        const queryB = {
            'key': 'B',
            'instructions': [
                {
                    'type': 'filter',
                    'data': {
                        'id': 'gene_type',
                        'type': 'generic',
                        'operand': 'none',
                        'values': ['SNP']
                    }
                }
            ]
        };
        const queryC = {
            'key': 'C',
            'instructions': [
                {
                    'type': 'subquery',
                    'data': {
                        'query': 'A'
                    }
                },
                {
                    'type': 'operator',
                    'data': {
                        'type': 'and'
                    }
                },
                {
                    'type': 'subquery',
                    'data': {
                        'query': 'B'
                    }
                }
            ]
        };
        const queryCDenormalized = cloneDeep(queryC)
        queryCDenormalized.instructions[0] = queryA.instructions
        queryCDenormalized.instructions[2] = queryB.instructions
        const normalized = cloneDeep([ queryA, queryB, queryC ])
        const denormalized = cloneDeep([ queryA, queryB, queryCDenormalized ])
        const results = cloneDeep([ queryA, queryB, queryC ])
        const denormalizeQueries = denormalize(normalized)
        results[0].instructions = denormalizeQueries[0]
        results[1].instructions = denormalizeQueries[1]
        results[2].instructions = denormalizeQueries[2]
        expect( results ).to.eql( denormalized )
    } )
    */

} );

describe( 'request generation', () => {

    it( 'should return valid request', () => {
        const statement = [{
            'key': 'A',
            'instructions': [
                {
                    'type': 'filter',
                    'data': {
                        'id': 'variant_type',
                        'type': 'generic',
                        'operand': 'all',
                        'values': ['VARIANT_TYPE_1', 'VARIANT_TYPE_2']
                    }
                },
                {
                    'type': 'operator',
                    'data': {
                        'type': 'and'
                    }
                },
                {
                    'type': 'filter',
                    'data': {
                        'id': 'gene_type',
                        'type': 'generic',
                        'operand': 'none',
                        'values': ['GENE_TYPE_1']
                    }
                }
            ]
        }, {
            'key': 'B',
            'instructions': [
                {
                    'type': 'filter',
                    'data': {
                        'id': 'gene_type',
                        'type': 'generic',
                        'operand': 'one',
                        'values': ['GENE_TYPE_2']
                    }
                }
            ]
        }, {
            'key': 'C',
            'instructions': [
                {
                    'type': 'subquery',
                    'data': {
                        'query': 'A'
                    }
                },
                {
                    'type': 'operator',
                    'data': {
                        'type': 'or'
                    }
                },
                {
                    'type': 'subquery',
                    'data': {
                        'query': 'B'
                    }
                }
            ]
        },
        {
            'key': 'D',
            'instructions': [
                {
                    'type': 'subquery',
                    'data': {
                        'query': 'C'
                    }
                },
                {
                    'type': 'operator',
                    'data': {
                        'type': 'and'
                    }
                },
                {
                    'type': 'subquery',
                    'data': {
                        'query': 'C'
                    }
                }
            ]
        }
        ]

        const transformed = transform(statement, 'D')
        console.log('___ FINAL ____')
        console.log(JSON.stringify(transformed))
    } )

} )



/*
const SINGLE_GENERIC_FILTER_ALL = [{
    'instructions': [{
        'type': 'filter',
        'data': { 'id': 'variant_type', 'type': 'generic', 'operand': 'all', 'values': ['SNP', 'DNP'] }
    }]
}]
const SINGLE_GENERIC_FILTER_ONE = [{
    'instructions': [{
        'type': 'filter',
        'data': { 'id': 'variant_type', 'type': 'generic', 'operand': 'one', 'values': ['SNP', 'DNP'] }
    }]
}]
const SINGLE_GENERIC_FILTER_NONE = [{
    'instructions': [{
        'type': 'filter',
        'data': { 'id': 'variant_type', 'type': 'generic', 'operand': 'none', 'values': ['SNP', 'DNP'] }
    }]
}]

describe( 'query with single instruction', () => {

    describe( 'filter instructions', () => {

        it( 'should transform ALL OF operand', () => {
            expect( transform( SINGLE_GENERIC_FILTER_ALL ) ).to.not.eql( null )
        } )

        it( 'should transform ONE OF operand', () => {
            expect( transform( SINGLE_GENERIC_FILTER_ONE ) ).to.not.eql( null )
        } )

        it( 'should transform NONE OF operand', () => {
            expect( transform( SINGLE_GENERIC_FILTER_NONE ) ).to.not.eql( null )
        } )

    } )

} )

describe( 'query with multiple instruction', () => {

} )
*/
