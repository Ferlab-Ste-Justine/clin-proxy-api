/* eslint-disable */

import { expect } from 'chai'
import { cloneDeep } from 'lodash';

import { elasticSearchTranslator } from '../../src/services/api/variant/sqon/dialect/es'




describe( 'SQON to ElasticSearch Mapper', () => {

    it( 'should contain valid empty translation structure', () => {
        expect(  elasticSearchTranslator.emptyTranslation ).to.eql(
            { query: { bool: { filter: [] } } }
        )
    } )

    it( 'should return NULL on invalid query', () => {

        elasticSearchTranslator.translate()



        /*
        const INVALID_SQON_MISSING_INSTRUCTIONS = [{}];
        const INVALID_SQON_ZERO_INSTRUCTIONS = [{ 'instructions': [] }];

        expect( validate() ).to.eql( false )
        expect( validate( {} ) ).to.eql( false )
        expect( validate( [] ) ).to.eql( false )
        expect( validate(INVALID_SQON_MISSING_INSTRUCTIONS) ).to.eql( false )
        expect( validate(INVALID_SQON_ZERO_INSTRUCTIONS) ).to.eql( false )
        */
    } )

} )
