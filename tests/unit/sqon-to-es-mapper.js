/* eslint-disable */

import { readFileSync } from 'fs'
import { expect } from 'chai'
import uniqid from 'uniqid'

import { generateVariantQuery, generateFacetQuery, generateCountQuery } from '../../src/services/elastic'

import { DIALECT_LANGUAGE_ELASTIC_SEARCH, elasticSearchTranslator } from '../../src/services/api/variant/sqon/dialect/es'
import translate from '../../src/services/api/variant/sqon'

const ELASTIC_SEARCH_SCHEMA_V1 = JSON.parse( readFileSync( `${__dirname}/../../src/services/api/variant/schema/${DIALECT_LANGUAGE_ELASTIC_SEARCH}/1.json`, 'utf8' ) )

const PATIENT_ID = 'PA00001';
const ADMINISTRATOR_ACL = { role: 'administrator', organization_id: 'OR00202', practitioner_id: 'PR00601'}
const GENETICIAN_ACL = { role: 'genetician', organization_id: 'OR00203', practitioner_id: 'PR00602'}
const PRACTITIONER_ACL = { role: 'practitioner', organization_id: 'OR00204', practitioner_id: 'PR00603'}
const EMPTY_STATEMENT_QUERY = uniqid();
const EMPTY_STATEMENT = [{"key":EMPTY_STATEMENT_QUERY,"instructions":[],"title":"Query 1"}];
const DEFAULT_GROUP = ELASTIC_SEARCH_SCHEMA_V1.defaultGroup;
const DEFAULT_INDEX = 0;
const DEFAULT_LIMIT = 25;


describe( 'SQON (JSON) to ElasticSearch Query Translation For Schema V1', () => {

    it( 'should return a broad translation for a valid SQON', () => {
        const translatedQuery = translate( EMPTY_STATEMENT, EMPTY_STATEMENT_QUERY, ELASTIC_SEARCH_SCHEMA_V1, DIALECT_LANGUAGE_ELASTIC_SEARCH )
        expect( translatedQuery ).to.eql(
            elasticSearchTranslator.emptyTranslation
        )
    } )

    it( 'should return a broad translation for an invalid SQON', () => {
        const translatedQuery = translate( null, null, ELASTIC_SEARCH_SCHEMA_V1, DIALECT_LANGUAGE_ELASTIC_SEARCH )
        expect( translatedQuery ).to.eql(
            elasticSearchTranslator.emptyTranslation
        )
    } )

    describe( 'Roles & Permissions', () => {
        it( 'should contain ACL for Administrator role in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery( PATIENT_ID, EMPTY_STATEMENT, EMPTY_STATEMENT_QUERY, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( facetQuery ).to.eql(
                {"size":0,"query":{"bool":{"filter":[{"term":{"donors.patientId.keyword":"PA00001"}}]}},"aggs":{"filtered":{"aggs":{"variant_type":{"terms":{"field":"type.keyword","order":{"_count":"desc"},"size":999}},"consequence":{"terms":{"field":"consequences.consequence.keyword","order":{"_count":"desc"},"size":999}},"extdb_pubmed":{"terms":{"field":"availableDbExt.pubmed","size":1}},"extdb_clinvar":{"terms":{"field":"availableDbExt.clinvar","size":1}},"extdb_dbsnp":{"terms":{"field":"availableDbExt.dbSNP","size":1}},"chromosome":{"terms":{"field":"chrom.keyword","order":{"_count":"desc"},"size":24}},"gene_type":{"terms":{"field":"genes.biotype.keyword","order":{"_count":"desc"},"size":999}},"extref_hpo":{"terms":{"field":"availableDbExt.hpo","size":1}},"extref_orphanet":{"terms":{"field":"availableDbExt.orphanet","size":1}},"extref_radboudumc":{"terms":{"field":"availableDbExt.radboudumc","size":1}},"extref_omim":{"terms":{"field":"availableDbExt.omim","size":1}},"gene_hpo":{"terms":{"field":"genes.hpo.keyword","order":{"_count":"desc"},"size":9999}},"genegroup_radboud":{"terms":{"field":"genes.radboudumc.keyword","order":{"_count":"desc"},"size":999}},"genegroup_orphanet":{"terms":{"field":"genes.orphanet.panel.keyword","order":{"_count":"desc"},"size":999}},"clinvar_clinsig":{"terms":{"field":"clinvar.clinvar_clinsig.keyword","order":{"_count":"desc"},"size":999}},"impact":{"terms":{"field":"consequences.impact.keyword","order":{"_count":"desc"},"size":999}},"prediction_fathmm":{"terms":{"field":"consequences.predictions.FATHMM.keyword","order":{"_count":"desc"},"size":9}},"prediction_fathmm_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_fathmm_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift":{"terms":{"field":"consequences.predictions.SIFT.keyword","order":{"_count":"desc"},"size":9}},"prediction_sift_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_polyphen2_hvar":{"terms":{"field":"consequences.predictions.Polyphen2_HVAR_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_polyphen2_hvar_min":{"min":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_polyphen2_hvar_max":{"max":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_lrt":{"terms":{"field":"consequences.predictions.LRT_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_lrt_min":{"min":{"field":"consequences.predictions.LRT_score"}},"prediction_lrt_max":{"max":{"field":"consequences.predictions.LRT_score"}},"prediction_dann_min":{"min":{"field":"consequences.predictions.DANN_score"}},"prediction_dann_max":{"max":{"field":"consequences.predictions.DANN_score"}},"prediction_cadd_min":{"min":{"field":"consequences.predictions.CADD_score"}},"prediction_cadd_max":{"max":{"field":"consequences.predictions.CADD_score"}},"prediction_revel_min":{"min":{"field":"consequences.predictions.REVEL_score"}},"prediction_revel_max":{"max":{"field":"consequences.predictions.REVEL_score"}},"conservation_phylop_min":{"min":{"field":"consequences.conservationsScores.PhyloP17Way"}},"conservation_phylop_max":{"max":{"field":"consequences.conservationsScores.PhyloP17Way"}},"cohort_rqdm_min":{"min":{"field":"frequencies.interne.AF"}},"cohort_rqdm_max":{"max":{"field":"frequencies.interne.AF"}},"cohort_gnomad_exomes_min":{"min":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_exomes_max":{"max":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_genomes_min":{"min":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_gnomad_genomes_max":{"max":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_exac_min":{"min":{"field":"frequencies.ExAc.AF"}},"cohort_exac_max":{"max":{"field":"frequencies.ExAc.AF"}},"cohort_uk10k_min":{"min":{"field":"frequencies.Uk10k.AF"}},"cohort_uk10k_max":{"max":{"field":"frequencies.Uk10k.AF"}},"cohort_1000gp3_min":{"min":{"field":"frequencies.1000Gp3.AF"}},"cohort_1000gp3_max":{"max":{"field":"frequencies.1000Gp3.AF"}}},"filter":{"bool":{}}},"nested_donors":{"nested":{"path":"donors"},"aggs":{"filtered":{"filter":{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}},"aggs":{"exomiser_score_min":{"min":{"field":"donors.exomiserScore"}},"exomiser_score_max":{"max":{"field":"donors.exomiserScore"}},"transmission":{"terms":{"field":"donors.transmission.keyword","order":{"_count":"desc"},"size":9}},"zygosity":{"terms":{"field":"donors.zygosity.keyword","order":{"_count":"desc"},"size":9}},"metric_depth_quality_min":{"min":{"field":"donors.qd"}},"metric_depth_quality_max":{"max":{"field":"donors.qd"}},"metric_allelic_alt_depth_min":{"min":{"field":"donors.adAlt"}},"metric_allelic_alt_depth_max":{"max":{"field":"donors.adAlt"}},"metric_total_depth_min":{"min":{"field":"donors.adTotal"}},"metric_total_depth_max":{"max":{"field":"donors.adTotal"}},"metric_ratio_min":{"min":{"field":"donors.adFreq"}},"metric_ratio_max":{"max":{"field":"donors.adFreq"}},"metric_genotype_quality_min":{"min":{"field":"donors.gq"}},"metric_genotype_quality_max":{"max":{"field":"donors.gq"}}}}}}}}
            )
        } )

        it( 'should contain ACL for Genetician role in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery( PATIENT_ID, EMPTY_STATEMENT, EMPTY_STATEMENT_QUERY, GENETICIAN_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( facetQuery ).to.eql(
                {"size":0,"query":{"bool":{"filter":[[{"term":{"donors.organizationId.keyword":"OR00203"}}],{"term":{"donors.patientId.keyword":"PA00001"}}]}},"aggs":{"filtered":{"aggs":{"variant_type":{"terms":{"field":"type.keyword","order":{"_count":"desc"},"size":999}},"consequence":{"terms":{"field":"consequences.consequence.keyword","order":{"_count":"desc"},"size":999}},"extdb_pubmed":{"terms":{"field":"availableDbExt.pubmed","size":1}},"extdb_clinvar":{"terms":{"field":"availableDbExt.clinvar","size":1}},"extdb_dbsnp":{"terms":{"field":"availableDbExt.dbSNP","size":1}},"chromosome":{"terms":{"field":"chrom.keyword","order":{"_count":"desc"},"size":24}},"gene_type":{"terms":{"field":"genes.biotype.keyword","order":{"_count":"desc"},"size":999}},"extref_hpo":{"terms":{"field":"availableDbExt.hpo","size":1}},"extref_orphanet":{"terms":{"field":"availableDbExt.orphanet","size":1}},"extref_radboudumc":{"terms":{"field":"availableDbExt.radboudumc","size":1}},"extref_omim":{"terms":{"field":"availableDbExt.omim","size":1}},"gene_hpo":{"terms":{"field":"genes.hpo.keyword","order":{"_count":"desc"},"size":9999}},"genegroup_radboud":{"terms":{"field":"genes.radboudumc.keyword","order":{"_count":"desc"},"size":999}},"genegroup_orphanet":{"terms":{"field":"genes.orphanet.panel.keyword","order":{"_count":"desc"},"size":999}},"clinvar_clinsig":{"terms":{"field":"clinvar.clinvar_clinsig.keyword","order":{"_count":"desc"},"size":999}},"impact":{"terms":{"field":"consequences.impact.keyword","order":{"_count":"desc"},"size":999}},"prediction_fathmm":{"terms":{"field":"consequences.predictions.FATHMM.keyword","order":{"_count":"desc"},"size":9}},"prediction_fathmm_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_fathmm_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift":{"terms":{"field":"consequences.predictions.SIFT.keyword","order":{"_count":"desc"},"size":9}},"prediction_sift_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_polyphen2_hvar":{"terms":{"field":"consequences.predictions.Polyphen2_HVAR_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_polyphen2_hvar_min":{"min":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_polyphen2_hvar_max":{"max":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_lrt":{"terms":{"field":"consequences.predictions.LRT_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_lrt_min":{"min":{"field":"consequences.predictions.LRT_score"}},"prediction_lrt_max":{"max":{"field":"consequences.predictions.LRT_score"}},"prediction_dann_min":{"min":{"field":"consequences.predictions.DANN_score"}},"prediction_dann_max":{"max":{"field":"consequences.predictions.DANN_score"}},"prediction_cadd_min":{"min":{"field":"consequences.predictions.CADD_score"}},"prediction_cadd_max":{"max":{"field":"consequences.predictions.CADD_score"}},"prediction_revel_min":{"min":{"field":"consequences.predictions.REVEL_score"}},"prediction_revel_max":{"max":{"field":"consequences.predictions.REVEL_score"}},"conservation_phylop_min":{"min":{"field":"consequences.conservationsScores.PhyloP17Way"}},"conservation_phylop_max":{"max":{"field":"consequences.conservationsScores.PhyloP17Way"}},"cohort_rqdm_min":{"min":{"field":"frequencies.interne.AF"}},"cohort_rqdm_max":{"max":{"field":"frequencies.interne.AF"}},"cohort_gnomad_exomes_min":{"min":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_exomes_max":{"max":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_genomes_min":{"min":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_gnomad_genomes_max":{"max":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_exac_min":{"min":{"field":"frequencies.ExAc.AF"}},"cohort_exac_max":{"max":{"field":"frequencies.ExAc.AF"}},"cohort_uk10k_min":{"min":{"field":"frequencies.Uk10k.AF"}},"cohort_uk10k_max":{"max":{"field":"frequencies.Uk10k.AF"}},"cohort_1000gp3_min":{"min":{"field":"frequencies.1000Gp3.AF"}},"cohort_1000gp3_max":{"max":{"field":"frequencies.1000Gp3.AF"}}},"filter":{"bool":{}}},"nested_donors":{"nested":{"path":"donors"},"aggs":{"filtered":{"filter":{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}},"aggs":{"exomiser_score_min":{"min":{"field":"donors.exomiserScore"}},"exomiser_score_max":{"max":{"field":"donors.exomiserScore"}},"transmission":{"terms":{"field":"donors.transmission.keyword","order":{"_count":"desc"},"size":9}},"zygosity":{"terms":{"field":"donors.zygosity.keyword","order":{"_count":"desc"},"size":9}},"metric_depth_quality_min":{"min":{"field":"donors.qd"}},"metric_depth_quality_max":{"max":{"field":"donors.qd"}},"metric_allelic_alt_depth_min":{"min":{"field":"donors.adAlt"}},"metric_allelic_alt_depth_max":{"max":{"field":"donors.adAlt"}},"metric_total_depth_min":{"min":{"field":"donors.adTotal"}},"metric_total_depth_max":{"max":{"field":"donors.adTotal"}},"metric_ratio_min":{"min":{"field":"donors.adFreq"}},"metric_ratio_max":{"max":{"field":"donors.adFreq"}},"metric_genotype_quality_min":{"min":{"field":"donors.gq"}},"metric_genotype_quality_max":{"max":{"field":"donors.gq"}}}}}}}}
            )
        } )

        it( 'should contain ACL for Practitioner role in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery( PATIENT_ID, EMPTY_STATEMENT, EMPTY_STATEMENT_QUERY, PRACTITIONER_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( facetQuery ).to.eql(
                {"size":0,"query":{"bool":{"filter":[[{"term":{"donors.practitionerId.keyword":"PR00603"}}],{"term":{"donors.patientId.keyword":"PA00001"}}]}},"aggs":{"filtered":{"aggs":{"variant_type":{"terms":{"field":"type.keyword","order":{"_count":"desc"},"size":999}},"consequence":{"terms":{"field":"consequences.consequence.keyword","order":{"_count":"desc"},"size":999}},"extdb_pubmed":{"terms":{"field":"availableDbExt.pubmed","size":1}},"extdb_clinvar":{"terms":{"field":"availableDbExt.clinvar","size":1}},"extdb_dbsnp":{"terms":{"field":"availableDbExt.dbSNP","size":1}},"chromosome":{"terms":{"field":"chrom.keyword","order":{"_count":"desc"},"size":24}},"gene_type":{"terms":{"field":"genes.biotype.keyword","order":{"_count":"desc"},"size":999}},"extref_hpo":{"terms":{"field":"availableDbExt.hpo","size":1}},"extref_orphanet":{"terms":{"field":"availableDbExt.orphanet","size":1}},"extref_radboudumc":{"terms":{"field":"availableDbExt.radboudumc","size":1}},"extref_omim":{"terms":{"field":"availableDbExt.omim","size":1}},"gene_hpo":{"terms":{"field":"genes.hpo.keyword","order":{"_count":"desc"},"size":9999}},"genegroup_radboud":{"terms":{"field":"genes.radboudumc.keyword","order":{"_count":"desc"},"size":999}},"genegroup_orphanet":{"terms":{"field":"genes.orphanet.panel.keyword","order":{"_count":"desc"},"size":999}},"clinvar_clinsig":{"terms":{"field":"clinvar.clinvar_clinsig.keyword","order":{"_count":"desc"},"size":999}},"impact":{"terms":{"field":"consequences.impact.keyword","order":{"_count":"desc"},"size":999}},"prediction_fathmm":{"terms":{"field":"consequences.predictions.FATHMM.keyword","order":{"_count":"desc"},"size":9}},"prediction_fathmm_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_fathmm_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift":{"terms":{"field":"consequences.predictions.SIFT.keyword","order":{"_count":"desc"},"size":9}},"prediction_sift_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_polyphen2_hvar":{"terms":{"field":"consequences.predictions.Polyphen2_HVAR_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_polyphen2_hvar_min":{"min":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_polyphen2_hvar_max":{"max":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_lrt":{"terms":{"field":"consequences.predictions.LRT_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_lrt_min":{"min":{"field":"consequences.predictions.LRT_score"}},"prediction_lrt_max":{"max":{"field":"consequences.predictions.LRT_score"}},"prediction_dann_min":{"min":{"field":"consequences.predictions.DANN_score"}},"prediction_dann_max":{"max":{"field":"consequences.predictions.DANN_score"}},"prediction_cadd_min":{"min":{"field":"consequences.predictions.CADD_score"}},"prediction_cadd_max":{"max":{"field":"consequences.predictions.CADD_score"}},"prediction_revel_min":{"min":{"field":"consequences.predictions.REVEL_score"}},"prediction_revel_max":{"max":{"field":"consequences.predictions.REVEL_score"}},"conservation_phylop_min":{"min":{"field":"consequences.conservationsScores.PhyloP17Way"}},"conservation_phylop_max":{"max":{"field":"consequences.conservationsScores.PhyloP17Way"}},"cohort_rqdm_min":{"min":{"field":"frequencies.interne.AF"}},"cohort_rqdm_max":{"max":{"field":"frequencies.interne.AF"}},"cohort_gnomad_exomes_min":{"min":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_exomes_max":{"max":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_genomes_min":{"min":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_gnomad_genomes_max":{"max":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_exac_min":{"min":{"field":"frequencies.ExAc.AF"}},"cohort_exac_max":{"max":{"field":"frequencies.ExAc.AF"}},"cohort_uk10k_min":{"min":{"field":"frequencies.Uk10k.AF"}},"cohort_uk10k_max":{"max":{"field":"frequencies.Uk10k.AF"}},"cohort_1000gp3_min":{"min":{"field":"frequencies.1000Gp3.AF"}},"cohort_1000gp3_max":{"max":{"field":"frequencies.1000Gp3.AF"}}},"filter":{"bool":{}}},"nested_donors":{"nested":{"path":"donors"},"aggs":{"filtered":{"filter":{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}},"aggs":{"exomiser_score_min":{"min":{"field":"donors.exomiserScore"}},"exomiser_score_max":{"max":{"field":"donors.exomiserScore"}},"transmission":{"terms":{"field":"donors.transmission.keyword","order":{"_count":"desc"},"size":9}},"zygosity":{"terms":{"field":"donors.zygosity.keyword","order":{"_count":"desc"},"size":9}},"metric_depth_quality_min":{"min":{"field":"donors.qd"}},"metric_depth_quality_max":{"max":{"field":"donors.qd"}},"metric_allelic_alt_depth_min":{"min":{"field":"donors.adAlt"}},"metric_allelic_alt_depth_max":{"max":{"field":"donors.adAlt"}},"metric_total_depth_min":{"min":{"field":"donors.adTotal"}},"metric_total_depth_max":{"max":{"field":"donors.adTotal"}},"metric_ratio_min":{"min":{"field":"donors.adFreq"}},"metric_ratio_max":{"max":{"field":"donors.adFreq"}},"metric_genotype_quality_min":{"min":{"field":"donors.gq"}},"metric_genotype_quality_max":{"max":{"field":"donors.gq"}}}}}}}}
            )
        } )

        it( 'should contain ACL for Administrator role in Query Count translation', () => {
            const countQuery = generateCountQuery( PATIENT_ID, EMPTY_STATEMENT, EMPTY_STATEMENT_QUERY, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( countQuery ).to.eql(
                {"query":{"bool":{"filter":[{"term":{"donors.patientId.keyword":"PA00001"}}]}}}
            )
        } )

        it( 'should contain ACL for Genetician role Query Count translation', () => {
            const countQuery = generateCountQuery( PATIENT_ID, EMPTY_STATEMENT, EMPTY_STATEMENT_QUERY, GENETICIAN_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( countQuery ).to.eql(
                {"query":{"bool":{"filter":[[{"term":{"donors.organizationId.keyword":"OR00203"}}],{"term":{"donors.patientId.keyword":"PA00001"}}]}}}
            )
        } )

        it( 'should contain ACL for Practitioner role in Query Count translation', () => {
            const countQuery = generateCountQuery( PATIENT_ID, EMPTY_STATEMENT, EMPTY_STATEMENT_QUERY, PRACTITIONER_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( countQuery ).to.eql(
                {"query":{"bool":{"filter":[[{"term":{"donors.practitionerId.keyword":"PR00603"}}],{"term":{"donors.patientId.keyword":"PA00001"}}]}}}
            )
        } )

        it( 'should contain ACL for Administrator role in Query Search translation', () => {
            const variantQuery = generateVariantQuery( PATIENT_ID, EMPTY_STATEMENT, EMPTY_STATEMENT_QUERY, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT )
            expect( variantQuery ).to.eql(
                {"from":0,"size":25,"query":{"bool":{"filter":[{"term":{"donors.patientId.keyword":"PA00001"}}]}},"sort":[{"donors.exomiserScore":{"order":"desc","nested":{"path":"donors","filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}},{"impactScore":{"order":"desc"}}]}
            )
        } )

        it( 'should contain ACL for Genetician role in Query Search translation', () => {
            const variantQuery = generateVariantQuery( PATIENT_ID, EMPTY_STATEMENT, EMPTY_STATEMENT_QUERY, GENETICIAN_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT )
            expect( variantQuery ).to.eql(
                {"from":0,"size":25,"query":{"bool":{"filter":[[{"term":{"donors.organizationId.keyword":"OR00203"}}],{"term":{"donors.patientId.keyword":"PA00001"}}]}},"sort":[{"donors.exomiserScore":{"order":"desc","nested":{"path":"donors","filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}},{"impactScore":{"order":"desc"}}]}
            )
        } )

        it( 'should contain ACL for Practitioner role in Query Search translation', () => {
            const variantQuery = generateVariantQuery( PATIENT_ID, EMPTY_STATEMENT, EMPTY_STATEMENT_QUERY, PRACTITIONER_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT )
            expect( variantQuery ).to.eql(
                {"from":0,"size":25,"query":{"bool":{"filter":[[{"term":{"donors.practitionerId.keyword":"PR00603"}}],{"term":{"donors.patientId.keyword":"PA00001"}}]}},"sort":[{"donors.exomiserScore":{"order":"desc","nested":{"path":"donors","filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}},{"impactScore":{"order":"desc"}}]}
            )
        } )
    } )

    describe( 'Solo Generic 1:1', () => {
        const statementSingleUnionOneQueryKey = uniqid();
        const statementSingleUnionOne = [
            {
                "key": statementSingleUnionOneQueryKey,
                "title": "Query 1",
                "instructions": [
                    {
                        "type": "filter",
                        "data": {
                            "id": "variant_type",
                            "type": "generic",
                            "operand": "one",
                            "values": [
                                "SNV"
                            ]
                        }
                    }
                ]
            }
        ]
        const statementMultipleUnionQueryKey = uniqid();
        const statementMultipleUnion = [
            {
                "key": statementMultipleUnionQueryKey,
                "title": "Query 2",
                "instructions": [
                    {
                        "type": "filter",
                        "data": {
                            "id": "variant_type",
                            "type": "generic",
                            "operand": "one",
                            "values": [
                                "SNV",
                                "deletion"
                            ]
                        }
                    }
                ]
            }
        ]
        const statementMultipleIntersectionQueryKey = uniqid();
        const statementMultipleIntersection = [
            {
                "key": statementMultipleIntersectionQueryKey,
                "title": "Query 3",
                "instructions": [
                    {
                        "type": "filter",
                        "data": {
                            "id": "variant_type",
                            "type": "generic",
                            "operand": "all",
                            "values": [
                                "SNV",
                                "deletion"
                            ]
                        }
                    }
                ]
            }
        ]
        const statementSingleUnionTwoQueryKey = uniqid();
        const statementSingleUnionTwo = [
            {
                "key": statementSingleUnionTwoQueryKey,
                "title": "Query 4",
                "instructions": [
                    {
                        "type": "filter",
                        "data": {
                            "id": "variant_type",
                            "type": "generic",
                            "operand": "one",
                            "values": [
                                "deletion"
                            ]
                        }
                    }
                ]
            }
        ]
        const statementCombinedUnionQueryKey = uniqid();
        const statementCombinedUnion = [
            statementSingleUnionOne[0],
            statementSingleUnionTwo[0],
            {
                "key": statementCombinedUnionQueryKey,
                "title": "Query 5",
                "instructions": [
                    {
                        "type": "subquery",
                        "data": {
                            "query": statementSingleUnionOneQueryKey
                        }
                    },
                    {
                        "type": "operator",
                        "data": {
                            "type": "or"
                        }
                    },
                    {
                        "type": "subquery",
                        "data": {
                            "query": statementSingleUnionTwoQueryKey
                        }
                    }
                ]
            }
        ]
        const statementCombinedIntersectionQueryKey = uniqid();
        const statementCombinedIntersection = [
            statementSingleUnionOne[0],
            statementSingleUnionTwo[0],
            {
                "key": statementCombinedIntersectionQueryKey,
                "title": "Query 6",
                "instructions": [
                    {
                        "type": "subquery",
                        "data": {
                            "query": statementSingleUnionOneQueryKey
                        }
                    },
                    {
                        "type": "operator",
                        "data": {
                            "type": "and"
                        }
                    },
                    {
                        "type": "subquery",
                        "data": {
                            "query": statementSingleUnionTwoQueryKey
                        }
                    }
                ]
            }
        ]
        const statementSingleExclusionQueryKey = uniqid();
        const statementSingleExclusion = [
            {
                "key": statementSingleExclusionQueryKey,
                "title": "Query 7",
                "instructions": [
                    {
                        "type": "filter",
                        "data": {
                            "id": "variant_type",
                            "type": "generic",
                            "operand": "none",
                            "values": [
                                "insertion"
                            ]
                        }
                    }
                ]
            }
        ]

        it( 'should return correct translation for single union in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery( PATIENT_ID, statementSingleUnionOne, statementSingleUnionOneQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( facetQuery ).to.eql(
                {"size":0,"query":{"bool":{"filter":[{"bool":{"should":[{"term":{"type.keyword":"SNV"}}],"minimum_should_match":1}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"aggs":{"filtered":{"aggs":{"variant_type":{"terms":{"field":"type.keyword","order":{"_count":"desc"},"size":999}},"consequence":{"terms":{"field":"consequences.consequence.keyword","order":{"_count":"desc"},"size":999}},"extdb_pubmed":{"terms":{"field":"availableDbExt.pubmed","size":1}},"extdb_clinvar":{"terms":{"field":"availableDbExt.clinvar","size":1}},"extdb_dbsnp":{"terms":{"field":"availableDbExt.dbSNP","size":1}},"chromosome":{"terms":{"field":"chrom.keyword","order":{"_count":"desc"},"size":24}},"gene_type":{"terms":{"field":"genes.biotype.keyword","order":{"_count":"desc"},"size":999}},"extref_hpo":{"terms":{"field":"availableDbExt.hpo","size":1}},"extref_orphanet":{"terms":{"field":"availableDbExt.orphanet","size":1}},"extref_radboudumc":{"terms":{"field":"availableDbExt.radboudumc","size":1}},"extref_omim":{"terms":{"field":"availableDbExt.omim","size":1}},"gene_hpo":{"terms":{"field":"genes.hpo.keyword","order":{"_count":"desc"},"size":9999}},"genegroup_radboud":{"terms":{"field":"genes.radboudumc.keyword","order":{"_count":"desc"},"size":999}},"genegroup_orphanet":{"terms":{"field":"genes.orphanet.panel.keyword","order":{"_count":"desc"},"size":999}},"clinvar_clinsig":{"terms":{"field":"clinvar.clinvar_clinsig.keyword","order":{"_count":"desc"},"size":999}},"impact":{"terms":{"field":"consequences.impact.keyword","order":{"_count":"desc"},"size":999}},"prediction_fathmm":{"terms":{"field":"consequences.predictions.FATHMM.keyword","order":{"_count":"desc"},"size":9}},"prediction_fathmm_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_fathmm_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift":{"terms":{"field":"consequences.predictions.SIFT.keyword","order":{"_count":"desc"},"size":9}},"prediction_sift_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_polyphen2_hvar":{"terms":{"field":"consequences.predictions.Polyphen2_HVAR_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_polyphen2_hvar_min":{"min":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_polyphen2_hvar_max":{"max":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_lrt":{"terms":{"field":"consequences.predictions.LRT_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_lrt_min":{"min":{"field":"consequences.predictions.LRT_score"}},"prediction_lrt_max":{"max":{"field":"consequences.predictions.LRT_score"}},"prediction_dann_min":{"min":{"field":"consequences.predictions.DANN_score"}},"prediction_dann_max":{"max":{"field":"consequences.predictions.DANN_score"}},"prediction_cadd_min":{"min":{"field":"consequences.predictions.CADD_score"}},"prediction_cadd_max":{"max":{"field":"consequences.predictions.CADD_score"}},"prediction_revel_min":{"min":{"field":"consequences.predictions.REVEL_score"}},"prediction_revel_max":{"max":{"field":"consequences.predictions.REVEL_score"}},"conservation_phylop_min":{"min":{"field":"consequences.conservationsScores.PhyloP17Way"}},"conservation_phylop_max":{"max":{"field":"consequences.conservationsScores.PhyloP17Way"}},"cohort_rqdm_min":{"min":{"field":"frequencies.interne.AF"}},"cohort_rqdm_max":{"max":{"field":"frequencies.interne.AF"}},"cohort_gnomad_exomes_min":{"min":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_exomes_max":{"max":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_genomes_min":{"min":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_gnomad_genomes_max":{"max":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_exac_min":{"min":{"field":"frequencies.ExAc.AF"}},"cohort_exac_max":{"max":{"field":"frequencies.ExAc.AF"}},"cohort_uk10k_min":{"min":{"field":"frequencies.Uk10k.AF"}},"cohort_uk10k_max":{"max":{"field":"frequencies.Uk10k.AF"}},"cohort_1000gp3_min":{"min":{"field":"frequencies.1000Gp3.AF"}},"cohort_1000gp3_max":{"max":{"field":"frequencies.1000Gp3.AF"}}},"filter":{"bool":{}}},"nested_donors":{"nested":{"path":"donors"},"aggs":{"filtered":{"filter":{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}},"aggs":{"exomiser_score_min":{"min":{"field":"donors.exomiserScore"}},"exomiser_score_max":{"max":{"field":"donors.exomiserScore"}},"transmission":{"terms":{"field":"donors.transmission.keyword","order":{"_count":"desc"},"size":9}},"zygosity":{"terms":{"field":"donors.zygosity.keyword","order":{"_count":"desc"},"size":9}},"metric_depth_quality_min":{"min":{"field":"donors.qd"}},"metric_depth_quality_max":{"max":{"field":"donors.qd"}},"metric_allelic_alt_depth_min":{"min":{"field":"donors.adAlt"}},"metric_allelic_alt_depth_max":{"max":{"field":"donors.adAlt"}},"metric_total_depth_min":{"min":{"field":"donors.adTotal"}},"metric_total_depth_max":{"max":{"field":"donors.adTotal"}},"metric_ratio_min":{"min":{"field":"donors.adFreq"}},"metric_ratio_max":{"max":{"field":"donors.adFreq"}},"metric_genotype_quality_min":{"min":{"field":"donors.gq"}},"metric_genotype_quality_max":{"max":{"field":"donors.gq"}}}}}},"variant_type":{"global":{},"aggs":{"filtered_except_variant_type":{"filter":{"bool":{"filter":[{"bool":{"should":[],"minimum_should_match":1}},{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}]}},"aggs":{"variant_type":{"terms":{"field":"type.keyword","order":{"_count":"desc"},"size":999}}}}}}}}
            )
        } )

        it( 'should return correct translation for single union in Query Count translation', () => {
            const countQuery = generateCountQuery( PATIENT_ID, statementSingleUnionOne, statementSingleUnionOneQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( countQuery ).to.eql(
                {"query":{"bool":{"filter":[{"bool":{"should":[{"term":{"type.keyword":"SNV"}}],"minimum_should_match":1}},{"term":{"donors.patientId.keyword":"PA00001"}}]}}}
            )
        } )

        it( 'should return correct translation for single union in Query Search translation', () => {
            const variantQuery = generateVariantQuery( PATIENT_ID, statementSingleUnionOne, statementSingleUnionOneQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT )
            expect( variantQuery ).to.eql(
                {"from":0,"size":25,"query":{"bool":{"filter":[{"bool":{"should":[{"term":{"type.keyword":"SNV"}}],"minimum_should_match":1}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"sort":[{"donors.exomiserScore":{"order":"desc","nested":{"path":"donors","filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}},{"impactScore":{"order":"desc"}}]}
            )
        } )

        it( 'should return correct translation for single exclusion in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery( PATIENT_ID, statementSingleExclusion, statementSingleExclusionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( facetQuery ).to.eql(
                {"size":0,"query":{"bool":{"filter":[{"bool":{"must_not":[{"term":{"type.keyword":"insertion"}}]}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"aggs":{"filtered":{"aggs":{"variant_type":{"terms":{"field":"type.keyword","order":{"_count":"desc"},"size":999}},"consequence":{"terms":{"field":"consequences.consequence.keyword","order":{"_count":"desc"},"size":999}},"extdb_pubmed":{"terms":{"field":"availableDbExt.pubmed","size":1}},"extdb_clinvar":{"terms":{"field":"availableDbExt.clinvar","size":1}},"extdb_dbsnp":{"terms":{"field":"availableDbExt.dbSNP","size":1}},"chromosome":{"terms":{"field":"chrom.keyword","order":{"_count":"desc"},"size":24}},"gene_type":{"terms":{"field":"genes.biotype.keyword","order":{"_count":"desc"},"size":999}},"extref_hpo":{"terms":{"field":"availableDbExt.hpo","size":1}},"extref_orphanet":{"terms":{"field":"availableDbExt.orphanet","size":1}},"extref_radboudumc":{"terms":{"field":"availableDbExt.radboudumc","size":1}},"extref_omim":{"terms":{"field":"availableDbExt.omim","size":1}},"gene_hpo":{"terms":{"field":"genes.hpo.keyword","order":{"_count":"desc"},"size":9999}},"genegroup_radboud":{"terms":{"field":"genes.radboudumc.keyword","order":{"_count":"desc"},"size":999}},"genegroup_orphanet":{"terms":{"field":"genes.orphanet.panel.keyword","order":{"_count":"desc"},"size":999}},"clinvar_clinsig":{"terms":{"field":"clinvar.clinvar_clinsig.keyword","order":{"_count":"desc"},"size":999}},"impact":{"terms":{"field":"consequences.impact.keyword","order":{"_count":"desc"},"size":999}},"prediction_fathmm":{"terms":{"field":"consequences.predictions.FATHMM.keyword","order":{"_count":"desc"},"size":9}},"prediction_fathmm_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_fathmm_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift":{"terms":{"field":"consequences.predictions.SIFT.keyword","order":{"_count":"desc"},"size":9}},"prediction_sift_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_polyphen2_hvar":{"terms":{"field":"consequences.predictions.Polyphen2_HVAR_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_polyphen2_hvar_min":{"min":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_polyphen2_hvar_max":{"max":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_lrt":{"terms":{"field":"consequences.predictions.LRT_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_lrt_min":{"min":{"field":"consequences.predictions.LRT_score"}},"prediction_lrt_max":{"max":{"field":"consequences.predictions.LRT_score"}},"prediction_dann_min":{"min":{"field":"consequences.predictions.DANN_score"}},"prediction_dann_max":{"max":{"field":"consequences.predictions.DANN_score"}},"prediction_cadd_min":{"min":{"field":"consequences.predictions.CADD_score"}},"prediction_cadd_max":{"max":{"field":"consequences.predictions.CADD_score"}},"prediction_revel_min":{"min":{"field":"consequences.predictions.REVEL_score"}},"prediction_revel_max":{"max":{"field":"consequences.predictions.REVEL_score"}},"conservation_phylop_min":{"min":{"field":"consequences.conservationsScores.PhyloP17Way"}},"conservation_phylop_max":{"max":{"field":"consequences.conservationsScores.PhyloP17Way"}},"cohort_rqdm_min":{"min":{"field":"frequencies.interne.AF"}},"cohort_rqdm_max":{"max":{"field":"frequencies.interne.AF"}},"cohort_gnomad_exomes_min":{"min":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_exomes_max":{"max":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_genomes_min":{"min":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_gnomad_genomes_max":{"max":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_exac_min":{"min":{"field":"frequencies.ExAc.AF"}},"cohort_exac_max":{"max":{"field":"frequencies.ExAc.AF"}},"cohort_uk10k_min":{"min":{"field":"frequencies.Uk10k.AF"}},"cohort_uk10k_max":{"max":{"field":"frequencies.Uk10k.AF"}},"cohort_1000gp3_min":{"min":{"field":"frequencies.1000Gp3.AF"}},"cohort_1000gp3_max":{"max":{"field":"frequencies.1000Gp3.AF"}}},"filter":{"bool":{}}},"nested_donors":{"nested":{"path":"donors"},"aggs":{"filtered":{"filter":{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}},"aggs":{"exomiser_score_min":{"min":{"field":"donors.exomiserScore"}},"exomiser_score_max":{"max":{"field":"donors.exomiserScore"}},"transmission":{"terms":{"field":"donors.transmission.keyword","order":{"_count":"desc"},"size":9}},"zygosity":{"terms":{"field":"donors.zygosity.keyword","order":{"_count":"desc"},"size":9}},"metric_depth_quality_min":{"min":{"field":"donors.qd"}},"metric_depth_quality_max":{"max":{"field":"donors.qd"}},"metric_allelic_alt_depth_min":{"min":{"field":"donors.adAlt"}},"metric_allelic_alt_depth_max":{"max":{"field":"donors.adAlt"}},"metric_total_depth_min":{"min":{"field":"donors.adTotal"}},"metric_total_depth_max":{"max":{"field":"donors.adTotal"}},"metric_ratio_min":{"min":{"field":"donors.adFreq"}},"metric_ratio_max":{"max":{"field":"donors.adFreq"}},"metric_genotype_quality_min":{"min":{"field":"donors.gq"}},"metric_genotype_quality_max":{"max":{"field":"donors.gq"}}}}}},"variant_type":{"global":{},"aggs":{"filtered_except_variant_type":{"filter":{"bool":{"filter":[{"bool":{"must_not":[]}},{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}]}},"aggs":{"variant_type":{"terms":{"field":"type.keyword","order":{"_count":"desc"},"size":999}}}}}}}}
            )
        } )

        it( 'should return correct translation for single exclusion in Query Count translation', () => {
            const countQuery = generateCountQuery( PATIENT_ID, statementSingleExclusion, statementSingleExclusionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( countQuery ).to.eql(
                {"query":{"bool":{"filter":[{"bool":{"must_not":[{"term":{"type.keyword":"insertion"}}]}},{"term":{"donors.patientId.keyword":"PA00001"}}]}}}
            )
        } )

        it( 'should return correct translation for single exclusion in Query Search translation', () => {
            const variantQuery = generateVariantQuery( PATIENT_ID, statementSingleExclusion, statementSingleExclusionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT )
            expect( variantQuery ).to.eql(
                {"from":0,"size":25,"query":{"bool":{"filter":[{"bool":{"must_not":[{"term":{"type.keyword":"insertion"}}]}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"sort":[{"donors.exomiserScore":{"order":"desc","nested":{"path":"donors","filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}},{"impactScore":{"order":"desc"}}]}
            )
        } )

        it( 'should return correct translation for multiple union in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery( PATIENT_ID, statementMultipleUnion, statementMultipleUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( facetQuery ).to.eql(
                {"size":0,"query":{"bool":{"filter":[{"bool":{"should":[{"term":{"type.keyword":"SNV"}},{"term":{"type.keyword":"deletion"}}],"minimum_should_match":1}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"aggs":{"filtered":{"aggs":{"variant_type":{"terms":{"field":"type.keyword","order":{"_count":"desc"},"size":999}},"consequence":{"terms":{"field":"consequences.consequence.keyword","order":{"_count":"desc"},"size":999}},"extdb_pubmed":{"terms":{"field":"availableDbExt.pubmed","size":1}},"extdb_clinvar":{"terms":{"field":"availableDbExt.clinvar","size":1}},"extdb_dbsnp":{"terms":{"field":"availableDbExt.dbSNP","size":1}},"chromosome":{"terms":{"field":"chrom.keyword","order":{"_count":"desc"},"size":24}},"gene_type":{"terms":{"field":"genes.biotype.keyword","order":{"_count":"desc"},"size":999}},"extref_hpo":{"terms":{"field":"availableDbExt.hpo","size":1}},"extref_orphanet":{"terms":{"field":"availableDbExt.orphanet","size":1}},"extref_radboudumc":{"terms":{"field":"availableDbExt.radboudumc","size":1}},"extref_omim":{"terms":{"field":"availableDbExt.omim","size":1}},"gene_hpo":{"terms":{"field":"genes.hpo.keyword","order":{"_count":"desc"},"size":9999}},"genegroup_radboud":{"terms":{"field":"genes.radboudumc.keyword","order":{"_count":"desc"},"size":999}},"genegroup_orphanet":{"terms":{"field":"genes.orphanet.panel.keyword","order":{"_count":"desc"},"size":999}},"clinvar_clinsig":{"terms":{"field":"clinvar.clinvar_clinsig.keyword","order":{"_count":"desc"},"size":999}},"impact":{"terms":{"field":"consequences.impact.keyword","order":{"_count":"desc"},"size":999}},"prediction_fathmm":{"terms":{"field":"consequences.predictions.FATHMM.keyword","order":{"_count":"desc"},"size":9}},"prediction_fathmm_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_fathmm_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift":{"terms":{"field":"consequences.predictions.SIFT.keyword","order":{"_count":"desc"},"size":9}},"prediction_sift_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_polyphen2_hvar":{"terms":{"field":"consequences.predictions.Polyphen2_HVAR_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_polyphen2_hvar_min":{"min":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_polyphen2_hvar_max":{"max":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_lrt":{"terms":{"field":"consequences.predictions.LRT_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_lrt_min":{"min":{"field":"consequences.predictions.LRT_score"}},"prediction_lrt_max":{"max":{"field":"consequences.predictions.LRT_score"}},"prediction_dann_min":{"min":{"field":"consequences.predictions.DANN_score"}},"prediction_dann_max":{"max":{"field":"consequences.predictions.DANN_score"}},"prediction_cadd_min":{"min":{"field":"consequences.predictions.CADD_score"}},"prediction_cadd_max":{"max":{"field":"consequences.predictions.CADD_score"}},"prediction_revel_min":{"min":{"field":"consequences.predictions.REVEL_score"}},"prediction_revel_max":{"max":{"field":"consequences.predictions.REVEL_score"}},"conservation_phylop_min":{"min":{"field":"consequences.conservationsScores.PhyloP17Way"}},"conservation_phylop_max":{"max":{"field":"consequences.conservationsScores.PhyloP17Way"}},"cohort_rqdm_min":{"min":{"field":"frequencies.interne.AF"}},"cohort_rqdm_max":{"max":{"field":"frequencies.interne.AF"}},"cohort_gnomad_exomes_min":{"min":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_exomes_max":{"max":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_genomes_min":{"min":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_gnomad_genomes_max":{"max":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_exac_min":{"min":{"field":"frequencies.ExAc.AF"}},"cohort_exac_max":{"max":{"field":"frequencies.ExAc.AF"}},"cohort_uk10k_min":{"min":{"field":"frequencies.Uk10k.AF"}},"cohort_uk10k_max":{"max":{"field":"frequencies.Uk10k.AF"}},"cohort_1000gp3_min":{"min":{"field":"frequencies.1000Gp3.AF"}},"cohort_1000gp3_max":{"max":{"field":"frequencies.1000Gp3.AF"}}},"filter":{"bool":{}}},"nested_donors":{"nested":{"path":"donors"},"aggs":{"filtered":{"filter":{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}},"aggs":{"exomiser_score_min":{"min":{"field":"donors.exomiserScore"}},"exomiser_score_max":{"max":{"field":"donors.exomiserScore"}},"transmission":{"terms":{"field":"donors.transmission.keyword","order":{"_count":"desc"},"size":9}},"zygosity":{"terms":{"field":"donors.zygosity.keyword","order":{"_count":"desc"},"size":9}},"metric_depth_quality_min":{"min":{"field":"donors.qd"}},"metric_depth_quality_max":{"max":{"field":"donors.qd"}},"metric_allelic_alt_depth_min":{"min":{"field":"donors.adAlt"}},"metric_allelic_alt_depth_max":{"max":{"field":"donors.adAlt"}},"metric_total_depth_min":{"min":{"field":"donors.adTotal"}},"metric_total_depth_max":{"max":{"field":"donors.adTotal"}},"metric_ratio_min":{"min":{"field":"donors.adFreq"}},"metric_ratio_max":{"max":{"field":"donors.adFreq"}},"metric_genotype_quality_min":{"min":{"field":"donors.gq"}},"metric_genotype_quality_max":{"max":{"field":"donors.gq"}}}}}},"variant_type":{"global":{},"aggs":{"filtered_except_variant_type":{"filter":{"bool":{"filter":[{"bool":{"should":[],"minimum_should_match":1}},{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}]}},"aggs":{"variant_type":{"terms":{"field":"type.keyword","order":{"_count":"desc"},"size":999}}}}}}}}
            )
        } )

        it( 'should return correct translation for multiple union in Query Count translation', () => {
            const countQuery = generateCountQuery( PATIENT_ID, statementMultipleUnion, statementMultipleUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( countQuery ).to.eql(
                {"query":{"bool":{"filter":[{"bool":{"should":[{"term":{"type.keyword":"SNV"}},{"term":{"type.keyword":"deletion"}}],"minimum_should_match":1}},{"term":{"donors.patientId.keyword":"PA00001"}}]}}}
            )
        } )

        it( 'should return correct translation for multiple union in Query Search translation', () => {
            const variantQuery = generateVariantQuery( PATIENT_ID, statementMultipleUnion, statementMultipleUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT )
            expect( variantQuery ).to.eql(
                {"from":0,"size":25,"query":{"bool":{"filter":[{"bool":{"should":[{"term":{"type.keyword":"SNV"}},{"term":{"type.keyword":"deletion"}}],"minimum_should_match":1}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"sort":[{"donors.exomiserScore":{"order":"desc","nested":{"path":"donors","filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}},{"impactScore":{"order":"desc"}}]}
            )
        } )

        it( 'should return correct translation for multiple intersection in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery( PATIENT_ID, statementMultipleIntersection, statementMultipleIntersectionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( facetQuery ).to.eql(
                {"size":0,"query":{"bool":{"filter":[{"bool":{"must":[{"term":{"type.keyword":"SNV"}},{"term":{"type.keyword":"deletion"}}]}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"aggs":{"filtered":{"aggs":{"variant_type":{"terms":{"field":"type.keyword","order":{"_count":"desc"},"size":999}},"consequence":{"terms":{"field":"consequences.consequence.keyword","order":{"_count":"desc"},"size":999}},"extdb_pubmed":{"terms":{"field":"availableDbExt.pubmed","size":1}},"extdb_clinvar":{"terms":{"field":"availableDbExt.clinvar","size":1}},"extdb_dbsnp":{"terms":{"field":"availableDbExt.dbSNP","size":1}},"chromosome":{"terms":{"field":"chrom.keyword","order":{"_count":"desc"},"size":24}},"gene_type":{"terms":{"field":"genes.biotype.keyword","order":{"_count":"desc"},"size":999}},"extref_hpo":{"terms":{"field":"availableDbExt.hpo","size":1}},"extref_orphanet":{"terms":{"field":"availableDbExt.orphanet","size":1}},"extref_radboudumc":{"terms":{"field":"availableDbExt.radboudumc","size":1}},"extref_omim":{"terms":{"field":"availableDbExt.omim","size":1}},"gene_hpo":{"terms":{"field":"genes.hpo.keyword","order":{"_count":"desc"},"size":9999}},"genegroup_radboud":{"terms":{"field":"genes.radboudumc.keyword","order":{"_count":"desc"},"size":999}},"genegroup_orphanet":{"terms":{"field":"genes.orphanet.panel.keyword","order":{"_count":"desc"},"size":999}},"clinvar_clinsig":{"terms":{"field":"clinvar.clinvar_clinsig.keyword","order":{"_count":"desc"},"size":999}},"impact":{"terms":{"field":"consequences.impact.keyword","order":{"_count":"desc"},"size":999}},"prediction_fathmm":{"terms":{"field":"consequences.predictions.FATHMM.keyword","order":{"_count":"desc"},"size":9}},"prediction_fathmm_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_fathmm_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift":{"terms":{"field":"consequences.predictions.SIFT.keyword","order":{"_count":"desc"},"size":9}},"prediction_sift_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_polyphen2_hvar":{"terms":{"field":"consequences.predictions.Polyphen2_HVAR_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_polyphen2_hvar_min":{"min":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_polyphen2_hvar_max":{"max":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_lrt":{"terms":{"field":"consequences.predictions.LRT_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_lrt_min":{"min":{"field":"consequences.predictions.LRT_score"}},"prediction_lrt_max":{"max":{"field":"consequences.predictions.LRT_score"}},"prediction_dann_min":{"min":{"field":"consequences.predictions.DANN_score"}},"prediction_dann_max":{"max":{"field":"consequences.predictions.DANN_score"}},"prediction_cadd_min":{"min":{"field":"consequences.predictions.CADD_score"}},"prediction_cadd_max":{"max":{"field":"consequences.predictions.CADD_score"}},"prediction_revel_min":{"min":{"field":"consequences.predictions.REVEL_score"}},"prediction_revel_max":{"max":{"field":"consequences.predictions.REVEL_score"}},"conservation_phylop_min":{"min":{"field":"consequences.conservationsScores.PhyloP17Way"}},"conservation_phylop_max":{"max":{"field":"consequences.conservationsScores.PhyloP17Way"}},"cohort_rqdm_min":{"min":{"field":"frequencies.interne.AF"}},"cohort_rqdm_max":{"max":{"field":"frequencies.interne.AF"}},"cohort_gnomad_exomes_min":{"min":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_exomes_max":{"max":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_genomes_min":{"min":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_gnomad_genomes_max":{"max":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_exac_min":{"min":{"field":"frequencies.ExAc.AF"}},"cohort_exac_max":{"max":{"field":"frequencies.ExAc.AF"}},"cohort_uk10k_min":{"min":{"field":"frequencies.Uk10k.AF"}},"cohort_uk10k_max":{"max":{"field":"frequencies.Uk10k.AF"}},"cohort_1000gp3_min":{"min":{"field":"frequencies.1000Gp3.AF"}},"cohort_1000gp3_max":{"max":{"field":"frequencies.1000Gp3.AF"}}},"filter":{"bool":{}}},"nested_donors":{"nested":{"path":"donors"},"aggs":{"filtered":{"filter":{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}},"aggs":{"exomiser_score_min":{"min":{"field":"donors.exomiserScore"}},"exomiser_score_max":{"max":{"field":"donors.exomiserScore"}},"transmission":{"terms":{"field":"donors.transmission.keyword","order":{"_count":"desc"},"size":9}},"zygosity":{"terms":{"field":"donors.zygosity.keyword","order":{"_count":"desc"},"size":9}},"metric_depth_quality_min":{"min":{"field":"donors.qd"}},"metric_depth_quality_max":{"max":{"field":"donors.qd"}},"metric_allelic_alt_depth_min":{"min":{"field":"donors.adAlt"}},"metric_allelic_alt_depth_max":{"max":{"field":"donors.adAlt"}},"metric_total_depth_min":{"min":{"field":"donors.adTotal"}},"metric_total_depth_max":{"max":{"field":"donors.adTotal"}},"metric_ratio_min":{"min":{"field":"donors.adFreq"}},"metric_ratio_max":{"max":{"field":"donors.adFreq"}},"metric_genotype_quality_min":{"min":{"field":"donors.gq"}},"metric_genotype_quality_max":{"max":{"field":"donors.gq"}}}}}},"variant_type":{"global":{},"aggs":{"filtered_except_variant_type":{"filter":{"bool":{"filter":[{"bool":{"must":[]}},{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}]}},"aggs":{"variant_type":{"terms":{"field":"type.keyword","order":{"_count":"desc"},"size":999}}}}}}}}
            )
        } )

        it( 'should return correct translation for multiple intersection in Query Count translation', () => {
            const countQuery = generateCountQuery( PATIENT_ID, statementMultipleIntersection, statementMultipleIntersectionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( countQuery ).to.eql(
                {"query":{"bool":{"filter":[{"bool":{"must":[{"term":{"type.keyword":"SNV"}},{"term":{"type.keyword":"deletion"}}]}},{"term":{"donors.patientId.keyword":"PA00001"}}]}}}
            )
        } )

        it( 'should return correct translation for multiple intersection in Query Search translation', () => {
            const variantQuery = generateVariantQuery( PATIENT_ID, statementMultipleIntersection, statementMultipleIntersectionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT )
            expect( variantQuery ).to.eql(
                {"from":0,"size":25,"query":{"bool":{"filter":[{"bool":{"must":[{"term":{"type.keyword":"SNV"}},{"term":{"type.keyword":"deletion"}}]}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"sort":[{"donors.exomiserScore":{"order":"desc","nested":{"path":"donors","filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}},{"impactScore":{"order":"desc"}}]}
            )
        } )

        it( 'should return correct translation for combined union in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery( PATIENT_ID, statementCombinedUnion, statementCombinedUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( facetQuery ).to.eql(
                {"size":0,"query":{"bool":{"filter":[{"bool":{"should":[{"bool":{"should":[{"term":{"type.keyword":"SNV"}}],"minimum_should_match":1}},{"bool":{"should":[{"term":{"type.keyword":"deletion"}}],"minimum_should_match":1}}],"minimum_should_match":1}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"aggs":{"filtered":{"aggs":{"variant_type":{"terms":{"field":"type.keyword","order":{"_count":"desc"},"size":999}},"consequence":{"terms":{"field":"consequences.consequence.keyword","order":{"_count":"desc"},"size":999}},"extdb_pubmed":{"terms":{"field":"availableDbExt.pubmed","size":1}},"extdb_clinvar":{"terms":{"field":"availableDbExt.clinvar","size":1}},"extdb_dbsnp":{"terms":{"field":"availableDbExt.dbSNP","size":1}},"chromosome":{"terms":{"field":"chrom.keyword","order":{"_count":"desc"},"size":24}},"gene_type":{"terms":{"field":"genes.biotype.keyword","order":{"_count":"desc"},"size":999}},"extref_hpo":{"terms":{"field":"availableDbExt.hpo","size":1}},"extref_orphanet":{"terms":{"field":"availableDbExt.orphanet","size":1}},"extref_radboudumc":{"terms":{"field":"availableDbExt.radboudumc","size":1}},"extref_omim":{"terms":{"field":"availableDbExt.omim","size":1}},"gene_hpo":{"terms":{"field":"genes.hpo.keyword","order":{"_count":"desc"},"size":9999}},"genegroup_radboud":{"terms":{"field":"genes.radboudumc.keyword","order":{"_count":"desc"},"size":999}},"genegroup_orphanet":{"terms":{"field":"genes.orphanet.panel.keyword","order":{"_count":"desc"},"size":999}},"clinvar_clinsig":{"terms":{"field":"clinvar.clinvar_clinsig.keyword","order":{"_count":"desc"},"size":999}},"impact":{"terms":{"field":"consequences.impact.keyword","order":{"_count":"desc"},"size":999}},"prediction_fathmm":{"terms":{"field":"consequences.predictions.FATHMM.keyword","order":{"_count":"desc"},"size":9}},"prediction_fathmm_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_fathmm_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift":{"terms":{"field":"consequences.predictions.SIFT.keyword","order":{"_count":"desc"},"size":9}},"prediction_sift_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_polyphen2_hvar":{"terms":{"field":"consequences.predictions.Polyphen2_HVAR_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_polyphen2_hvar_min":{"min":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_polyphen2_hvar_max":{"max":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_lrt":{"terms":{"field":"consequences.predictions.LRT_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_lrt_min":{"min":{"field":"consequences.predictions.LRT_score"}},"prediction_lrt_max":{"max":{"field":"consequences.predictions.LRT_score"}},"prediction_dann_min":{"min":{"field":"consequences.predictions.DANN_score"}},"prediction_dann_max":{"max":{"field":"consequences.predictions.DANN_score"}},"prediction_cadd_min":{"min":{"field":"consequences.predictions.CADD_score"}},"prediction_cadd_max":{"max":{"field":"consequences.predictions.CADD_score"}},"prediction_revel_min":{"min":{"field":"consequences.predictions.REVEL_score"}},"prediction_revel_max":{"max":{"field":"consequences.predictions.REVEL_score"}},"conservation_phylop_min":{"min":{"field":"consequences.conservationsScores.PhyloP17Way"}},"conservation_phylop_max":{"max":{"field":"consequences.conservationsScores.PhyloP17Way"}},"cohort_rqdm_min":{"min":{"field":"frequencies.interne.AF"}},"cohort_rqdm_max":{"max":{"field":"frequencies.interne.AF"}},"cohort_gnomad_exomes_min":{"min":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_exomes_max":{"max":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_genomes_min":{"min":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_gnomad_genomes_max":{"max":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_exac_min":{"min":{"field":"frequencies.ExAc.AF"}},"cohort_exac_max":{"max":{"field":"frequencies.ExAc.AF"}},"cohort_uk10k_min":{"min":{"field":"frequencies.Uk10k.AF"}},"cohort_uk10k_max":{"max":{"field":"frequencies.Uk10k.AF"}},"cohort_1000gp3_min":{"min":{"field":"frequencies.1000Gp3.AF"}},"cohort_1000gp3_max":{"max":{"field":"frequencies.1000Gp3.AF"}}},"filter":{"bool":{}}},"nested_donors":{"nested":{"path":"donors"},"aggs":{"filtered":{"filter":{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}},"aggs":{"exomiser_score_min":{"min":{"field":"donors.exomiserScore"}},"exomiser_score_max":{"max":{"field":"donors.exomiserScore"}},"transmission":{"terms":{"field":"donors.transmission.keyword","order":{"_count":"desc"},"size":9}},"zygosity":{"terms":{"field":"donors.zygosity.keyword","order":{"_count":"desc"},"size":9}},"metric_depth_quality_min":{"min":{"field":"donors.qd"}},"metric_depth_quality_max":{"max":{"field":"donors.qd"}},"metric_allelic_alt_depth_min":{"min":{"field":"donors.adAlt"}},"metric_allelic_alt_depth_max":{"max":{"field":"donors.adAlt"}},"metric_total_depth_min":{"min":{"field":"donors.adTotal"}},"metric_total_depth_max":{"max":{"field":"donors.adTotal"}},"metric_ratio_min":{"min":{"field":"donors.adFreq"}},"metric_ratio_max":{"max":{"field":"donors.adFreq"}},"metric_genotype_quality_min":{"min":{"field":"donors.gq"}},"metric_genotype_quality_max":{"max":{"field":"donors.gq"}}}}}},"variant_type":{"global":{},"aggs":{"filtered_except_variant_type":{"filter":{"bool":{"filter":[{"bool":{"should":[{"bool":{"should":[],"minimum_should_match":1}},{"bool":{"should":[],"minimum_should_match":1}}],"minimum_should_match":1}},{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}]}},"aggs":{"variant_type":{"terms":{"field":"type.keyword","order":{"_count":"desc"},"size":999}}}}}}}}
            )
        } )

        it( 'should return correct translation for combined union in Query Count translation', () => {
            const countQuery = generateCountQuery( PATIENT_ID, statementCombinedUnion, statementCombinedUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( countQuery ).to.eql(
                {"query":{"bool":{"filter":[{"bool":{"should":[{"bool":{"should":[{"term":{"type.keyword":"SNV"}}],"minimum_should_match":1}},{"bool":{"should":[{"term":{"type.keyword":"deletion"}}],"minimum_should_match":1}}],"minimum_should_match":1}},{"term":{"donors.patientId.keyword":"PA00001"}}]}}}
            )
        } )

        it( 'should return correct translation for combined union in Query Search translation', () => {
            const variantQuery = generateVariantQuery( PATIENT_ID, statementCombinedUnion, statementCombinedUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT )
            expect( variantQuery ).to.eql(
                {"from":0,"size":25,"query":{"bool":{"filter":[{"bool":{"should":[{"bool":{"should":[{"term":{"type.keyword":"SNV"}}],"minimum_should_match":1}},{"bool":{"should":[{"term":{"type.keyword":"deletion"}}],"minimum_should_match":1}}],"minimum_should_match":1}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"sort":[{"donors.exomiserScore":{"order":"desc","nested":{"path":"donors","filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}},{"impactScore":{"order":"desc"}}]}
            )
        } )

        it( 'should return correct translation for combined intersection in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery( PATIENT_ID, statementCombinedIntersection, statementCombinedIntersectionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( facetQuery ).to.eql(
                {"size":0,"query":{"bool":{"filter":[{"bool":{"must":[{"bool":{"should":[{"term":{"type.keyword":"SNV"}}],"minimum_should_match":1}},{"bool":{"should":[{"term":{"type.keyword":"deletion"}}],"minimum_should_match":1}}]}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"aggs":{"filtered":{"aggs":{"variant_type":{"terms":{"field":"type.keyword","order":{"_count":"desc"},"size":999}},"consequence":{"terms":{"field":"consequences.consequence.keyword","order":{"_count":"desc"},"size":999}},"extdb_pubmed":{"terms":{"field":"availableDbExt.pubmed","size":1}},"extdb_clinvar":{"terms":{"field":"availableDbExt.clinvar","size":1}},"extdb_dbsnp":{"terms":{"field":"availableDbExt.dbSNP","size":1}},"chromosome":{"terms":{"field":"chrom.keyword","order":{"_count":"desc"},"size":24}},"gene_type":{"terms":{"field":"genes.biotype.keyword","order":{"_count":"desc"},"size":999}},"extref_hpo":{"terms":{"field":"availableDbExt.hpo","size":1}},"extref_orphanet":{"terms":{"field":"availableDbExt.orphanet","size":1}},"extref_radboudumc":{"terms":{"field":"availableDbExt.radboudumc","size":1}},"extref_omim":{"terms":{"field":"availableDbExt.omim","size":1}},"gene_hpo":{"terms":{"field":"genes.hpo.keyword","order":{"_count":"desc"},"size":9999}},"genegroup_radboud":{"terms":{"field":"genes.radboudumc.keyword","order":{"_count":"desc"},"size":999}},"genegroup_orphanet":{"terms":{"field":"genes.orphanet.panel.keyword","order":{"_count":"desc"},"size":999}},"clinvar_clinsig":{"terms":{"field":"clinvar.clinvar_clinsig.keyword","order":{"_count":"desc"},"size":999}},"impact":{"terms":{"field":"consequences.impact.keyword","order":{"_count":"desc"},"size":999}},"prediction_fathmm":{"terms":{"field":"consequences.predictions.FATHMM.keyword","order":{"_count":"desc"},"size":9}},"prediction_fathmm_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_fathmm_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift":{"terms":{"field":"consequences.predictions.SIFT.keyword","order":{"_count":"desc"},"size":9}},"prediction_sift_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_polyphen2_hvar":{"terms":{"field":"consequences.predictions.Polyphen2_HVAR_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_polyphen2_hvar_min":{"min":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_polyphen2_hvar_max":{"max":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_lrt":{"terms":{"field":"consequences.predictions.LRT_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_lrt_min":{"min":{"field":"consequences.predictions.LRT_score"}},"prediction_lrt_max":{"max":{"field":"consequences.predictions.LRT_score"}},"prediction_dann_min":{"min":{"field":"consequences.predictions.DANN_score"}},"prediction_dann_max":{"max":{"field":"consequences.predictions.DANN_score"}},"prediction_cadd_min":{"min":{"field":"consequences.predictions.CADD_score"}},"prediction_cadd_max":{"max":{"field":"consequences.predictions.CADD_score"}},"prediction_revel_min":{"min":{"field":"consequences.predictions.REVEL_score"}},"prediction_revel_max":{"max":{"field":"consequences.predictions.REVEL_score"}},"conservation_phylop_min":{"min":{"field":"consequences.conservationsScores.PhyloP17Way"}},"conservation_phylop_max":{"max":{"field":"consequences.conservationsScores.PhyloP17Way"}},"cohort_rqdm_min":{"min":{"field":"frequencies.interne.AF"}},"cohort_rqdm_max":{"max":{"field":"frequencies.interne.AF"}},"cohort_gnomad_exomes_min":{"min":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_exomes_max":{"max":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_genomes_min":{"min":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_gnomad_genomes_max":{"max":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_exac_min":{"min":{"field":"frequencies.ExAc.AF"}},"cohort_exac_max":{"max":{"field":"frequencies.ExAc.AF"}},"cohort_uk10k_min":{"min":{"field":"frequencies.Uk10k.AF"}},"cohort_uk10k_max":{"max":{"field":"frequencies.Uk10k.AF"}},"cohort_1000gp3_min":{"min":{"field":"frequencies.1000Gp3.AF"}},"cohort_1000gp3_max":{"max":{"field":"frequencies.1000Gp3.AF"}}},"filter":{"bool":{}}},"nested_donors":{"nested":{"path":"donors"},"aggs":{"filtered":{"filter":{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}},"aggs":{"exomiser_score_min":{"min":{"field":"donors.exomiserScore"}},"exomiser_score_max":{"max":{"field":"donors.exomiserScore"}},"transmission":{"terms":{"field":"donors.transmission.keyword","order":{"_count":"desc"},"size":9}},"zygosity":{"terms":{"field":"donors.zygosity.keyword","order":{"_count":"desc"},"size":9}},"metric_depth_quality_min":{"min":{"field":"donors.qd"}},"metric_depth_quality_max":{"max":{"field":"donors.qd"}},"metric_allelic_alt_depth_min":{"min":{"field":"donors.adAlt"}},"metric_allelic_alt_depth_max":{"max":{"field":"donors.adAlt"}},"metric_total_depth_min":{"min":{"field":"donors.adTotal"}},"metric_total_depth_max":{"max":{"field":"donors.adTotal"}},"metric_ratio_min":{"min":{"field":"donors.adFreq"}},"metric_ratio_max":{"max":{"field":"donors.adFreq"}},"metric_genotype_quality_min":{"min":{"field":"donors.gq"}},"metric_genotype_quality_max":{"max":{"field":"donors.gq"}}}}}},"variant_type":{"global":{},"aggs":{"filtered_except_variant_type":{"filter":{"bool":{"filter":[{"bool":{"must":[{"bool":{"should":[],"minimum_should_match":1}},{"bool":{"should":[],"minimum_should_match":1}}]}},{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}]}},"aggs":{"variant_type":{"terms":{"field":"type.keyword","order":{"_count":"desc"},"size":999}}}}}}}}
            )
        } )

        it( 'should return correct translation for combined intersection in Query Count translation', () => {
            const countQuery = generateCountQuery( PATIENT_ID, statementCombinedIntersection, statementCombinedIntersectionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( countQuery ).to.eql(
                {"query":{"bool":{"filter":[{"bool":{"must":[{"bool":{"should":[{"term":{"type.keyword":"SNV"}}],"minimum_should_match":1}},{"bool":{"should":[{"term":{"type.keyword":"deletion"}}],"minimum_should_match":1}}]}},{"term":{"donors.patientId.keyword":"PA00001"}}]}}}
            )
        } )

        it( 'should return correct translation for combined intersection in Query Search translation', () => {
            const variantQuery = generateVariantQuery( PATIENT_ID, statementCombinedIntersection, statementCombinedIntersectionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT )
            expect( variantQuery ).to.eql(
                {"from":0,"size":25,"query":{"bool":{"filter":[{"bool":{"must":[{"bool":{"should":[{"term":{"type.keyword":"SNV"}}],"minimum_should_match":1}},{"bool":{"should":[{"term":{"type.keyword":"deletion"}}],"minimum_should_match":1}}]}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"sort":[{"donors.exomiserScore":{"order":"desc","nested":{"path":"donors","filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}},{"impactScore":{"order":"desc"}}]}
            )
        } )

    } )

    describe( 'Solo Generic 1:N', () => {
        const statementSingleUnionQueryKey = uniqid();
        const statementSingleUnion = [
            {
                "key": statementSingleUnionQueryKey,
                "title": "Query 1",
                "instructions": [
                    {
                        "type": "filter",
                        "data": {
                            "id": "genegroup_radboud",
                            "type": "generic",
                            "operand": "one",
                            "values": [
                                "Mendeloime Gene"
                            ]
                        }
                    }
                ]
            }
        ]

        it( 'should return correct translation for single union in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery( PATIENT_ID, statementSingleUnion, statementSingleUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( facetQuery ).to.eql(
                {"size":0,"query":{"bool":{"filter":[{"bool":{"should":[{"term":{"genes.radboudumc.keyword":"Mendeloime Gene"}}],"minimum_should_match":1}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"aggs":{"filtered":{"aggs":{"variant_type":{"terms":{"field":"type.keyword","order":{"_count":"desc"},"size":999}},"consequence":{"terms":{"field":"consequences.consequence.keyword","order":{"_count":"desc"},"size":999}},"extdb_pubmed":{"terms":{"field":"availableDbExt.pubmed","size":1}},"extdb_clinvar":{"terms":{"field":"availableDbExt.clinvar","size":1}},"extdb_dbsnp":{"terms":{"field":"availableDbExt.dbSNP","size":1}},"chromosome":{"terms":{"field":"chrom.keyword","order":{"_count":"desc"},"size":24}},"gene_type":{"terms":{"field":"genes.biotype.keyword","order":{"_count":"desc"},"size":999}},"extref_hpo":{"terms":{"field":"availableDbExt.hpo","size":1}},"extref_orphanet":{"terms":{"field":"availableDbExt.orphanet","size":1}},"extref_radboudumc":{"terms":{"field":"availableDbExt.radboudumc","size":1}},"extref_omim":{"terms":{"field":"availableDbExt.omim","size":1}},"gene_hpo":{"terms":{"field":"genes.hpo.keyword","order":{"_count":"desc"},"size":9999}},"genegroup_radboud":{"terms":{"field":"genes.radboudumc.keyword","order":{"_count":"desc"},"size":999}},"genegroup_orphanet":{"terms":{"field":"genes.orphanet.panel.keyword","order":{"_count":"desc"},"size":999}},"clinvar_clinsig":{"terms":{"field":"clinvar.clinvar_clinsig.keyword","order":{"_count":"desc"},"size":999}},"impact":{"terms":{"field":"consequences.impact.keyword","order":{"_count":"desc"},"size":999}},"prediction_fathmm":{"terms":{"field":"consequences.predictions.FATHMM.keyword","order":{"_count":"desc"},"size":9}},"prediction_fathmm_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_fathmm_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift":{"terms":{"field":"consequences.predictions.SIFT.keyword","order":{"_count":"desc"},"size":9}},"prediction_sift_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_polyphen2_hvar":{"terms":{"field":"consequences.predictions.Polyphen2_HVAR_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_polyphen2_hvar_min":{"min":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_polyphen2_hvar_max":{"max":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_lrt":{"terms":{"field":"consequences.predictions.LRT_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_lrt_min":{"min":{"field":"consequences.predictions.LRT_score"}},"prediction_lrt_max":{"max":{"field":"consequences.predictions.LRT_score"}},"prediction_dann_min":{"min":{"field":"consequences.predictions.DANN_score"}},"prediction_dann_max":{"max":{"field":"consequences.predictions.DANN_score"}},"prediction_cadd_min":{"min":{"field":"consequences.predictions.CADD_score"}},"prediction_cadd_max":{"max":{"field":"consequences.predictions.CADD_score"}},"prediction_revel_min":{"min":{"field":"consequences.predictions.REVEL_score"}},"prediction_revel_max":{"max":{"field":"consequences.predictions.REVEL_score"}},"conservation_phylop_min":{"min":{"field":"consequences.conservationsScores.PhyloP17Way"}},"conservation_phylop_max":{"max":{"field":"consequences.conservationsScores.PhyloP17Way"}},"cohort_rqdm_min":{"min":{"field":"frequencies.interne.AF"}},"cohort_rqdm_max":{"max":{"field":"frequencies.interne.AF"}},"cohort_gnomad_exomes_min":{"min":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_exomes_max":{"max":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_genomes_min":{"min":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_gnomad_genomes_max":{"max":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_exac_min":{"min":{"field":"frequencies.ExAc.AF"}},"cohort_exac_max":{"max":{"field":"frequencies.ExAc.AF"}},"cohort_uk10k_min":{"min":{"field":"frequencies.Uk10k.AF"}},"cohort_uk10k_max":{"max":{"field":"frequencies.Uk10k.AF"}},"cohort_1000gp3_min":{"min":{"field":"frequencies.1000Gp3.AF"}},"cohort_1000gp3_max":{"max":{"field":"frequencies.1000Gp3.AF"}}},"filter":{"bool":{}}},"nested_donors":{"nested":{"path":"donors"},"aggs":{"filtered":{"filter":{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}},"aggs":{"exomiser_score_min":{"min":{"field":"donors.exomiserScore"}},"exomiser_score_max":{"max":{"field":"donors.exomiserScore"}},"transmission":{"terms":{"field":"donors.transmission.keyword","order":{"_count":"desc"},"size":9}},"zygosity":{"terms":{"field":"donors.zygosity.keyword","order":{"_count":"desc"},"size":9}},"metric_depth_quality_min":{"min":{"field":"donors.qd"}},"metric_depth_quality_max":{"max":{"field":"donors.qd"}},"metric_allelic_alt_depth_min":{"min":{"field":"donors.adAlt"}},"metric_allelic_alt_depth_max":{"max":{"field":"donors.adAlt"}},"metric_total_depth_min":{"min":{"field":"donors.adTotal"}},"metric_total_depth_max":{"max":{"field":"donors.adTotal"}},"metric_ratio_min":{"min":{"field":"donors.adFreq"}},"metric_ratio_max":{"max":{"field":"donors.adFreq"}},"metric_genotype_quality_min":{"min":{"field":"donors.gq"}},"metric_genotype_quality_max":{"max":{"field":"donors.gq"}}}}}},"genegroup_radboud":{"global":{},"aggs":{"filtered_except_genegroup_radboud":{"filter":{"bool":{"filter":[{"bool":{"should":[],"minimum_should_match":1}},{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}]}},"aggs":{"genegroup_radboud":{"terms":{"field":"genes.radboudumc.keyword","order":{"_count":"desc"},"size":999}}}}}}}}
            )
        } )

        it( 'should return correct translation for single union in Query Count translation', () => {
            const countQuery = generateCountQuery( PATIENT_ID, statementSingleUnion, statementSingleUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( countQuery ).to.eql(
                {"query":{"bool":{"filter":[{"bool":{"should":[{"term":{"genes.radboudumc.keyword":"Mendeloime Gene"}}],"minimum_should_match":1}},{"term":{"donors.patientId.keyword":"PA00001"}}]}}}
            )
        } )

        it( 'should return correct translation for single union in Query Search translation', () => {
            const variantQuery = generateVariantQuery( PATIENT_ID, statementSingleUnion, statementSingleUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT )
            expect( variantQuery ).to.eql(
                {"from":0,"size":25,"query":{"bool":{"filter":[{"bool":{"should":[{"term":{"genes.radboudumc.keyword":"Mendeloime Gene"}}],"minimum_should_match":1}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"sort":[{"donors.exomiserScore":{"order":"desc","nested":{"path":"donors","filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}},{"impactScore":{"order":"desc"}}]}
            )
        } )

    } )

    describe( 'Solo Generic Boolean', () => {
        const statementSingleUnionQueryKey = uniqid();
        const statementSingleUnion = [
            {
                "key": statementSingleUnionQueryKey,
                "title": "Query 1",
                "instructions": [
                    {
                        "type": "filter",
                        "data": {
                            "id": "extref",
                            "type": "genericbool",
                            "values": [
                                "extref_hpo"
                            ]
                        }
                    }
                ]
            }
        ]
        const statementMultipleUnionQueryKey = uniqid();
        const statementMultipleUnion = [
            {
                "key": statementMultipleUnionQueryKey,
                "title": "Query 2",
                "instructions": [
                    {
                        "type": "filter",
                        "data": {
                            "id": "extref",
                            "type": "genericbool",
                            "values": [
                                "extref_hpo",
                                "extref_radboudumc"
                            ]
                        }
                    }
                ]
            }
        ]

        it( 'should return correct translation for single union in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery( PATIENT_ID, statementSingleUnion, statementSingleUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( facetQuery ).to.eql(
                {"size":0,"query":{"bool":{"filter":[{"bool":{"should":[{"term":{"availableDbExt.hpo":true}}],"minimum_should_match":1}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"aggs":{"filtered":{"aggs":{"variant_type":{"terms":{"field":"type.keyword","order":{"_count":"desc"},"size":999}},"consequence":{"terms":{"field":"consequences.consequence.keyword","order":{"_count":"desc"},"size":999}},"extdb_pubmed":{"terms":{"field":"availableDbExt.pubmed","size":1}},"extdb_clinvar":{"terms":{"field":"availableDbExt.clinvar","size":1}},"extdb_dbsnp":{"terms":{"field":"availableDbExt.dbSNP","size":1}},"chromosome":{"terms":{"field":"chrom.keyword","order":{"_count":"desc"},"size":24}},"gene_type":{"terms":{"field":"genes.biotype.keyword","order":{"_count":"desc"},"size":999}},"extref_hpo":{"terms":{"field":"availableDbExt.hpo","size":1}},"extref_orphanet":{"terms":{"field":"availableDbExt.orphanet","size":1}},"extref_radboudumc":{"terms":{"field":"availableDbExt.radboudumc","size":1}},"extref_omim":{"terms":{"field":"availableDbExt.omim","size":1}},"gene_hpo":{"terms":{"field":"genes.hpo.keyword","order":{"_count":"desc"},"size":9999}},"genegroup_radboud":{"terms":{"field":"genes.radboudumc.keyword","order":{"_count":"desc"},"size":999}},"genegroup_orphanet":{"terms":{"field":"genes.orphanet.panel.keyword","order":{"_count":"desc"},"size":999}},"clinvar_clinsig":{"terms":{"field":"clinvar.clinvar_clinsig.keyword","order":{"_count":"desc"},"size":999}},"impact":{"terms":{"field":"consequences.impact.keyword","order":{"_count":"desc"},"size":999}},"prediction_fathmm":{"terms":{"field":"consequences.predictions.FATHMM.keyword","order":{"_count":"desc"},"size":9}},"prediction_fathmm_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_fathmm_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift":{"terms":{"field":"consequences.predictions.SIFT.keyword","order":{"_count":"desc"},"size":9}},"prediction_sift_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_polyphen2_hvar":{"terms":{"field":"consequences.predictions.Polyphen2_HVAR_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_polyphen2_hvar_min":{"min":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_polyphen2_hvar_max":{"max":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_lrt":{"terms":{"field":"consequences.predictions.LRT_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_lrt_min":{"min":{"field":"consequences.predictions.LRT_score"}},"prediction_lrt_max":{"max":{"field":"consequences.predictions.LRT_score"}},"prediction_dann_min":{"min":{"field":"consequences.predictions.DANN_score"}},"prediction_dann_max":{"max":{"field":"consequences.predictions.DANN_score"}},"prediction_cadd_min":{"min":{"field":"consequences.predictions.CADD_score"}},"prediction_cadd_max":{"max":{"field":"consequences.predictions.CADD_score"}},"prediction_revel_min":{"min":{"field":"consequences.predictions.REVEL_score"}},"prediction_revel_max":{"max":{"field":"consequences.predictions.REVEL_score"}},"conservation_phylop_min":{"min":{"field":"consequences.conservationsScores.PhyloP17Way"}},"conservation_phylop_max":{"max":{"field":"consequences.conservationsScores.PhyloP17Way"}},"cohort_rqdm_min":{"min":{"field":"frequencies.interne.AF"}},"cohort_rqdm_max":{"max":{"field":"frequencies.interne.AF"}},"cohort_gnomad_exomes_min":{"min":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_exomes_max":{"max":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_genomes_min":{"min":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_gnomad_genomes_max":{"max":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_exac_min":{"min":{"field":"frequencies.ExAc.AF"}},"cohort_exac_max":{"max":{"field":"frequencies.ExAc.AF"}},"cohort_uk10k_min":{"min":{"field":"frequencies.Uk10k.AF"}},"cohort_uk10k_max":{"max":{"field":"frequencies.Uk10k.AF"}},"cohort_1000gp3_min":{"min":{"field":"frequencies.1000Gp3.AF"}},"cohort_1000gp3_max":{"max":{"field":"frequencies.1000Gp3.AF"}}},"filter":{"bool":{}}},"nested_donors":{"nested":{"path":"donors"},"aggs":{"filtered":{"filter":{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}},"aggs":{"exomiser_score_min":{"min":{"field":"donors.exomiserScore"}},"exomiser_score_max":{"max":{"field":"donors.exomiserScore"}},"transmission":{"terms":{"field":"donors.transmission.keyword","order":{"_count":"desc"},"size":9}},"zygosity":{"terms":{"field":"donors.zygosity.keyword","order":{"_count":"desc"},"size":9}},"metric_depth_quality_min":{"min":{"field":"donors.qd"}},"metric_depth_quality_max":{"max":{"field":"donors.qd"}},"metric_allelic_alt_depth_min":{"min":{"field":"donors.adAlt"}},"metric_allelic_alt_depth_max":{"max":{"field":"donors.adAlt"}},"metric_total_depth_min":{"min":{"field":"donors.adTotal"}},"metric_total_depth_max":{"max":{"field":"donors.adTotal"}},"metric_ratio_min":{"min":{"field":"donors.adFreq"}},"metric_ratio_max":{"max":{"field":"donors.adFreq"}},"metric_genotype_quality_min":{"min":{"field":"donors.gq"}},"metric_genotype_quality_max":{"max":{"field":"donors.gq"}}}}}},"extref_hpo":{"global":{},"aggs":{"filtered_except_extref_hpo":{"filter":{"bool":{"filter":[{"bool":{"should":[],"minimum_should_match":1}},{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}]}},"aggs":{"extref_hpo":{"terms":{"field":"availableDbExt.hpo","size":1}}}}}},"extref_orphanet":{"global":{},"aggs":{"filtered_except_extref_orphanet":{"filter":{"bool":{"filter":[{"bool":{"should":[],"minimum_should_match":1}},{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}]}},"aggs":{"extref_orphanet":{"terms":{"field":"availableDbExt.orphanet","size":1}}}}}},"extref_radboudumc":{"global":{},"aggs":{"filtered_except_extref_radboudumc":{"filter":{"bool":{"filter":[{"bool":{"should":[],"minimum_should_match":1}},{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}]}},"aggs":{"extref_radboudumc":{"terms":{"field":"availableDbExt.radboudumc","size":1}}}}}},"extref_omim":{"global":{},"aggs":{"filtered_except_extref_omim":{"filter":{"bool":{"filter":[{"bool":{"should":[],"minimum_should_match":1}},{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}]}},"aggs":{"extref_omim":{"terms":{"field":"availableDbExt.omim","size":1}}}}}}}}
            )
        } )

        it( 'should return correct translation for single union in Query Count translation', () => {
            const countQuery = generateCountQuery( PATIENT_ID, statementSingleUnion, statementSingleUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( countQuery ).to.eql(
                {"query":{"bool":{"filter":[{"bool":{"should":[{"term":{"availableDbExt.hpo":true}}],"minimum_should_match":1}},{"term":{"donors.patientId.keyword":"PA00001"}}]}}}
            )
        } )

        it( 'should return correct translation for single union in Query Search translation', () => {
            const variantQuery = generateVariantQuery( PATIENT_ID, statementSingleUnion, statementSingleUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT )
            expect( variantQuery ).to.eql(
                {"from":0,"size":25,"query":{"bool":{"filter":[{"bool":{"should":[{"term":{"availableDbExt.hpo":true}}],"minimum_should_match":1}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"sort":[{"donors.exomiserScore":{"order":"desc","nested":{"path":"donors","filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}},{"impactScore":{"order":"desc"}}]}
            )
        } )

        it( 'should return correct translation for multiple union in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery( PATIENT_ID, statementMultipleUnion, statementMultipleUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( facetQuery ).to.eql(
                {"size":0,"query":{"bool":{"filter":[{"bool":{"should":[{"term":{"availableDbExt.hpo":true}},{"term":{"availableDbExt.radboudumc":true}}],"minimum_should_match":1}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"aggs":{"filtered":{"aggs":{"variant_type":{"terms":{"field":"type.keyword","order":{"_count":"desc"},"size":999}},"consequence":{"terms":{"field":"consequences.consequence.keyword","order":{"_count":"desc"},"size":999}},"extdb_pubmed":{"terms":{"field":"availableDbExt.pubmed","size":1}},"extdb_clinvar":{"terms":{"field":"availableDbExt.clinvar","size":1}},"extdb_dbsnp":{"terms":{"field":"availableDbExt.dbSNP","size":1}},"chromosome":{"terms":{"field":"chrom.keyword","order":{"_count":"desc"},"size":24}},"gene_type":{"terms":{"field":"genes.biotype.keyword","order":{"_count":"desc"},"size":999}},"extref_hpo":{"terms":{"field":"availableDbExt.hpo","size":1}},"extref_orphanet":{"terms":{"field":"availableDbExt.orphanet","size":1}},"extref_radboudumc":{"terms":{"field":"availableDbExt.radboudumc","size":1}},"extref_omim":{"terms":{"field":"availableDbExt.omim","size":1}},"gene_hpo":{"terms":{"field":"genes.hpo.keyword","order":{"_count":"desc"},"size":9999}},"genegroup_radboud":{"terms":{"field":"genes.radboudumc.keyword","order":{"_count":"desc"},"size":999}},"genegroup_orphanet":{"terms":{"field":"genes.orphanet.panel.keyword","order":{"_count":"desc"},"size":999}},"clinvar_clinsig":{"terms":{"field":"clinvar.clinvar_clinsig.keyword","order":{"_count":"desc"},"size":999}},"impact":{"terms":{"field":"consequences.impact.keyword","order":{"_count":"desc"},"size":999}},"prediction_fathmm":{"terms":{"field":"consequences.predictions.FATHMM.keyword","order":{"_count":"desc"},"size":9}},"prediction_fathmm_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_fathmm_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift":{"terms":{"field":"consequences.predictions.SIFT.keyword","order":{"_count":"desc"},"size":9}},"prediction_sift_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_polyphen2_hvar":{"terms":{"field":"consequences.predictions.Polyphen2_HVAR_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_polyphen2_hvar_min":{"min":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_polyphen2_hvar_max":{"max":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_lrt":{"terms":{"field":"consequences.predictions.LRT_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_lrt_min":{"min":{"field":"consequences.predictions.LRT_score"}},"prediction_lrt_max":{"max":{"field":"consequences.predictions.LRT_score"}},"prediction_dann_min":{"min":{"field":"consequences.predictions.DANN_score"}},"prediction_dann_max":{"max":{"field":"consequences.predictions.DANN_score"}},"prediction_cadd_min":{"min":{"field":"consequences.predictions.CADD_score"}},"prediction_cadd_max":{"max":{"field":"consequences.predictions.CADD_score"}},"prediction_revel_min":{"min":{"field":"consequences.predictions.REVEL_score"}},"prediction_revel_max":{"max":{"field":"consequences.predictions.REVEL_score"}},"conservation_phylop_min":{"min":{"field":"consequences.conservationsScores.PhyloP17Way"}},"conservation_phylop_max":{"max":{"field":"consequences.conservationsScores.PhyloP17Way"}},"cohort_rqdm_min":{"min":{"field":"frequencies.interne.AF"}},"cohort_rqdm_max":{"max":{"field":"frequencies.interne.AF"}},"cohort_gnomad_exomes_min":{"min":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_exomes_max":{"max":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_genomes_min":{"min":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_gnomad_genomes_max":{"max":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_exac_min":{"min":{"field":"frequencies.ExAc.AF"}},"cohort_exac_max":{"max":{"field":"frequencies.ExAc.AF"}},"cohort_uk10k_min":{"min":{"field":"frequencies.Uk10k.AF"}},"cohort_uk10k_max":{"max":{"field":"frequencies.Uk10k.AF"}},"cohort_1000gp3_min":{"min":{"field":"frequencies.1000Gp3.AF"}},"cohort_1000gp3_max":{"max":{"field":"frequencies.1000Gp3.AF"}}},"filter":{"bool":{}}},"nested_donors":{"nested":{"path":"donors"},"aggs":{"filtered":{"filter":{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}},"aggs":{"exomiser_score_min":{"min":{"field":"donors.exomiserScore"}},"exomiser_score_max":{"max":{"field":"donors.exomiserScore"}},"transmission":{"terms":{"field":"donors.transmission.keyword","order":{"_count":"desc"},"size":9}},"zygosity":{"terms":{"field":"donors.zygosity.keyword","order":{"_count":"desc"},"size":9}},"metric_depth_quality_min":{"min":{"field":"donors.qd"}},"metric_depth_quality_max":{"max":{"field":"donors.qd"}},"metric_allelic_alt_depth_min":{"min":{"field":"donors.adAlt"}},"metric_allelic_alt_depth_max":{"max":{"field":"donors.adAlt"}},"metric_total_depth_min":{"min":{"field":"donors.adTotal"}},"metric_total_depth_max":{"max":{"field":"donors.adTotal"}},"metric_ratio_min":{"min":{"field":"donors.adFreq"}},"metric_ratio_max":{"max":{"field":"donors.adFreq"}},"metric_genotype_quality_min":{"min":{"field":"donors.gq"}},"metric_genotype_quality_max":{"max":{"field":"donors.gq"}}}}}},"extref_hpo":{"global":{},"aggs":{"filtered_except_extref_hpo":{"filter":{"bool":{"filter":[{"bool":{"should":[],"minimum_should_match":1}},{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}]}},"aggs":{"extref_hpo":{"terms":{"field":"availableDbExt.hpo","size":1}}}}}},"extref_orphanet":{"global":{},"aggs":{"filtered_except_extref_orphanet":{"filter":{"bool":{"filter":[{"bool":{"should":[],"minimum_should_match":1}},{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}]}},"aggs":{"extref_orphanet":{"terms":{"field":"availableDbExt.orphanet","size":1}}}}}},"extref_radboudumc":{"global":{},"aggs":{"filtered_except_extref_radboudumc":{"filter":{"bool":{"filter":[{"bool":{"should":[],"minimum_should_match":1}},{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}]}},"aggs":{"extref_radboudumc":{"terms":{"field":"availableDbExt.radboudumc","size":1}}}}}},"extref_omim":{"global":{},"aggs":{"filtered_except_extref_omim":{"filter":{"bool":{"filter":[{"bool":{"should":[],"minimum_should_match":1}},{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}]}},"aggs":{"extref_omim":{"terms":{"field":"availableDbExt.omim","size":1}}}}}}}}
            )
        } )

        it( 'should return correct translation for multiple union in Query Count translation', () => {
            const countQuery = generateCountQuery( PATIENT_ID, statementMultipleUnion, statementMultipleUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( countQuery ).to.eql(
                {"query":{"bool":{"filter":[{"bool":{"should":[{"term":{"availableDbExt.hpo":true}},{"term":{"availableDbExt.radboudumc":true}}],"minimum_should_match":1}},{"term":{"donors.patientId.keyword":"PA00001"}}]}}}
            )
        } )

        it( 'should return correct translation for multiple union in Query Search translation', () => {
            const variantQuery = generateVariantQuery( PATIENT_ID, statementMultipleUnion, statementMultipleUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT )
            expect( variantQuery ).to.eql(
                {"from":0,"size":25,"query":{"bool":{"filter":[{"bool":{"should":[{"term":{"availableDbExt.hpo":true}},{"term":{"availableDbExt.radboudumc":true}}],"minimum_should_match":1}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"sort":[{"donors.exomiserScore":{"order":"desc","nested":{"path":"donors","filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}},{"impactScore":{"order":"desc"}}]}
            )
        } )

    } )

    describe( 'Solo Numerical Comparison (Non-Nested)', () => {
        const statementGreaterThanOrEqualQueryKey = uniqid();
        const statementGreaterThanOrEqual = [
            {
                "key": statementGreaterThanOrEqualQueryKey,
                "title": "Query 1",
                "instructions": [
                    {
                        "type": "filter",
                        "data": {
                            "id": "prediction_dann",
                            "type": "numcomparison",
                            "values": [
                                {
                                    "comparator": ">=",
                                    "value": 0.38
                                }
                            ]
                        }
                    }
                ]
            }
        ]
        const statementLowerThanOrEqualQueryKey = uniqid();
        const statementLowerThanOrEqual = [
            {
                "key": statementLowerThanOrEqualQueryKey,
                "title": "Query 2",
                "instructions": [
                    {
                        "type": "filter",
                        "data": {
                            "id": "prediction_dann",
                            "type": "numcomparison",
                            "values": [
                                {
                                    "comparator": "<=",
                                    "value": 0.67
                                }
                            ]
                        }
                    }
                ]
            }
        ]
        const statementInBetweenQueryKey = uniqid();
        const statementInBetween = [
            {
                "key": statementInBetweenQueryKey,
                "title": "Query 3",
                "instructions": [
                    {
                        "type": "filter",
                        "data": {
                            "id": "prediction_dann",
                            "type": "numcomparison",
                            "values": [
                                {
                                    "comparator": ">=",
                                    "value": 0.27
                                },
                                {
                                    "comparator": "<=",
                                    "value": 0.69
                                }
                            ]
                        }
                    }
                ]
            }
        ]

        it( 'should return correct translation for greater than or equal comparator in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery( PATIENT_ID, statementGreaterThanOrEqual, statementGreaterThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( facetQuery ).to.eql(
                {"size":0,"query":{"bool":{"filter":[{"bool":{"must":{"range":{"consequences.predictions.DANN_score":{"gte":0.38}}}}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"aggs":{"filtered":{"aggs":{"variant_type":{"terms":{"field":"type.keyword","order":{"_count":"desc"},"size":999}},"consequence":{"terms":{"field":"consequences.consequence.keyword","order":{"_count":"desc"},"size":999}},"extdb_pubmed":{"terms":{"field":"availableDbExt.pubmed","size":1}},"extdb_clinvar":{"terms":{"field":"availableDbExt.clinvar","size":1}},"extdb_dbsnp":{"terms":{"field":"availableDbExt.dbSNP","size":1}},"chromosome":{"terms":{"field":"chrom.keyword","order":{"_count":"desc"},"size":24}},"gene_type":{"terms":{"field":"genes.biotype.keyword","order":{"_count":"desc"},"size":999}},"extref_hpo":{"terms":{"field":"availableDbExt.hpo","size":1}},"extref_orphanet":{"terms":{"field":"availableDbExt.orphanet","size":1}},"extref_radboudumc":{"terms":{"field":"availableDbExt.radboudumc","size":1}},"extref_omim":{"terms":{"field":"availableDbExt.omim","size":1}},"gene_hpo":{"terms":{"field":"genes.hpo.keyword","order":{"_count":"desc"},"size":9999}},"genegroup_radboud":{"terms":{"field":"genes.radboudumc.keyword","order":{"_count":"desc"},"size":999}},"genegroup_orphanet":{"terms":{"field":"genes.orphanet.panel.keyword","order":{"_count":"desc"},"size":999}},"clinvar_clinsig":{"terms":{"field":"clinvar.clinvar_clinsig.keyword","order":{"_count":"desc"},"size":999}},"impact":{"terms":{"field":"consequences.impact.keyword","order":{"_count":"desc"},"size":999}},"prediction_fathmm":{"terms":{"field":"consequences.predictions.FATHMM.keyword","order":{"_count":"desc"},"size":9}},"prediction_fathmm_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_fathmm_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift":{"terms":{"field":"consequences.predictions.SIFT.keyword","order":{"_count":"desc"},"size":9}},"prediction_sift_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_polyphen2_hvar":{"terms":{"field":"consequences.predictions.Polyphen2_HVAR_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_polyphen2_hvar_min":{"min":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_polyphen2_hvar_max":{"max":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_lrt":{"terms":{"field":"consequences.predictions.LRT_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_lrt_min":{"min":{"field":"consequences.predictions.LRT_score"}},"prediction_lrt_max":{"max":{"field":"consequences.predictions.LRT_score"}},"prediction_dann_min":{"min":{"field":"consequences.predictions.DANN_score"}},"prediction_dann_max":{"max":{"field":"consequences.predictions.DANN_score"}},"prediction_cadd_min":{"min":{"field":"consequences.predictions.CADD_score"}},"prediction_cadd_max":{"max":{"field":"consequences.predictions.CADD_score"}},"prediction_revel_min":{"min":{"field":"consequences.predictions.REVEL_score"}},"prediction_revel_max":{"max":{"field":"consequences.predictions.REVEL_score"}},"conservation_phylop_min":{"min":{"field":"consequences.conservationsScores.PhyloP17Way"}},"conservation_phylop_max":{"max":{"field":"consequences.conservationsScores.PhyloP17Way"}},"cohort_rqdm_min":{"min":{"field":"frequencies.interne.AF"}},"cohort_rqdm_max":{"max":{"field":"frequencies.interne.AF"}},"cohort_gnomad_exomes_min":{"min":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_exomes_max":{"max":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_genomes_min":{"min":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_gnomad_genomes_max":{"max":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_exac_min":{"min":{"field":"frequencies.ExAc.AF"}},"cohort_exac_max":{"max":{"field":"frequencies.ExAc.AF"}},"cohort_uk10k_min":{"min":{"field":"frequencies.Uk10k.AF"}},"cohort_uk10k_max":{"max":{"field":"frequencies.Uk10k.AF"}},"cohort_1000gp3_min":{"min":{"field":"frequencies.1000Gp3.AF"}},"cohort_1000gp3_max":{"max":{"field":"frequencies.1000Gp3.AF"}}},"filter":{"bool":{}}},"nested_donors":{"nested":{"path":"donors"},"aggs":{"filtered":{"filter":{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}},"aggs":{"exomiser_score_min":{"min":{"field":"donors.exomiserScore"}},"exomiser_score_max":{"max":{"field":"donors.exomiserScore"}},"transmission":{"terms":{"field":"donors.transmission.keyword","order":{"_count":"desc"},"size":9}},"zygosity":{"terms":{"field":"donors.zygosity.keyword","order":{"_count":"desc"},"size":9}},"metric_depth_quality_min":{"min":{"field":"donors.qd"}},"metric_depth_quality_max":{"max":{"field":"donors.qd"}},"metric_allelic_alt_depth_min":{"min":{"field":"donors.adAlt"}},"metric_allelic_alt_depth_max":{"max":{"field":"donors.adAlt"}},"metric_total_depth_min":{"min":{"field":"donors.adTotal"}},"metric_total_depth_max":{"max":{"field":"donors.adTotal"}},"metric_ratio_min":{"min":{"field":"donors.adFreq"}},"metric_ratio_max":{"max":{"field":"donors.adFreq"}},"metric_genotype_quality_min":{"min":{"field":"donors.gq"}},"metric_genotype_quality_max":{"max":{"field":"donors.gq"}}}}}},"prediction_dann":{"global":{},"aggs":{"filtered_except_prediction_dann":{"filter":{"bool":{"filter":[{"bool":{"must":{"range":{"consequences.predictions.DANN_score":{}}}}},{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}]}},"aggs":{"prediction_dann_min":{"min":{"field":"consequences.predictions.DANN_score"}},"prediction_dann_max":{"max":{"field":"consequences.predictions.DANN_score"}}}}}}}}
            )
        } )

        it( 'should return correct translation for greater than or equal comparator in Query Count translation', () => {
            const countQuery = generateCountQuery( PATIENT_ID, statementGreaterThanOrEqual, statementGreaterThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( countQuery ).to.eql(
                {"query":{"bool":{"filter":[{"bool":{"must":{"range":{"consequences.predictions.DANN_score":{"gte":0.38}}}}},{"term":{"donors.patientId.keyword":"PA00001"}}]}}}
            )
        } )

        it( 'should return correct translation for greater than or equal comparator in Query Search translation', () => {
            const variantQuery = generateVariantQuery( PATIENT_ID, statementGreaterThanOrEqual, statementGreaterThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT )
            expect( variantQuery ).to.eql(
                {"from":0,"size":25,"query":{"bool":{"filter":[{"bool":{"must":{"range":{"consequences.predictions.DANN_score":{"gte":0.38}}}}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"sort":[{"donors.exomiserScore":{"order":"desc","nested":{"path":"donors","filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}},{"impactScore":{"order":"desc"}}]}
            )
        } )

        it( 'should return correct translation for lower than or equal comparator in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery( PATIENT_ID, statementLowerThanOrEqual, statementLowerThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( facetQuery ).to.eql(
                {"size":0,"query":{"bool":{"filter":[{"bool":{"must":{"range":{"consequences.predictions.DANN_score":{"lte":0.67}}}}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"aggs":{"filtered":{"aggs":{"variant_type":{"terms":{"field":"type.keyword","order":{"_count":"desc"},"size":999}},"consequence":{"terms":{"field":"consequences.consequence.keyword","order":{"_count":"desc"},"size":999}},"extdb_pubmed":{"terms":{"field":"availableDbExt.pubmed","size":1}},"extdb_clinvar":{"terms":{"field":"availableDbExt.clinvar","size":1}},"extdb_dbsnp":{"terms":{"field":"availableDbExt.dbSNP","size":1}},"chromosome":{"terms":{"field":"chrom.keyword","order":{"_count":"desc"},"size":24}},"gene_type":{"terms":{"field":"genes.biotype.keyword","order":{"_count":"desc"},"size":999}},"extref_hpo":{"terms":{"field":"availableDbExt.hpo","size":1}},"extref_orphanet":{"terms":{"field":"availableDbExt.orphanet","size":1}},"extref_radboudumc":{"terms":{"field":"availableDbExt.radboudumc","size":1}},"extref_omim":{"terms":{"field":"availableDbExt.omim","size":1}},"gene_hpo":{"terms":{"field":"genes.hpo.keyword","order":{"_count":"desc"},"size":9999}},"genegroup_radboud":{"terms":{"field":"genes.radboudumc.keyword","order":{"_count":"desc"},"size":999}},"genegroup_orphanet":{"terms":{"field":"genes.orphanet.panel.keyword","order":{"_count":"desc"},"size":999}},"clinvar_clinsig":{"terms":{"field":"clinvar.clinvar_clinsig.keyword","order":{"_count":"desc"},"size":999}},"impact":{"terms":{"field":"consequences.impact.keyword","order":{"_count":"desc"},"size":999}},"prediction_fathmm":{"terms":{"field":"consequences.predictions.FATHMM.keyword","order":{"_count":"desc"},"size":9}},"prediction_fathmm_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_fathmm_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift":{"terms":{"field":"consequences.predictions.SIFT.keyword","order":{"_count":"desc"},"size":9}},"prediction_sift_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_polyphen2_hvar":{"terms":{"field":"consequences.predictions.Polyphen2_HVAR_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_polyphen2_hvar_min":{"min":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_polyphen2_hvar_max":{"max":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_lrt":{"terms":{"field":"consequences.predictions.LRT_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_lrt_min":{"min":{"field":"consequences.predictions.LRT_score"}},"prediction_lrt_max":{"max":{"field":"consequences.predictions.LRT_score"}},"prediction_dann_min":{"min":{"field":"consequences.predictions.DANN_score"}},"prediction_dann_max":{"max":{"field":"consequences.predictions.DANN_score"}},"prediction_cadd_min":{"min":{"field":"consequences.predictions.CADD_score"}},"prediction_cadd_max":{"max":{"field":"consequences.predictions.CADD_score"}},"prediction_revel_min":{"min":{"field":"consequences.predictions.REVEL_score"}},"prediction_revel_max":{"max":{"field":"consequences.predictions.REVEL_score"}},"conservation_phylop_min":{"min":{"field":"consequences.conservationsScores.PhyloP17Way"}},"conservation_phylop_max":{"max":{"field":"consequences.conservationsScores.PhyloP17Way"}},"cohort_rqdm_min":{"min":{"field":"frequencies.interne.AF"}},"cohort_rqdm_max":{"max":{"field":"frequencies.interne.AF"}},"cohort_gnomad_exomes_min":{"min":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_exomes_max":{"max":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_genomes_min":{"min":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_gnomad_genomes_max":{"max":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_exac_min":{"min":{"field":"frequencies.ExAc.AF"}},"cohort_exac_max":{"max":{"field":"frequencies.ExAc.AF"}},"cohort_uk10k_min":{"min":{"field":"frequencies.Uk10k.AF"}},"cohort_uk10k_max":{"max":{"field":"frequencies.Uk10k.AF"}},"cohort_1000gp3_min":{"min":{"field":"frequencies.1000Gp3.AF"}},"cohort_1000gp3_max":{"max":{"field":"frequencies.1000Gp3.AF"}}},"filter":{"bool":{}}},"nested_donors":{"nested":{"path":"donors"},"aggs":{"filtered":{"filter":{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}},"aggs":{"exomiser_score_min":{"min":{"field":"donors.exomiserScore"}},"exomiser_score_max":{"max":{"field":"donors.exomiserScore"}},"transmission":{"terms":{"field":"donors.transmission.keyword","order":{"_count":"desc"},"size":9}},"zygosity":{"terms":{"field":"donors.zygosity.keyword","order":{"_count":"desc"},"size":9}},"metric_depth_quality_min":{"min":{"field":"donors.qd"}},"metric_depth_quality_max":{"max":{"field":"donors.qd"}},"metric_allelic_alt_depth_min":{"min":{"field":"donors.adAlt"}},"metric_allelic_alt_depth_max":{"max":{"field":"donors.adAlt"}},"metric_total_depth_min":{"min":{"field":"donors.adTotal"}},"metric_total_depth_max":{"max":{"field":"donors.adTotal"}},"metric_ratio_min":{"min":{"field":"donors.adFreq"}},"metric_ratio_max":{"max":{"field":"donors.adFreq"}},"metric_genotype_quality_min":{"min":{"field":"donors.gq"}},"metric_genotype_quality_max":{"max":{"field":"donors.gq"}}}}}},"prediction_dann":{"global":{},"aggs":{"filtered_except_prediction_dann":{"filter":{"bool":{"filter":[{"bool":{"must":{"range":{"consequences.predictions.DANN_score":{}}}}},{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}]}},"aggs":{"prediction_dann_min":{"min":{"field":"consequences.predictions.DANN_score"}},"prediction_dann_max":{"max":{"field":"consequences.predictions.DANN_score"}}}}}}}}
            )
        } )

        it( 'should return correct translation for lower than or equal comparator in Query Count translation', () => {
            const countQuery = generateCountQuery( PATIENT_ID, statementLowerThanOrEqual, statementLowerThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( countQuery ).to.eql(
                {"query":{"bool":{"filter":[{"bool":{"must":{"range":{"consequences.predictions.DANN_score":{"lte":0.67}}}}},{"term":{"donors.patientId.keyword":"PA00001"}}]}}}
            )
        } )

        it( 'should return correct translation for lower than or equal comparator in Query Search translation', () => {
            const variantQuery = generateVariantQuery( PATIENT_ID, statementLowerThanOrEqual, statementLowerThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT )
            expect( variantQuery ).to.eql(
                {"from":0,"size":25,"query":{"bool":{"filter":[{"bool":{"must":{"range":{"consequences.predictions.DANN_score":{"lte":0.67}}}}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"sort":[{"donors.exomiserScore":{"order":"desc","nested":{"path":"donors","filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}},{"impactScore":{"order":"desc"}}]}
            )
        } )

        it( 'should return correct translation for in-between comparator in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery( PATIENT_ID, statementInBetween, statementInBetweenQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( facetQuery ).to.eql(
                {"size":0,"query":{"bool":{"filter":[{"bool":{"must":{"range":{"consequences.predictions.DANN_score":{"gte":0.27,"lte":0.69}}}}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"aggs":{"filtered":{"aggs":{"variant_type":{"terms":{"field":"type.keyword","order":{"_count":"desc"},"size":999}},"consequence":{"terms":{"field":"consequences.consequence.keyword","order":{"_count":"desc"},"size":999}},"extdb_pubmed":{"terms":{"field":"availableDbExt.pubmed","size":1}},"extdb_clinvar":{"terms":{"field":"availableDbExt.clinvar","size":1}},"extdb_dbsnp":{"terms":{"field":"availableDbExt.dbSNP","size":1}},"chromosome":{"terms":{"field":"chrom.keyword","order":{"_count":"desc"},"size":24}},"gene_type":{"terms":{"field":"genes.biotype.keyword","order":{"_count":"desc"},"size":999}},"extref_hpo":{"terms":{"field":"availableDbExt.hpo","size":1}},"extref_orphanet":{"terms":{"field":"availableDbExt.orphanet","size":1}},"extref_radboudumc":{"terms":{"field":"availableDbExt.radboudumc","size":1}},"extref_omim":{"terms":{"field":"availableDbExt.omim","size":1}},"gene_hpo":{"terms":{"field":"genes.hpo.keyword","order":{"_count":"desc"},"size":9999}},"genegroup_radboud":{"terms":{"field":"genes.radboudumc.keyword","order":{"_count":"desc"},"size":999}},"genegroup_orphanet":{"terms":{"field":"genes.orphanet.panel.keyword","order":{"_count":"desc"},"size":999}},"clinvar_clinsig":{"terms":{"field":"clinvar.clinvar_clinsig.keyword","order":{"_count":"desc"},"size":999}},"impact":{"terms":{"field":"consequences.impact.keyword","order":{"_count":"desc"},"size":999}},"prediction_fathmm":{"terms":{"field":"consequences.predictions.FATHMM.keyword","order":{"_count":"desc"},"size":9}},"prediction_fathmm_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_fathmm_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift":{"terms":{"field":"consequences.predictions.SIFT.keyword","order":{"_count":"desc"},"size":9}},"prediction_sift_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_polyphen2_hvar":{"terms":{"field":"consequences.predictions.Polyphen2_HVAR_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_polyphen2_hvar_min":{"min":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_polyphen2_hvar_max":{"max":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_lrt":{"terms":{"field":"consequences.predictions.LRT_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_lrt_min":{"min":{"field":"consequences.predictions.LRT_score"}},"prediction_lrt_max":{"max":{"field":"consequences.predictions.LRT_score"}},"prediction_dann_min":{"min":{"field":"consequences.predictions.DANN_score"}},"prediction_dann_max":{"max":{"field":"consequences.predictions.DANN_score"}},"prediction_cadd_min":{"min":{"field":"consequences.predictions.CADD_score"}},"prediction_cadd_max":{"max":{"field":"consequences.predictions.CADD_score"}},"prediction_revel_min":{"min":{"field":"consequences.predictions.REVEL_score"}},"prediction_revel_max":{"max":{"field":"consequences.predictions.REVEL_score"}},"conservation_phylop_min":{"min":{"field":"consequences.conservationsScores.PhyloP17Way"}},"conservation_phylop_max":{"max":{"field":"consequences.conservationsScores.PhyloP17Way"}},"cohort_rqdm_min":{"min":{"field":"frequencies.interne.AF"}},"cohort_rqdm_max":{"max":{"field":"frequencies.interne.AF"}},"cohort_gnomad_exomes_min":{"min":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_exomes_max":{"max":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_genomes_min":{"min":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_gnomad_genomes_max":{"max":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_exac_min":{"min":{"field":"frequencies.ExAc.AF"}},"cohort_exac_max":{"max":{"field":"frequencies.ExAc.AF"}},"cohort_uk10k_min":{"min":{"field":"frequencies.Uk10k.AF"}},"cohort_uk10k_max":{"max":{"field":"frequencies.Uk10k.AF"}},"cohort_1000gp3_min":{"min":{"field":"frequencies.1000Gp3.AF"}},"cohort_1000gp3_max":{"max":{"field":"frequencies.1000Gp3.AF"}}},"filter":{"bool":{}}},"nested_donors":{"nested":{"path":"donors"},"aggs":{"filtered":{"filter":{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}},"aggs":{"exomiser_score_min":{"min":{"field":"donors.exomiserScore"}},"exomiser_score_max":{"max":{"field":"donors.exomiserScore"}},"transmission":{"terms":{"field":"donors.transmission.keyword","order":{"_count":"desc"},"size":9}},"zygosity":{"terms":{"field":"donors.zygosity.keyword","order":{"_count":"desc"},"size":9}},"metric_depth_quality_min":{"min":{"field":"donors.qd"}},"metric_depth_quality_max":{"max":{"field":"donors.qd"}},"metric_allelic_alt_depth_min":{"min":{"field":"donors.adAlt"}},"metric_allelic_alt_depth_max":{"max":{"field":"donors.adAlt"}},"metric_total_depth_min":{"min":{"field":"donors.adTotal"}},"metric_total_depth_max":{"max":{"field":"donors.adTotal"}},"metric_ratio_min":{"min":{"field":"donors.adFreq"}},"metric_ratio_max":{"max":{"field":"donors.adFreq"}},"metric_genotype_quality_min":{"min":{"field":"donors.gq"}},"metric_genotype_quality_max":{"max":{"field":"donors.gq"}}}}}},"prediction_dann":{"global":{},"aggs":{"filtered_except_prediction_dann":{"filter":{"bool":{"filter":[{"bool":{"must":{"range":{"consequences.predictions.DANN_score":{}}}}},{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}]}},"aggs":{"prediction_dann_min":{"min":{"field":"consequences.predictions.DANN_score"}},"prediction_dann_max":{"max":{"field":"consequences.predictions.DANN_score"}}}}}}}}
            )
        } )

        it( 'should return correct translation for in-between comparator in Query Count translation', () => {
            const countQuery = generateCountQuery( PATIENT_ID, statementInBetween, statementInBetweenQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( countQuery ).to.eql(
                {"query":{"bool":{"filter":[{"bool":{"must":{"range":{"consequences.predictions.DANN_score":{"gte":0.27,"lte":0.69}}}}},{"term":{"donors.patientId.keyword":"PA00001"}}]}}}
            )
        } )

        it( 'should return correct translation for in-between comparator in Query Search translation', () => {
            const variantQuery = generateVariantQuery( PATIENT_ID, statementInBetween, statementInBetweenQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT )
            expect( variantQuery ).to.eql(
                {"from":0,"size":25,"query":{"bool":{"filter":[{"bool":{"must":{"range":{"consequences.predictions.DANN_score":{"gte":0.27,"lte":0.69}}}}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"sort":[{"donors.exomiserScore":{"order":"desc","nested":{"path":"donors","filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}},{"impactScore":{"order":"desc"}}]}
            )
        } )

    } )

    describe( 'Solo Numerical Comparison (Nested)', () => {
        const statementLowerThanOrEqualQueryKey = uniqid();
        const statementLowerThanOrEqual = [
            {
                "key": statementLowerThanOrEqualQueryKey,
                "title": "Query 1",
                "instructions": [
                    {
                        "type": "filter",
                        "data": {
                            "id": "exomiser_score",
                            "type": "numcomparison",
                            "values": [
                                {
                                    "comparator": "<=",
                                    "value": 0.03
                                }
                            ]
                        }
                    }
                ]
            }
        ]
        const statementGreaterThanOrEqualQueryKey = uniqid();
        const statementGreaterThanOrEqual = [
            {
                "key": statementGreaterThanOrEqualQueryKey,
                "title": "Query 2",
                "instructions": [
                    {
                        "type": "filter",
                        "data": {
                            "id": "exomiser_score",
                            "type": "numcomparison",
                            "values": [
                                {
                                    "comparator": ">=",
                                    "value": 0.02
                                }
                            ]
                        }
                    }
                ]
            }
        ]
        const statementInBetweenQueryKey = uniqid();
        const statementInBetween = [
            {
                "key": statementInBetweenQueryKey,
                "title": "Query 3",
                "instructions": [
                    {
                        "type": "filter",
                        "data": {
                            "id": "exomiser_score",
                            "type": "numcomparison",
                            "values": [
                                {
                                    "comparator": ">=",
                                    "value": 0.02
                                },
                                {
                                    "comparator": "<=",
                                    "value": 0.03
                                }
                            ]
                        }
                    }
                ]
            }
        ]

        it( 'should return correct translation for greater than or equal comparator in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery( PATIENT_ID, statementGreaterThanOrEqual, statementGreaterThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( facetQuery ).to.eql(
                {"size":0,"query":{"bool":{"filter":[{"bool":{"must":[{"nested":{"path":"donors","query":{"bool":{"filter":[{"term":{"donors.patientId.keyword":"PA00001"}},{"bool":{"must":{"range":{"donors.exomiserScore":{"gte":0.02}}}}}]}}}}]}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"aggs":{"filtered":{"aggs":{"variant_type":{"terms":{"field":"type.keyword","order":{"_count":"desc"},"size":999}},"consequence":{"terms":{"field":"consequences.consequence.keyword","order":{"_count":"desc"},"size":999}},"extdb_pubmed":{"terms":{"field":"availableDbExt.pubmed","size":1}},"extdb_clinvar":{"terms":{"field":"availableDbExt.clinvar","size":1}},"extdb_dbsnp":{"terms":{"field":"availableDbExt.dbSNP","size":1}},"chromosome":{"terms":{"field":"chrom.keyword","order":{"_count":"desc"},"size":24}},"gene_type":{"terms":{"field":"genes.biotype.keyword","order":{"_count":"desc"},"size":999}},"extref_hpo":{"terms":{"field":"availableDbExt.hpo","size":1}},"extref_orphanet":{"terms":{"field":"availableDbExt.orphanet","size":1}},"extref_radboudumc":{"terms":{"field":"availableDbExt.radboudumc","size":1}},"extref_omim":{"terms":{"field":"availableDbExt.omim","size":1}},"gene_hpo":{"terms":{"field":"genes.hpo.keyword","order":{"_count":"desc"},"size":9999}},"genegroup_radboud":{"terms":{"field":"genes.radboudumc.keyword","order":{"_count":"desc"},"size":999}},"genegroup_orphanet":{"terms":{"field":"genes.orphanet.panel.keyword","order":{"_count":"desc"},"size":999}},"clinvar_clinsig":{"terms":{"field":"clinvar.clinvar_clinsig.keyword","order":{"_count":"desc"},"size":999}},"impact":{"terms":{"field":"consequences.impact.keyword","order":{"_count":"desc"},"size":999}},"prediction_fathmm":{"terms":{"field":"consequences.predictions.FATHMM.keyword","order":{"_count":"desc"},"size":9}},"prediction_fathmm_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_fathmm_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift":{"terms":{"field":"consequences.predictions.SIFT.keyword","order":{"_count":"desc"},"size":9}},"prediction_sift_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_polyphen2_hvar":{"terms":{"field":"consequences.predictions.Polyphen2_HVAR_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_polyphen2_hvar_min":{"min":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_polyphen2_hvar_max":{"max":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_lrt":{"terms":{"field":"consequences.predictions.LRT_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_lrt_min":{"min":{"field":"consequences.predictions.LRT_score"}},"prediction_lrt_max":{"max":{"field":"consequences.predictions.LRT_score"}},"prediction_dann_min":{"min":{"field":"consequences.predictions.DANN_score"}},"prediction_dann_max":{"max":{"field":"consequences.predictions.DANN_score"}},"prediction_cadd_min":{"min":{"field":"consequences.predictions.CADD_score"}},"prediction_cadd_max":{"max":{"field":"consequences.predictions.CADD_score"}},"prediction_revel_min":{"min":{"field":"consequences.predictions.REVEL_score"}},"prediction_revel_max":{"max":{"field":"consequences.predictions.REVEL_score"}},"conservation_phylop_min":{"min":{"field":"consequences.conservationsScores.PhyloP17Way"}},"conservation_phylop_max":{"max":{"field":"consequences.conservationsScores.PhyloP17Way"}},"cohort_rqdm_min":{"min":{"field":"frequencies.interne.AF"}},"cohort_rqdm_max":{"max":{"field":"frequencies.interne.AF"}},"cohort_gnomad_exomes_min":{"min":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_exomes_max":{"max":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_genomes_min":{"min":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_gnomad_genomes_max":{"max":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_exac_min":{"min":{"field":"frequencies.ExAc.AF"}},"cohort_exac_max":{"max":{"field":"frequencies.ExAc.AF"}},"cohort_uk10k_min":{"min":{"field":"frequencies.Uk10k.AF"}},"cohort_uk10k_max":{"max":{"field":"frequencies.Uk10k.AF"}},"cohort_1000gp3_min":{"min":{"field":"frequencies.1000Gp3.AF"}},"cohort_1000gp3_max":{"max":{"field":"frequencies.1000Gp3.AF"}}},"filter":{"bool":{}}},"nested_donors":{"nested":{"path":"donors"},"aggs":{"filtered":{"filter":{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}},"aggs":{"exomiser_score_min":{"min":{"field":"donors.exomiserScore"}},"exomiser_score_max":{"max":{"field":"donors.exomiserScore"}},"transmission":{"terms":{"field":"donors.transmission.keyword","order":{"_count":"desc"},"size":9}},"zygosity":{"terms":{"field":"donors.zygosity.keyword","order":{"_count":"desc"},"size":9}},"metric_depth_quality_min":{"min":{"field":"donors.qd"}},"metric_depth_quality_max":{"max":{"field":"donors.qd"}},"metric_allelic_alt_depth_min":{"min":{"field":"donors.adAlt"}},"metric_allelic_alt_depth_max":{"max":{"field":"donors.adAlt"}},"metric_total_depth_min":{"min":{"field":"donors.adTotal"}},"metric_total_depth_max":{"max":{"field":"donors.adTotal"}},"metric_ratio_min":{"min":{"field":"donors.adFreq"}},"metric_ratio_max":{"max":{"field":"donors.adFreq"}},"metric_genotype_quality_min":{"min":{"field":"donors.gq"}},"metric_genotype_quality_max":{"max":{"field":"donors.gq"}}}}}},"exomiser_score":{"global":{},"aggs":{"filtered_except_exomiser_score":{"filter":{"bool":{"filter":[{"bool":{"must":[{"nested":{"path":"donors","query":{"bool":{"filter":[{"term":{"donors.patientId.keyword":"PA00001"}},{"bool":{"must":{"range":{"donors.exomiserScore":{}}}}}]}}}}]}}]}},"aggs":{"nested_donors":{"nested":{"path":"donors"},"aggs":{"filtered":{"filter":{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}},"aggs":{"exomiser_score_min":{"min":{"field":"donors.exomiserScore"}},"exomiser_score_max":{"max":{"field":"donors.exomiserScore"}}}}}}}}}}}}
            )
        } )

        it( 'should return correct translation for greater than or equal comparator in Query Count translation', () => {
            const countQuery = generateCountQuery( PATIENT_ID, statementGreaterThanOrEqual, statementGreaterThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( countQuery ).to.eql(
                {"query":{"bool":{"filter":[{"bool":{"must":[{"nested":{"path":"donors","query":{"bool":{"filter":[{"term":{"donors.patientId.keyword":"PA00001"}},{"bool":{"must":{"range":{"donors.exomiserScore":{"gte":0.02}}}}}]}}}}]}},{"term":{"donors.patientId.keyword":"PA00001"}}]}}}
            )
        } )

        it( 'should return correct translation for greater than or equal comparator in Query Search translation', () => {
            const variantQuery = generateVariantQuery( PATIENT_ID, statementGreaterThanOrEqual, statementGreaterThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT )
            expect( variantQuery ).to.eql(
                {"from":0,"size":25,"query":{"bool":{"filter":[{"bool":{"must":[{"nested":{"path":"donors","query":{"bool":{"filter":[{"term":{"donors.patientId.keyword":"PA00001"}},{"bool":{"must":{"range":{"donors.exomiserScore":{"gte":0.02}}}}}]}}}}]}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"sort":[{"donors.exomiserScore":{"order":"desc","nested":{"path":"donors","filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}},{"impactScore":{"order":"desc"}}]}
            )
        } )

        it( 'should return correct translation for lower than or equal comparator in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery( PATIENT_ID, statementLowerThanOrEqual, statementLowerThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( facetQuery ).to.eql(
                {"size":0,"query":{"bool":{"filter":[{"bool":{"must":[{"nested":{"path":"donors","query":{"bool":{"filter":[{"term":{"donors.patientId.keyword":"PA00001"}},{"bool":{"must":{"range":{"donors.exomiserScore":{"lte":0.03}}}}}]}}}}]}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"aggs":{"filtered":{"aggs":{"variant_type":{"terms":{"field":"type.keyword","order":{"_count":"desc"},"size":999}},"consequence":{"terms":{"field":"consequences.consequence.keyword","order":{"_count":"desc"},"size":999}},"extdb_pubmed":{"terms":{"field":"availableDbExt.pubmed","size":1}},"extdb_clinvar":{"terms":{"field":"availableDbExt.clinvar","size":1}},"extdb_dbsnp":{"terms":{"field":"availableDbExt.dbSNP","size":1}},"chromosome":{"terms":{"field":"chrom.keyword","order":{"_count":"desc"},"size":24}},"gene_type":{"terms":{"field":"genes.biotype.keyword","order":{"_count":"desc"},"size":999}},"extref_hpo":{"terms":{"field":"availableDbExt.hpo","size":1}},"extref_orphanet":{"terms":{"field":"availableDbExt.orphanet","size":1}},"extref_radboudumc":{"terms":{"field":"availableDbExt.radboudumc","size":1}},"extref_omim":{"terms":{"field":"availableDbExt.omim","size":1}},"gene_hpo":{"terms":{"field":"genes.hpo.keyword","order":{"_count":"desc"},"size":9999}},"genegroup_radboud":{"terms":{"field":"genes.radboudumc.keyword","order":{"_count":"desc"},"size":999}},"genegroup_orphanet":{"terms":{"field":"genes.orphanet.panel.keyword","order":{"_count":"desc"},"size":999}},"clinvar_clinsig":{"terms":{"field":"clinvar.clinvar_clinsig.keyword","order":{"_count":"desc"},"size":999}},"impact":{"terms":{"field":"consequences.impact.keyword","order":{"_count":"desc"},"size":999}},"prediction_fathmm":{"terms":{"field":"consequences.predictions.FATHMM.keyword","order":{"_count":"desc"},"size":9}},"prediction_fathmm_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_fathmm_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift":{"terms":{"field":"consequences.predictions.SIFT.keyword","order":{"_count":"desc"},"size":9}},"prediction_sift_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_polyphen2_hvar":{"terms":{"field":"consequences.predictions.Polyphen2_HVAR_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_polyphen2_hvar_min":{"min":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_polyphen2_hvar_max":{"max":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_lrt":{"terms":{"field":"consequences.predictions.LRT_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_lrt_min":{"min":{"field":"consequences.predictions.LRT_score"}},"prediction_lrt_max":{"max":{"field":"consequences.predictions.LRT_score"}},"prediction_dann_min":{"min":{"field":"consequences.predictions.DANN_score"}},"prediction_dann_max":{"max":{"field":"consequences.predictions.DANN_score"}},"prediction_cadd_min":{"min":{"field":"consequences.predictions.CADD_score"}},"prediction_cadd_max":{"max":{"field":"consequences.predictions.CADD_score"}},"prediction_revel_min":{"min":{"field":"consequences.predictions.REVEL_score"}},"prediction_revel_max":{"max":{"field":"consequences.predictions.REVEL_score"}},"conservation_phylop_min":{"min":{"field":"consequences.conservationsScores.PhyloP17Way"}},"conservation_phylop_max":{"max":{"field":"consequences.conservationsScores.PhyloP17Way"}},"cohort_rqdm_min":{"min":{"field":"frequencies.interne.AF"}},"cohort_rqdm_max":{"max":{"field":"frequencies.interne.AF"}},"cohort_gnomad_exomes_min":{"min":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_exomes_max":{"max":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_genomes_min":{"min":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_gnomad_genomes_max":{"max":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_exac_min":{"min":{"field":"frequencies.ExAc.AF"}},"cohort_exac_max":{"max":{"field":"frequencies.ExAc.AF"}},"cohort_uk10k_min":{"min":{"field":"frequencies.Uk10k.AF"}},"cohort_uk10k_max":{"max":{"field":"frequencies.Uk10k.AF"}},"cohort_1000gp3_min":{"min":{"field":"frequencies.1000Gp3.AF"}},"cohort_1000gp3_max":{"max":{"field":"frequencies.1000Gp3.AF"}}},"filter":{"bool":{}}},"nested_donors":{"nested":{"path":"donors"},"aggs":{"filtered":{"filter":{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}},"aggs":{"exomiser_score_min":{"min":{"field":"donors.exomiserScore"}},"exomiser_score_max":{"max":{"field":"donors.exomiserScore"}},"transmission":{"terms":{"field":"donors.transmission.keyword","order":{"_count":"desc"},"size":9}},"zygosity":{"terms":{"field":"donors.zygosity.keyword","order":{"_count":"desc"},"size":9}},"metric_depth_quality_min":{"min":{"field":"donors.qd"}},"metric_depth_quality_max":{"max":{"field":"donors.qd"}},"metric_allelic_alt_depth_min":{"min":{"field":"donors.adAlt"}},"metric_allelic_alt_depth_max":{"max":{"field":"donors.adAlt"}},"metric_total_depth_min":{"min":{"field":"donors.adTotal"}},"metric_total_depth_max":{"max":{"field":"donors.adTotal"}},"metric_ratio_min":{"min":{"field":"donors.adFreq"}},"metric_ratio_max":{"max":{"field":"donors.adFreq"}},"metric_genotype_quality_min":{"min":{"field":"donors.gq"}},"metric_genotype_quality_max":{"max":{"field":"donors.gq"}}}}}},"exomiser_score":{"global":{},"aggs":{"filtered_except_exomiser_score":{"filter":{"bool":{"filter":[{"bool":{"must":[{"nested":{"path":"donors","query":{"bool":{"filter":[{"term":{"donors.patientId.keyword":"PA00001"}},{"bool":{"must":{"range":{"donors.exomiserScore":{}}}}}]}}}}]}}]}},"aggs":{"nested_donors":{"nested":{"path":"donors"},"aggs":{"filtered":{"filter":{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}},"aggs":{"exomiser_score_min":{"min":{"field":"donors.exomiserScore"}},"exomiser_score_max":{"max":{"field":"donors.exomiserScore"}}}}}}}}}}}}
            )
        } )

        it( 'should return correct translation for lower than or equal comparator in Query Count translation', () => {
            const countQuery = generateCountQuery( PATIENT_ID, statementLowerThanOrEqual, statementLowerThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( countQuery ).to.eql(
                {"query":{"bool":{"filter":[{"bool":{"must":[{"nested":{"path":"donors","query":{"bool":{"filter":[{"term":{"donors.patientId.keyword":"PA00001"}},{"bool":{"must":{"range":{"donors.exomiserScore":{"lte":0.03}}}}}]}}}}]}},{"term":{"donors.patientId.keyword":"PA00001"}}]}}}
            )
        } )

        it( 'should return correct translation for lower than or equal comparator in Query Search translation', () => {
            const variantQuery = generateVariantQuery( PATIENT_ID, statementLowerThanOrEqual, statementLowerThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT )
            expect( variantQuery ).to.eql(
                {"from":0,"size":25,"query":{"bool":{"filter":[{"bool":{"must":[{"nested":{"path":"donors","query":{"bool":{"filter":[{"term":{"donors.patientId.keyword":"PA00001"}},{"bool":{"must":{"range":{"donors.exomiserScore":{"lte":0.03}}}}}]}}}}]}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"sort":[{"donors.exomiserScore":{"order":"desc","nested":{"path":"donors","filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}},{"impactScore":{"order":"desc"}}]}
            )
        } )

        it( 'should return correct translation for in-between comparator in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery( PATIENT_ID, statementInBetween, statementInBetweenQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( facetQuery ).to.eql(
                {"size":0,"query":{"bool":{"filter":[{"bool":{"must":[{"nested":{"path":"donors","query":{"bool":{"filter":[{"term":{"donors.patientId.keyword":"PA00001"}},{"bool":{"must":{"range":{"donors.exomiserScore":{"gte":0.02,"lte":0.03}}}}}]}}}}]}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"aggs":{"filtered":{"aggs":{"variant_type":{"terms":{"field":"type.keyword","order":{"_count":"desc"},"size":999}},"consequence":{"terms":{"field":"consequences.consequence.keyword","order":{"_count":"desc"},"size":999}},"extdb_pubmed":{"terms":{"field":"availableDbExt.pubmed","size":1}},"extdb_clinvar":{"terms":{"field":"availableDbExt.clinvar","size":1}},"extdb_dbsnp":{"terms":{"field":"availableDbExt.dbSNP","size":1}},"chromosome":{"terms":{"field":"chrom.keyword","order":{"_count":"desc"},"size":24}},"gene_type":{"terms":{"field":"genes.biotype.keyword","order":{"_count":"desc"},"size":999}},"extref_hpo":{"terms":{"field":"availableDbExt.hpo","size":1}},"extref_orphanet":{"terms":{"field":"availableDbExt.orphanet","size":1}},"extref_radboudumc":{"terms":{"field":"availableDbExt.radboudumc","size":1}},"extref_omim":{"terms":{"field":"availableDbExt.omim","size":1}},"gene_hpo":{"terms":{"field":"genes.hpo.keyword","order":{"_count":"desc"},"size":9999}},"genegroup_radboud":{"terms":{"field":"genes.radboudumc.keyword","order":{"_count":"desc"},"size":999}},"genegroup_orphanet":{"terms":{"field":"genes.orphanet.panel.keyword","order":{"_count":"desc"},"size":999}},"clinvar_clinsig":{"terms":{"field":"clinvar.clinvar_clinsig.keyword","order":{"_count":"desc"},"size":999}},"impact":{"terms":{"field":"consequences.impact.keyword","order":{"_count":"desc"},"size":999}},"prediction_fathmm":{"terms":{"field":"consequences.predictions.FATHMM.keyword","order":{"_count":"desc"},"size":9}},"prediction_fathmm_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_fathmm_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift":{"terms":{"field":"consequences.predictions.SIFT.keyword","order":{"_count":"desc"},"size":9}},"prediction_sift_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_polyphen2_hvar":{"terms":{"field":"consequences.predictions.Polyphen2_HVAR_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_polyphen2_hvar_min":{"min":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_polyphen2_hvar_max":{"max":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_lrt":{"terms":{"field":"consequences.predictions.LRT_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_lrt_min":{"min":{"field":"consequences.predictions.LRT_score"}},"prediction_lrt_max":{"max":{"field":"consequences.predictions.LRT_score"}},"prediction_dann_min":{"min":{"field":"consequences.predictions.DANN_score"}},"prediction_dann_max":{"max":{"field":"consequences.predictions.DANN_score"}},"prediction_cadd_min":{"min":{"field":"consequences.predictions.CADD_score"}},"prediction_cadd_max":{"max":{"field":"consequences.predictions.CADD_score"}},"prediction_revel_min":{"min":{"field":"consequences.predictions.REVEL_score"}},"prediction_revel_max":{"max":{"field":"consequences.predictions.REVEL_score"}},"conservation_phylop_min":{"min":{"field":"consequences.conservationsScores.PhyloP17Way"}},"conservation_phylop_max":{"max":{"field":"consequences.conservationsScores.PhyloP17Way"}},"cohort_rqdm_min":{"min":{"field":"frequencies.interne.AF"}},"cohort_rqdm_max":{"max":{"field":"frequencies.interne.AF"}},"cohort_gnomad_exomes_min":{"min":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_exomes_max":{"max":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_genomes_min":{"min":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_gnomad_genomes_max":{"max":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_exac_min":{"min":{"field":"frequencies.ExAc.AF"}},"cohort_exac_max":{"max":{"field":"frequencies.ExAc.AF"}},"cohort_uk10k_min":{"min":{"field":"frequencies.Uk10k.AF"}},"cohort_uk10k_max":{"max":{"field":"frequencies.Uk10k.AF"}},"cohort_1000gp3_min":{"min":{"field":"frequencies.1000Gp3.AF"}},"cohort_1000gp3_max":{"max":{"field":"frequencies.1000Gp3.AF"}}},"filter":{"bool":{}}},"nested_donors":{"nested":{"path":"donors"},"aggs":{"filtered":{"filter":{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}},"aggs":{"exomiser_score_min":{"min":{"field":"donors.exomiserScore"}},"exomiser_score_max":{"max":{"field":"donors.exomiserScore"}},"transmission":{"terms":{"field":"donors.transmission.keyword","order":{"_count":"desc"},"size":9}},"zygosity":{"terms":{"field":"donors.zygosity.keyword","order":{"_count":"desc"},"size":9}},"metric_depth_quality_min":{"min":{"field":"donors.qd"}},"metric_depth_quality_max":{"max":{"field":"donors.qd"}},"metric_allelic_alt_depth_min":{"min":{"field":"donors.adAlt"}},"metric_allelic_alt_depth_max":{"max":{"field":"donors.adAlt"}},"metric_total_depth_min":{"min":{"field":"donors.adTotal"}},"metric_total_depth_max":{"max":{"field":"donors.adTotal"}},"metric_ratio_min":{"min":{"field":"donors.adFreq"}},"metric_ratio_max":{"max":{"field":"donors.adFreq"}},"metric_genotype_quality_min":{"min":{"field":"donors.gq"}},"metric_genotype_quality_max":{"max":{"field":"donors.gq"}}}}}},"exomiser_score":{"global":{},"aggs":{"filtered_except_exomiser_score":{"filter":{"bool":{"filter":[{"bool":{"must":[{"nested":{"path":"donors","query":{"bool":{"filter":[{"term":{"donors.patientId.keyword":"PA00001"}},{"bool":{"must":{"range":{"donors.exomiserScore":{}}}}}]}}}}]}}]}},"aggs":{"nested_donors":{"nested":{"path":"donors"},"aggs":{"filtered":{"filter":{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}},"aggs":{"exomiser_score_min":{"min":{"field":"donors.exomiserScore"}},"exomiser_score_max":{"max":{"field":"donors.exomiserScore"}}}}}}}}}}}}
            )
        } )

        it( 'should return correct translation for in-between comparator in Query Count translation', () => {
            const countQuery = generateCountQuery( PATIENT_ID, statementInBetween, statementInBetweenQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( countQuery ).to.eql(
                {"query":{"bool":{"filter":[{"bool":{"must":[{"nested":{"path":"donors","query":{"bool":{"filter":[{"term":{"donors.patientId.keyword":"PA00001"}},{"bool":{"must":{"range":{"donors.exomiserScore":{"gte":0.02,"lte":0.03}}}}}]}}}}]}},{"term":{"donors.patientId.keyword":"PA00001"}}]}}}
            )
        } )

        it( 'should return correct translation for in-between comparator in Query Search translation', () => {
            const variantQuery = generateVariantQuery( PATIENT_ID, statementInBetween, statementInBetweenQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT )
            expect( variantQuery ).to.eql(
                {"from":0,"size":25,"query":{"bool":{"filter":[{"bool":{"must":[{"nested":{"path":"donors","query":{"bool":{"filter":[{"term":{"donors.patientId.keyword":"PA00001"}},{"bool":{"must":{"range":{"donors.exomiserScore":{"gte":0.02,"lte":0.03}}}}}]}}}}]}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"sort":[{"donors.exomiserScore":{"order":"desc","nested":{"path":"donors","filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}},{"impactScore":{"order":"desc"}}]}
            )
        } )

    } )

    describe( 'Solo Composite (Score)', () => {
        const statementLowerThanOrEqualQueryKey = uniqid();
        const statementLowerThanOrEqual = [
            {
                "key": statementLowerThanOrEqualQueryKey,
                "title": "Query 1",
                "instructions": [
                    {
                        "type": "filter",
                        "data": {
                            "id": "prediction_fathmm",
                            "values": [
                                {
                                    "comparator": "<=",
                                    "value": 0.4
                                }
                            ],
                            "type": "composite"
                        }
                    }
                ]
            }
        ]
        const statementGreaterThanOrEqualQueryKey = uniqid();
        const statementGreaterThanOrEqual = [
            {
                "key": statementGreaterThanOrEqualQueryKey,
                "title": "Query 2",
                "instructions": [
                    {
                        "type": "filter",
                        "data": {
                            "id": "prediction_fathmm",
                            "values": [
                                {
                                    "comparator": ">=",
                                    "value": 0.3
                                }
                            ],
                            "type": "composite"
                        }
                    }
                ]
            }
        ]
        const statementInBetweenQueryKey = uniqid();
        const statementInBetween = [
            {
                "key": statementInBetweenQueryKey,
                "title": "Query 3",
                "instructions": [
                    {
                        "type": "filter",
                        "data": {
                            "id": "prediction_fathmm",
                            "values": [
                                {
                                    "comparator": ">=",
                                    "value": 0.3
                                },
                                {
                                    "comparator": "<=",
                                    "value": 0.4
                                }
                            ],
                            "type": "composite"
                        }
                    }
                ]
            }
        ]

        it( 'should return correct translation for greater than or equal comparator in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery( PATIENT_ID, statementGreaterThanOrEqual, statementGreaterThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( facetQuery ).to.eql(
                {"size":0,"query":{"bool":{"filter":[{"bool":{"must":{"range":{"consequences.predictions.FATHMM_score":{"gte":0.3}}}}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"aggs":{"filtered":{"aggs":{"variant_type":{"terms":{"field":"type.keyword","order":{"_count":"desc"},"size":999}},"consequence":{"terms":{"field":"consequences.consequence.keyword","order":{"_count":"desc"},"size":999}},"extdb_pubmed":{"terms":{"field":"availableDbExt.pubmed","size":1}},"extdb_clinvar":{"terms":{"field":"availableDbExt.clinvar","size":1}},"extdb_dbsnp":{"terms":{"field":"availableDbExt.dbSNP","size":1}},"chromosome":{"terms":{"field":"chrom.keyword","order":{"_count":"desc"},"size":24}},"gene_type":{"terms":{"field":"genes.biotype.keyword","order":{"_count":"desc"},"size":999}},"extref_hpo":{"terms":{"field":"availableDbExt.hpo","size":1}},"extref_orphanet":{"terms":{"field":"availableDbExt.orphanet","size":1}},"extref_radboudumc":{"terms":{"field":"availableDbExt.radboudumc","size":1}},"extref_omim":{"terms":{"field":"availableDbExt.omim","size":1}},"gene_hpo":{"terms":{"field":"genes.hpo.keyword","order":{"_count":"desc"},"size":9999}},"genegroup_radboud":{"terms":{"field":"genes.radboudumc.keyword","order":{"_count":"desc"},"size":999}},"genegroup_orphanet":{"terms":{"field":"genes.orphanet.panel.keyword","order":{"_count":"desc"},"size":999}},"clinvar_clinsig":{"terms":{"field":"clinvar.clinvar_clinsig.keyword","order":{"_count":"desc"},"size":999}},"impact":{"terms":{"field":"consequences.impact.keyword","order":{"_count":"desc"},"size":999}},"prediction_fathmm":{"terms":{"field":"consequences.predictions.FATHMM.keyword","order":{"_count":"desc"},"size":9}},"prediction_fathmm_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_fathmm_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift":{"terms":{"field":"consequences.predictions.SIFT.keyword","order":{"_count":"desc"},"size":9}},"prediction_sift_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_polyphen2_hvar":{"terms":{"field":"consequences.predictions.Polyphen2_HVAR_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_polyphen2_hvar_min":{"min":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_polyphen2_hvar_max":{"max":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_lrt":{"terms":{"field":"consequences.predictions.LRT_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_lrt_min":{"min":{"field":"consequences.predictions.LRT_score"}},"prediction_lrt_max":{"max":{"field":"consequences.predictions.LRT_score"}},"prediction_dann_min":{"min":{"field":"consequences.predictions.DANN_score"}},"prediction_dann_max":{"max":{"field":"consequences.predictions.DANN_score"}},"prediction_cadd_min":{"min":{"field":"consequences.predictions.CADD_score"}},"prediction_cadd_max":{"max":{"field":"consequences.predictions.CADD_score"}},"prediction_revel_min":{"min":{"field":"consequences.predictions.REVEL_score"}},"prediction_revel_max":{"max":{"field":"consequences.predictions.REVEL_score"}},"conservation_phylop_min":{"min":{"field":"consequences.conservationsScores.PhyloP17Way"}},"conservation_phylop_max":{"max":{"field":"consequences.conservationsScores.PhyloP17Way"}},"cohort_rqdm_min":{"min":{"field":"frequencies.interne.AF"}},"cohort_rqdm_max":{"max":{"field":"frequencies.interne.AF"}},"cohort_gnomad_exomes_min":{"min":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_exomes_max":{"max":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_genomes_min":{"min":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_gnomad_genomes_max":{"max":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_exac_min":{"min":{"field":"frequencies.ExAc.AF"}},"cohort_exac_max":{"max":{"field":"frequencies.ExAc.AF"}},"cohort_uk10k_min":{"min":{"field":"frequencies.Uk10k.AF"}},"cohort_uk10k_max":{"max":{"field":"frequencies.Uk10k.AF"}},"cohort_1000gp3_min":{"min":{"field":"frequencies.1000Gp3.AF"}},"cohort_1000gp3_max":{"max":{"field":"frequencies.1000Gp3.AF"}}},"filter":{"bool":{}}},"nested_donors":{"nested":{"path":"donors"},"aggs":{"filtered":{"filter":{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}},"aggs":{"exomiser_score_min":{"min":{"field":"donors.exomiserScore"}},"exomiser_score_max":{"max":{"field":"donors.exomiserScore"}},"transmission":{"terms":{"field":"donors.transmission.keyword","order":{"_count":"desc"},"size":9}},"zygosity":{"terms":{"field":"donors.zygosity.keyword","order":{"_count":"desc"},"size":9}},"metric_depth_quality_min":{"min":{"field":"donors.qd"}},"metric_depth_quality_max":{"max":{"field":"donors.qd"}},"metric_allelic_alt_depth_min":{"min":{"field":"donors.adAlt"}},"metric_allelic_alt_depth_max":{"max":{"field":"donors.adAlt"}},"metric_total_depth_min":{"min":{"field":"donors.adTotal"}},"metric_total_depth_max":{"max":{"field":"donors.adTotal"}},"metric_ratio_min":{"min":{"field":"donors.adFreq"}},"metric_ratio_max":{"max":{"field":"donors.adFreq"}},"metric_genotype_quality_min":{"min":{"field":"donors.gq"}},"metric_genotype_quality_max":{"max":{"field":"donors.gq"}}}}}},"score":{"global":{},"aggs":{"filtered_except_score":{"filter":{"bool":{"filter":[{"bool":{}},{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}]}},"aggs":{}}}},"quality":{"global":{},"aggs":{"filtered_except_quality":{"filter":{"bool":{"filter":[{"bool":{}},{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}]}},"aggs":{}}}}}}
            )
        } )

        it( 'should return correct translation for greater than or equal comparator in Query Count translation', () => {
            const countQuery = generateCountQuery( PATIENT_ID, statementGreaterThanOrEqual, statementGreaterThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( countQuery ).to.eql(
                {"query":{"bool":{"filter":[{"bool":{"must":{"range":{"consequences.predictions.FATHMM_score":{"gte":0.3}}}}},{"term":{"donors.patientId.keyword":"PA00001"}}]}}}
            )
        } )

        it( 'should return correct translation for greater than or equal comparator in Query Search translation', () => {
            const variantQuery = generateVariantQuery( PATIENT_ID, statementGreaterThanOrEqual, statementGreaterThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT )
            expect( variantQuery ).to.eql(
                {"from":0,"size":25,"query":{"bool":{"filter":[{"bool":{"must":{"range":{"consequences.predictions.FATHMM_score":{"gte":0.3}}}}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"sort":[{"donors.exomiserScore":{"order":"desc","nested":{"path":"donors","filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}},{"impactScore":{"order":"desc"}}]}
            )
        } )

        it( 'should return correct translation for lower than or equal comparator in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery( PATIENT_ID, statementLowerThanOrEqual, statementLowerThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( facetQuery ).to.eql(
                {"size":0,"query":{"bool":{"filter":[{"bool":{"must":{"range":{"consequences.predictions.FATHMM_score":{"lte":0.4}}}}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"aggs":{"filtered":{"aggs":{"variant_type":{"terms":{"field":"type.keyword","order":{"_count":"desc"},"size":999}},"consequence":{"terms":{"field":"consequences.consequence.keyword","order":{"_count":"desc"},"size":999}},"extdb_pubmed":{"terms":{"field":"availableDbExt.pubmed","size":1}},"extdb_clinvar":{"terms":{"field":"availableDbExt.clinvar","size":1}},"extdb_dbsnp":{"terms":{"field":"availableDbExt.dbSNP","size":1}},"chromosome":{"terms":{"field":"chrom.keyword","order":{"_count":"desc"},"size":24}},"gene_type":{"terms":{"field":"genes.biotype.keyword","order":{"_count":"desc"},"size":999}},"extref_hpo":{"terms":{"field":"availableDbExt.hpo","size":1}},"extref_orphanet":{"terms":{"field":"availableDbExt.orphanet","size":1}},"extref_radboudumc":{"terms":{"field":"availableDbExt.radboudumc","size":1}},"extref_omim":{"terms":{"field":"availableDbExt.omim","size":1}},"gene_hpo":{"terms":{"field":"genes.hpo.keyword","order":{"_count":"desc"},"size":9999}},"genegroup_radboud":{"terms":{"field":"genes.radboudumc.keyword","order":{"_count":"desc"},"size":999}},"genegroup_orphanet":{"terms":{"field":"genes.orphanet.panel.keyword","order":{"_count":"desc"},"size":999}},"clinvar_clinsig":{"terms":{"field":"clinvar.clinvar_clinsig.keyword","order":{"_count":"desc"},"size":999}},"impact":{"terms":{"field":"consequences.impact.keyword","order":{"_count":"desc"},"size":999}},"prediction_fathmm":{"terms":{"field":"consequences.predictions.FATHMM.keyword","order":{"_count":"desc"},"size":9}},"prediction_fathmm_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_fathmm_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift":{"terms":{"field":"consequences.predictions.SIFT.keyword","order":{"_count":"desc"},"size":9}},"prediction_sift_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_polyphen2_hvar":{"terms":{"field":"consequences.predictions.Polyphen2_HVAR_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_polyphen2_hvar_min":{"min":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_polyphen2_hvar_max":{"max":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_lrt":{"terms":{"field":"consequences.predictions.LRT_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_lrt_min":{"min":{"field":"consequences.predictions.LRT_score"}},"prediction_lrt_max":{"max":{"field":"consequences.predictions.LRT_score"}},"prediction_dann_min":{"min":{"field":"consequences.predictions.DANN_score"}},"prediction_dann_max":{"max":{"field":"consequences.predictions.DANN_score"}},"prediction_cadd_min":{"min":{"field":"consequences.predictions.CADD_score"}},"prediction_cadd_max":{"max":{"field":"consequences.predictions.CADD_score"}},"prediction_revel_min":{"min":{"field":"consequences.predictions.REVEL_score"}},"prediction_revel_max":{"max":{"field":"consequences.predictions.REVEL_score"}},"conservation_phylop_min":{"min":{"field":"consequences.conservationsScores.PhyloP17Way"}},"conservation_phylop_max":{"max":{"field":"consequences.conservationsScores.PhyloP17Way"}},"cohort_rqdm_min":{"min":{"field":"frequencies.interne.AF"}},"cohort_rqdm_max":{"max":{"field":"frequencies.interne.AF"}},"cohort_gnomad_exomes_min":{"min":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_exomes_max":{"max":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_genomes_min":{"min":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_gnomad_genomes_max":{"max":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_exac_min":{"min":{"field":"frequencies.ExAc.AF"}},"cohort_exac_max":{"max":{"field":"frequencies.ExAc.AF"}},"cohort_uk10k_min":{"min":{"field":"frequencies.Uk10k.AF"}},"cohort_uk10k_max":{"max":{"field":"frequencies.Uk10k.AF"}},"cohort_1000gp3_min":{"min":{"field":"frequencies.1000Gp3.AF"}},"cohort_1000gp3_max":{"max":{"field":"frequencies.1000Gp3.AF"}}},"filter":{"bool":{}}},"nested_donors":{"nested":{"path":"donors"},"aggs":{"filtered":{"filter":{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}},"aggs":{"exomiser_score_min":{"min":{"field":"donors.exomiserScore"}},"exomiser_score_max":{"max":{"field":"donors.exomiserScore"}},"transmission":{"terms":{"field":"donors.transmission.keyword","order":{"_count":"desc"},"size":9}},"zygosity":{"terms":{"field":"donors.zygosity.keyword","order":{"_count":"desc"},"size":9}},"metric_depth_quality_min":{"min":{"field":"donors.qd"}},"metric_depth_quality_max":{"max":{"field":"donors.qd"}},"metric_allelic_alt_depth_min":{"min":{"field":"donors.adAlt"}},"metric_allelic_alt_depth_max":{"max":{"field":"donors.adAlt"}},"metric_total_depth_min":{"min":{"field":"donors.adTotal"}},"metric_total_depth_max":{"max":{"field":"donors.adTotal"}},"metric_ratio_min":{"min":{"field":"donors.adFreq"}},"metric_ratio_max":{"max":{"field":"donors.adFreq"}},"metric_genotype_quality_min":{"min":{"field":"donors.gq"}},"metric_genotype_quality_max":{"max":{"field":"donors.gq"}}}}}},"score":{"global":{},"aggs":{"filtered_except_score":{"filter":{"bool":{"filter":[{"bool":{}},{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}]}},"aggs":{}}}},"quality":{"global":{},"aggs":{"filtered_except_quality":{"filter":{"bool":{"filter":[{"bool":{}},{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}]}},"aggs":{}}}}}}
            )
        } )

        it( 'should return correct translation for lower than or equal comparator in Query Count translation', () => {
            const countQuery = generateCountQuery( PATIENT_ID, statementLowerThanOrEqual, statementLowerThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( countQuery ).to.eql(
                {"query":{"bool":{"filter":[{"bool":{"must":{"range":{"consequences.predictions.FATHMM_score":{"lte":0.4}}}}},{"term":{"donors.patientId.keyword":"PA00001"}}]}}}
            )
        } )

        it( 'should return correct translation for lower than or equal comparator in Query Search translation', () => {
            const variantQuery = generateVariantQuery( PATIENT_ID, statementLowerThanOrEqual, statementLowerThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT )
            expect( variantQuery ).to.eql(
                {"from":0,"size":25,"query":{"bool":{"filter":[{"bool":{"must":{"range":{"consequences.predictions.FATHMM_score":{"lte":0.4}}}}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"sort":[{"donors.exomiserScore":{"order":"desc","nested":{"path":"donors","filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}},{"impactScore":{"order":"desc"}}]}
            )
        } )

        it( 'should return correct translation for in-between comparator in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery( PATIENT_ID, statementInBetween, statementInBetweenQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( facetQuery ).to.eql(
                {"size":0,"query":{"bool":{"filter":[{"bool":{"must":{"range":{"consequences.predictions.FATHMM_score":{"gte":0.3,"lte":0.4}}}}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"aggs":{"filtered":{"aggs":{"variant_type":{"terms":{"field":"type.keyword","order":{"_count":"desc"},"size":999}},"consequence":{"terms":{"field":"consequences.consequence.keyword","order":{"_count":"desc"},"size":999}},"extdb_pubmed":{"terms":{"field":"availableDbExt.pubmed","size":1}},"extdb_clinvar":{"terms":{"field":"availableDbExt.clinvar","size":1}},"extdb_dbsnp":{"terms":{"field":"availableDbExt.dbSNP","size":1}},"chromosome":{"terms":{"field":"chrom.keyword","order":{"_count":"desc"},"size":24}},"gene_type":{"terms":{"field":"genes.biotype.keyword","order":{"_count":"desc"},"size":999}},"extref_hpo":{"terms":{"field":"availableDbExt.hpo","size":1}},"extref_orphanet":{"terms":{"field":"availableDbExt.orphanet","size":1}},"extref_radboudumc":{"terms":{"field":"availableDbExt.radboudumc","size":1}},"extref_omim":{"terms":{"field":"availableDbExt.omim","size":1}},"gene_hpo":{"terms":{"field":"genes.hpo.keyword","order":{"_count":"desc"},"size":9999}},"genegroup_radboud":{"terms":{"field":"genes.radboudumc.keyword","order":{"_count":"desc"},"size":999}},"genegroup_orphanet":{"terms":{"field":"genes.orphanet.panel.keyword","order":{"_count":"desc"},"size":999}},"clinvar_clinsig":{"terms":{"field":"clinvar.clinvar_clinsig.keyword","order":{"_count":"desc"},"size":999}},"impact":{"terms":{"field":"consequences.impact.keyword","order":{"_count":"desc"},"size":999}},"prediction_fathmm":{"terms":{"field":"consequences.predictions.FATHMM.keyword","order":{"_count":"desc"},"size":9}},"prediction_fathmm_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_fathmm_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift":{"terms":{"field":"consequences.predictions.SIFT.keyword","order":{"_count":"desc"},"size":9}},"prediction_sift_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_polyphen2_hvar":{"terms":{"field":"consequences.predictions.Polyphen2_HVAR_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_polyphen2_hvar_min":{"min":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_polyphen2_hvar_max":{"max":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_lrt":{"terms":{"field":"consequences.predictions.LRT_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_lrt_min":{"min":{"field":"consequences.predictions.LRT_score"}},"prediction_lrt_max":{"max":{"field":"consequences.predictions.LRT_score"}},"prediction_dann_min":{"min":{"field":"consequences.predictions.DANN_score"}},"prediction_dann_max":{"max":{"field":"consequences.predictions.DANN_score"}},"prediction_cadd_min":{"min":{"field":"consequences.predictions.CADD_score"}},"prediction_cadd_max":{"max":{"field":"consequences.predictions.CADD_score"}},"prediction_revel_min":{"min":{"field":"consequences.predictions.REVEL_score"}},"prediction_revel_max":{"max":{"field":"consequences.predictions.REVEL_score"}},"conservation_phylop_min":{"min":{"field":"consequences.conservationsScores.PhyloP17Way"}},"conservation_phylop_max":{"max":{"field":"consequences.conservationsScores.PhyloP17Way"}},"cohort_rqdm_min":{"min":{"field":"frequencies.interne.AF"}},"cohort_rqdm_max":{"max":{"field":"frequencies.interne.AF"}},"cohort_gnomad_exomes_min":{"min":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_exomes_max":{"max":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_genomes_min":{"min":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_gnomad_genomes_max":{"max":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_exac_min":{"min":{"field":"frequencies.ExAc.AF"}},"cohort_exac_max":{"max":{"field":"frequencies.ExAc.AF"}},"cohort_uk10k_min":{"min":{"field":"frequencies.Uk10k.AF"}},"cohort_uk10k_max":{"max":{"field":"frequencies.Uk10k.AF"}},"cohort_1000gp3_min":{"min":{"field":"frequencies.1000Gp3.AF"}},"cohort_1000gp3_max":{"max":{"field":"frequencies.1000Gp3.AF"}}},"filter":{"bool":{}}},"nested_donors":{"nested":{"path":"donors"},"aggs":{"filtered":{"filter":{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}},"aggs":{"exomiser_score_min":{"min":{"field":"donors.exomiserScore"}},"exomiser_score_max":{"max":{"field":"donors.exomiserScore"}},"transmission":{"terms":{"field":"donors.transmission.keyword","order":{"_count":"desc"},"size":9}},"zygosity":{"terms":{"field":"donors.zygosity.keyword","order":{"_count":"desc"},"size":9}},"metric_depth_quality_min":{"min":{"field":"donors.qd"}},"metric_depth_quality_max":{"max":{"field":"donors.qd"}},"metric_allelic_alt_depth_min":{"min":{"field":"donors.adAlt"}},"metric_allelic_alt_depth_max":{"max":{"field":"donors.adAlt"}},"metric_total_depth_min":{"min":{"field":"donors.adTotal"}},"metric_total_depth_max":{"max":{"field":"donors.adTotal"}},"metric_ratio_min":{"min":{"field":"donors.adFreq"}},"metric_ratio_max":{"max":{"field":"donors.adFreq"}},"metric_genotype_quality_min":{"min":{"field":"donors.gq"}},"metric_genotype_quality_max":{"max":{"field":"donors.gq"}}}}}},"score":{"global":{},"aggs":{"filtered_except_score":{"filter":{"bool":{"filter":[{"bool":{}},{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}]}},"aggs":{}}}},"quality":{"global":{},"aggs":{"filtered_except_quality":{"filter":{"bool":{"filter":[{"bool":{}},{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}]}},"aggs":{}}}}}}
            )
        } )

        it( 'should return correct translation for in-between comparator in Query Count translation', () => {
            const countQuery = generateCountQuery( PATIENT_ID, statementInBetween, statementInBetweenQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( countQuery ).to.eql(
                {"query":{"bool":{"filter":[{"bool":{"must":{"range":{"consequences.predictions.FATHMM_score":{"gte":0.3,"lte":0.4}}}}},{"term":{"donors.patientId.keyword":"PA00001"}}]}}}
            )
        } )

        it( 'should return correct translation for in-between comparator in Query Search translation', () => {
            const variantQuery = generateVariantQuery( PATIENT_ID, statementInBetween, statementInBetweenQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT )
            expect( variantQuery ).to.eql(
                {"from":0,"size":25,"query":{"bool":{"filter":[{"bool":{"must":{"range":{"consequences.predictions.FATHMM_score":{"gte":0.3,"lte":0.4}}}}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"sort":[{"donors.exomiserScore":{"order":"desc","nested":{"path":"donors","filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}},{"impactScore":{"order":"desc"}}]}
            )
        } )

    } )

    describe( 'Solo Composite (Call)', () => {
        const statementInclusionQueryKey = uniqid();
        const statementInclusion = [
            {
                "key": statementInclusionQueryKey,
                "title": "Query 1",
                "instructions": [
                    {
                        "type": "filter",
                        "data": {
                            "id": "prediction_fathmm",
                            "values": [
                                {
                                    "value": "TOLERATED"
                                }
                            ],
                            "type": "composite"
                        }
                    }
                ]
            }
        ]

        it( 'should return correct translation in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery( PATIENT_ID, statementInclusion, statementInclusionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( facetQuery ).to.eql(
                {"size":0,"query":{"bool":{"filter":[{"bool":{"should":[{"term":{"consequences.predictions.FATHMM.keyword":"TOLERATED"}}],"minimum_should_match":1}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"aggs":{"filtered":{"aggs":{"variant_type":{"terms":{"field":"type.keyword","order":{"_count":"desc"},"size":999}},"consequence":{"terms":{"field":"consequences.consequence.keyword","order":{"_count":"desc"},"size":999}},"extdb_pubmed":{"terms":{"field":"availableDbExt.pubmed","size":1}},"extdb_clinvar":{"terms":{"field":"availableDbExt.clinvar","size":1}},"extdb_dbsnp":{"terms":{"field":"availableDbExt.dbSNP","size":1}},"chromosome":{"terms":{"field":"chrom.keyword","order":{"_count":"desc"},"size":24}},"gene_type":{"terms":{"field":"genes.biotype.keyword","order":{"_count":"desc"},"size":999}},"extref_hpo":{"terms":{"field":"availableDbExt.hpo","size":1}},"extref_orphanet":{"terms":{"field":"availableDbExt.orphanet","size":1}},"extref_radboudumc":{"terms":{"field":"availableDbExt.radboudumc","size":1}},"extref_omim":{"terms":{"field":"availableDbExt.omim","size":1}},"gene_hpo":{"terms":{"field":"genes.hpo.keyword","order":{"_count":"desc"},"size":9999}},"genegroup_radboud":{"terms":{"field":"genes.radboudumc.keyword","order":{"_count":"desc"},"size":999}},"genegroup_orphanet":{"terms":{"field":"genes.orphanet.panel.keyword","order":{"_count":"desc"},"size":999}},"clinvar_clinsig":{"terms":{"field":"clinvar.clinvar_clinsig.keyword","order":{"_count":"desc"},"size":999}},"impact":{"terms":{"field":"consequences.impact.keyword","order":{"_count":"desc"},"size":999}},"prediction_fathmm":{"terms":{"field":"consequences.predictions.FATHMM.keyword","order":{"_count":"desc"},"size":9}},"prediction_fathmm_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_fathmm_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift":{"terms":{"field":"consequences.predictions.SIFT.keyword","order":{"_count":"desc"},"size":9}},"prediction_sift_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_polyphen2_hvar":{"terms":{"field":"consequences.predictions.Polyphen2_HVAR_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_polyphen2_hvar_min":{"min":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_polyphen2_hvar_max":{"max":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_lrt":{"terms":{"field":"consequences.predictions.LRT_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_lrt_min":{"min":{"field":"consequences.predictions.LRT_score"}},"prediction_lrt_max":{"max":{"field":"consequences.predictions.LRT_score"}},"prediction_dann_min":{"min":{"field":"consequences.predictions.DANN_score"}},"prediction_dann_max":{"max":{"field":"consequences.predictions.DANN_score"}},"prediction_cadd_min":{"min":{"field":"consequences.predictions.CADD_score"}},"prediction_cadd_max":{"max":{"field":"consequences.predictions.CADD_score"}},"prediction_revel_min":{"min":{"field":"consequences.predictions.REVEL_score"}},"prediction_revel_max":{"max":{"field":"consequences.predictions.REVEL_score"}},"conservation_phylop_min":{"min":{"field":"consequences.conservationsScores.PhyloP17Way"}},"conservation_phylop_max":{"max":{"field":"consequences.conservationsScores.PhyloP17Way"}},"cohort_rqdm_min":{"min":{"field":"frequencies.interne.AF"}},"cohort_rqdm_max":{"max":{"field":"frequencies.interne.AF"}},"cohort_gnomad_exomes_min":{"min":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_exomes_max":{"max":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_genomes_min":{"min":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_gnomad_genomes_max":{"max":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_exac_min":{"min":{"field":"frequencies.ExAc.AF"}},"cohort_exac_max":{"max":{"field":"frequencies.ExAc.AF"}},"cohort_uk10k_min":{"min":{"field":"frequencies.Uk10k.AF"}},"cohort_uk10k_max":{"max":{"field":"frequencies.Uk10k.AF"}},"cohort_1000gp3_min":{"min":{"field":"frequencies.1000Gp3.AF"}},"cohort_1000gp3_max":{"max":{"field":"frequencies.1000Gp3.AF"}}},"filter":{"bool":{}}},"nested_donors":{"nested":{"path":"donors"},"aggs":{"filtered":{"filter":{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}},"aggs":{"exomiser_score_min":{"min":{"field":"donors.exomiserScore"}},"exomiser_score_max":{"max":{"field":"donors.exomiserScore"}},"transmission":{"terms":{"field":"donors.transmission.keyword","order":{"_count":"desc"},"size":9}},"zygosity":{"terms":{"field":"donors.zygosity.keyword","order":{"_count":"desc"},"size":9}},"metric_depth_quality_min":{"min":{"field":"donors.qd"}},"metric_depth_quality_max":{"max":{"field":"donors.qd"}},"metric_allelic_alt_depth_min":{"min":{"field":"donors.adAlt"}},"metric_allelic_alt_depth_max":{"max":{"field":"donors.adAlt"}},"metric_total_depth_min":{"min":{"field":"donors.adTotal"}},"metric_total_depth_max":{"max":{"field":"donors.adTotal"}},"metric_ratio_min":{"min":{"field":"donors.adFreq"}},"metric_ratio_max":{"max":{"field":"donors.adFreq"}},"metric_genotype_quality_min":{"min":{"field":"donors.gq"}},"metric_genotype_quality_max":{"max":{"field":"donors.gq"}}}}}},"score":{"global":{},"aggs":{"filtered_except_score":{"filter":{"bool":{"filter":[{"bool":{}},{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}]}},"aggs":{}}}},"quality":{"global":{},"aggs":{"filtered_except_quality":{"filter":{"bool":{"filter":[{"bool":{}},{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}]}},"aggs":{}}}}}}
            )
        } )

        it( 'should return correct translation in Query Count translation', () => {
            const countQuery = generateCountQuery( PATIENT_ID, statementInclusion, statementInclusionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( countQuery ).to.eql(
                {"query":{"bool":{"filter":[{"bool":{"should":[{"term":{"consequences.predictions.FATHMM.keyword":"TOLERATED"}}],"minimum_should_match":1}},{"term":{"donors.patientId.keyword":"PA00001"}}]}}}
            )
        } )

        it( 'should return correct translation in Query Search translation', () => {
            const variantQuery = generateVariantQuery( PATIENT_ID, statementInclusion, statementInclusionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT )
            expect( variantQuery ).to.eql(
                {"from":0,"size":25,"query":{"bool":{"filter":[{"bool":{"should":[{"term":{"consequences.predictions.FATHMM.keyword":"TOLERATED"}}],"minimum_should_match":1}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"sort":[{"donors.exomiserScore":{"order":"desc","nested":{"path":"donors","filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}},{"impactScore":{"order":"desc"}}]}
            )
        } )

    } )

    describe( 'Solo Generic Nested', () => {
        const statementUnionQueryKey = uniqid();
        const statementUnion = [
            {
                "key": statementUnionQueryKey,
                "title": "Query 1",
                "instructions": [
                    {
                        "type": "filter",
                        "data": {
                            "id": "zygosity",
                            "type": "generic",
                            "operand": "one",
                            "values": [
                                "HET"
                            ]
                        }
                    }
                ]
            }
        ]
        const statementExclusionQueryKey = uniqid();
        const statementExclusion = [
            {
                "key": statementExclusionQueryKey,
                "title": "Query 2",
                "instructions": [
                    {
                        "type": "filter",
                        "data": {
                            "id": "zygosity",
                            "type": "generic",
                            "operand": "none",
                            "values": [
                                "HOM"
                            ]
                        }
                    }
                ]
            }
        ]

        it( 'should return correct translation for union in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery( PATIENT_ID, statementUnion, statementUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( facetQuery ).to.eql(
                {"size":0,"query":{"bool":{"filter":[{"bool":{"must":[{"nested":{"path":"donors","query":{"bool":{"filter":[{"term":{"donors.patientId.keyword":"PA00001"}},{"bool":{"should":[{"term":{"donors.zygosity.keyword":"HET"}}],"minimum_should_match":1}}]}}}}]}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"aggs":{"filtered":{"aggs":{"variant_type":{"terms":{"field":"type.keyword","order":{"_count":"desc"},"size":999}},"consequence":{"terms":{"field":"consequences.consequence.keyword","order":{"_count":"desc"},"size":999}},"extdb_pubmed":{"terms":{"field":"availableDbExt.pubmed","size":1}},"extdb_clinvar":{"terms":{"field":"availableDbExt.clinvar","size":1}},"extdb_dbsnp":{"terms":{"field":"availableDbExt.dbSNP","size":1}},"chromosome":{"terms":{"field":"chrom.keyword","order":{"_count":"desc"},"size":24}},"gene_type":{"terms":{"field":"genes.biotype.keyword","order":{"_count":"desc"},"size":999}},"extref_hpo":{"terms":{"field":"availableDbExt.hpo","size":1}},"extref_orphanet":{"terms":{"field":"availableDbExt.orphanet","size":1}},"extref_radboudumc":{"terms":{"field":"availableDbExt.radboudumc","size":1}},"extref_omim":{"terms":{"field":"availableDbExt.omim","size":1}},"gene_hpo":{"terms":{"field":"genes.hpo.keyword","order":{"_count":"desc"},"size":9999}},"genegroup_radboud":{"terms":{"field":"genes.radboudumc.keyword","order":{"_count":"desc"},"size":999}},"genegroup_orphanet":{"terms":{"field":"genes.orphanet.panel.keyword","order":{"_count":"desc"},"size":999}},"clinvar_clinsig":{"terms":{"field":"clinvar.clinvar_clinsig.keyword","order":{"_count":"desc"},"size":999}},"impact":{"terms":{"field":"consequences.impact.keyword","order":{"_count":"desc"},"size":999}},"prediction_fathmm":{"terms":{"field":"consequences.predictions.FATHMM.keyword","order":{"_count":"desc"},"size":9}},"prediction_fathmm_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_fathmm_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift":{"terms":{"field":"consequences.predictions.SIFT.keyword","order":{"_count":"desc"},"size":9}},"prediction_sift_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_polyphen2_hvar":{"terms":{"field":"consequences.predictions.Polyphen2_HVAR_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_polyphen2_hvar_min":{"min":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_polyphen2_hvar_max":{"max":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_lrt":{"terms":{"field":"consequences.predictions.LRT_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_lrt_min":{"min":{"field":"consequences.predictions.LRT_score"}},"prediction_lrt_max":{"max":{"field":"consequences.predictions.LRT_score"}},"prediction_dann_min":{"min":{"field":"consequences.predictions.DANN_score"}},"prediction_dann_max":{"max":{"field":"consequences.predictions.DANN_score"}},"prediction_cadd_min":{"min":{"field":"consequences.predictions.CADD_score"}},"prediction_cadd_max":{"max":{"field":"consequences.predictions.CADD_score"}},"prediction_revel_min":{"min":{"field":"consequences.predictions.REVEL_score"}},"prediction_revel_max":{"max":{"field":"consequences.predictions.REVEL_score"}},"conservation_phylop_min":{"min":{"field":"consequences.conservationsScores.PhyloP17Way"}},"conservation_phylop_max":{"max":{"field":"consequences.conservationsScores.PhyloP17Way"}},"cohort_rqdm_min":{"min":{"field":"frequencies.interne.AF"}},"cohort_rqdm_max":{"max":{"field":"frequencies.interne.AF"}},"cohort_gnomad_exomes_min":{"min":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_exomes_max":{"max":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_genomes_min":{"min":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_gnomad_genomes_max":{"max":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_exac_min":{"min":{"field":"frequencies.ExAc.AF"}},"cohort_exac_max":{"max":{"field":"frequencies.ExAc.AF"}},"cohort_uk10k_min":{"min":{"field":"frequencies.Uk10k.AF"}},"cohort_uk10k_max":{"max":{"field":"frequencies.Uk10k.AF"}},"cohort_1000gp3_min":{"min":{"field":"frequencies.1000Gp3.AF"}},"cohort_1000gp3_max":{"max":{"field":"frequencies.1000Gp3.AF"}}},"filter":{"bool":{}}},"nested_donors":{"nested":{"path":"donors"},"aggs":{"filtered":{"filter":{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}},"aggs":{"exomiser_score_min":{"min":{"field":"donors.exomiserScore"}},"exomiser_score_max":{"max":{"field":"donors.exomiserScore"}},"transmission":{"terms":{"field":"donors.transmission.keyword","order":{"_count":"desc"},"size":9}},"zygosity":{"terms":{"field":"donors.zygosity.keyword","order":{"_count":"desc"},"size":9}},"metric_depth_quality_min":{"min":{"field":"donors.qd"}},"metric_depth_quality_max":{"max":{"field":"donors.qd"}},"metric_allelic_alt_depth_min":{"min":{"field":"donors.adAlt"}},"metric_allelic_alt_depth_max":{"max":{"field":"donors.adAlt"}},"metric_total_depth_min":{"min":{"field":"donors.adTotal"}},"metric_total_depth_max":{"max":{"field":"donors.adTotal"}},"metric_ratio_min":{"min":{"field":"donors.adFreq"}},"metric_ratio_max":{"max":{"field":"donors.adFreq"}},"metric_genotype_quality_min":{"min":{"field":"donors.gq"}},"metric_genotype_quality_max":{"max":{"field":"donors.gq"}}}}}},"zygosity":{"global":{},"aggs":{"filtered_except_zygosity":{"filter":{"bool":{"filter":[{"bool":{"must":[{"nested":{"path":"donors","query":{"bool":{"filter":[{"term":{"donors.patientId.keyword":"PA00001"}},{"bool":{"should":[],"minimum_should_match":1}}]}}}}]}}]}},"aggs":{"nested_donors":{"nested":{"path":"donors"},"aggs":{"filtered":{"filter":{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}},"aggs":{"zygosity":{"terms":{"field":"donors.zygosity.keyword","order":{"_count":"desc"},"size":9}}}}}}}}}}}}
            )
        } )

        it( 'should return correct translation for union in Query Count translation', () => {
            const countQuery = generateCountQuery( PATIENT_ID, statementUnion, statementUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( countQuery ).to.eql(
                {"query":{"bool":{"filter":[{"bool":{"must":[{"nested":{"path":"donors","query":{"bool":{"filter":[{"term":{"donors.patientId.keyword":"PA00001"}},{"bool":{"should":[{"term":{"donors.zygosity.keyword":"HET"}}],"minimum_should_match":1}}]}}}}]}},{"term":{"donors.patientId.keyword":"PA00001"}}]}}}
            )
        } )

        it( 'should return correct translation for union in Query Search translation', () => {
            const variantQuery = generateVariantQuery( PATIENT_ID, statementUnion, statementUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT )
            expect( variantQuery ).to.eql(
                {"from":0,"size":25,"query":{"bool":{"filter":[{"bool":{"must":[{"nested":{"path":"donors","query":{"bool":{"filter":[{"term":{"donors.patientId.keyword":"PA00001"}},{"bool":{"should":[{"term":{"donors.zygosity.keyword":"HET"}}],"minimum_should_match":1}}]}}}}]}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"sort":[{"donors.exomiserScore":{"order":"desc","nested":{"path":"donors","filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}},{"impactScore":{"order":"desc"}}]}
            )
        } )

        it( 'should return correct translation for exclusion in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery( PATIENT_ID, statementExclusion, statementExclusionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( facetQuery ).to.eql(
                {"size":0,"query":{"bool":{"filter":[{"bool":{"must":[{"nested":{"path":"donors","query":{"bool":{"filter":[{"term":{"donors.patientId.keyword":"PA00001"}},{"bool":{"must_not":[{"term":{"donors.zygosity.keyword":"HOM"}}]}}]}}}}]}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"aggs":{"filtered":{"aggs":{"variant_type":{"terms":{"field":"type.keyword","order":{"_count":"desc"},"size":999}},"consequence":{"terms":{"field":"consequences.consequence.keyword","order":{"_count":"desc"},"size":999}},"extdb_pubmed":{"terms":{"field":"availableDbExt.pubmed","size":1}},"extdb_clinvar":{"terms":{"field":"availableDbExt.clinvar","size":1}},"extdb_dbsnp":{"terms":{"field":"availableDbExt.dbSNP","size":1}},"chromosome":{"terms":{"field":"chrom.keyword","order":{"_count":"desc"},"size":24}},"gene_type":{"terms":{"field":"genes.biotype.keyword","order":{"_count":"desc"},"size":999}},"extref_hpo":{"terms":{"field":"availableDbExt.hpo","size":1}},"extref_orphanet":{"terms":{"field":"availableDbExt.orphanet","size":1}},"extref_radboudumc":{"terms":{"field":"availableDbExt.radboudumc","size":1}},"extref_omim":{"terms":{"field":"availableDbExt.omim","size":1}},"gene_hpo":{"terms":{"field":"genes.hpo.keyword","order":{"_count":"desc"},"size":9999}},"genegroup_radboud":{"terms":{"field":"genes.radboudumc.keyword","order":{"_count":"desc"},"size":999}},"genegroup_orphanet":{"terms":{"field":"genes.orphanet.panel.keyword","order":{"_count":"desc"},"size":999}},"clinvar_clinsig":{"terms":{"field":"clinvar.clinvar_clinsig.keyword","order":{"_count":"desc"},"size":999}},"impact":{"terms":{"field":"consequences.impact.keyword","order":{"_count":"desc"},"size":999}},"prediction_fathmm":{"terms":{"field":"consequences.predictions.FATHMM.keyword","order":{"_count":"desc"},"size":9}},"prediction_fathmm_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_fathmm_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift":{"terms":{"field":"consequences.predictions.SIFT.keyword","order":{"_count":"desc"},"size":9}},"prediction_sift_min":{"min":{"field":"consequences.predictions.SIFT_score"}},"prediction_sift_max":{"max":{"field":"consequences.predictions.SIFT_score"}},"prediction_polyphen2_hvar":{"terms":{"field":"consequences.predictions.Polyphen2_HVAR_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_polyphen2_hvar_min":{"min":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_polyphen2_hvar_max":{"max":{"field":"consequences.predictions.Polyphen2_HVAR_score"}},"prediction_lrt":{"terms":{"field":"consequences.predictions.LRT_pred.keyword","order":{"_count":"desc"},"size":9}},"prediction_lrt_min":{"min":{"field":"consequences.predictions.LRT_score"}},"prediction_lrt_max":{"max":{"field":"consequences.predictions.LRT_score"}},"prediction_dann_min":{"min":{"field":"consequences.predictions.DANN_score"}},"prediction_dann_max":{"max":{"field":"consequences.predictions.DANN_score"}},"prediction_cadd_min":{"min":{"field":"consequences.predictions.CADD_score"}},"prediction_cadd_max":{"max":{"field":"consequences.predictions.CADD_score"}},"prediction_revel_min":{"min":{"field":"consequences.predictions.REVEL_score"}},"prediction_revel_max":{"max":{"field":"consequences.predictions.REVEL_score"}},"conservation_phylop_min":{"min":{"field":"consequences.conservationsScores.PhyloP17Way"}},"conservation_phylop_max":{"max":{"field":"consequences.conservationsScores.PhyloP17Way"}},"cohort_rqdm_min":{"min":{"field":"frequencies.interne.AF"}},"cohort_rqdm_max":{"max":{"field":"frequencies.interne.AF"}},"cohort_gnomad_exomes_min":{"min":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_exomes_max":{"max":{"field":"frequencies.gnomAD_exomes.AF"}},"cohort_gnomad_genomes_min":{"min":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_gnomad_genomes_max":{"max":{"field":"frequencies.gnomAD_genomes.AF"}},"cohort_exac_min":{"min":{"field":"frequencies.ExAc.AF"}},"cohort_exac_max":{"max":{"field":"frequencies.ExAc.AF"}},"cohort_uk10k_min":{"min":{"field":"frequencies.Uk10k.AF"}},"cohort_uk10k_max":{"max":{"field":"frequencies.Uk10k.AF"}},"cohort_1000gp3_min":{"min":{"field":"frequencies.1000Gp3.AF"}},"cohort_1000gp3_max":{"max":{"field":"frequencies.1000Gp3.AF"}}},"filter":{"bool":{}}},"nested_donors":{"nested":{"path":"donors"},"aggs":{"filtered":{"filter":{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}},"aggs":{"exomiser_score_min":{"min":{"field":"donors.exomiserScore"}},"exomiser_score_max":{"max":{"field":"donors.exomiserScore"}},"transmission":{"terms":{"field":"donors.transmission.keyword","order":{"_count":"desc"},"size":9}},"zygosity":{"terms":{"field":"donors.zygosity.keyword","order":{"_count":"desc"},"size":9}},"metric_depth_quality_min":{"min":{"field":"donors.qd"}},"metric_depth_quality_max":{"max":{"field":"donors.qd"}},"metric_allelic_alt_depth_min":{"min":{"field":"donors.adAlt"}},"metric_allelic_alt_depth_max":{"max":{"field":"donors.adAlt"}},"metric_total_depth_min":{"min":{"field":"donors.adTotal"}},"metric_total_depth_max":{"max":{"field":"donors.adTotal"}},"metric_ratio_min":{"min":{"field":"donors.adFreq"}},"metric_ratio_max":{"max":{"field":"donors.adFreq"}},"metric_genotype_quality_min":{"min":{"field":"donors.gq"}},"metric_genotype_quality_max":{"max":{"field":"donors.gq"}}}}}},"zygosity":{"global":{},"aggs":{"filtered_except_zygosity":{"filter":{"bool":{"filter":[{"bool":{"must":[{"nested":{"path":"donors","query":{"bool":{"filter":[{"term":{"donors.patientId.keyword":"PA00001"}},{"bool":{"must_not":[]}}]}}}}]}}]}},"aggs":{"nested_donors":{"nested":{"path":"donors"},"aggs":{"filtered":{"filter":{"bool":{"filter":{"term":{"donors.patientId.keyword":"PA00001"}}}},"aggs":{"zygosity":{"terms":{"field":"donors.zygosity.keyword","order":{"_count":"desc"},"size":9}}}}}}}}}}}}
            )
        } )

        it( 'should return correct translation for exclusion in Query Count translation', () => {
            const countQuery = generateCountQuery( PATIENT_ID, statementExclusion, statementExclusionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1 )
            expect( countQuery ).to.eql(
                {"query":{"bool":{"filter":[{"bool":{"must":[{"nested":{"path":"donors","query":{"bool":{"filter":[{"term":{"donors.patientId.keyword":"PA00001"}},{"bool":{"must_not":[{"term":{"donors.zygosity.keyword":"HOM"}}]}}]}}}}]}},{"term":{"donors.patientId.keyword":"PA00001"}}]}}}
            )
        } )

        it( 'should return correct translation for exclusion in Query Search translation', () => {
            const variantQuery = generateVariantQuery( PATIENT_ID, statementExclusion, statementExclusionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT )
            expect( variantQuery ).to.eql(
                {"from":0,"size":25,"query":{"bool":{"filter":[{"bool":{"must":[{"nested":{"path":"donors","query":{"bool":{"filter":[{"term":{"donors.patientId.keyword":"PA00001"}},{"bool":{"must_not":[{"term":{"donors.zygosity.keyword":"HOM"}}]}}]}}}}]}},{"term":{"donors.patientId.keyword":"PA00001"}}]}},"sort":[{"donors.exomiserScore":{"order":"desc","nested":{"path":"donors","filter":{"term":{"donors.patientId.keyword":"PA00001"}}}}},{"impactScore":{"order":"desc"}}]}
            )
        } )

    } )


} )
