/* eslint-disable */

import { readFileSync } from 'fs'
import { expect } from 'chai'
import { cloneDeep } from 'lodash';

import { generateVariantQuery, generateFacetQuery, generateCountQuery } from '../../src/services/elastic'

import { DIALECT_LANGUAGE_ELASTIC_SEARCH, elasticSearchTranslator } from '../../src/services/api/variant/sqon/dialect/es'
import translate from '../../src/services/api/variant/sqon'

const ELASTIC_SEARCH_SCHEMA_V1 = JSON.parse( readFileSync( `${__dirname}/../../src/services/api/variant/schema/${DIALECT_LANGUAGE_ELASTIC_SEARCH}/1.json`, 'utf8' ) )




const PATIENT_ID = 'PA00001';
const ADMINISTRATOR_ACL = { role: 'administrator', organization_id: 'OR00202', practitioner_id: 'PR00601'}
const GENETICIAN_ACL = { role: 'genetician', organization_id: 'OR00203', practitioner_id: 'PR00602'}
const PRACTITIONER_ACL = { role: 'practitioner', organization_id: 'OR00204', practitioner_id: 'PR00603'}
const EMPTY_STATEMENT = {"key":"0895b100-9494-11ea-973e-c5cbfbdf7241","title":"Requête 1","instructions":[]};
const EMPTY_STATEMENT_QUERY = "0895b100-9494-11ea-973e-c5cbfbdf7241";
const DEFAULT_GROUP = ELASTIC_SEARCH_SCHEMA_V1.defaultGroup;
const DEFAULT_INDEX = 0;
const DEFAULT_LIMIT = 25;


describe( 'SQON to ElasticSearch Mapper', () => {

    it( 'should return a valid translation structure for an empty sqon', () => {
        const translatedQuery = translate( EMPTY_STATEMENT, EMPTY_STATEMENT_QUERY, ELASTIC_SEARCH_SCHEMA_V1, DIALECT_LANGUAGE_ELASTIC_SEARCH )
        expect( translatedQuery ).to.eql(
            elasticSearchTranslator.emptyTranslation
        )
    } )

    describe( 'should return valid translation for each ACL role', () => {

        it( 'variant query should contain ACL for administrator role', () => {
            const variantQuery = generateVariantQuery( PATIENT_ID, elasticSearchTranslator.emptyTranslation, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT )
            expect( variantQuery ).to.eql(
                {"from":0,"size":25,"query":{"bool":{"filter":[{"term":{"donors.patientId.keyword":"PA00001"}}]}},"sort":[{"donors.exomiserScore":{"order":"desc","nested":{"path":"donors","filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}},{"impactScore":{"order":"desc"}}]}
            )
        } )

        it( 'variant query should contain ACL for genetician role', () => {
            const variantQuery = generateVariantQuery( PATIENT_ID, elasticSearchTranslator.emptyTranslation, GENETICIAN_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT )
            expect( variantQuery ).to.eql(
                {"from":0,"size":25,"query":{"bool":{"filter":[{"term":{"donors.patientId.keyword":"PA00001"}},[{"term":{"donors.organizationId.keyword":"OR00203"}}],{"term":{"donors.patientId.keyword":"PA00001"}}]}},"sort":[{"donors.exomiserScore":{"order":"desc","nested":{"path":"donors","filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}},{"impactScore":{"order":"desc"}}]}
            )
        } )

        it( 'variant query should contain ACL for practitioner role', () => {
            const variantQuery = generateVariantQuery( PATIENT_ID, elasticSearchTranslator.emptyTranslation, PRACTITIONER_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT )
            expect( variantQuery ).to.eql(
                {"from":0,"size":25,"query":{"bool":{"filter":[{"term":{"donors.patientId.keyword":"PA00001"}},[{"term":{"donors.organizationId.keyword":"OR00203"}}],{"term":{"donors.patientId.keyword":"PA00001"}},[{"term":{"donors.practitionerId.keyword":"PR00603"}}],{"term":{"donors.patientId.keyword":"PA00001"}}]}},"sort":[{"donors.exomiserScore":{"order":"desc","nested":{"path":"donors","filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}},{"impactScore":{"order":"desc"}}]}
            )
        } )

    } )

} )
