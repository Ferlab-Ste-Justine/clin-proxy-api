/* eslint-disable */

import { expect } from 'chai'

import transform, { groupByPriorities, denormalizeSubqueries } from '../../src/services/api/variant/sqon'

import { cloneDeep } from 'lodash';

const INVALID_SQON_MISSING_INSTRUCTIONS = [{}];
const INVALID_SQON_ZERO_INSTRUCTIONS = [{ 'instructions': [] }];


describe( 'query helpers', () => {

    it( 'should group queries by priorities', () => {
        const unsortedSet = [ 4.1, 4.2, [3.2, 3.3], [3.1, [2.1, 2.2, [1]]], 4.3 ];
        const sortedSet   = [ [ 1 ], [ 2.1, 2.2 ], [ 3.2, 3.3, 3.1 ], [ 4.1, 4.2, 4.3 ] ];
        const results = groupByPriorities(unsortedSet);
        expect( results ).to.eql( sortedSet )
    } )

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
        const queryCDenormalized = cloneDeep(queryC);
        queryCDenormalized.instructions[0] = queryA.instructions;
        queryCDenormalized.instructions[2] = queryB.instructions;
        const normalized = [ queryA, queryB, queryC ]
        const denormalized = [ queryA, queryB, queryCDenormalized ]
        const results = denormalizeSubqueries(normalized);
        //expect( results ).to.eql( denormalized )
    } )







} );



describe( 'query structure validation', () => {

    const instructions = [
        {
            "key": "50c8d3d0",
            "title": "Query One",
            "instructions": [
                {
                    "type": "filter",
                    "data": {
                        "id": "variant_type",
                        "type": "generic",
                        "operand": "all",
                        "values": ["SNP"]
                    }
                },
                {
                    "type": "operator",
                    "data": {
                        "type": "and not"
                    }
                },
                {
                    "type": "filter",
                    "data": {
                        "id": "variant_type",
                        "type": "generic",
                        "operand": "none",
                        "values": ["DNP"]
                    }
                }
            ]
        },
        [
            [
                {
                    "key": "51c8d3d0",
                    "title": "Query Five",
                    "instructions": [
                        {
                            "type": "filter",
                            "data": {
                                "id": "variant_type",
                                "type": "generic",
                                "operand": "one",
                                "values": ["SNP", "DNP"]
                            }
                        }
                    ]
                },
            ]
        ],
        [
            {
                "key": "51c8d3d0",
                "title": "Query Three",
                "instructions": [
                    {
                        "type": "filter",
                        "data": {
                            "id": "variant_type",
                            "type": "generic",
                            "operand": "one",
                            "values": ["SNP", "DNP"]
                        }
                    }
                ]
            },
            {
                "key": "51c8d3d0",
                "title": "Query Four",
                "instructions": [
                    {
                        "type": "filter",
                        "data": {
                            "id": "variant_type",
                            "type": "generic",
                            "operand": "one",
                            "values": ["SNP", "DNP"]
                        }
                    }
                ]
            },
        ],
        {
            "key": "51c8d3d0",
            "title": "Query Two",
            "instructions": [
                {
                    "type": "filter",
                    "data": {
                        "id": "variant_type",
                        "type": "generic",
                        "operand": "one",
                        "values": ["SNP", "DNP"]
                    }
                }
            ]
        }
    ]


    const BODY = {
        from: 0,
        size: 25,
        query: {}
    }








/*

    it( 'should return NULL on invalid query', () => {
        expect( transform() ).to.eql( null )
        expect( transform( {} ) ).to.eql( null )
        expect( transform( [] ) ).to.eql( null )
        //expect( transform(INVALID_SQON_MISSING_INSTRUCTIONS) ).to.eql( null )
        //expect( transform(INVALID_SQON_ZERO_INSTRUCTIONS) ).to.eql( null )
    } )
*/
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
