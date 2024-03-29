/* eslint-disable */

import {readFileSync} from 'fs'
import {expect} from 'chai'
import uniqid from 'uniqid'

import {generateVariantQuery, generateFacetQuery, generateCountQuery} from '../../src/services/elastic'

import {DIALECT_LANGUAGE_ELASTIC_SEARCH, elasticSearchTranslator} from '../../src/services/api/variant/sqon/dialect/es'
import translate from '../../src/services/api/variant/sqon'

const ELASTIC_SEARCH_SCHEMA_V1 = JSON.parse(readFileSync(`${__dirname}/1.json`, 'utf8'))

const PATIENT_ID = 'PA00001';
const ADMINISTRATOR_ACL = {roles: ['clin_administrator'], organization_id: 'OR00202', practitioner_id: 'PR00601'}
const GENETICIAN_ACL = {roles: ['clin_genetician'], organization_id: 'OR00203', practitioner_id: 'PR00602'}
const PRACTITIONER_ACL = {roles: ['clin_practitioner'], organization_id: 'OR00204', practitioner_id: 'PR00603'}
const EMPTY_STATEMENT_QUERY = uniqid();
const EMPTY_STATEMENT = [{"key": EMPTY_STATEMENT_QUERY, "instructions": [], "title": "Query 1"}];
const DEFAULT_GROUP = ELASTIC_SEARCH_SCHEMA_V1.defaultGroup;
const DEFAULT_INDEX = 0;
const DEFAULT_LIMIT = 25;


describe('SQON (JSON) to ElasticSearch Query Translation For Schema V1', () => {

    it('should return a broad translation for a valid SQON', () => {
        const translatedQuery = translate(EMPTY_STATEMENT, EMPTY_STATEMENT_QUERY, ELASTIC_SEARCH_SCHEMA_V1, DIALECT_LANGUAGE_ELASTIC_SEARCH)
        expect(translatedQuery).to.eql(
            elasticSearchTranslator.emptyTranslation
        )
    })

    it('should return a broad translation for an invalid SQON', () => {
        const translatedQuery = translate(null, null, ELASTIC_SEARCH_SCHEMA_V1, DIALECT_LANGUAGE_ELASTIC_SEARCH)
        expect(translatedQuery).to.eql(
            elasticSearchTranslator.emptyTranslation
        )
    })

    describe('Roles & Permissions', () => {
        it('should contain ACL for Administrator role in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery(PATIENT_ID, EMPTY_STATEMENT, EMPTY_STATEMENT_QUERY, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(facetQuery).to.eql(
                {
                    "size": 0,
                    "query": {"bool": {"filter": [{"term": {"donors.patient_id": "PA00001"}}]}},
                    "aggs": {
                        "filtered": {
                            "aggs": {
                                "variant_type": {
                                    "terms": {
                                        "field": "variant_class",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "consequence": {
                                    "terms": {
                                        "field": "consequences.consequence",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extdb_pubmed": {"terms": {"field": "ext_db.is_pubmed", "size": 1}},
                                "extdb_clinvar": {"terms": {"field": "ext_db.is_clinvar", "size": 1}},
                                "extdb_dbsnp": {"terms": {"field": "ext_db.is_dbsnp", "size": 1}},
                                "chromosome": {
                                    "terms": {
                                         "field": "chromosome",
                                        "order": {"_count": "desc"},
                                        "size": 24
                                    }
                                },
                                "gene_type": {
                                    "terms": {
                                        "field": "genes.biotype",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extref_hpo": {"terms": {"field": "ext_db.is_hpo", "size": 1}},
                                "extref_orphanet": {"terms": {"field": "ext_db.is_orphanet", "size": 1}},

                                "extref_omim": {"terms": {"field": "ext_db.is_omim", "size": 1}},
                                "gene_hpo": {
                                    "terms": {
                                        "field": "genes.hpo.hpo_term_label",
                                        "order": {"_count": "desc"},
                                        "size": 9999
                                    }
                                },

                                "genegroup_orphanet": {
                                    "terms": {
                                        "field": "genes.orphanet.panel",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "clinvar_clinsig": {
                                    "terms": {
                                        "field": "clinvar.clin_sig",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "impact": {
                                    "terms": {
                                        "field": "consequences.impact",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "prediction_fathmm": {
                                    "terms": {
                                        "field": "consequences.predictions.fathmm_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_fathmm_min": {"min": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_fathmm_max": {"max": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_sift": {
                                    "terms": {
                                        "field": "consequences.predictions.sift_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_sift_min": {"min": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_sift_max": {"max": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_polyphen2_hvar": {
                                    "terms": {
                                        "field": "consequences.predictions.polyphen2_hvar_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_polyphen2_hvar_min": {"min": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_polyphen2_hvar_max": {"max": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_lrt": {
                                    "terms": {
                                        "field": "consequences.predictions.lrt_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_lrt_min": {"min": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_lrt_max": {"max": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_dann_min": {"min": {"field": "consequences.predictions.dann_score"}},
                                "prediction_dann_max": {"max": {"field": "consequences.predictions.dann_score"}},
                                "prediction_cadd_min": {"min": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_cadd_max": {"max": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_revel_min": {"min": {"field": "consequences.predictions.revel_rankscore"}},
                                "prediction_revel_max": {"max": {"field": "consequences.predictions.revel_rankscore"}},
                                "conservation_phylop_min": {"min": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "conservation_phylop_max": {"max": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "cohort_rqdm_min": {"min": {"field": "frequencies.internal.af"}},
                                "cohort_rqdm_max": {"max": {"field": "frequencies.internal.af"}},

                                "cohort_gnomad_genomes_min": {"min": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_gnomad_genomes_max": {"max": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_exac_min": {"min": {"field": "frequencies.exac.af"}},
                                "cohort_exac_max": {"max": {"field": "frequencies.exac.af"}},

                                "cohort_1000gp3_min": {"min": {"field": "frequencies.1000_genomes.af"}},
                                "cohort_1000gp3_max": {"max": {"field": "frequencies.1000_genomes.af"}}
                            }, "filter": {"bool": {}}
                        }, "nested_donors": {
                            "nested": {"path": "donors"}, "aggs": {
                                "filtered": {
                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                    "aggs": {


                                        "zygosity": {
                                            "terms": {
                                                "field": "donors.zygosity",
                                                "order": {"_count": "desc"},
                                                "size": 9
                                            }
                                        },
                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}},
                                        "metric_allelic_alt_depth_min": {"min": {"field": "donors.ad_alt"}},
                                        "metric_allelic_alt_depth_max": {"max": {"field": "donors.ad_alt"}},
                                        "metric_total_depth_min": {"min": {"field": "donors.ad_total"}},
                                        "metric_total_depth_max": {"max": {"field": "donors.ad_total"}},
                                        "metric_ratio_min": {"min": {"field": "donors.ad_ratio"}},
                                        "metric_ratio_max": {"max": {"field": "donors.ad_ratio"}},
                                        "metric_genotype_quality_min": {"min": {"field": "donors.gq"}},
                                        "metric_genotype_quality_max": {"max": {"field": "donors.gq"}}
                                    }
                                }
                            }
                        }
                    }
                }
            )
        })

        it('should contain ACL for Genetician role in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery(PATIENT_ID, EMPTY_STATEMENT, EMPTY_STATEMENT_QUERY, GENETICIAN_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(facetQuery).to.eql(
                {
                    "size": 0,
                    "query": {"bool": {"filter": [{"term": {"donors.patient_id": "PA00001"}}]}},
                    "aggs": {
                        "filtered": {
                            "aggs": {
                                "variant_type": {
                                    "terms": {
                                        "field": "variant_class",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "consequence": {
                                    "terms": {
                                        "field": "consequences.consequence",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extdb_pubmed": {"terms": {"field": "ext_db.is_pubmed", "size": 1}},
                                "extdb_clinvar": {"terms": {"field": "ext_db.is_clinvar", "size": 1}},
                                "extdb_dbsnp": {"terms": {"field": "ext_db.is_dbsnp", "size": 1}},
                                "chromosome": {
                                    "terms": {
                                         "field": "chromosome",
                                        "order": {"_count": "desc"},
                                        "size": 24
                                    }
                                },
                                "gene_type": {
                                    "terms": {
                                        "field": "genes.biotype",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extref_hpo": {"terms": {"field": "ext_db.is_hpo", "size": 1}},
                                "extref_orphanet": {"terms": {"field": "ext_db.is_orphanet", "size": 1}},

                                "extref_omim": {"terms": {"field": "ext_db.is_omim", "size": 1}},
                                "gene_hpo": {
                                    "terms": {
                                        "field": "genes.hpo.hpo_term_label",
                                        "order": {"_count": "desc"},
                                        "size": 9999
                                    }
                                },

                                "genegroup_orphanet": {
                                    "terms": {
                                        "field": "genes.orphanet.panel",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "clinvar_clinsig": {
                                    "terms": {
                                        "field": "clinvar.clin_sig",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "impact": {
                                    "terms": {
                                        "field": "consequences.impact",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "prediction_fathmm": {
                                    "terms": {
                                        "field": "consequences.predictions.fathmm_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_fathmm_min": {"min": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_fathmm_max": {"max": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_sift": {
                                    "terms": {
                                        "field": "consequences.predictions.sift_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_sift_min": {"min": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_sift_max": {"max": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_polyphen2_hvar": {
                                    "terms": {
                                        "field": "consequences.predictions.polyphen2_hvar_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_polyphen2_hvar_min": {"min": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_polyphen2_hvar_max": {"max": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_lrt": {
                                    "terms": {
                                        "field": "consequences.predictions.lrt_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_lrt_min": {"min": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_lrt_max": {"max": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_dann_min": {"min": {"field": "consequences.predictions.dann_score"}},
                                "prediction_dann_max": {"max": {"field": "consequences.predictions.dann_score"}},
                                "prediction_cadd_min": {"min": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_cadd_max": {"max": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_revel_min": {"min": {"field": "consequences.predictions.revel_rankscore"}},
                                "prediction_revel_max": {"max": {"field": "consequences.predictions.revel_rankscore"}},
                                "conservation_phylop_min": {"min": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "conservation_phylop_max": {"max": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "cohort_rqdm_min": {"min": {"field": "frequencies.internal.af"}},
                                "cohort_rqdm_max": {"max": {"field": "frequencies.internal.af"}},

                                "cohort_gnomad_genomes_min": {"min": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_gnomad_genomes_max": {"max": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_exac_min": {"min": {"field": "frequencies.exac.af"}},
                                "cohort_exac_max": {"max": {"field": "frequencies.exac.af"}},

                                "cohort_1000gp3_min": {"min": {"field": "frequencies.1000_genomes.af"}},
                                "cohort_1000gp3_max": {"max": {"field": "frequencies.1000_genomes.af"}}
                            }, "filter": {"bool": {}}
                        }, "nested_donors": {
                            "nested": {"path": "donors"}, "aggs": {
                                "filtered": {
                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                    "aggs": {


                                        "zygosity": {
                                            "terms": {
                                                "field": "donors.zygosity",
                                                "order": {"_count": "desc"},
                                                "size": 9
                                            }
                                        },
                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}},
                                        "metric_allelic_alt_depth_min": {"min": {"field": "donors.ad_alt"}},
                                        "metric_allelic_alt_depth_max": {"max": {"field": "donors.ad_alt"}},
                                        "metric_total_depth_min": {"min": {"field": "donors.ad_total"}},
                                        "metric_total_depth_max": {"max": {"field": "donors.ad_total"}},
                                        "metric_ratio_min": {"min": {"field": "donors.ad_ratio"}},
                                        "metric_ratio_max": {"max": {"field": "donors.ad_ratio"}},
                                        "metric_genotype_quality_min": {"min": {"field": "donors.gq"}},
                                        "metric_genotype_quality_max": {"max": {"field": "donors.gq"}}
                                    }
                                }
                            }
                        }
                    }
                }
            )
        })

        it('should contain ACL for Practitioner role in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery(PATIENT_ID, EMPTY_STATEMENT, EMPTY_STATEMENT_QUERY, PRACTITIONER_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(facetQuery).to.eql(
                {
                    "size": 0,
                    "query": {"bool": {"filter": [{"term": {"donors.patient_id": "PA00001"}}]}},
                    "aggs": {
                        "filtered": {
                            "aggs": {
                                "variant_type": {
                                    "terms": {
                                        "field": "variant_class",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "consequence": {
                                    "terms": {
                                        "field": "consequences.consequence",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extdb_pubmed": {"terms": {"field": "ext_db.is_pubmed", "size": 1}},
                                "extdb_clinvar": {"terms": {"field": "ext_db.is_clinvar", "size": 1}},
                                "extdb_dbsnp": {"terms": {"field": "ext_db.is_dbsnp", "size": 1}},
                                "chromosome": {
                                    "terms": {
                                         "field": "chromosome",
                                        "order": {"_count": "desc"},
                                        "size": 24
                                    }
                                },
                                "gene_type": {
                                    "terms": {
                                        "field": "genes.biotype",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extref_hpo": {"terms": {"field": "ext_db.is_hpo", "size": 1}},
                                "extref_orphanet": {"terms": {"field": "ext_db.is_orphanet", "size": 1}},

                                "extref_omim": {"terms": {"field": "ext_db.is_omim", "size": 1}},
                                "gene_hpo": {
                                    "terms": {
                                        "field": "genes.hpo.hpo_term_label",
                                        "order": {"_count": "desc"},
                                        "size": 9999
                                    }
                                },

                                "genegroup_orphanet": {
                                    "terms": {
                                        "field": "genes.orphanet.panel",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "clinvar_clinsig": {
                                    "terms": {
                                        "field": "clinvar.clin_sig",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "impact": {
                                    "terms": {
                                        "field": "consequences.impact",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "prediction_fathmm": {
                                    "terms": {
                                        "field": "consequences.predictions.fathmm_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_fathmm_min": {"min": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_fathmm_max": {"max": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_sift": {
                                    "terms": {
                                        "field": "consequences.predictions.sift_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_sift_min": {"min": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_sift_max": {"max": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_polyphen2_hvar": {
                                    "terms": {
                                        "field": "consequences.predictions.polyphen2_hvar_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_polyphen2_hvar_min": {"min": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_polyphen2_hvar_max": {"max": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_lrt": {
                                    "terms": {
                                        "field": "consequences.predictions.lrt_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_lrt_min": {"min": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_lrt_max": {"max": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_dann_min": {"min": {"field": "consequences.predictions.dann_score"}},
                                "prediction_dann_max": {"max": {"field": "consequences.predictions.dann_score"}},
                                "prediction_cadd_min": {"min": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_cadd_max": {"max": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_revel_min": {"min": {"field": "consequences.predictions.revel_rankscore"}},
                                "prediction_revel_max": {"max": {"field": "consequences.predictions.revel_rankscore"}},
                                "conservation_phylop_min": {"min": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "conservation_phylop_max": {"max": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "cohort_rqdm_min": {"min": {"field": "frequencies.internal.af"}},
                                "cohort_rqdm_max": {"max": {"field": "frequencies.internal.af"}},
                                "cohort_gnomad_genomes_min": {"min": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_gnomad_genomes_max": {"max": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_exac_min": {"min": {"field": "frequencies.exac.af"}},
                                "cohort_exac_max": {"max": {"field": "frequencies.exac.af"}},

                                "cohort_1000gp3_min": {"min": {"field": "frequencies.1000_genomes.af"}},
                                "cohort_1000gp3_max": {"max": {"field": "frequencies.1000_genomes.af"}}
                            }, "filter": {"bool": {}}
                        }, "nested_donors": {
                            "nested": {"path": "donors"}, "aggs": {
                                "filtered": {
                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                    "aggs": {
                                        "zygosity": {
                                            "terms": {
                                                "field": "donors.zygosity",
                                                "order": {"_count": "desc"},
                                                "size": 9
                                            }
                                        },
                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}},
                                        "metric_allelic_alt_depth_min": {"min": {"field": "donors.ad_alt"}},
                                        "metric_allelic_alt_depth_max": {"max": {"field": "donors.ad_alt"}},
                                        "metric_total_depth_min": {"min": {"field": "donors.ad_total"}},
                                        "metric_total_depth_max": {"max": {"field": "donors.ad_total"}},
                                        "metric_ratio_min": {"min": {"field": "donors.ad_ratio"}},
                                        "metric_ratio_max": {"max": {"field": "donors.ad_ratio"}},
                                        "metric_genotype_quality_min": {"min": {"field": "donors.gq"}},
                                        "metric_genotype_quality_max": {"max": {"field": "donors.gq"}}
                                    }
                                }
                            }
                        }
                    }
                }
            )
        })

        it('should contain ACL for Administrator role in Query Count translation', () => {
            const countQuery = generateCountQuery(PATIENT_ID, EMPTY_STATEMENT, EMPTY_STATEMENT_QUERY, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(countQuery).to.eql(
                {"query": {"bool": {"filter": [{"term": {"donors.patient_id": "PA00001"}}]}}}
            )
        })

        it('should contain ACL for Genetician role Query Count translation', () => {
            const countQuery = generateCountQuery(PATIENT_ID, EMPTY_STATEMENT, EMPTY_STATEMENT_QUERY, GENETICIAN_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(countQuery).to.eql(
                {"query": {"bool": {"filter": [{"term": {"donors.patient_id": "PA00001"}}]}}}
            )
        })

        it('should contain ACL for Practitioner role in Query Count translation', () => {
            const countQuery = generateCountQuery(PATIENT_ID, EMPTY_STATEMENT, EMPTY_STATEMENT_QUERY, PRACTITIONER_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(countQuery).to.eql(
                {"query": {"bool": {"filter": [{"term": {"donors.patient_id": "PA00001"}}]}}}
            )
        })

        it('should contain ACL for Administrator role in Query Search translation', () => {
            const variantQuery = generateVariantQuery(PATIENT_ID, EMPTY_STATEMENT, EMPTY_STATEMENT_QUERY, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT)
            expect(variantQuery).to.eql(
                {
                    "from": 0,
                    "size": 25,
                    "query": {"bool": {"filter": [{"term": {"donors.patient_id": "PA00001"}}]}},
                    "sort": [{"impact_score": {"order": "desc"}}]

                }
            )
        })

        it('should contain ACL for Genetician role in Query Search translation', () => {
            const variantQuery = generateVariantQuery(PATIENT_ID, EMPTY_STATEMENT, EMPTY_STATEMENT_QUERY, GENETICIAN_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT)
            expect(variantQuery).to.eql(
                {
                    "from": 0,
                    "size": 25,
                    "query": {"bool": {"filter": [{"term": {"donors.patient_id": "PA00001"}}]}},
                    "sort": [{"impact_score": {"order": "desc"}}]

                }
            )
        })

        it('should contain ACL for Practitioner role in Query Search translation', () => {
            const variantQuery = generateVariantQuery(PATIENT_ID, EMPTY_STATEMENT, EMPTY_STATEMENT_QUERY, PRACTITIONER_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT)
            expect(variantQuery).to.eql(
                {
                    "from": 0,
                    "size": 25,
                    "query": {"bool": {"filter": [{"term": {"donors.patient_id": "PA00001"}}]}},
                    "sort": [{"impact_score": {"order": "desc"}}]

                }
            )
        })
    })

    describe('Solo Generic 1:1', () => {
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

        it('should return correct translation for single union in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery(PATIENT_ID, statementSingleUnionOne, statementSingleUnionOneQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(facetQuery).to.eql(
                {
                    "size": 0,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "should": [{"term": {"variant_class": "SNV"}}],
                                    "minimum_should_match": 1
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "aggs": {
                        "filtered": {
                            "aggs": {
                                "variant_type": {
                                    "terms": {
                                        "field": "variant_class",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "consequence": {
                                    "terms": {
                                        "field": "consequences.consequence",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extdb_pubmed": {"terms": {"field": "ext_db.is_pubmed", "size": 1}},
                                "extdb_clinvar": {"terms": {"field": "ext_db.is_clinvar", "size": 1}},
                                "extdb_dbsnp": {"terms": {"field": "ext_db.is_dbsnp", "size": 1}},
                                "chromosome": {
                                    "terms": {
                                         "field": "chromosome",
                                        "order": {"_count": "desc"},
                                        "size": 24
                                    }
                                },
                                "gene_type": {
                                    "terms": {
                                        "field": "genes.biotype",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extref_hpo": {"terms": {"field": "ext_db.is_hpo", "size": 1}},
                                "extref_orphanet": {"terms": {"field": "ext_db.is_orphanet", "size": 1}},
                                "extref_omim": {"terms": {"field": "ext_db.is_omim", "size": 1}},
                                "gene_hpo": {
                                    "terms": {
                                        "field": "genes.hpo.hpo_term_label",
                                        "order": {"_count": "desc"},
                                        "size": 9999
                                    }
                                },

                                "genegroup_orphanet": {
                                    "terms": {
                                        "field": "genes.orphanet.panel",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "clinvar_clinsig": {
                                    "terms": {
                                        "field": "clinvar.clin_sig",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "impact": {
                                    "terms": {
                                        "field": "consequences.impact",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "prediction_fathmm": {
                                    "terms": {
                                        "field": "consequences.predictions.fathmm_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_fathmm_min": {"min": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_fathmm_max": {"max": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_sift": {
                                    "terms": {
                                        "field": "consequences.predictions.sift_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_sift_min": {"min": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_sift_max": {"max": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_polyphen2_hvar": {
                                    "terms": {
                                        "field": "consequences.predictions.polyphen2_hvar_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_polyphen2_hvar_min": {"min": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_polyphen2_hvar_max": {"max": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_lrt": {
                                    "terms": {
                                        "field": "consequences.predictions.lrt_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_lrt_min": {"min": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_lrt_max": {"max": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_dann_min": {"min": {"field": "consequences.predictions.dann_score"}},
                                "prediction_dann_max": {"max": {"field": "consequences.predictions.dann_score"}},
                                "prediction_cadd_min": {"min": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_cadd_max": {"max": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_revel_min": {"min": {"field": "consequences.predictions.revel_rankscore"}},
                                "prediction_revel_max": {"max": {"field": "consequences.predictions.revel_rankscore"}},
                                "conservation_phylop_min": {"min": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "conservation_phylop_max": {"max": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "cohort_rqdm_min": {"min": {"field": "frequencies.internal.af"}},
                                "cohort_rqdm_max": {"max": {"field": "frequencies.internal.af"}},
                                "cohort_gnomad_genomes_min": {"min": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_gnomad_genomes_max": {"max": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_exac_min": {"min": {"field": "frequencies.exac.af"}},
                                "cohort_exac_max": {"max": {"field": "frequencies.exac.af"}},

                                "cohort_1000gp3_min": {"min": {"field": "frequencies.1000_genomes.af"}},
                                "cohort_1000gp3_max": {"max": {"field": "frequencies.1000_genomes.af"}}
                            }, "filter": {"bool": {}}
                        },
                        "nested_donors": {
                            "nested": {"path": "donors"}, "aggs": {
                                "filtered": {
                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                    "aggs": {


                                        "zygosity": {
                                            "terms": {
                                                "field": "donors.zygosity",
                                                "order": {"_count": "desc"},
                                                "size": 9
                                            }
                                        },
                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}},
                                        "metric_allelic_alt_depth_min": {"min": {"field": "donors.ad_alt"}},
                                        "metric_allelic_alt_depth_max": {"max": {"field": "donors.ad_alt"}},
                                        "metric_total_depth_min": {"min": {"field": "donors.ad_total"}},
                                        "metric_total_depth_max": {"max": {"field": "donors.ad_total"}},
                                        "metric_ratio_min": {"min": {"field": "donors.ad_ratio"}},
                                        "metric_ratio_max": {"max": {"field": "donors.ad_ratio"}},
                                        "metric_genotype_quality_min": {"min": {"field": "donors.gq"}},
                                        "metric_genotype_quality_max": {"max": {"field": "donors.gq"}}
                                    }
                                }
                            }
                        },
                        "variant_type": {
                            "global": {},
                            "aggs": {
                                "filtered_except_variant_type": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "should": [],
                                                    "minimum_should_match": 1
                                                }
                                            }, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]
                                        }
                                    },
                                    "aggs": {
                                        "variant_type": {
                                            "terms": {
                                                "field": "variant_class",
                                                "order": {"_count": "desc"},
                                                "size": 999
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            )
        })

        it('should return correct translation for single union in Query Count translation', () => {
            const countQuery = generateCountQuery(PATIENT_ID, statementSingleUnionOne, statementSingleUnionOneQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(countQuery).to.eql(
                {
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "should": [{"term": {"variant_class": "SNV"}}],
                                    "minimum_should_match": 1
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    }
                }
            )
        })

        it('should return correct translation for single union in Query Search translation', () => {
            const variantQuery = generateVariantQuery(PATIENT_ID, statementSingleUnionOne, statementSingleUnionOneQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT)
            expect(variantQuery).to.eql(
                {
                    "from": 0,
                    "size": 25,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "should": [{"term": {"variant_class": "SNV"}}],
                                    "minimum_should_match": 1
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "sort": [{"impact_score": {"order": "desc"}}]

                }
            )
        })

        it('should return correct translation for single exclusion in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery(PATIENT_ID, statementSingleExclusion, statementSingleExclusionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(facetQuery).to.eql(
                {
                    "size": 0,
                    "query": {"bool": {"filter": [{"bool": {"must_not": [{"term": {"variant_class": "insertion"}}]}}, {"term": {"donors.patient_id": "PA00001"}}]}},
                    "aggs": {
                        "filtered": {
                            "aggs": {
                                "variant_type": {
                                    "terms": {
                                        "field": "variant_class",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "consequence": {
                                    "terms": {
                                        "field": "consequences.consequence",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extdb_pubmed": {"terms": {"field": "ext_db.is_pubmed", "size": 1}},
                                "extdb_clinvar": {"terms": {"field": "ext_db.is_clinvar", "size": 1}},
                                "extdb_dbsnp": {"terms": {"field": "ext_db.is_dbsnp", "size": 1}},
                                "chromosome": {
                                    "terms": {
                                         "field": "chromosome",
                                        "order": {"_count": "desc"},
                                        "size": 24
                                    }
                                },
                                "gene_type": {
                                    "terms": {
                                        "field": "genes.biotype",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extref_hpo": {"terms": {"field": "ext_db.is_hpo", "size": 1}},
                                "extref_orphanet": {"terms": {"field": "ext_db.is_orphanet", "size": 1}},

                                "extref_omim": {"terms": {"field": "ext_db.is_omim", "size": 1}},
                                "gene_hpo": {
                                    "terms": {
                                        "field": "genes.hpo.hpo_term_label",
                                        "order": {"_count": "desc"},
                                        "size": 9999
                                    }
                                },

                                "genegroup_orphanet": {
                                    "terms": {
                                        "field": "genes.orphanet.panel",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "clinvar_clinsig": {
                                    "terms": {
                                        "field": "clinvar.clin_sig",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "impact": {
                                    "terms": {
                                        "field": "consequences.impact",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "prediction_fathmm": {
                                    "terms": {
                                        "field": "consequences.predictions.fathmm_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_fathmm_min": {"min": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_fathmm_max": {"max": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_sift": {
                                    "terms": {
                                        "field": "consequences.predictions.sift_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_sift_min": {"min": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_sift_max": {"max": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_polyphen2_hvar": {
                                    "terms": {
                                        "field": "consequences.predictions.polyphen2_hvar_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_polyphen2_hvar_min": {"min": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_polyphen2_hvar_max": {"max": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_lrt": {
                                    "terms": {
                                        "field": "consequences.predictions.lrt_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_lrt_min": {"min": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_lrt_max": {"max": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_dann_min": {"min": {"field": "consequences.predictions.dann_score"}},
                                "prediction_dann_max": {"max": {"field": "consequences.predictions.dann_score"}},
                                "prediction_cadd_min": {"min": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_cadd_max": {"max": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_revel_min": {"min": {"field": "consequences.predictions.revel_rankscore"}},
                                "prediction_revel_max": {"max": {"field": "consequences.predictions.revel_rankscore"}},
                                "conservation_phylop_min": {"min": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "conservation_phylop_max": {"max": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "cohort_rqdm_min": {"min": {"field": "frequencies.internal.af"}},
                                "cohort_rqdm_max": {"max": {"field": "frequencies.internal.af"}},
                                "cohort_gnomad_genomes_min": {"min": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_gnomad_genomes_max": {"max": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_exac_min": {"min": {"field": "frequencies.exac.af"}},
                                "cohort_exac_max": {"max": {"field": "frequencies.exac.af"}},

                                "cohort_1000gp3_min": {"min": {"field": "frequencies.1000_genomes.af"}},
                                "cohort_1000gp3_max": {"max": {"field": "frequencies.1000_genomes.af"}}
                            }, "filter": {"bool": {}}
                        },
                        "nested_donors": {
                            "nested": {"path": "donors"}, "aggs": {
                                "filtered": {
                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                    "aggs": {


                                        "zygosity": {
                                            "terms": {
                                                "field": "donors.zygosity",
                                                "order": {"_count": "desc"},
                                                "size": 9
                                            }
                                        },
                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}},
                                        "metric_allelic_alt_depth_min": {"min": {"field": "donors.ad_alt"}},
                                        "metric_allelic_alt_depth_max": {"max": {"field": "donors.ad_alt"}},
                                        "metric_total_depth_min": {"min": {"field": "donors.ad_total"}},
                                        "metric_total_depth_max": {"max": {"field": "donors.ad_total"}},
                                        "metric_ratio_min": {"min": {"field": "donors.ad_ratio"}},
                                        "metric_ratio_max": {"max": {"field": "donors.ad_ratio"}},
                                        "metric_genotype_quality_min": {"min": {"field": "donors.gq"}},
                                        "metric_genotype_quality_max": {"max": {"field": "donors.gq"}}
                                    }
                                }
                            }
                        },
                        "variant_type": {
                            "global": {},
                            "aggs": {
                                "filtered_except_variant_type": {
                                    "filter": {"bool": {"filter": [{"bool": {"must_not": []}}, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]}},
                                    "aggs": {
                                        "variant_type": {
                                            "terms": {
                                                "field": "variant_class",
                                                "order": {"_count": "desc"},
                                                "size": 999
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            )
        })

        it('should return correct translation for single exclusion in Query Count translation', () => {
            const countQuery = generateCountQuery(PATIENT_ID, statementSingleExclusion, statementSingleExclusionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(countQuery).to.eql(
                {"query": {"bool": {"filter": [{"bool": {"must_not": [{"term": {"variant_class": "insertion"}}]}}, {"term": {"donors.patient_id": "PA00001"}}]}}}
            )
        })

        it('should return correct translation for single exclusion in Query Search translation', () => {
            const variantQuery = generateVariantQuery(PATIENT_ID, statementSingleExclusion, statementSingleExclusionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT)
            expect(variantQuery).to.eql(
                {
                    "from": 0,
                    "size": 25,
                    "query": {"bool": {"filter": [{"bool": {"must_not": [{"term": {"variant_class": "insertion"}}]}}, {"term": {"donors.patient_id": "PA00001"}}]}},
                    "sort": [{"impact_score": {"order": "desc"}}]

                }
            )
        })

        it('should return correct translation for multiple union in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery(PATIENT_ID, statementMultipleUnion, statementMultipleUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(facetQuery).to.eql(
                {
                    "size": 0,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "should": [{"term": {"variant_class": "SNV"}}, {"term": {"variant_class": "deletion"}}],
                                    "minimum_should_match": 1
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "aggs": {
                        "filtered": {
                            "aggs": {
                                "variant_type": {
                                    "terms": {
                                        "field": "variant_class",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "consequence": {
                                    "terms": {
                                        "field": "consequences.consequence",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extdb_pubmed": {"terms": {"field": "ext_db.is_pubmed", "size": 1}},
                                "extdb_clinvar": {"terms": {"field": "ext_db.is_clinvar", "size": 1}},
                                "extdb_dbsnp": {"terms": {"field": "ext_db.is_dbsnp", "size": 1}},
                                "chromosome": {
                                    "terms": {
                                         "field": "chromosome",
                                        "order": {"_count": "desc"},
                                        "size": 24
                                    }
                                },
                                "gene_type": {
                                    "terms": {
                                        "field": "genes.biotype",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extref_hpo": {"terms": {"field": "ext_db.is_hpo", "size": 1}},
                                "extref_orphanet": {"terms": {"field": "ext_db.is_orphanet", "size": 1}},

                                "extref_omim": {"terms": {"field": "ext_db.is_omim", "size": 1}},
                                "gene_hpo": {
                                    "terms": {
                                        "field": "genes.hpo.hpo_term_label",
                                        "order": {"_count": "desc"},
                                        "size": 9999
                                    }
                                },

                                "genegroup_orphanet": {
                                    "terms": {
                                        "field": "genes.orphanet.panel",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "clinvar_clinsig": {
                                    "terms": {
                                        "field": "clinvar.clin_sig",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "impact": {
                                    "terms": {
                                        "field": "consequences.impact",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "prediction_fathmm": {
                                    "terms": {
                                        "field": "consequences.predictions.fathmm_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_fathmm_min": {"min": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_fathmm_max": {"max": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_sift": {
                                    "terms": {
                                        "field": "consequences.predictions.sift_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_sift_min": {"min": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_sift_max": {"max": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_polyphen2_hvar": {
                                    "terms": {
                                        "field": "consequences.predictions.polyphen2_hvar_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_polyphen2_hvar_min": {"min": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_polyphen2_hvar_max": {"max": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_lrt": {
                                    "terms": {
                                        "field": "consequences.predictions.lrt_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_lrt_min": {"min": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_lrt_max": {"max": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_dann_min": {"min": {"field": "consequences.predictions.dann_score"}},
                                "prediction_dann_max": {"max": {"field": "consequences.predictions.dann_score"}},
                                "prediction_cadd_min": {"min": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_cadd_max": {"max": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_revel_min": {"min": {"field": "consequences.predictions.revel_rankscore"}},
                                "prediction_revel_max": {"max": {"field": "consequences.predictions.revel_rankscore"}},
                                "conservation_phylop_min": {"min": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "conservation_phylop_max": {"max": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "cohort_rqdm_min": {"min": {"field": "frequencies.internal.af"}},
                                "cohort_rqdm_max": {"max": {"field": "frequencies.internal.af"}},
                                "cohort_gnomad_genomes_min": {"min": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_gnomad_genomes_max": {"max": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_exac_min": {"min": {"field": "frequencies.exac.af"}},
                                "cohort_exac_max": {"max": {"field": "frequencies.exac.af"}},

                                "cohort_1000gp3_min": {"min": {"field": "frequencies.1000_genomes.af"}},
                                "cohort_1000gp3_max": {"max": {"field": "frequencies.1000_genomes.af"}}
                            }, "filter": {"bool": {}}
                        },
                        "nested_donors": {
                            "nested": {"path": "donors"}, "aggs": {
                                "filtered": {
                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                    "aggs": {


                                        "zygosity": {
                                            "terms": {
                                                "field": "donors.zygosity",
                                                "order": {"_count": "desc"},
                                                "size": 9
                                            }
                                        },
                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}},
                                        "metric_allelic_alt_depth_min": {"min": {"field": "donors.ad_alt"}},
                                        "metric_allelic_alt_depth_max": {"max": {"field": "donors.ad_alt"}},
                                        "metric_total_depth_min": {"min": {"field": "donors.ad_total"}},
                                        "metric_total_depth_max": {"max": {"field": "donors.ad_total"}},
                                        "metric_ratio_min": {"min": {"field": "donors.ad_ratio"}},
                                        "metric_ratio_max": {"max": {"field": "donors.ad_ratio"}},
                                        "metric_genotype_quality_min": {"min": {"field": "donors.gq"}},
                                        "metric_genotype_quality_max": {"max": {"field": "donors.gq"}}
                                    }
                                }
                            }
                        },
                        "variant_type": {
                            "global": {},
                            "aggs": {
                                "filtered_except_variant_type": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "should": [],
                                                    "minimum_should_match": 1
                                                }
                                            }, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]
                                        }
                                    },
                                    "aggs": {
                                        "variant_type": {
                                            "terms": {
                                                "field": "variant_class",
                                                "order": {"_count": "desc"},
                                                "size": 999
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            )
        })

        it('should return correct translation for multiple union in Query Count translation', () => {
            const countQuery = generateCountQuery(PATIENT_ID, statementMultipleUnion, statementMultipleUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(countQuery).to.eql(
                {
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "should": [{"term": {"variant_class": "SNV"}}, {"term": {"variant_class": "deletion"}}],
                                    "minimum_should_match": 1
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    }
                }
            )
        })

        it('should return correct translation for multiple union in Query Search translation', () => {
            const variantQuery = generateVariantQuery(PATIENT_ID, statementMultipleUnion, statementMultipleUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT)
            expect(variantQuery).to.eql(
                {
                    "from": 0,
                    "size": 25,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "should": [{"term": {"variant_class": "SNV"}}, {"term": {"variant_class": "deletion"}}],
                                    "minimum_should_match": 1
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "sort": [{"impact_score": {"order": "desc"}}]

                }
            )
        })

        it('should return correct translation for multiple intersection in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery(PATIENT_ID, statementMultipleIntersection, statementMultipleIntersectionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(facetQuery).to.eql(
                {
                    "size": 0,
                    "query": {"bool": {"filter": [{"bool": {"must": [{"term": {"variant_class": "SNV"}}, {"term": {"variant_class": "deletion"}}]}}, {"term": {"donors.patient_id": "PA00001"}}]}},
                    "aggs": {
                        "filtered": {
                            "aggs": {
                                "variant_type": {
                                    "terms": {
                                        "field": "variant_class",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "consequence": {
                                    "terms": {
                                        "field": "consequences.consequence",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extdb_pubmed": {"terms": {"field": "ext_db.is_pubmed", "size": 1}},
                                "extdb_clinvar": {"terms": {"field": "ext_db.is_clinvar", "size": 1}},
                                "extdb_dbsnp": {"terms": {"field": "ext_db.is_dbsnp", "size": 1}},
                                "chromosome": {
                                    "terms": {
                                         "field": "chromosome",
                                        "order": {"_count": "desc"},
                                        "size": 24
                                    }
                                },
                                "gene_type": {
                                    "terms": {
                                        "field": "genes.biotype",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extref_hpo": {"terms": {"field": "ext_db.is_hpo", "size": 1}},
                                "extref_orphanet": {"terms": {"field": "ext_db.is_orphanet", "size": 1}},

                                "extref_omim": {"terms": {"field": "ext_db.is_omim", "size": 1}},
                                "gene_hpo": {
                                    "terms": {
                                        "field": "genes.hpo.hpo_term_label",
                                        "order": {"_count": "desc"},
                                        "size": 9999
                                    }
                                },

                                "genegroup_orphanet": {
                                    "terms": {
                                        "field": "genes.orphanet.panel",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "clinvar_clinsig": {
                                    "terms": {
                                        "field": "clinvar.clin_sig",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "impact": {
                                    "terms": {
                                        "field": "consequences.impact",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "prediction_fathmm": {
                                    "terms": {
                                        "field": "consequences.predictions.fathmm_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_fathmm_min": {"min": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_fathmm_max": {"max": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_sift": {
                                    "terms": {
                                        "field": "consequences.predictions.sift_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_sift_min": {"min": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_sift_max": {"max": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_polyphen2_hvar": {
                                    "terms": {
                                        "field": "consequences.predictions.polyphen2_hvar_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_polyphen2_hvar_min": {"min": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_polyphen2_hvar_max": {"max": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_lrt": {
                                    "terms": {
                                        "field": "consequences.predictions.lrt_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_lrt_min": {"min": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_lrt_max": {"max": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_dann_min": {"min": {"field": "consequences.predictions.dann_score"}},
                                "prediction_dann_max": {"max": {"field": "consequences.predictions.dann_score"}},
                                "prediction_cadd_min": {"min": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_cadd_max": {"max": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_revel_min": {"min": {"field": "consequences.predictions.revel_rankscore"}},
                                "prediction_revel_max": {"max": {"field": "consequences.predictions.revel_rankscore"}},
                                "conservation_phylop_min": {"min": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "conservation_phylop_max": {"max": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "cohort_rqdm_min": {"min": {"field": "frequencies.internal.af"}},
                                "cohort_rqdm_max": {"max": {"field": "frequencies.internal.af"}},
                                "cohort_gnomad_genomes_min": {"min": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_gnomad_genomes_max": {"max": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_exac_min": {"min": {"field": "frequencies.exac.af"}},
                                "cohort_exac_max": {"max": {"field": "frequencies.exac.af"}},

                                "cohort_1000gp3_min": {"min": {"field": "frequencies.1000_genomes.af"}},
                                "cohort_1000gp3_max": {"max": {"field": "frequencies.1000_genomes.af"}}
                            }, "filter": {"bool": {}}
                        },
                        "nested_donors": {
                            "nested": {"path": "donors"}, "aggs": {
                                "filtered": {
                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                    "aggs": {


                                        "zygosity": {
                                            "terms": {
                                                "field": "donors.zygosity",
                                                "order": {"_count": "desc"},
                                                "size": 9
                                            }
                                        },
                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}},
                                        "metric_allelic_alt_depth_min": {"min": {"field": "donors.ad_alt"}},
                                        "metric_allelic_alt_depth_max": {"max": {"field": "donors.ad_alt"}},
                                        "metric_total_depth_min": {"min": {"field": "donors.ad_total"}},
                                        "metric_total_depth_max": {"max": {"field": "donors.ad_total"}},
                                        "metric_ratio_min": {"min": {"field": "donors.ad_ratio"}},
                                        "metric_ratio_max": {"max": {"field": "donors.ad_ratio"}},
                                        "metric_genotype_quality_min": {"min": {"field": "donors.gq"}},
                                        "metric_genotype_quality_max": {"max": {"field": "donors.gq"}}
                                    }
                                }
                            }
                        },
                        "variant_type": {
                            "global": {},
                            "aggs": {
                                "filtered_except_variant_type": {
                                    "filter": {"bool": {"filter": [{"bool": {"must": []}}, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]}},
                                    "aggs": {
                                        "variant_type": {
                                            "terms": {
                                                "field": "variant_class",
                                                "order": {"_count": "desc"},
                                                "size": 999
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            )
        })

        it('should return correct translation for multiple intersection in Query Count translation', () => {
            const countQuery = generateCountQuery(PATIENT_ID, statementMultipleIntersection, statementMultipleIntersectionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(countQuery).to.eql(
                {"query": {"bool": {"filter": [{"bool": {"must": [{"term": {"variant_class": "SNV"}}, {"term": {"variant_class": "deletion"}}]}}, {"term": {"donors.patient_id": "PA00001"}}]}}}
            )
        })

        it('should return correct translation for multiple intersection in Query Search translation', () => {
            const variantQuery = generateVariantQuery(PATIENT_ID, statementMultipleIntersection, statementMultipleIntersectionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT)
            expect(variantQuery).to.eql(
                {
                    "from": 0,
                    "size": 25,
                    "query": {"bool": {"filter": [{"bool": {"must": [{"term": {"variant_class": "SNV"}}, {"term": {"variant_class": "deletion"}}]}}, {"term": {"donors.patient_id": "PA00001"}}]}},
                    "sort": [{"impact_score": {"order": "desc"}}]

                }
            )
        })

        it('should return correct translation for combined union in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery(PATIENT_ID, statementCombinedUnion, statementCombinedUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(facetQuery).to.eql(
                {
                    "size": 0,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "should": [{
                                        "bool": {
                                            "should": [{"term": {"variant_class": "SNV"}}],
                                            "minimum_should_match": 1
                                        }
                                    }, {
                                        "bool": {
                                            "should": [{"term": {"variant_class": "deletion"}}],
                                            "minimum_should_match": 1
                                        }
                                    }], "minimum_should_match": 1
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "aggs": {
                        "filtered": {
                            "aggs": {
                                "variant_type": {
                                    "terms": {
                                        "field": "variant_class",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "consequence": {
                                    "terms": {
                                        "field": "consequences.consequence",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extdb_pubmed": {"terms": {"field": "ext_db.is_pubmed", "size": 1}},
                                "extdb_clinvar": {"terms": {"field": "ext_db.is_clinvar", "size": 1}},
                                "extdb_dbsnp": {"terms": {"field": "ext_db.is_dbsnp", "size": 1}},
                                "chromosome": {
                                    "terms": {
                                         "field": "chromosome",
                                        "order": {"_count": "desc"},
                                        "size": 24
                                    }
                                },
                                "gene_type": {
                                    "terms": {
                                        "field": "genes.biotype",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extref_hpo": {"terms": {"field": "ext_db.is_hpo", "size": 1}},
                                "extref_orphanet": {"terms": {"field": "ext_db.is_orphanet", "size": 1}},

                                "extref_omim": {"terms": {"field": "ext_db.is_omim", "size": 1}},
                                "gene_hpo": {
                                    "terms": {
                                        "field": "genes.hpo.hpo_term_label",
                                        "order": {"_count": "desc"},
                                        "size": 9999
                                    }
                                },

                                "genegroup_orphanet": {
                                    "terms": {
                                        "field": "genes.orphanet.panel",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "clinvar_clinsig": {
                                    "terms": {
                                        "field": "clinvar.clin_sig",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "impact": {
                                    "terms": {
                                        "field": "consequences.impact",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "prediction_fathmm": {
                                    "terms": {
                                        "field": "consequences.predictions.fathmm_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_fathmm_min": {"min": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_fathmm_max": {"max": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_sift": {
                                    "terms": {
                                        "field": "consequences.predictions.sift_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_sift_min": {"min": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_sift_max": {"max": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_polyphen2_hvar": {
                                    "terms": {
                                        "field": "consequences.predictions.polyphen2_hvar_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_polyphen2_hvar_min": {"min": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_polyphen2_hvar_max": {"max": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_lrt": {
                                    "terms": {
                                        "field": "consequences.predictions.lrt_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_lrt_min": {"min": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_lrt_max": {"max": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_dann_min": {"min": {"field": "consequences.predictions.dann_score"}},
                                "prediction_dann_max": {"max": {"field": "consequences.predictions.dann_score"}},
                                "prediction_cadd_min": {"min": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_cadd_max": {"max": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_revel_min": {"min": {"field": "consequences.predictions.revel_rankscore"}},
                                "prediction_revel_max": {"max": {"field": "consequences.predictions.revel_rankscore"}},
                                "conservation_phylop_min": {"min": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "conservation_phylop_max": {"max": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "cohort_rqdm_min": {"min": {"field": "frequencies.internal.af"}},
                                "cohort_rqdm_max": {"max": {"field": "frequencies.internal.af"}},

                                "cohort_gnomad_genomes_min": {"min": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_gnomad_genomes_max": {"max": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_exac_min": {"min": {"field": "frequencies.exac.af"}},
                                "cohort_exac_max": {"max": {"field": "frequencies.exac.af"}},

                                "cohort_1000gp3_min": {"min": {"field": "frequencies.1000_genomes.af"}},
                                "cohort_1000gp3_max": {"max": {"field": "frequencies.1000_genomes.af"}}
                            }, "filter": {"bool": {}}
                        },
                        "nested_donors": {
                            "nested": {"path": "donors"}, "aggs": {
                                "filtered": {
                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                    "aggs": {

                                        "zygosity": {
                                            "terms": {
                                                "field": "donors.zygosity",
                                                "order": {"_count": "desc"},
                                                "size": 9
                                            }
                                        },
                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}},
                                        "metric_allelic_alt_depth_min": {"min": {"field": "donors.ad_alt"}},
                                        "metric_allelic_alt_depth_max": {"max": {"field": "donors.ad_alt"}},
                                        "metric_total_depth_min": {"min": {"field": "donors.ad_total"}},
                                        "metric_total_depth_max": {"max": {"field": "donors.ad_total"}},
                                        "metric_ratio_min": {"min": {"field": "donors.ad_ratio"}},
                                        "metric_ratio_max": {"max": {"field": "donors.ad_ratio"}},
                                        "metric_genotype_quality_min": {"min": {"field": "donors.gq"}},
                                        "metric_genotype_quality_max": {"max": {"field": "donors.gq"}}
                                    }
                                }
                            }
                        },
                        "variant_type": {
                            "global": {},
                            "aggs": {
                                "filtered_except_variant_type": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "should": [{
                                                        "bool": {
                                                            "should": [],
                                                            "minimum_should_match": 1
                                                        }
                                                    }, {"bool": {"should": [], "minimum_should_match": 1}}],
                                                    "minimum_should_match": 1
                                                }
                                            }, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]
                                        }
                                    },
                                    "aggs": {
                                        "variant_type": {
                                            "terms": {
                                                "field": "variant_class",
                                                "order": {"_count": "desc"},
                                                "size": 999
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            )
        })

        it('should return correct translation for combined union in Query Count translation', () => {
            const countQuery = generateCountQuery(PATIENT_ID, statementCombinedUnion, statementCombinedUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(countQuery).to.eql(
                {
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "should": [{
                                        "bool": {
                                            "should": [{"term": {"variant_class": "SNV"}}],
                                            "minimum_should_match": 1
                                        }
                                    }, {
                                        "bool": {
                                            "should": [{"term": {"variant_class": "deletion"}}],
                                            "minimum_should_match": 1
                                        }
                                    }], "minimum_should_match": 1
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    }
                }
            )
        })

        it('should return correct translation for combined union in Query Search translation', () => {
            const variantQuery = generateVariantQuery(PATIENT_ID, statementCombinedUnion, statementCombinedUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT)
            expect(variantQuery).to.eql(
                {
                    "from": 0,
                    "size": 25,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "should": [{
                                        "bool": {
                                            "should": [{"term": {"variant_class": "SNV"}}],
                                            "minimum_should_match": 1
                                        }
                                    }, {
                                        "bool": {
                                            "should": [{"term": {"variant_class": "deletion"}}],
                                            "minimum_should_match": 1
                                        }
                                    }], "minimum_should_match": 1
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "sort": [{"impact_score": {"order": "desc"}}]

                }
            )
        })

        it('should return correct translation for combined intersection in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery(PATIENT_ID, statementCombinedIntersection, statementCombinedIntersectionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(facetQuery).to.eql(
                {
                    "size": 0,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": [{
                                        "bool": {
                                            "should": [{"term": {"variant_class": "SNV"}}],
                                            "minimum_should_match": 1
                                        }
                                    }, {
                                        "bool": {
                                            "should": [{"term": {"variant_class": "deletion"}}],
                                            "minimum_should_match": 1
                                        }
                                    }]
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "aggs": {
                        "filtered": {
                            "aggs": {
                                "variant_type": {
                                    "terms": {
                                        "field": "variant_class",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "consequence": {
                                    "terms": {
                                        "field": "consequences.consequence",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extdb_pubmed": {"terms": {"field": "ext_db.is_pubmed", "size": 1}},
                                "extdb_clinvar": {"terms": {"field": "ext_db.is_clinvar", "size": 1}},
                                "extdb_dbsnp": {"terms": {"field": "ext_db.is_dbsnp", "size": 1}},
                                "chromosome": {
                                    "terms": {
                                         "field": "chromosome",
                                        "order": {"_count": "desc"},
                                        "size": 24
                                    }
                                },
                                "gene_type": {
                                    "terms": {
                                        "field": "genes.biotype",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extref_hpo": {"terms": {"field": "ext_db.is_hpo", "size": 1}},
                                "extref_orphanet": {"terms": {"field": "ext_db.is_orphanet", "size": 1}},

                                "extref_omim": {"terms": {"field": "ext_db.is_omim", "size": 1}},
                                "gene_hpo": {
                                    "terms": {
                                        "field": "genes.hpo.hpo_term_label",
                                        "order": {"_count": "desc"},
                                        "size": 9999
                                    }
                                },

                                "genegroup_orphanet": {
                                    "terms": {
                                        "field": "genes.orphanet.panel",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "clinvar_clinsig": {
                                    "terms": {
                                        "field": "clinvar.clin_sig",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "impact": {
                                    "terms": {
                                        "field": "consequences.impact",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "prediction_fathmm": {
                                    "terms": {
                                        "field": "consequences.predictions.fathmm_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_fathmm_min": {"min": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_fathmm_max": {"max": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_sift": {
                                    "terms": {
                                        "field": "consequences.predictions.sift_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_sift_min": {"min": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_sift_max": {"max": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_polyphen2_hvar": {
                                    "terms": {
                                        "field": "consequences.predictions.polyphen2_hvar_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_polyphen2_hvar_min": {"min": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_polyphen2_hvar_max": {"max": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_lrt": {
                                    "terms": {
                                        "field": "consequences.predictions.lrt_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_lrt_min": {"min": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_lrt_max": {"max": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_dann_min": {"min": {"field": "consequences.predictions.dann_score"}},
                                "prediction_dann_max": {"max": {"field": "consequences.predictions.dann_score"}},
                                "prediction_cadd_min": {"min": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_cadd_max": {"max": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_revel_min": {"min": {"field": "consequences.predictions.revel_rankscore"}},
                                "prediction_revel_max": {"max": {"field": "consequences.predictions.revel_rankscore"}},
                                "conservation_phylop_min": {"min": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "conservation_phylop_max": {"max": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "cohort_rqdm_min": {"min": {"field": "frequencies.internal.af"}},
                                "cohort_rqdm_max": {"max": {"field": "frequencies.internal.af"}},

                                "cohort_gnomad_genomes_min": {"min": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_gnomad_genomes_max": {"max": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_exac_min": {"min": {"field": "frequencies.exac.af"}},
                                "cohort_exac_max": {"max": {"field": "frequencies.exac.af"}},

                                "cohort_1000gp3_min": {"min": {"field": "frequencies.1000_genomes.af"}},
                                "cohort_1000gp3_max": {"max": {"field": "frequencies.1000_genomes.af"}}
                            }, "filter": {"bool": {}}
                        },
                        "nested_donors": {
                            "nested": {"path": "donors"}, "aggs": {
                                "filtered": {
                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                    "aggs": {


                                        "zygosity": {
                                            "terms": {
                                                "field": "donors.zygosity",
                                                "order": {"_count": "desc"},
                                                "size": 9
                                            }
                                        },
                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}},
                                        "metric_allelic_alt_depth_min": {"min": {"field": "donors.ad_alt"}},
                                        "metric_allelic_alt_depth_max": {"max": {"field": "donors.ad_alt"}},
                                        "metric_total_depth_min": {"min": {"field": "donors.ad_total"}},
                                        "metric_total_depth_max": {"max": {"field": "donors.ad_total"}},
                                        "metric_ratio_min": {"min": {"field": "donors.ad_ratio"}},
                                        "metric_ratio_max": {"max": {"field": "donors.ad_ratio"}},
                                        "metric_genotype_quality_min": {"min": {"field": "donors.gq"}},
                                        "metric_genotype_quality_max": {"max": {"field": "donors.gq"}}
                                    }
                                }
                            }
                        },
                        "variant_type": {
                            "global": {},
                            "aggs": {
                                "filtered_except_variant_type": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "must": [{
                                                        "bool": {
                                                            "should": [],
                                                            "minimum_should_match": 1
                                                        }
                                                    }, {"bool": {"should": [], "minimum_should_match": 1}}]
                                                }
                                            }, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]
                                        }
                                    },
                                    "aggs": {
                                        "variant_type": {
                                            "terms": {
                                                "field": "variant_class",
                                                "order": {"_count": "desc"},
                                                "size": 999
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            )
        })

        it('should return correct translation for combined intersection in Query Count translation', () => {
            const countQuery = generateCountQuery(PATIENT_ID, statementCombinedIntersection, statementCombinedIntersectionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(countQuery).to.eql(
                {
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": [{
                                        "bool": {
                                            "should": [{"term": {"variant_class": "SNV"}}],
                                            "minimum_should_match": 1
                                        }
                                    }, {
                                        "bool": {
                                            "should": [{"term": {"variant_class": "deletion"}}],
                                            "minimum_should_match": 1
                                        }
                                    }]
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    }
                }
            )
        })

        it('should return correct translation for combined intersection in Query Search translation', () => {
            const variantQuery = generateVariantQuery(PATIENT_ID, statementCombinedIntersection, statementCombinedIntersectionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT)
            expect(variantQuery).to.eql(
                {
                    "from": 0,
                    "size": 25,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": [{
                                        "bool": {
                                            "should": [{"term": {"variant_class": "SNV"}}],
                                            "minimum_should_match": 1
                                        }
                                    }, {
                                        "bool": {
                                            "should": [{"term": {"variant_class": "deletion"}}],
                                            "minimum_should_match": 1
                                        }
                                    }]
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "sort": [{"impact_score": {"order": "desc"}}]

                }
            )
        })

    })

    describe('Solo Generic 1:N', () => {
        const statementSingleUnionQueryKey = uniqid();
        const statementSingleUnion = [
            {
                "key": statementSingleUnionQueryKey,
                "title": "Query 1",
                "instructions": [
                    {
                        "type": "filter",
                        "data": {
                            "id": "genegroup_orphanet",
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

        it('should return correct translation for single union in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery(PATIENT_ID, statementSingleUnion, statementSingleUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(facetQuery).to.eql(
                {
                    "size": 0,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "should": [{"term": {"genes.orphanet.panel": "Mendeloime Gene"}}],
                                    "minimum_should_match": 1
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "aggs": {
                        "filtered": {
                            "aggs": {
                                "variant_type": {
                                    "terms": {
                                        "field": "variant_class",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "consequence": {
                                    "terms": {
                                        "field": "consequences.consequence",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extdb_pubmed": {"terms": {"field": "ext_db.is_pubmed", "size": 1}},
                                "extdb_clinvar": {"terms": {"field": "ext_db.is_clinvar", "size": 1}},
                                "extdb_dbsnp": {"terms": {"field": "ext_db.is_dbsnp", "size": 1}},
                                "chromosome": {
                                    "terms": {
                                         "field": "chromosome",
                                        "order": {"_count": "desc"},
                                        "size": 24
                                    }
                                },
                                "gene_type": {
                                    "terms": {
                                        "field": "genes.biotype",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extref_hpo": {"terms": {"field": "ext_db.is_hpo", "size": 1}},
                                "extref_orphanet": {"terms": {"field": "ext_db.is_orphanet", "size": 1}},

                                "extref_omim": {"terms": {"field": "ext_db.is_omim", "size": 1}},
                                "gene_hpo": {
                                    "terms": {
                                        "field": "genes.hpo.hpo_term_label",
                                        "order": {"_count": "desc"},
                                        "size": 9999
                                    }
                                },

                                "genegroup_orphanet": {
                                    "terms": {
                                        "field": "genes.orphanet.panel",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "clinvar_clinsig": {
                                    "terms": {
                                        "field": "clinvar.clin_sig",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "impact": {
                                    "terms": {
                                        "field": "consequences.impact",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "prediction_fathmm": {
                                    "terms": {
                                        "field": "consequences.predictions.fathmm_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_fathmm_min": {"min": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_fathmm_max": {"max": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_sift": {
                                    "terms": {
                                        "field": "consequences.predictions.sift_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_sift_min": {"min": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_sift_max": {"max": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_polyphen2_hvar": {
                                    "terms": {
                                        "field": "consequences.predictions.polyphen2_hvar_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_polyphen2_hvar_min": {"min": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_polyphen2_hvar_max": {"max": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_lrt": {
                                    "terms": {
                                        "field": "consequences.predictions.lrt_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_lrt_min": {"min": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_lrt_max": {"max": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_dann_min": {"min": {"field": "consequences.predictions.dann_score"}},
                                "prediction_dann_max": {"max": {"field": "consequences.predictions.dann_score"}},
                                "prediction_cadd_min": {"min": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_cadd_max": {"max": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_revel_min": {"min": {"field": "consequences.predictions.revel_rankscore"}},
                                "prediction_revel_max": {"max": {"field": "consequences.predictions.revel_rankscore"}},
                                "conservation_phylop_min": {"min": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "conservation_phylop_max": {"max": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "cohort_rqdm_min": {"min": {"field": "frequencies.internal.af"}},
                                "cohort_rqdm_max": {"max": {"field": "frequencies.internal.af"}},

                                "cohort_gnomad_genomes_min": {"min": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_gnomad_genomes_max": {"max": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_exac_min": {"min": {"field": "frequencies.exac.af"}},
                                "cohort_exac_max": {"max": {"field": "frequencies.exac.af"}},

                                "cohort_1000gp3_min": {"min": {"field": "frequencies.1000_genomes.af"}},
                                "cohort_1000gp3_max": {"max": {"field": "frequencies.1000_genomes.af"}}
                            }, "filter": {"bool": {}}
                        },
                        "genegroup_orphanet": {
                            "aggs": {
                                "filtered_except_genegroup_orphanet": {
                                    "aggs": {
                                        "genegroup_orphanet": {
                                            "terms": {
                                                "field": "genes.orphanet.panel",
                                                "order": {
                                                    "_count": "desc"
                                                },
                                                "size": 999
                                            }
                                        }
                                    },
                                    "filter": {
                                        "bool": {
                                            "filter": [
                                                {
                                                    "bool": {
                                                        "minimum_should_match": 1,
                                                        "should": []
                                                    }
                                                },
                                                {
                                                    "bool": {
                                                        "filter": {
                                                            "term": {
                                                                "donors.patient_id": "PA00001"
                                                            }
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                }
                            },
                            "global": {}
                        },
                        "nested_donors": {
                            "nested": {"path": "donors"}, "aggs": {
                                "filtered": {
                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                    "aggs": {


                                        "zygosity": {
                                            "terms": {
                                                "field": "donors.zygosity",
                                                "order": {"_count": "desc"},
                                                "size": 9
                                            }
                                        },
                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}},
                                        "metric_allelic_alt_depth_min": {"min": {"field": "donors.ad_alt"}},
                                        "metric_allelic_alt_depth_max": {"max": {"field": "donors.ad_alt"}},
                                        "metric_total_depth_min": {"min": {"field": "donors.ad_total"}},
                                        "metric_total_depth_max": {"max": {"field": "donors.ad_total"}},
                                        "metric_ratio_min": {"min": {"field": "donors.ad_ratio"}},
                                        "metric_ratio_max": {"max": {"field": "donors.ad_ratio"}},
                                        "metric_genotype_quality_min": {"min": {"field": "donors.gq"}},
                                        "metric_genotype_quality_max": {"max": {"field": "donors.gq"}}
                                    }
                                }
                            }
                        }
                    }
                }
            )
        })

        it('should return correct translation for single union in Query Count translation', () => {
            const countQuery = generateCountQuery(PATIENT_ID, statementSingleUnion, statementSingleUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(countQuery).to.eql(
                {
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "should": [{"term": {"genes.orphanet.panel": "Mendeloime Gene"}}],
                                    "minimum_should_match": 1
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    }
                }
            )
        })

        it('should return correct translation for single union in Query Search translation', () => {
            const variantQuery = generateVariantQuery(PATIENT_ID, statementSingleUnion, statementSingleUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT)
            expect(variantQuery).to.eql(
                {
                    "from": 0,
                    "size": 25,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "should": [{"term": {"genes.orphanet.panel": "Mendeloime Gene"}}],
                                    "minimum_should_match": 1
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "sort": [{"impact_score": {"order": "desc"}}]

                }
            )
        })

    })

    describe('Solo Generic Boolean', () => {
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
                                "extref_hpo"
                            ]
                        }
                    }
                ]
            }
        ]

        it('should return correct translation for single union in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery(PATIENT_ID, statementSingleUnion, statementSingleUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(facetQuery).to.eql(
                {
                    "size": 0,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "should": [{"term": {"ext_db.is_hpo": true}}],
                                    "minimum_should_match": 1
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "aggs": {
                        "filtered": {
                            "aggs": {
                                "variant_type": {
                                    "terms": {
                                        "field": "variant_class",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "consequence": {
                                    "terms": {
                                        "field": "consequences.consequence",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extdb_pubmed": {"terms": {"field": "ext_db.is_pubmed", "size": 1}},
                                "extdb_clinvar": {"terms": {"field": "ext_db.is_clinvar", "size": 1}},
                                "extdb_dbsnp": {"terms": {"field": "ext_db.is_dbsnp", "size": 1}},
                                "chromosome": {
                                    "terms": {
                                         "field": "chromosome",
                                        "order": {"_count": "desc"},
                                        "size": 24
                                    }
                                },
                                "gene_type": {
                                    "terms": {
                                        "field": "genes.biotype",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extref_hpo": {"terms": {"field": "ext_db.is_hpo", "size": 1}},
                                "extref_orphanet": {"terms": {"field": "ext_db.is_orphanet", "size": 1}},

                                "extref_omim": {"terms": {"field": "ext_db.is_omim", "size": 1}},
                                "gene_hpo": {
                                    "terms": {
                                        "field": "genes.hpo.hpo_term_label",
                                        "order": {"_count": "desc"},
                                        "size": 9999
                                    }
                                },

                                "genegroup_orphanet": {
                                    "terms": {
                                        "field": "genes.orphanet.panel",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "clinvar_clinsig": {
                                    "terms": {
                                        "field": "clinvar.clin_sig",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "impact": {
                                    "terms": {
                                        "field": "consequences.impact",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "prediction_fathmm": {
                                    "terms": {
                                        "field": "consequences.predictions.fathmm_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_fathmm_min": {"min": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_fathmm_max": {"max": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_sift": {
                                    "terms": {
                                        "field": "consequences.predictions.sift_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_sift_min": {"min": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_sift_max": {"max": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_polyphen2_hvar": {
                                    "terms": {
                                        "field": "consequences.predictions.polyphen2_hvar_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_polyphen2_hvar_min": {"min": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_polyphen2_hvar_max": {"max": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_lrt": {
                                    "terms": {
                                        "field": "consequences.predictions.lrt_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_lrt_min": {"min": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_lrt_max": {"max": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_dann_min": {"min": {"field": "consequences.predictions.dann_score"}},
                                "prediction_dann_max": {"max": {"field": "consequences.predictions.dann_score"}},
                                "prediction_cadd_min": {"min": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_cadd_max": {"max": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_revel_min": {"min": {"field": "consequences.predictions.revel_rankscore"}},
                                "prediction_revel_max": {"max": {"field": "consequences.predictions.revel_rankscore"}},
                                "conservation_phylop_min": {"min": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "conservation_phylop_max": {"max": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "cohort_rqdm_min": {"min": {"field": "frequencies.internal.af"}},
                                "cohort_rqdm_max": {"max": {"field": "frequencies.internal.af"}},

                                "cohort_gnomad_genomes_min": {"min": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_gnomad_genomes_max": {"max": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_exac_min": {"min": {"field": "frequencies.exac.af"}},
                                "cohort_exac_max": {"max": {"field": "frequencies.exac.af"}},

                                "cohort_1000gp3_min": {"min": {"field": "frequencies.1000_genomes.af"}},
                                "cohort_1000gp3_max": {"max": {"field": "frequencies.1000_genomes.af"}}
                            }, "filter": {"bool": {}}
                        },
                        "nested_donors": {
                            "nested": {"path": "donors"}, "aggs": {
                                "filtered": {
                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                    "aggs": {


                                        "zygosity": {
                                            "terms": {
                                                "field": "donors.zygosity",
                                                "order": {"_count": "desc"},
                                                "size": 9
                                            }
                                        },
                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}},
                                        "metric_allelic_alt_depth_min": {"min": {"field": "donors.ad_alt"}},
                                        "metric_allelic_alt_depth_max": {"max": {"field": "donors.ad_alt"}},
                                        "metric_total_depth_min": {"min": {"field": "donors.ad_total"}},
                                        "metric_total_depth_max": {"max": {"field": "donors.ad_total"}},
                                        "metric_ratio_min": {"min": {"field": "donors.ad_ratio"}},
                                        "metric_ratio_max": {"max": {"field": "donors.ad_ratio"}},
                                        "metric_genotype_quality_min": {"min": {"field": "donors.gq"}},
                                        "metric_genotype_quality_max": {"max": {"field": "donors.gq"}}
                                    }
                                }
                            }
                        },
                        "extref_hpo": {
                            "global": {},
                            "aggs": {
                                "filtered_except_extref_hpo": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "should": [],
                                                    "minimum_should_match": 1
                                                }
                                            }, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]
                                        }
                                    }, "aggs": {"extref_hpo": {"terms": {"field": "ext_db.is_hpo", "size": 1}}}
                                }
                            }
                        },
                        "extref_orphanet": {
                            "global": {},
                            "aggs": {
                                "filtered_except_extref_orphanet": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "should": [],
                                                    "minimum_should_match": 1
                                                }
                                            }, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]
                                        }
                                    },
                                    "aggs": {
                                        "extref_orphanet": {
                                            "terms": {
                                                "field": "ext_db.is_orphanet",
                                                "size": 1
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "extref_omim": {
                            "global": {},
                            "aggs": {
                                "filtered_except_extref_omim": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "should": [],
                                                    "minimum_should_match": 1
                                                }
                                            }, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]
                                        }
                                    }, "aggs": {"extref_omim": {"terms": {"field": "ext_db.is_omim", "size": 1}}}
                                }
                            }
                        }
                    }
                }
            )
        })

        it('should return correct translation for single union in Query Count translation', () => {
            const countQuery = generateCountQuery(PATIENT_ID, statementSingleUnion, statementSingleUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(countQuery).to.eql(
                {
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "should": [{"term": {"ext_db.is_hpo": true}}],
                                    "minimum_should_match": 1
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    }
                }
            )
        })

        it('should return correct translation for single union in Query Search translation', () => {
            const variantQuery = generateVariantQuery(PATIENT_ID, statementSingleUnion, statementSingleUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT)
            expect(variantQuery).to.eql(
                {
                    "from": 0,
                    "size": 25,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "should": [{"term": {"ext_db.is_hpo": true}}],
                                    "minimum_should_match": 1
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "sort": [{"impact_score": {"order": "desc"}}]

                }
            )
        })

        it('should return correct translation for multiple union in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery(PATIENT_ID, statementMultipleUnion, statementMultipleUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(facetQuery).to.eql(
                {
                    "size": 0,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "should": [{"term": {"ext_db.is_hpo": true}}],
                                    "minimum_should_match": 1
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "aggs": {
                        "filtered": {
                            "aggs": {
                                "variant_type": {
                                    "terms": {
                                        "field": "variant_class",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "consequence": {
                                    "terms": {
                                        "field": "consequences.consequence",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extdb_pubmed": {"terms": {"field": "ext_db.is_pubmed", "size": 1}},
                                "extdb_clinvar": {"terms": {"field": "ext_db.is_clinvar", "size": 1}},
                                "extdb_dbsnp": {"terms": {"field": "ext_db.is_dbsnp", "size": 1}},
                                "chromosome": {
                                    "terms": {
                                         "field": "chromosome",
                                        "order": {"_count": "desc"},
                                        "size": 24
                                    }
                                },
                                "gene_type": {
                                    "terms": {
                                        "field": "genes.biotype",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extref_hpo": {"terms": {"field": "ext_db.is_hpo", "size": 1}},
                                "extref_orphanet": {"terms": {"field": "ext_db.is_orphanet", "size": 1}},

                                "extref_omim": {"terms": {"field": "ext_db.is_omim", "size": 1}},
                                "gene_hpo": {
                                    "terms": {
                                        "field": "genes.hpo.hpo_term_label",
                                        "order": {"_count": "desc"},
                                        "size": 9999
                                    }
                                },

                                "genegroup_orphanet": {
                                    "terms": {
                                        "field": "genes.orphanet.panel",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "clinvar_clinsig": {
                                    "terms": {
                                        "field": "clinvar.clin_sig",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "impact": {
                                    "terms": {
                                        "field": "consequences.impact",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "prediction_fathmm": {
                                    "terms": {
                                        "field": "consequences.predictions.fathmm_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_fathmm_min": {"min": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_fathmm_max": {"max": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_sift": {
                                    "terms": {
                                        "field": "consequences.predictions.sift_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_sift_min": {"min": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_sift_max": {"max": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_polyphen2_hvar": {
                                    "terms": {
                                        "field": "consequences.predictions.polyphen2_hvar_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_polyphen2_hvar_min": {"min": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_polyphen2_hvar_max": {"max": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_lrt": {
                                    "terms": {
                                        "field": "consequences.predictions.lrt_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_lrt_min": {"min": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_lrt_max": {"max": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_dann_min": {"min": {"field": "consequences.predictions.dann_score"}},
                                "prediction_dann_max": {"max": {"field": "consequences.predictions.dann_score"}},
                                "prediction_cadd_min": {"min": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_cadd_max": {"max": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_revel_min": {"min": {"field": "consequences.predictions.revel_rankscore"}},
                                "prediction_revel_max": {"max": {"field": "consequences.predictions.revel_rankscore"}},
                                "conservation_phylop_min": {"min": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "conservation_phylop_max": {"max": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "cohort_rqdm_min": {"min": {"field": "frequencies.internal.af"}},
                                "cohort_rqdm_max": {"max": {"field": "frequencies.internal.af"}},

                                "cohort_gnomad_genomes_min": {"min": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_gnomad_genomes_max": {"max": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_exac_min": {"min": {"field": "frequencies.exac.af"}},
                                "cohort_exac_max": {"max": {"field": "frequencies.exac.af"}},

                                "cohort_1000gp3_min": {"min": {"field": "frequencies.1000_genomes.af"}},
                                "cohort_1000gp3_max": {"max": {"field": "frequencies.1000_genomes.af"}}
                            }, "filter": {"bool": {}}
                        },
                        "nested_donors": {
                            "nested": {"path": "donors"}, "aggs": {
                                "filtered": {
                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                    "aggs": {


                                        "zygosity": {
                                            "terms": {
                                                "field": "donors.zygosity",
                                                "order": {"_count": "desc"},
                                                "size": 9
                                            }
                                        },
                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}},
                                        "metric_allelic_alt_depth_min": {"min": {"field": "donors.ad_alt"}},
                                        "metric_allelic_alt_depth_max": {"max": {"field": "donors.ad_alt"}},
                                        "metric_total_depth_min": {"min": {"field": "donors.ad_total"}},
                                        "metric_total_depth_max": {"max": {"field": "donors.ad_total"}},
                                        "metric_ratio_min": {"min": {"field": "donors.ad_ratio"}},
                                        "metric_ratio_max": {"max": {"field": "donors.ad_ratio"}},
                                        "metric_genotype_quality_min": {"min": {"field": "donors.gq"}},
                                        "metric_genotype_quality_max": {"max": {"field": "donors.gq"}}
                                    }
                                }
                            }
                        },
                        "extref_hpo": {
                            "global": {},
                            "aggs": {
                                "filtered_except_extref_hpo": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "should": [],
                                                    "minimum_should_match": 1
                                                }
                                            }, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]
                                        }
                                    }, "aggs": {"extref_hpo": {"terms": {"field": "ext_db.is_hpo", "size": 1}}}
                                }
                            }
                        },
                        "extref_orphanet": {
                            "global": {},
                            "aggs": {
                                "filtered_except_extref_orphanet": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "should": [],
                                                    "minimum_should_match": 1
                                                }
                                            }, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]
                                        }
                                    },
                                    "aggs": {
                                        "extref_orphanet": {
                                            "terms": {
                                                "field": "ext_db.is_orphanet",
                                                "size": 1
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "extref_omim": {
                            "global": {},
                            "aggs": {
                                "filtered_except_extref_omim": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "should": [],
                                                    "minimum_should_match": 1
                                                }
                                            }, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]
                                        }
                                    }, "aggs": {"extref_omim": {"terms": {"field": "ext_db.is_omim", "size": 1}}}
                                }
                            }
                        }
                    }
                }
            )
        })

        it('should return correct translation for multiple union in Query Count translation', () => {
            const countQuery = generateCountQuery(PATIENT_ID, statementMultipleUnion, statementMultipleUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(countQuery).to.eql(
                {
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "should": [{"term": {"ext_db.is_hpo": true}}],
                                    "minimum_should_match": 1
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    }
                }
            )
        })

        it('should return correct translation for multiple union in Query Search translation', () => {
            const variantQuery = generateVariantQuery(PATIENT_ID, statementMultipleUnion, statementMultipleUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT)
            expect(variantQuery).to.eql(
                {
                    "from": 0,
                    "size": 25,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "should": [{"term": {"ext_db.is_hpo": true}}],
                                    "minimum_should_match": 1
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "sort": [{"impact_score": {"order": "desc"}}]

                }
            )
        })

    })

    describe('Solo Numerical Comparison (Non-Nested)', () => {
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

        it('should return correct translation for greater than or equal comparator in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery(PATIENT_ID, statementGreaterThanOrEqual, statementGreaterThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(facetQuery).to.eql(
                {
                    "size": 0,
                    "query": {"bool": {"filter": [{"bool": {"must": {"range": {"consequences.predictions.dann_score": {"gte": 0.38}}}}}, {"term": {"donors.patient_id": "PA00001"}}]}},
                    "aggs": {
                        "filtered": {
                            "aggs": {
                                "variant_type": {
                                    "terms": {
                                        "field": "variant_class",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "consequence": {
                                    "terms": {
                                        "field": "consequences.consequence",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extdb_pubmed": {"terms": {"field": "ext_db.is_pubmed", "size": 1}},
                                "extdb_clinvar": {"terms": {"field": "ext_db.is_clinvar", "size": 1}},
                                "extdb_dbsnp": {"terms": {"field": "ext_db.is_dbsnp", "size": 1}},
                                "chromosome": {
                                    "terms": {
                                         "field": "chromosome",
                                        "order": {"_count": "desc"},
                                        "size": 24
                                    }
                                },
                                "gene_type": {
                                    "terms": {
                                        "field": "genes.biotype",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extref_hpo": {"terms": {"field": "ext_db.is_hpo", "size": 1}},
                                "extref_orphanet": {"terms": {"field": "ext_db.is_orphanet", "size": 1}},

                                "extref_omim": {"terms": {"field": "ext_db.is_omim", "size": 1}},
                                "gene_hpo": {
                                    "terms": {
                                        "field": "genes.hpo.hpo_term_label",
                                        "order": {"_count": "desc"},
                                        "size": 9999
                                    }
                                },

                                "genegroup_orphanet": {
                                    "terms": {
                                        "field": "genes.orphanet.panel",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "clinvar_clinsig": {
                                    "terms": {
                                        "field": "clinvar.clin_sig",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "impact": {
                                    "terms": {
                                        "field": "consequences.impact",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "prediction_fathmm": {
                                    "terms": {
                                        "field": "consequences.predictions.fathmm_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_fathmm_min": {"min": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_fathmm_max": {"max": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_sift": {
                                    "terms": {
                                        "field": "consequences.predictions.sift_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_sift_min": {"min": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_sift_max": {"max": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_polyphen2_hvar": {
                                    "terms": {
                                        "field": "consequences.predictions.polyphen2_hvar_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_polyphen2_hvar_min": {"min": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_polyphen2_hvar_max": {"max": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_lrt": {
                                    "terms": {
                                        "field": "consequences.predictions.lrt_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_lrt_min": {"min": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_lrt_max": {"max": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_dann_min": {"min": {"field": "consequences.predictions.dann_score"}},
                                "prediction_dann_max": {"max": {"field": "consequences.predictions.dann_score"}},
                                "prediction_cadd_min": {"min": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_cadd_max": {"max": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_revel_min": {"min": {"field": "consequences.predictions.revel_rankscore"}},
                                "prediction_revel_max": {"max": {"field": "consequences.predictions.revel_rankscore"}},
                                "conservation_phylop_min": {"min": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "conservation_phylop_max": {"max": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "cohort_rqdm_min": {"min": {"field": "frequencies.internal.af"}},
                                "cohort_rqdm_max": {"max": {"field": "frequencies.internal.af"}},

                                "cohort_gnomad_genomes_min": {"min": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_gnomad_genomes_max": {"max": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_exac_min": {"min": {"field": "frequencies.exac.af"}},
                                "cohort_exac_max": {"max": {"field": "frequencies.exac.af"}},

                                "cohort_1000gp3_min": {"min": {"field": "frequencies.1000_genomes.af"}},
                                "cohort_1000gp3_max": {"max": {"field": "frequencies.1000_genomes.af"}}
                            }, "filter": {"bool": {}}
                        },
                        "nested_donors": {
                            "nested": {"path": "donors"}, "aggs": {
                                "filtered": {
                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                    "aggs": {


                                        "zygosity": {
                                            "terms": {
                                                "field": "donors.zygosity",
                                                "order": {"_count": "desc"},
                                                "size": 9
                                            }
                                        },
                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}},
                                        "metric_allelic_alt_depth_min": {"min": {"field": "donors.ad_alt"}},
                                        "metric_allelic_alt_depth_max": {"max": {"field": "donors.ad_alt"}},
                                        "metric_total_depth_min": {"min": {"field": "donors.ad_total"}},
                                        "metric_total_depth_max": {"max": {"field": "donors.ad_total"}},
                                        "metric_ratio_min": {"min": {"field": "donors.ad_ratio"}},
                                        "metric_ratio_max": {"max": {"field": "donors.ad_ratio"}},
                                        "metric_genotype_quality_min": {"min": {"field": "donors.gq"}},
                                        "metric_genotype_quality_max": {"max": {"field": "donors.gq"}}
                                    }
                                }
                            }
                        },
                        "prediction_dann": {
                            "global": {},
                            "aggs": {
                                "filtered_except_prediction_dann": {
                                    "filter": {"bool": {"filter": [{"bool": {"must": {"range": {"consequences.predictions.dann_score": {}}}}}, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]}},
                                    "aggs": {
                                        "prediction_dann_min": {"min": {"field": "consequences.predictions.dann_score"}},
                                        "prediction_dann_max": {"max": {"field": "consequences.predictions.dann_score"}}
                                    }
                                }
                            }
                        }
                    }
                }
            )
        })

        it('should return correct translation for greater than or equal comparator in Query Count translation', () => {
            const countQuery = generateCountQuery(PATIENT_ID, statementGreaterThanOrEqual, statementGreaterThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(countQuery).to.eql(
                {"query": {"bool": {"filter": [{"bool": {"must": {"range": {"consequences.predictions.dann_score": {"gte": 0.38}}}}}, {"term": {"donors.patient_id": "PA00001"}}]}}}
            )
        })

        it('should return correct translation for greater than or equal comparator in Query Search translation', () => {
            const variantQuery = generateVariantQuery(PATIENT_ID, statementGreaterThanOrEqual, statementGreaterThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT)
            expect(variantQuery).to.eql(
                {
                    "from": 0,
                    "size": 25,
                    "query": {"bool": {"filter": [{"bool": {"must": {"range": {"consequences.predictions.dann_score": {"gte": 0.38}}}}}, {"term": {"donors.patient_id": "PA00001"}}]}},
                    "sort": [{"impact_score": {"order": "desc"}}]

                }
            )
        })

        it('should return correct translation for lower than or equal comparator in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery(PATIENT_ID, statementLowerThanOrEqual, statementLowerThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(facetQuery).to.eql(
                {
                    "size": 0,
                    "query": {"bool": {"filter": [{"bool": {"must": {"range": {"consequences.predictions.dann_score": {"lte": 0.67}}}}}, {"term": {"donors.patient_id": "PA00001"}}]}},
                    "aggs": {
                        "filtered": {
                            "aggs": {
                                "variant_type": {
                                    "terms": {
                                        "field": "variant_class",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "consequence": {
                                    "terms": {
                                        "field": "consequences.consequence",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extdb_pubmed": {"terms": {"field": "ext_db.is_pubmed", "size": 1}},
                                "extdb_clinvar": {"terms": {"field": "ext_db.is_clinvar", "size": 1}},
                                "extdb_dbsnp": {"terms": {"field": "ext_db.is_dbsnp", "size": 1}},
                                "chromosome": {
                                    "terms": {
                                         "field": "chromosome",
                                        "order": {"_count": "desc"},
                                        "size": 24
                                    }
                                },
                                "gene_type": {
                                    "terms": {
                                        "field": "genes.biotype",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extref_hpo": {"terms": {"field": "ext_db.is_hpo", "size": 1}},
                                "extref_orphanet": {"terms": {"field": "ext_db.is_orphanet", "size": 1}},

                                "extref_omim": {"terms": {"field": "ext_db.is_omim", "size": 1}},
                                "gene_hpo": {
                                    "terms": {
                                        "field": "genes.hpo.hpo_term_label",
                                        "order": {"_count": "desc"},
                                        "size": 9999
                                    }
                                },

                                "genegroup_orphanet": {
                                    "terms": {
                                        "field": "genes.orphanet.panel",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "clinvar_clinsig": {
                                    "terms": {
                                        "field": "clinvar.clin_sig",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "impact": {
                                    "terms": {
                                        "field": "consequences.impact",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "prediction_fathmm": {
                                    "terms": {
                                        "field": "consequences.predictions.fathmm_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_fathmm_min": {"min": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_fathmm_max": {"max": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_sift": {
                                    "terms": {
                                        "field": "consequences.predictions.sift_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_sift_min": {"min": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_sift_max": {"max": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_polyphen2_hvar": {
                                    "terms": {
                                        "field": "consequences.predictions.polyphen2_hvar_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_polyphen2_hvar_min": {"min": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_polyphen2_hvar_max": {"max": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_lrt": {
                                    "terms": {
                                        "field": "consequences.predictions.lrt_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_lrt_min": {"min": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_lrt_max": {"max": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_dann_min": {"min": {"field": "consequences.predictions.dann_score"}},
                                "prediction_dann_max": {"max": {"field": "consequences.predictions.dann_score"}},
                                "prediction_cadd_min": {"min": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_cadd_max": {"max": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_revel_min": {"min": {"field": "consequences.predictions.revel_rankscore"}},
                                "prediction_revel_max": {"max": {"field": "consequences.predictions.revel_rankscore"}},
                                "conservation_phylop_min": {"min": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "conservation_phylop_max": {"max": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "cohort_rqdm_min": {"min": {"field": "frequencies.internal.af"}},
                                "cohort_rqdm_max": {"max": {"field": "frequencies.internal.af"}},

                                "cohort_gnomad_genomes_min": {"min": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_gnomad_genomes_max": {"max": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_exac_min": {"min": {"field": "frequencies.exac.af"}},
                                "cohort_exac_max": {"max": {"field": "frequencies.exac.af"}},

                                "cohort_1000gp3_min": {"min": {"field": "frequencies.1000_genomes.af"}},
                                "cohort_1000gp3_max": {"max": {"field": "frequencies.1000_genomes.af"}}
                            }, "filter": {"bool": {}}
                        },
                        "nested_donors": {
                            "nested": {"path": "donors"}, "aggs": {
                                "filtered": {
                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                    "aggs": {


                                        "zygosity": {
                                            "terms": {
                                                "field": "donors.zygosity",
                                                "order": {"_count": "desc"},
                                                "size": 9
                                            }
                                        },
                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}},
                                        "metric_allelic_alt_depth_min": {"min": {"field": "donors.ad_alt"}},
                                        "metric_allelic_alt_depth_max": {"max": {"field": "donors.ad_alt"}},
                                        "metric_total_depth_min": {"min": {"field": "donors.ad_total"}},
                                        "metric_total_depth_max": {"max": {"field": "donors.ad_total"}},
                                        "metric_ratio_min": {"min": {"field": "donors.ad_ratio"}},
                                        "metric_ratio_max": {"max": {"field": "donors.ad_ratio"}},
                                        "metric_genotype_quality_min": {"min": {"field": "donors.gq"}},
                                        "metric_genotype_quality_max": {"max": {"field": "donors.gq"}}
                                    }
                                }
                            }
                        },
                        "prediction_dann": {
                            "global": {},
                            "aggs": {
                                "filtered_except_prediction_dann": {
                                    "filter": {"bool": {"filter": [{"bool": {"must": {"range": {"consequences.predictions.dann_score": {}}}}}, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]}},
                                    "aggs": {
                                        "prediction_dann_min": {"min": {"field": "consequences.predictions.dann_score"}},
                                        "prediction_dann_max": {"max": {"field": "consequences.predictions.dann_score"}}
                                    }
                                }
                            }
                        }
                    }
                }
            )
        })

        it('should return correct translation for lower than or equal comparator in Query Count translation', () => {
            const countQuery = generateCountQuery(PATIENT_ID, statementLowerThanOrEqual, statementLowerThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(countQuery).to.eql(
                {"query": {"bool": {"filter": [{"bool": {"must": {"range": {"consequences.predictions.dann_score": {"lte": 0.67}}}}}, {"term": {"donors.patient_id": "PA00001"}}]}}}
            )
        })

        it('should return correct translation for lower than or equal comparator in Query Search translation', () => {
            const variantQuery = generateVariantQuery(PATIENT_ID, statementLowerThanOrEqual, statementLowerThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT)
            expect(variantQuery).to.eql(
                {
                    "from": 0,
                    "size": 25,
                    "query": {"bool": {"filter": [{"bool": {"must": {"range": {"consequences.predictions.dann_score": {"lte": 0.67}}}}}, {"term": {"donors.patient_id": "PA00001"}}]}},
                    "sort": [{"impact_score": {"order": "desc"}}]

                }
            )
        })

        it('should return correct translation for in-between comparator in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery(PATIENT_ID, statementInBetween, statementInBetweenQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(facetQuery).to.eql(
                {
                    "size": 0,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": {
                                        "range": {
                                            "consequences.predictions.dann_score": {
                                                "gte": 0.27,
                                                "lte": 0.69
                                            }
                                        }
                                    }
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "aggs": {
                        "filtered": {
                            "aggs": {
                                "variant_type": {
                                    "terms": {
                                        "field": "variant_class",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "consequence": {
                                    "terms": {
                                        "field": "consequences.consequence",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extdb_pubmed": {"terms": {"field": "ext_db.is_pubmed", "size": 1}},
                                "extdb_clinvar": {"terms": {"field": "ext_db.is_clinvar", "size": 1}},
                                "extdb_dbsnp": {"terms": {"field": "ext_db.is_dbsnp", "size": 1}},
                                "chromosome": {
                                    "terms": {
                                         "field": "chromosome",
                                        "order": {"_count": "desc"},
                                        "size": 24
                                    }
                                },
                                "gene_type": {
                                    "terms": {
                                        "field": "genes.biotype",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extref_hpo": {"terms": {"field": "ext_db.is_hpo", "size": 1}},
                                "extref_orphanet": {"terms": {"field": "ext_db.is_orphanet", "size": 1}},

                                "extref_omim": {"terms": {"field": "ext_db.is_omim", "size": 1}},
                                "gene_hpo": {
                                    "terms": {
                                        "field": "genes.hpo.hpo_term_label",
                                        "order": {"_count": "desc"},
                                        "size": 9999
                                    }
                                },

                                "genegroup_orphanet": {
                                    "terms": {
                                        "field": "genes.orphanet.panel",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "clinvar_clinsig": {
                                    "terms": {
                                        "field": "clinvar.clin_sig",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "impact": {
                                    "terms": {
                                        "field": "consequences.impact",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "prediction_fathmm": {
                                    "terms": {
                                        "field": "consequences.predictions.fathmm_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_fathmm_min": {"min": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_fathmm_max": {"max": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_sift": {
                                    "terms": {
                                        "field": "consequences.predictions.sift_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_sift_min": {"min": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_sift_max": {"max": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_polyphen2_hvar": {
                                    "terms": {
                                        "field": "consequences.predictions.polyphen2_hvar_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_polyphen2_hvar_min": {"min": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_polyphen2_hvar_max": {"max": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_lrt": {
                                    "terms": {
                                        "field": "consequences.predictions.lrt_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_lrt_min": {"min": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_lrt_max": {"max": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_dann_min": {"min": {"field": "consequences.predictions.dann_score"}},
                                "prediction_dann_max": {"max": {"field": "consequences.predictions.dann_score"}},
                                "prediction_cadd_min": {"min": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_cadd_max": {"max": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_revel_min": {"min": {"field": "consequences.predictions.revel_rankscore"}},
                                "prediction_revel_max": {"max": {"field": "consequences.predictions.revel_rankscore"}},
                                "conservation_phylop_min": {"min": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "conservation_phylop_max": {"max": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "cohort_rqdm_min": {"min": {"field": "frequencies.internal.af"}},
                                "cohort_rqdm_max": {"max": {"field": "frequencies.internal.af"}},

                                "cohort_gnomad_genomes_min": {"min": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_gnomad_genomes_max": {"max": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_exac_min": {"min": {"field": "frequencies.exac.af"}},
                                "cohort_exac_max": {"max": {"field": "frequencies.exac.af"}},

                                "cohort_1000gp3_min": {"min": {"field": "frequencies.1000_genomes.af"}},
                                "cohort_1000gp3_max": {"max": {"field": "frequencies.1000_genomes.af"}}
                            }, "filter": {"bool": {}}
                        },
                        "nested_donors": {
                            "nested": {"path": "donors"}, "aggs": {
                                "filtered": {
                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                    "aggs": {


                                        "zygosity": {
                                            "terms": {
                                                "field": "donors.zygosity",
                                                "order": {"_count": "desc"},
                                                "size": 9
                                            }
                                        },
                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}},
                                        "metric_allelic_alt_depth_min": {"min": {"field": "donors.ad_alt"}},
                                        "metric_allelic_alt_depth_max": {"max": {"field": "donors.ad_alt"}},
                                        "metric_total_depth_min": {"min": {"field": "donors.ad_total"}},
                                        "metric_total_depth_max": {"max": {"field": "donors.ad_total"}},
                                        "metric_ratio_min": {"min": {"field": "donors.ad_ratio"}},
                                        "metric_ratio_max": {"max": {"field": "donors.ad_ratio"}},
                                        "metric_genotype_quality_min": {"min": {"field": "donors.gq"}},
                                        "metric_genotype_quality_max": {"max": {"field": "donors.gq"}}
                                    }
                                }
                            }
                        },
                        "prediction_dann": {
                            "global": {},
                            "aggs": {
                                "filtered_except_prediction_dann": {
                                    "filter": {"bool": {"filter": [{"bool": {"must": {"range": {"consequences.predictions.dann_score": {}}}}}, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]}},
                                    "aggs": {
                                        "prediction_dann_min": {"min": {"field": "consequences.predictions.dann_score"}},
                                        "prediction_dann_max": {"max": {"field": "consequences.predictions.dann_score"}}
                                    }
                                }
                            }
                        }
                    }
                }
            )
        })

        it('should return correct translation for in-between comparator in Query Count translation', () => {
            const countQuery = generateCountQuery(PATIENT_ID, statementInBetween, statementInBetweenQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(countQuery).to.eql(
                {
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": {
                                        "range": {
                                            "consequences.predictions.dann_score": {
                                                "gte": 0.27,
                                                "lte": 0.69
                                            }
                                        }
                                    }
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    }
                }
            )
        })

        it('should return correct translation for in-between comparator in Query Search translation', () => {
            const variantQuery = generateVariantQuery(PATIENT_ID, statementInBetween, statementInBetweenQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT)
            expect(variantQuery).to.eql(
                {
                    "from": 0,
                    "size": 25,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": {
                                        "range": {
                                            "consequences.predictions.dann_score": {
                                                "gte": 0.27,
                                                "lte": 0.69
                                            }
                                        }
                                    }
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "sort": [{"impact_score": {"order": "desc"}}]

                }
            )
        })

    })

    describe('Solo Numerical Comparison (Nested)', () => {
        const statementLowerThanOrEqualQueryKey = uniqid();
        const statementLowerThanOrEqual = [
            {
                "key": statementLowerThanOrEqualQueryKey,
                "title": "Query 1",
                "instructions": [
                    {
                        "type": "filter",
                        "data": {
                            "id": "metric_depth_quality",
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
                            "id": "metric_depth_quality",
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
                            "id": "metric_depth_quality",
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

        it('should return correct translation for greater than or equal comparator in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery(PATIENT_ID, statementGreaterThanOrEqual, statementGreaterThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(facetQuery).to.eql(
                {
                    "size": 0,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": [{
                                        "nested": {
                                            "path": "donors",
                                            "query": {"bool": {"filter": [{"term": {"donors.patient_id": "PA00001"}}, {"bool": {"must": {"range": {"donors.qd": {"gte": 0.02}}}}}]}}
                                        }
                                    }]
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "aggs": {
                        "filtered": {
                            "aggs": {
                                "variant_type": {
                                    "terms": {
                                        "field": "variant_class",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "consequence": {
                                    "terms": {
                                        "field": "consequences.consequence",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extdb_pubmed": {"terms": {"field": "ext_db.is_pubmed", "size": 1}},
                                "extdb_clinvar": {"terms": {"field": "ext_db.is_clinvar", "size": 1}},
                                "extdb_dbsnp": {"terms": {"field": "ext_db.is_dbsnp", "size": 1}},
                                "chromosome": {
                                    "terms": {
                                         "field": "chromosome",
                                        "order": {"_count": "desc"},
                                        "size": 24
                                    }
                                },
                                "gene_type": {
                                    "terms": {
                                        "field": "genes.biotype",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extref_hpo": {"terms": {"field": "ext_db.is_hpo", "size": 1}},
                                "extref_orphanet": {"terms": {"field": "ext_db.is_orphanet", "size": 1}},

                                "extref_omim": {"terms": {"field": "ext_db.is_omim", "size": 1}},
                                "gene_hpo": {
                                    "terms": {
                                        "field": "genes.hpo.hpo_term_label",
                                        "order": {"_count": "desc"},
                                        "size": 9999
                                    }
                                },

                                "genegroup_orphanet": {
                                    "terms": {
                                        "field": "genes.orphanet.panel",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "clinvar_clinsig": {
                                    "terms": {
                                        "field": "clinvar.clin_sig",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "impact": {
                                    "terms": {
                                        "field": "consequences.impact",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "prediction_fathmm": {
                                    "terms": {
                                        "field": "consequences.predictions.fathmm_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_fathmm_min": {"min": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_fathmm_max": {"max": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_sift": {
                                    "terms": {
                                        "field": "consequences.predictions.sift_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_sift_min": {"min": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_sift_max": {"max": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_polyphen2_hvar": {
                                    "terms": {
                                        "field": "consequences.predictions.polyphen2_hvar_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_polyphen2_hvar_min": {"min": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_polyphen2_hvar_max": {"max": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_lrt": {
                                    "terms": {
                                        "field": "consequences.predictions.lrt_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_lrt_min": {"min": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_lrt_max": {"max": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_dann_min": {"min": {"field": "consequences.predictions.dann_score"}},
                                "prediction_dann_max": {"max": {"field": "consequences.predictions.dann_score"}},
                                "prediction_cadd_min": {"min": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_cadd_max": {"max": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_revel_min": {"min": {"field": "consequences.predictions.revel_rankscore"}},
                                "prediction_revel_max": {"max": {"field": "consequences.predictions.revel_rankscore"}},
                                "conservation_phylop_min": {"min": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "conservation_phylop_max": {"max": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "cohort_rqdm_min": {"min": {"field": "frequencies.internal.af"}},
                                "cohort_rqdm_max": {"max": {"field": "frequencies.internal.af"}},

                                "cohort_gnomad_genomes_min": {"min": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_gnomad_genomes_max": {"max": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_exac_min": {"min": {"field": "frequencies.exac.af"}},
                                "cohort_exac_max": {"max": {"field": "frequencies.exac.af"}},

                                "cohort_1000gp3_min": {"min": {"field": "frequencies.1000_genomes.af"}},
                                "cohort_1000gp3_max": {"max": {"field": "frequencies.1000_genomes.af"}}
                            }, "filter": {"bool": {}}
                        },
                        "nested_donors": {
                            "nested": {"path": "donors"}, "aggs": {
                                "filtered": {
                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                    "aggs": {


                                        "zygosity": {
                                            "terms": {
                                                "field": "donors.zygosity",
                                                "order": {"_count": "desc"},
                                                "size": 9
                                            }
                                        },
                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}},
                                        "metric_allelic_alt_depth_min": {"min": {"field": "donors.ad_alt"}},
                                        "metric_allelic_alt_depth_max": {"max": {"field": "donors.ad_alt"}},
                                        "metric_total_depth_min": {"min": {"field": "donors.ad_total"}},
                                        "metric_total_depth_max": {"max": {"field": "donors.ad_total"}},
                                        "metric_ratio_min": {"min": {"field": "donors.ad_ratio"}},
                                        "metric_ratio_max": {"max": {"field": "donors.ad_ratio"}},
                                        "metric_genotype_quality_min": {"min": {"field": "donors.gq"}},
                                        "metric_genotype_quality_max": {"max": {"field": "donors.gq"}}
                                    }
                                }
                            }
                        },
                        "metric_depth_quality": {
                            "global": {},
                            "aggs": {
                                "filtered_except_metric_depth_quality": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "must": [{
                                                        "nested": {
                                                            "path": "donors",
                                                            "query": {"bool": {"filter": [{"term": {"donors.patient_id": "PA00001"}}, {"bool": {"must": {"range": {"donors.qd": {}}}}}]}}
                                                        }
                                                    }]
                                                }
                                            }]
                                        }
                                    },
                                    "aggs": {
                                        "nested_donors": {
                                            "nested": {"path": "donors"},
                                            "aggs": {
                                                "filtered": {
                                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                                    "aggs": {
                                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}}
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            )
        })

        it('should return correct translation for greater than or equal comparator in Query Count translation', () => {
            const countQuery = generateCountQuery(PATIENT_ID, statementGreaterThanOrEqual, statementGreaterThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(countQuery).to.eql(
                {
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": [{
                                        "nested": {
                                            "path": "donors",
                                            "query": {"bool": {"filter": [{"term": {"donors.patient_id": "PA00001"}}, {"bool": {"must": {"range": {"donors.qd": {"gte": 0.02}}}}}]}}
                                        }
                                    }]
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    }
                }
            )
        })

        it('should return correct translation for greater than or equal comparator in Query Search translation', () => {
            const variantQuery = generateVariantQuery(PATIENT_ID, statementGreaterThanOrEqual, statementGreaterThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT)
            expect(variantQuery).to.eql(
                {
                    "from": 0,
                    "size": 25,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": [{
                                        "nested": {
                                            "path": "donors",
                                            "query": {"bool": {"filter": [{"term": {"donors.patient_id": "PA00001"}}, {"bool": {"must": {"range": {"donors.qd": {"gte": 0.02}}}}}]}}
                                        }
                                    }]
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "sort": [{"impact_score": {"order": "desc"}}]

                }
            )
        })

        it('should return correct translation for lower than or equal comparator in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery(PATIENT_ID, statementLowerThanOrEqual, statementLowerThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(facetQuery).to.eql(
                {
                    "size": 0,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": [{
                                        "nested": {
                                            "path": "donors",
                                            "query": {"bool": {"filter": [{"term": {"donors.patient_id": "PA00001"}}, {"bool": {"must": {"range": {"donors.qd": {"lte": 0.03}}}}}]}}
                                        }
                                    }]
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "aggs": {
                        "filtered": {
                            "aggs": {
                                "variant_type": {
                                    "terms": {
                                        "field": "variant_class",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "consequence": {
                                    "terms": {
                                        "field": "consequences.consequence",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extdb_pubmed": {"terms": {"field": "ext_db.is_pubmed", "size": 1}},
                                "extdb_clinvar": {"terms": {"field": "ext_db.is_clinvar", "size": 1}},
                                "extdb_dbsnp": {"terms": {"field": "ext_db.is_dbsnp", "size": 1}},
                                "chromosome": {
                                    "terms": {
                                         "field": "chromosome",
                                        "order": {"_count": "desc"},
                                        "size": 24
                                    }
                                },
                                "gene_type": {
                                    "terms": {
                                        "field": "genes.biotype",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extref_hpo": {"terms": {"field": "ext_db.is_hpo", "size": 1}},
                                "extref_orphanet": {"terms": {"field": "ext_db.is_orphanet", "size": 1}},

                                "extref_omim": {"terms": {"field": "ext_db.is_omim", "size": 1}},
                                "gene_hpo": {
                                    "terms": {
                                        "field": "genes.hpo.hpo_term_label",
                                        "order": {"_count": "desc"},
                                        "size": 9999
                                    }
                                },

                                "genegroup_orphanet": {
                                    "terms": {
                                        "field": "genes.orphanet.panel",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "clinvar_clinsig": {
                                    "terms": {
                                        "field": "clinvar.clin_sig",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "impact": {
                                    "terms": {
                                        "field": "consequences.impact",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "prediction_fathmm": {
                                    "terms": {
                                        "field": "consequences.predictions.fathmm_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_fathmm_min": {"min": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_fathmm_max": {"max": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_sift": {
                                    "terms": {
                                        "field": "consequences.predictions.sift_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_sift_min": {"min": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_sift_max": {"max": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_polyphen2_hvar": {
                                    "terms": {
                                        "field": "consequences.predictions.polyphen2_hvar_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_polyphen2_hvar_min": {"min": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_polyphen2_hvar_max": {"max": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_lrt": {
                                    "terms": {
                                        "field": "consequences.predictions.lrt_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_lrt_min": {"min": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_lrt_max": {"max": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_dann_min": {"min": {"field": "consequences.predictions.dann_score"}},
                                "prediction_dann_max": {"max": {"field": "consequences.predictions.dann_score"}},
                                "prediction_cadd_min": {"min": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_cadd_max": {"max": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_revel_min": {"min": {"field": "consequences.predictions.revel_rankscore"}},
                                "prediction_revel_max": {"max": {"field": "consequences.predictions.revel_rankscore"}},
                                "conservation_phylop_min": {"min": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "conservation_phylop_max": {"max": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "cohort_rqdm_min": {"min": {"field": "frequencies.internal.af"}},
                                "cohort_rqdm_max": {"max": {"field": "frequencies.internal.af"}},

                                "cohort_gnomad_genomes_min": {"min": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_gnomad_genomes_max": {"max": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_exac_min": {"min": {"field": "frequencies.exac.af"}},
                                "cohort_exac_max": {"max": {"field": "frequencies.exac.af"}},

                                "cohort_1000gp3_min": {"min": {"field": "frequencies.1000_genomes.af"}},
                                "cohort_1000gp3_max": {"max": {"field": "frequencies.1000_genomes.af"}}
                            }, "filter": {"bool": {}}
                        },
                        "nested_donors": {
                            "nested": {"path": "donors"}, "aggs": {
                                "filtered": {
                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                    "aggs": {


                                        "zygosity": {
                                            "terms": {
                                                "field": "donors.zygosity",
                                                "order": {"_count": "desc"},
                                                "size": 9
                                            }
                                        },
                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}},
                                        "metric_allelic_alt_depth_min": {"min": {"field": "donors.ad_alt"}},
                                        "metric_allelic_alt_depth_max": {"max": {"field": "donors.ad_alt"}},
                                        "metric_total_depth_min": {"min": {"field": "donors.ad_total"}},
                                        "metric_total_depth_max": {"max": {"field": "donors.ad_total"}},
                                        "metric_ratio_min": {"min": {"field": "donors.ad_ratio"}},
                                        "metric_ratio_max": {"max": {"field": "donors.ad_ratio"}},
                                        "metric_genotype_quality_min": {"min": {"field": "donors.gq"}},
                                        "metric_genotype_quality_max": {"max": {"field": "donors.gq"}}
                                    }
                                }
                            }
                        },
                        "metric_depth_quality": {
                            "global": {},
                            "aggs": {
                                "filtered_except_metric_depth_quality": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "must": [{
                                                        "nested": {
                                                            "path": "donors",
                                                            "query": {"bool": {"filter": [{"term": {"donors.patient_id": "PA00001"}}, {"bool": {"must": {"range": {"donors.qd": {}}}}}]}}
                                                        }
                                                    }]
                                                }
                                            }]
                                        }
                                    },
                                    "aggs": {
                                        "nested_donors": {
                                            "nested": {"path": "donors"},
                                            "aggs": {
                                                "filtered": {
                                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                                    "aggs": {
                                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}}
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            )
        })

        it('should return correct translation for lower than or equal comparator in Query Count translation', () => {
            const countQuery = generateCountQuery(PATIENT_ID, statementLowerThanOrEqual, statementLowerThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(countQuery).to.eql(
                {
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": [{
                                        "nested": {
                                            "path": "donors",
                                            "query": {"bool": {"filter": [{"term": {"donors.patient_id": "PA00001"}}, {"bool": {"must": {"range": {"donors.qd": {"lte": 0.03}}}}}]}}
                                        }
                                    }]
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    }
                }
            )
        })

        it('should return correct translation for lower than or equal comparator in Query Search translation', () => {
            const variantQuery = generateVariantQuery(PATIENT_ID, statementLowerThanOrEqual, statementLowerThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT)
            expect(variantQuery).to.eql(
                {
                    "from": 0,
                    "size": 25,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": [{
                                        "nested": {
                                            "path": "donors",
                                            "query": {"bool": {"filter": [{"term": {"donors.patient_id": "PA00001"}}, {"bool": {"must": {"range": {"donors.qd": {"lte": 0.03}}}}}]}}
                                        }
                                    }]
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "sort": [{"impact_score": {"order": "desc"}}]

                }
            )
        })

        it('should return correct translation for in-between comparator in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery(PATIENT_ID, statementInBetween, statementInBetweenQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(facetQuery).to.eql(
                {
                    "size": 0,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": [{
                                        "nested": {
                                            "path": "donors",
                                            "query": {
                                                "bool": {
                                                    "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                        "bool": {
                                                            "must": {
                                                                "range": {
                                                                    "donors.qd": {
                                                                        "gte": 0.02,
                                                                        "lte": 0.03
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }]
                                                }
                                            }
                                        }
                                    }]
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "aggs": {
                        "filtered": {
                            "aggs": {
                                "variant_type": {
                                    "terms": {
                                        "field": "variant_class",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "consequence": {
                                    "terms": {
                                        "field": "consequences.consequence",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extdb_pubmed": {"terms": {"field": "ext_db.is_pubmed", "size": 1}},
                                "extdb_clinvar": {"terms": {"field": "ext_db.is_clinvar", "size": 1}},
                                "extdb_dbsnp": {"terms": {"field": "ext_db.is_dbsnp", "size": 1}},
                                "chromosome": {
                                    "terms": {
                                         "field": "chromosome",
                                        "order": {"_count": "desc"},
                                        "size": 24
                                    }
                                },
                                "gene_type": {
                                    "terms": {
                                        "field": "genes.biotype",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extref_hpo": {"terms": {"field": "ext_db.is_hpo", "size": 1}},
                                "extref_orphanet": {"terms": {"field": "ext_db.is_orphanet", "size": 1}},

                                "extref_omim": {"terms": {"field": "ext_db.is_omim", "size": 1}},
                                "gene_hpo": {
                                    "terms": {
                                        "field": "genes.hpo.hpo_term_label",
                                        "order": {"_count": "desc"},
                                        "size": 9999
                                    }
                                },

                                "genegroup_orphanet": {
                                    "terms": {
                                        "field": "genes.orphanet.panel",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "clinvar_clinsig": {
                                    "terms": {
                                        "field": "clinvar.clin_sig",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "impact": {
                                    "terms": {
                                        "field": "consequences.impact",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "prediction_fathmm": {
                                    "terms": {
                                        "field": "consequences.predictions.fathmm_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_fathmm_min": {"min": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_fathmm_max": {"max": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_sift": {
                                    "terms": {
                                        "field": "consequences.predictions.sift_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_sift_min": {"min": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_sift_max": {"max": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_polyphen2_hvar": {
                                    "terms": {
                                        "field": "consequences.predictions.polyphen2_hvar_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_polyphen2_hvar_min": {"min": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_polyphen2_hvar_max": {"max": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_lrt": {
                                    "terms": {
                                        "field": "consequences.predictions.lrt_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_lrt_min": {"min": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_lrt_max": {"max": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_dann_min": {"min": {"field": "consequences.predictions.dann_score"}},
                                "prediction_dann_max": {"max": {"field": "consequences.predictions.dann_score"}},
                                "prediction_cadd_min": {"min": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_cadd_max": {"max": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_revel_min": {"min": {"field": "consequences.predictions.revel_rankscore"}},
                                "prediction_revel_max": {"max": {"field": "consequences.predictions.revel_rankscore"}},
                                "conservation_phylop_min": {"min": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "conservation_phylop_max": {"max": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "cohort_rqdm_min": {"min": {"field": "frequencies.internal.af"}},
                                "cohort_rqdm_max": {"max": {"field": "frequencies.internal.af"}},

                                "cohort_gnomad_genomes_min": {"min": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_gnomad_genomes_max": {"max": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_exac_min": {"min": {"field": "frequencies.exac.af"}},
                                "cohort_exac_max": {"max": {"field": "frequencies.exac.af"}},

                                "cohort_1000gp3_min": {"min": {"field": "frequencies.1000_genomes.af"}},
                                "cohort_1000gp3_max": {"max": {"field": "frequencies.1000_genomes.af"}}
                            }, "filter": {"bool": {}}
                        },
                        "nested_donors": {
                            "nested": {"path": "donors"}, "aggs": {
                                "filtered": {
                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                    "aggs": {


                                        "zygosity": {
                                            "terms": {
                                                "field": "donors.zygosity",
                                                "order": {"_count": "desc"},
                                                "size": 9
                                            }
                                        },
                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}},
                                        "metric_allelic_alt_depth_min": {"min": {"field": "donors.ad_alt"}},
                                        "metric_allelic_alt_depth_max": {"max": {"field": "donors.ad_alt"}},
                                        "metric_total_depth_min": {"min": {"field": "donors.ad_total"}},
                                        "metric_total_depth_max": {"max": {"field": "donors.ad_total"}},
                                        "metric_ratio_min": {"min": {"field": "donors.ad_ratio"}},
                                        "metric_ratio_max": {"max": {"field": "donors.ad_ratio"}},
                                        "metric_genotype_quality_min": {"min": {"field": "donors.gq"}},
                                        "metric_genotype_quality_max": {"max": {"field": "donors.gq"}}
                                    }
                                }
                            }
                        },
                        "metric_depth_quality": {
                            "global": {},
                            "aggs": {
                                "filtered_except_metric_depth_quality": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "must": [{
                                                        "nested": {
                                                            "path": "donors",
                                                            "query": {"bool": {"filter": [{"term": {"donors.patient_id": "PA00001"}}, {"bool": {"must": {"range": {"donors.qd": {}}}}}]}}
                                                        }
                                                    }]
                                                }
                                            }]
                                        }
                                    },
                                    "aggs": {
                                        "nested_donors": {
                                            "nested": {"path": "donors"},
                                            "aggs": {
                                                "filtered": {
                                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                                    "aggs": {
                                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}}
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            )
        })

        it('should return correct translation for in-between comparator in Query Count translation', () => {
            const countQuery = generateCountQuery(PATIENT_ID, statementInBetween, statementInBetweenQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(countQuery).to.eql(
                {
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": [{
                                        "nested": {
                                            "path": "donors",
                                            "query": {
                                                "bool": {
                                                    "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                        "bool": {
                                                            "must": {
                                                                "range": {
                                                                    "donors.qd": {
                                                                        "gte": 0.02,
                                                                        "lte": 0.03
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }]
                                                }
                                            }
                                        }
                                    }]
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    }
                }
            )
        })

        it('should return correct translation for in-between comparator in Query Search translation', () => {
            const variantQuery = generateVariantQuery(PATIENT_ID, statementInBetween, statementInBetweenQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT)
            expect(variantQuery).to.eql(
                {
                    "from": 0,
                    "size": 25,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": [{
                                        "nested": {
                                            "path": "donors",
                                            "query": {
                                                "bool": {
                                                    "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                        "bool": {
                                                            "must": {
                                                                "range": {
                                                                    "donors.qd": {
                                                                        "gte": 0.02,
                                                                        "lte": 0.03
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }]
                                                }
                                            }
                                        }
                                    }]
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "sort": [{"impact_score": {"order": "desc"}}]

                }
            )
        })

    })

    describe('Solo Composite (Score)', () => {
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

        it('should return correct translation for greater than or equal comparator in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery(PATIENT_ID, statementGreaterThanOrEqual, statementGreaterThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(facetQuery).to.eql(
                {
                    "size": 0,
                    "query": {"bool": {"filter": [{"bool": {"must": {"range": {"consequences.predictions.fathmm_converted_rank_score": {"gte": 0.3}}}}}, {"term": {"donors.patient_id": "PA00001"}}]}},
                    "aggs": {
                        "filtered": {
                            "aggs": {
                                "variant_type": {
                                    "terms": {
                                        "field": "variant_class",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "consequence": {
                                    "terms": {
                                        "field": "consequences.consequence",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extdb_pubmed": {"terms": {"field": "ext_db.is_pubmed", "size": 1}},
                                "extdb_clinvar": {"terms": {"field": "ext_db.is_clinvar", "size": 1}},
                                "extdb_dbsnp": {"terms": {"field": "ext_db.is_dbsnp", "size": 1}},
                                "chromosome": {
                                    "terms": {
                                         "field": "chromosome",
                                        "order": {"_count": "desc"},
                                        "size": 24
                                    }
                                },
                                "gene_type": {
                                    "terms": {
                                        "field": "genes.biotype",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extref_hpo": {"terms": {"field": "ext_db.is_hpo", "size": 1}},
                                "extref_orphanet": {"terms": {"field": "ext_db.is_orphanet", "size": 1}},

                                "extref_omim": {"terms": {"field": "ext_db.is_omim", "size": 1}},
                                "gene_hpo": {
                                    "terms": {
                                        "field": "genes.hpo.hpo_term_label",
                                        "order": {"_count": "desc"},
                                        "size": 9999
                                    }
                                },

                                "genegroup_orphanet": {
                                    "terms": {
                                        "field": "genes.orphanet.panel",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "clinvar_clinsig": {
                                    "terms": {
                                        "field": "clinvar.clin_sig",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "impact": {
                                    "terms": {
                                        "field": "consequences.impact",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "prediction_fathmm": {
                                    "terms": {
                                        "field": "consequences.predictions.fathmm_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_fathmm_min": {"min": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_fathmm_max": {"max": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_sift": {
                                    "terms": {
                                        "field": "consequences.predictions.sift_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_sift_min": {"min": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_sift_max": {"max": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_polyphen2_hvar": {
                                    "terms": {
                                        "field": "consequences.predictions.polyphen2_hvar_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_polyphen2_hvar_min": {"min": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_polyphen2_hvar_max": {"max": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_lrt": {
                                    "terms": {
                                        "field": "consequences.predictions.lrt_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_lrt_min": {"min": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_lrt_max": {"max": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_dann_min": {"min": {"field": "consequences.predictions.dann_score"}},
                                "prediction_dann_max": {"max": {"field": "consequences.predictions.dann_score"}},
                                "prediction_cadd_min": {"min": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_cadd_max": {"max": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_revel_min": {"min": {"field": "consequences.predictions.revel_rankscore"}},
                                "prediction_revel_max": {"max": {"field": "consequences.predictions.revel_rankscore"}},
                                "conservation_phylop_min": {"min": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "conservation_phylop_max": {"max": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "cohort_rqdm_min": {"min": {"field": "frequencies.internal.af"}},
                                "cohort_rqdm_max": {"max": {"field": "frequencies.internal.af"}},

                                "cohort_gnomad_genomes_min": {"min": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_gnomad_genomes_max": {"max": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_exac_min": {"min": {"field": "frequencies.exac.af"}},
                                "cohort_exac_max": {"max": {"field": "frequencies.exac.af"}},

                                "cohort_1000gp3_min": {"min": {"field": "frequencies.1000_genomes.af"}},
                                "cohort_1000gp3_max": {"max": {"field": "frequencies.1000_genomes.af"}}
                            }, "filter": {"bool": {}}
                        },
                        "nested_donors": {
                            "nested": {"path": "donors"}, "aggs": {
                                "filtered": {
                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                    "aggs": {


                                        "zygosity": {
                                            "terms": {
                                                "field": "donors.zygosity",
                                                "order": {"_count": "desc"},
                                                "size": 9
                                            }
                                        },
                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}},
                                        "metric_allelic_alt_depth_min": {"min": {"field": "donors.ad_alt"}},
                                        "metric_allelic_alt_depth_max": {"max": {"field": "donors.ad_alt"}},
                                        "metric_total_depth_min": {"min": {"field": "donors.ad_total"}},
                                        "metric_total_depth_max": {"max": {"field": "donors.ad_total"}},
                                        "metric_ratio_min": {"min": {"field": "donors.ad_ratio"}},
                                        "metric_ratio_max": {"max": {"field": "donors.ad_ratio"}},
                                        "metric_genotype_quality_min": {"min": {"field": "donors.gq"}},
                                        "metric_genotype_quality_max": {"max": {"field": "donors.gq"}}
                                    }
                                }
                            }
                        },
                        "score": {
                            "global": {},
                            "aggs": {
                                "filtered_except_score": {
                                    "filter": {"bool": {"filter": [{"bool": {}}, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]}},
                                    "aggs": {}
                                }
                            }
                        },
                        "quality": {
                            "global": {},
                            "aggs": {
                                "filtered_except_quality": {
                                    "filter": {"bool": {"filter": [{"bool": {}}, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]}},
                                    "aggs": {}
                                }
                            }
                        }
                    }
                }
            )
        })

        it('should return correct translation for greater than or equal comparator in Query Count translation', () => {
            const countQuery = generateCountQuery(PATIENT_ID, statementGreaterThanOrEqual, statementGreaterThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(countQuery).to.eql(
                {"query": {"bool": {"filter": [{"bool": {"must": {"range": {"consequences.predictions.fathmm_converted_rank_score": {"gte": 0.3}}}}}, {"term": {"donors.patient_id": "PA00001"}}]}}}
            )
        })

        it('should return correct translation for greater than or equal comparator in Query Search translation', () => {
            const variantQuery = generateVariantQuery(PATIENT_ID, statementGreaterThanOrEqual, statementGreaterThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT)
            expect(variantQuery).to.eql(
                {
                    "from": 0,
                    "size": 25,
                    "query": {"bool": {"filter": [{"bool": {"must": {"range": {"consequences.predictions.fathmm_converted_rank_score": {"gte": 0.3}}}}}, {"term": {"donors.patient_id": "PA00001"}}]}},
                    "sort": [{"impact_score": {"order": "desc"}}]

                }
            )
        })

        it('should return correct translation for lower than or equal comparator in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery(PATIENT_ID, statementLowerThanOrEqual, statementLowerThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(facetQuery).to.eql(
                {
                    "size": 0,
                    "query": {"bool": {"filter": [{"bool": {"must": {"range": {"consequences.predictions.fathmm_converted_rank_score": {"lte": 0.4}}}}}, {"term": {"donors.patient_id": "PA00001"}}]}},
                    "aggs": {
                        "filtered": {
                            "aggs": {
                                "variant_type": {
                                    "terms": {
                                        "field": "variant_class",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "consequence": {
                                    "terms": {
                                        "field": "consequences.consequence",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extdb_pubmed": {"terms": {"field": "ext_db.is_pubmed", "size": 1}},
                                "extdb_clinvar": {"terms": {"field": "ext_db.is_clinvar", "size": 1}},
                                "extdb_dbsnp": {"terms": {"field": "ext_db.is_dbsnp", "size": 1}},
                                "chromosome": {
                                    "terms": {
                                         "field": "chromosome",
                                        "order": {"_count": "desc"},
                                        "size": 24
                                    }
                                },
                                "gene_type": {
                                    "terms": {
                                        "field": "genes.biotype",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extref_hpo": {"terms": {"field": "ext_db.is_hpo", "size": 1}},
                                "extref_orphanet": {"terms": {"field": "ext_db.is_orphanet", "size": 1}},

                                "extref_omim": {"terms": {"field": "ext_db.is_omim", "size": 1}},
                                "gene_hpo": {
                                    "terms": {
                                        "field": "genes.hpo.hpo_term_label",
                                        "order": {"_count": "desc"},
                                        "size": 9999
                                    }
                                },

                                "genegroup_orphanet": {
                                    "terms": {
                                        "field": "genes.orphanet.panel",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "clinvar_clinsig": {
                                    "terms": {
                                        "field": "clinvar.clin_sig",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "impact": {
                                    "terms": {
                                        "field": "consequences.impact",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "prediction_fathmm": {
                                    "terms": {
                                        "field": "consequences.predictions.fathmm_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_fathmm_min": {"min": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_fathmm_max": {"max": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_sift": {
                                    "terms": {
                                        "field": "consequences.predictions.sift_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_sift_min": {"min": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_sift_max": {"max": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_polyphen2_hvar": {
                                    "terms": {
                                        "field": "consequences.predictions.polyphen2_hvar_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_polyphen2_hvar_min": {"min": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_polyphen2_hvar_max": {"max": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_lrt": {
                                    "terms": {
                                        "field": "consequences.predictions.lrt_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_lrt_min": {"min": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_lrt_max": {"max": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_dann_min": {"min": {"field": "consequences.predictions.dann_score"}},
                                "prediction_dann_max": {"max": {"field": "consequences.predictions.dann_score"}},
                                "prediction_cadd_min": {"min": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_cadd_max": {"max": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_revel_min": {"min": {"field": "consequences.predictions.revel_rankscore"}},
                                "prediction_revel_max": {"max": {"field": "consequences.predictions.revel_rankscore"}},
                                "conservation_phylop_min": {"min": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "conservation_phylop_max": {"max": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "cohort_rqdm_min": {"min": {"field": "frequencies.internal.af"}},
                                "cohort_rqdm_max": {"max": {"field": "frequencies.internal.af"}},

                                "cohort_gnomad_genomes_min": {"min": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_gnomad_genomes_max": {"max": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_exac_min": {"min": {"field": "frequencies.exac.af"}},
                                "cohort_exac_max": {"max": {"field": "frequencies.exac.af"}},

                                "cohort_1000gp3_min": {"min": {"field": "frequencies.1000_genomes.af"}},
                                "cohort_1000gp3_max": {"max": {"field": "frequencies.1000_genomes.af"}}
                            }, "filter": {"bool": {}}
                        },
                        "nested_donors": {
                            "nested": {"path": "donors"}, "aggs": {
                                "filtered": {
                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                    "aggs": {


                                        "zygosity": {
                                            "terms": {
                                                "field": "donors.zygosity",
                                                "order": {"_count": "desc"},
                                                "size": 9
                                            }
                                        },
                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}},
                                        "metric_allelic_alt_depth_min": {"min": {"field": "donors.ad_alt"}},
                                        "metric_allelic_alt_depth_max": {"max": {"field": "donors.ad_alt"}},
                                        "metric_total_depth_min": {"min": {"field": "donors.ad_total"}},
                                        "metric_total_depth_max": {"max": {"field": "donors.ad_total"}},
                                        "metric_ratio_min": {"min": {"field": "donors.ad_ratio"}},
                                        "metric_ratio_max": {"max": {"field": "donors.ad_ratio"}},
                                        "metric_genotype_quality_min": {"min": {"field": "donors.gq"}},
                                        "metric_genotype_quality_max": {"max": {"field": "donors.gq"}}
                                    }
                                }
                            }
                        },
                        "score": {
                            "global": {},
                            "aggs": {
                                "filtered_except_score": {
                                    "filter": {"bool": {"filter": [{"bool": {}}, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]}},
                                    "aggs": {}
                                }
                            }
                        },
                        "quality": {
                            "global": {},
                            "aggs": {
                                "filtered_except_quality": {
                                    "filter": {"bool": {"filter": [{"bool": {}}, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]}},
                                    "aggs": {}
                                }
                            }
                        }
                    }
                }
            )
        })

        it('should return correct translation for lower than or equal comparator in Query Count translation', () => {
            const countQuery = generateCountQuery(PATIENT_ID, statementLowerThanOrEqual, statementLowerThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(countQuery).to.eql(
                {"query": {"bool": {"filter": [{"bool": {"must": {"range": {"consequences.predictions.fathmm_converted_rank_score": {"lte": 0.4}}}}}, {"term": {"donors.patient_id": "PA00001"}}]}}}
            )
        })

        it('should return correct translation for lower than or equal comparator in Query Search translation', () => {
            const variantQuery = generateVariantQuery(PATIENT_ID, statementLowerThanOrEqual, statementLowerThanOrEqualQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT)
            expect(variantQuery).to.eql(
                {
                    "from": 0,
                    "size": 25,
                    "query": {"bool": {"filter": [{"bool": {"must": {"range": {"consequences.predictions.fathmm_converted_rank_score": {"lte": 0.4}}}}}, {"term": {"donors.patient_id": "PA00001"}}]}},
                    "sort": [{"impact_score": {"order": "desc"}}]

                }
            )
        })

        it('should return correct translation for in-between comparator in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery(PATIENT_ID, statementInBetween, statementInBetweenQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(facetQuery).to.eql(
                {
                    "size": 0,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": {
                                        "range": {
                                            "consequences.predictions.fathmm_converted_rank_score": {
                                                "gte": 0.3,
                                                "lte": 0.4
                                            }
                                        }
                                    }
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "aggs": {
                        "filtered": {
                            "aggs": {
                                "variant_type": {
                                    "terms": {
                                        "field": "variant_class",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "consequence": {
                                    "terms": {
                                        "field": "consequences.consequence",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extdb_pubmed": {"terms": {"field": "ext_db.is_pubmed", "size": 1}},
                                "extdb_clinvar": {"terms": {"field": "ext_db.is_clinvar", "size": 1}},
                                "extdb_dbsnp": {"terms": {"field": "ext_db.is_dbsnp", "size": 1}},
                                "chromosome": {
                                    "terms": {
                                         "field": "chromosome",
                                        "order": {"_count": "desc"},
                                        "size": 24
                                    }
                                },
                                "gene_type": {
                                    "terms": {
                                        "field": "genes.biotype",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extref_hpo": {"terms": {"field": "ext_db.is_hpo", "size": 1}},
                                "extref_orphanet": {"terms": {"field": "ext_db.is_orphanet", "size": 1}},

                                "extref_omim": {"terms": {"field": "ext_db.is_omim", "size": 1}},
                                "gene_hpo": {
                                    "terms": {
                                        "field": "genes.hpo.hpo_term_label",
                                        "order": {"_count": "desc"},
                                        "size": 9999
                                    }
                                },

                                "genegroup_orphanet": {
                                    "terms": {
                                        "field": "genes.orphanet.panel",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "clinvar_clinsig": {
                                    "terms": {
                                        "field": "clinvar.clin_sig",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "impact": {
                                    "terms": {
                                        "field": "consequences.impact",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "prediction_fathmm": {
                                    "terms": {
                                        "field": "consequences.predictions.fathmm_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_fathmm_min": {"min": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_fathmm_max": {"max": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_sift": {
                                    "terms": {
                                        "field": "consequences.predictions.sift_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_sift_min": {"min": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_sift_max": {"max": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_polyphen2_hvar": {
                                    "terms": {
                                        "field": "consequences.predictions.polyphen2_hvar_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_polyphen2_hvar_min": {"min": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_polyphen2_hvar_max": {"max": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_lrt": {
                                    "terms": {
                                        "field": "consequences.predictions.lrt_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_lrt_min": {"min": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_lrt_max": {"max": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_dann_min": {"min": {"field": "consequences.predictions.dann_score"}},
                                "prediction_dann_max": {"max": {"field": "consequences.predictions.dann_score"}},
                                "prediction_cadd_min": {"min": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_cadd_max": {"max": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_revel_min": {"min": {"field": "consequences.predictions.revel_rankscore"}},
                                "prediction_revel_max": {"max": {"field": "consequences.predictions.revel_rankscore"}},
                                "conservation_phylop_min": {"min": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "conservation_phylop_max": {"max": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "cohort_rqdm_min": {"min": {"field": "frequencies.internal.af"}},
                                "cohort_rqdm_max": {"max": {"field": "frequencies.internal.af"}},

                                "cohort_gnomad_genomes_min": {"min": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_gnomad_genomes_max": {"max": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_exac_min": {"min": {"field": "frequencies.exac.af"}},
                                "cohort_exac_max": {"max": {"field": "frequencies.exac.af"}},

                                "cohort_1000gp3_min": {"min": {"field": "frequencies.1000_genomes.af"}},
                                "cohort_1000gp3_max": {"max": {"field": "frequencies.1000_genomes.af"}}
                            }, "filter": {"bool": {}}
                        },
                        "nested_donors": {
                            "nested": {"path": "donors"}, "aggs": {
                                "filtered": {
                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                    "aggs": {


                                        "zygosity": {
                                            "terms": {
                                                "field": "donors.zygosity",
                                                "order": {"_count": "desc"},
                                                "size": 9
                                            }
                                        },
                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}},
                                        "metric_allelic_alt_depth_min": {"min": {"field": "donors.ad_alt"}},
                                        "metric_allelic_alt_depth_max": {"max": {"field": "donors.ad_alt"}},
                                        "metric_total_depth_min": {"min": {"field": "donors.ad_total"}},
                                        "metric_total_depth_max": {"max": {"field": "donors.ad_total"}},
                                        "metric_ratio_min": {"min": {"field": "donors.ad_ratio"}},
                                        "metric_ratio_max": {"max": {"field": "donors.ad_ratio"}},
                                        "metric_genotype_quality_min": {"min": {"field": "donors.gq"}},
                                        "metric_genotype_quality_max": {"max": {"field": "donors.gq"}}
                                    }
                                }
                            }
                        },
                        "score": {
                            "global": {},
                            "aggs": {
                                "filtered_except_score": {
                                    "filter": {"bool": {"filter": [{"bool": {}}, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]}},
                                    "aggs": {}
                                }
                            }
                        },
                        "quality": {
                            "global": {},
                            "aggs": {
                                "filtered_except_quality": {
                                    "filter": {"bool": {"filter": [{"bool": {}}, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]}},
                                    "aggs": {}
                                }
                            }
                        }
                    }
                }
            )
        })

        it('should return correct translation for in-between comparator in Query Count translation', () => {
            const countQuery = generateCountQuery(PATIENT_ID, statementInBetween, statementInBetweenQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(countQuery).to.eql(
                {
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": {
                                        "range": {
                                            "consequences.predictions.fathmm_converted_rank_score": {
                                                "gte": 0.3,
                                                "lte": 0.4
                                            }
                                        }
                                    }
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    }
                }
            )
        })

        it('should return correct translation for in-between comparator in Query Search translation', () => {
            const variantQuery = generateVariantQuery(PATIENT_ID, statementInBetween, statementInBetweenQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT)
            expect(variantQuery).to.eql(
                {
                    "from": 0,
                    "size": 25,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": {
                                        "range": {
                                            "consequences.predictions.fathmm_converted_rank_score": {
                                                "gte": 0.3,
                                                "lte": 0.4
                                            }
                                        }
                                    }
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "sort": [{"impact_score": {"order": "desc"}}]

                }
            )
        })

    })

    describe('Solo Composite (Call)', () => {
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

        it('should return correct translation in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery(PATIENT_ID, statementInclusion, statementInclusionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(facetQuery).to.eql(
                {
                    "size": 0,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "should": [{"term": {"consequences.predictions.fathmm_pred": "TOLERATED"}}],
                                    "minimum_should_match": 1
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "aggs": {
                        "filtered": {
                            "aggs": {
                                "variant_type": {
                                    "terms": {
                                        "field": "variant_class",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "consequence": {
                                    "terms": {
                                        "field": "consequences.consequence",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extdb_pubmed": {"terms": {"field": "ext_db.is_pubmed", "size": 1}},
                                "extdb_clinvar": {"terms": {"field": "ext_db.is_clinvar", "size": 1}},
                                "extdb_dbsnp": {"terms": {"field": "ext_db.is_dbsnp", "size": 1}},
                                "chromosome": {
                                    "terms": {
                                         "field": "chromosome",
                                        "order": {"_count": "desc"},
                                        "size": 24
                                    }
                                },
                                "gene_type": {
                                    "terms": {
                                        "field": "genes.biotype",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extref_hpo": {"terms": {"field": "ext_db.is_hpo", "size": 1}},
                                "extref_orphanet": {"terms": {"field": "ext_db.is_orphanet", "size": 1}},

                                "extref_omim": {"terms": {"field": "ext_db.is_omim", "size": 1}},
                                "gene_hpo": {
                                    "terms": {
                                        "field": "genes.hpo.hpo_term_label",
                                        "order": {"_count": "desc"},
                                        "size": 9999
                                    }
                                },

                                "genegroup_orphanet": {
                                    "terms": {
                                        "field": "genes.orphanet.panel",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "clinvar_clinsig": {
                                    "terms": {
                                        "field": "clinvar.clin_sig",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "impact": {
                                    "terms": {
                                        "field": "consequences.impact",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "prediction_fathmm": {
                                    "terms": {
                                        "field": "consequences.predictions.fathmm_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_fathmm_min": {"min": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_fathmm_max": {"max": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_sift": {
                                    "terms": {
                                        "field": "consequences.predictions.sift_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_sift_min": {"min": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_sift_max": {"max": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_polyphen2_hvar": {
                                    "terms": {
                                        "field": "consequences.predictions.polyphen2_hvar_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_polyphen2_hvar_min": {"min": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_polyphen2_hvar_max": {"max": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_lrt": {
                                    "terms": {
                                        "field": "consequences.predictions.lrt_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_lrt_min": {"min": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_lrt_max": {"max": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_dann_min": {"min": {"field": "consequences.predictions.dann_score"}},
                                "prediction_dann_max": {"max": {"field": "consequences.predictions.dann_score"}},
                                "prediction_cadd_min": {"min": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_cadd_max": {"max": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_revel_min": {"min": {"field": "consequences.predictions.revel_rankscore"}},
                                "prediction_revel_max": {"max": {"field": "consequences.predictions.revel_rankscore"}},
                                "conservation_phylop_min": {"min": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "conservation_phylop_max": {"max": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "cohort_rqdm_min": {"min": {"field": "frequencies.internal.af"}},
                                "cohort_rqdm_max": {"max": {"field": "frequencies.internal.af"}},

                                "cohort_gnomad_genomes_min": {"min": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_gnomad_genomes_max": {"max": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_exac_min": {"min": {"field": "frequencies.exac.af"}},
                                "cohort_exac_max": {"max": {"field": "frequencies.exac.af"}},

                                "cohort_1000gp3_min": {"min": {"field": "frequencies.1000_genomes.af"}},
                                "cohort_1000gp3_max": {"max": {"field": "frequencies.1000_genomes.af"}}
                            }, "filter": {"bool": {}}
                        },
                        "nested_donors": {
                            "nested": {"path": "donors"}, "aggs": {
                                "filtered": {
                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                    "aggs": {


                                        "zygosity": {
                                            "terms": {
                                                "field": "donors.zygosity",
                                                "order": {"_count": "desc"},
                                                "size": 9
                                            }
                                        },
                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}},
                                        "metric_allelic_alt_depth_min": {"min": {"field": "donors.ad_alt"}},
                                        "metric_allelic_alt_depth_max": {"max": {"field": "donors.ad_alt"}},
                                        "metric_total_depth_min": {"min": {"field": "donors.ad_total"}},
                                        "metric_total_depth_max": {"max": {"field": "donors.ad_total"}},
                                        "metric_ratio_min": {"min": {"field": "donors.ad_ratio"}},
                                        "metric_ratio_max": {"max": {"field": "donors.ad_ratio"}},
                                        "metric_genotype_quality_min": {"min": {"field": "donors.gq"}},
                                        "metric_genotype_quality_max": {"max": {"field": "donors.gq"}}
                                    }
                                }
                            }
                        },
                        "score": {
                            "global": {},
                            "aggs": {
                                "filtered_except_score": {
                                    "filter": {"bool": {"filter": [{"bool": {}}, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]}},
                                    "aggs": {}
                                }
                            }
                        },
                        "quality": {
                            "global": {},
                            "aggs": {
                                "filtered_except_quality": {
                                    "filter": {"bool": {"filter": [{"bool": {}}, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]}},
                                    "aggs": {}
                                }
                            }
                        }
                    }
                }
            )
        })

        it('should return correct translation in Query Count translation', () => {
            const countQuery = generateCountQuery(PATIENT_ID, statementInclusion, statementInclusionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(countQuery).to.eql(
                {
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "should": [{"term": {"consequences.predictions.fathmm_pred": "TOLERATED"}}],
                                    "minimum_should_match": 1
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    }
                }
            )
        })

        it('should return correct translation in Query Search translation', () => {
            const variantQuery = generateVariantQuery(PATIENT_ID, statementInclusion, statementInclusionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT)
            expect(variantQuery).to.eql(
                {
                    "from": 0,
                    "size": 25,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "should": [{"term": {"consequences.predictions.fathmm_pred": "TOLERATED"}}],
                                    "minimum_should_match": 1
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "sort": [{"impact_score": {"order": "desc"}}]

                }
            )
        })

    })

    describe('Solo Generic Nested', () => {
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

        it('should return correct translation for union in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery(PATIENT_ID, statementUnion, statementUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(facetQuery).to.eql(
                {
                    "size": 0,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": [{
                                        "nested": {
                                            "path": "donors",
                                            "query": {
                                                "bool": {
                                                    "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                        "bool": {
                                                            "should": [{"term": {"donors.zygosity": "HET"}}],
                                                            "minimum_should_match": 1
                                                        }
                                                    }]
                                                }
                                            }
                                        }
                                    }]
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "aggs": {
                        "filtered": {
                            "aggs": {
                                "variant_type": {
                                    "terms": {
                                        "field": "variant_class",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "consequence": {
                                    "terms": {
                                        "field": "consequences.consequence",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extdb_pubmed": {"terms": {"field": "ext_db.is_pubmed", "size": 1}},
                                "extdb_clinvar": {"terms": {"field": "ext_db.is_clinvar", "size": 1}},
                                "extdb_dbsnp": {"terms": {"field": "ext_db.is_dbsnp", "size": 1}},
                                "chromosome": {
                                    "terms": {
                                         "field": "chromosome",
                                        "order": {"_count": "desc"},
                                        "size": 24
                                    }
                                },
                                "gene_type": {
                                    "terms": {
                                        "field": "genes.biotype",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extref_hpo": {"terms": {"field": "ext_db.is_hpo", "size": 1}},
                                "extref_orphanet": {"terms": {"field": "ext_db.is_orphanet", "size": 1}},

                                "extref_omim": {"terms": {"field": "ext_db.is_omim", "size": 1}},
                                "gene_hpo": {
                                    "terms": {
                                        "field": "genes.hpo.hpo_term_label",
                                        "order": {"_count": "desc"},
                                        "size": 9999
                                    }
                                },

                                "genegroup_orphanet": {
                                    "terms": {
                                        "field": "genes.orphanet.panel",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "clinvar_clinsig": {
                                    "terms": {
                                        "field": "clinvar.clin_sig",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "impact": {
                                    "terms": {
                                        "field": "consequences.impact",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "prediction_fathmm": {
                                    "terms": {
                                        "field": "consequences.predictions.fathmm_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_fathmm_min": {"min": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_fathmm_max": {"max": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_sift": {
                                    "terms": {
                                        "field": "consequences.predictions.sift_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_sift_min": {"min": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_sift_max": {"max": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_polyphen2_hvar": {
                                    "terms": {
                                        "field": "consequences.predictions.polyphen2_hvar_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_polyphen2_hvar_min": {"min": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_polyphen2_hvar_max": {"max": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_lrt": {
                                    "terms": {
                                        "field": "consequences.predictions.lrt_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_lrt_min": {"min": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_lrt_max": {"max": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_dann_min": {"min": {"field": "consequences.predictions.dann_score"}},
                                "prediction_dann_max": {"max": {"field": "consequences.predictions.dann_score"}},
                                "prediction_cadd_min": {"min": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_cadd_max": {"max": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_revel_min": {"min": {"field": "consequences.predictions.revel_rankscore"}},
                                "prediction_revel_max": {"max": {"field": "consequences.predictions.revel_rankscore"}},
                                "conservation_phylop_min": {"min": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "conservation_phylop_max": {"max": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "cohort_rqdm_min": {"min": {"field": "frequencies.internal.af"}},
                                "cohort_rqdm_max": {"max": {"field": "frequencies.internal.af"}},

                                "cohort_gnomad_genomes_min": {"min": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_gnomad_genomes_max": {"max": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_exac_min": {"min": {"field": "frequencies.exac.af"}},
                                "cohort_exac_max": {"max": {"field": "frequencies.exac.af"}},

                                "cohort_1000gp3_min": {"min": {"field": "frequencies.1000_genomes.af"}},
                                "cohort_1000gp3_max": {"max": {"field": "frequencies.1000_genomes.af"}}
                            }, "filter": {"bool": {}}
                        },
                        "nested_donors": {
                            "nested": {"path": "donors"}, "aggs": {
                                "filtered": {
                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                    "aggs": {


                                        "zygosity": {
                                            "terms": {
                                                "field": "donors.zygosity",
                                                "order": {"_count": "desc"},
                                                "size": 9
                                            }
                                        },
                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}},
                                        "metric_allelic_alt_depth_min": {"min": {"field": "donors.ad_alt"}},
                                        "metric_allelic_alt_depth_max": {"max": {"field": "donors.ad_alt"}},
                                        "metric_total_depth_min": {"min": {"field": "donors.ad_total"}},
                                        "metric_total_depth_max": {"max": {"field": "donors.ad_total"}},
                                        "metric_ratio_min": {"min": {"field": "donors.ad_ratio"}},
                                        "metric_ratio_max": {"max": {"field": "donors.ad_ratio"}},
                                        "metric_genotype_quality_min": {"min": {"field": "donors.gq"}},
                                        "metric_genotype_quality_max": {"max": {"field": "donors.gq"}}
                                    }
                                }
                            }
                        },
                        "zygosity": {
                            "global": {},
                            "aggs": {
                                "filtered_except_zygosity": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "must": [{
                                                        "nested": {
                                                            "path": "donors",
                                                            "query": {
                                                                "bool": {
                                                                    "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                                        "bool": {
                                                                            "should": [],
                                                                            "minimum_should_match": 1
                                                                        }
                                                                    }]
                                                                }
                                                            }
                                                        }
                                                    }]
                                                }
                                            }]
                                        }
                                    },
                                    "aggs": {
                                        "nested_donors": {
                                            "nested": {"path": "donors"},
                                            "aggs": {
                                                "filtered": {
                                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                                    "aggs": {
                                                        "zygosity": {
                                                            "terms": {
                                                                "field": "donors.zygosity",
                                                                "order": {"_count": "desc"},
                                                                "size": 9
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            )
        })

        it('should return correct translation for union in Query Count translation', () => {
            const countQuery = generateCountQuery(PATIENT_ID, statementUnion, statementUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(countQuery).to.eql(
                {
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": [{
                                        "nested": {
                                            "path": "donors",
                                            "query": {
                                                "bool": {
                                                    "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                        "bool": {
                                                            "should": [{"term": {"donors.zygosity": "HET"}}],
                                                            "minimum_should_match": 1
                                                        }
                                                    }]
                                                }
                                            }
                                        }
                                    }]
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    }
                }
            )
        })

        it('should return correct translation for union in Query Search translation', () => {
            const variantQuery = generateVariantQuery(PATIENT_ID, statementUnion, statementUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT)
            expect(variantQuery).to.eql(
                {
                    "from": 0,
                    "size": 25,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": [{
                                        "nested": {
                                            "path": "donors",
                                            "query": {
                                                "bool": {
                                                    "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                        "bool": {
                                                            "should": [{"term": {"donors.zygosity": "HET"}}],
                                                            "minimum_should_match": 1
                                                        }
                                                    }]
                                                }
                                            }
                                        }
                                    }]
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "sort": [{"impact_score": {"order": "desc"}}]

                }
            )
        })

        it('should return correct translation for exclusion in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery(PATIENT_ID, statementExclusion, statementExclusionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(facetQuery).to.eql(
                {
                    "size": 0,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": [{
                                        "nested": {
                                            "path": "donors",
                                            "query": {"bool": {"filter": [{"term": {"donors.patient_id": "PA00001"}}, {"bool": {"must_not": [{"term": {"donors.zygosity": "HOM"}}]}}]}}
                                        }
                                    }]
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "aggs": {
                        "filtered": {
                            "aggs": {
                                "variant_type": {
                                    "terms": {
                                        "field": "variant_class",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "consequence": {
                                    "terms": {
                                        "field": "consequences.consequence",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extdb_pubmed": {"terms": {"field": "ext_db.is_pubmed", "size": 1}},
                                "extdb_clinvar": {"terms": {"field": "ext_db.is_clinvar", "size": 1}},
                                "extdb_dbsnp": {"terms": {"field": "ext_db.is_dbsnp", "size": 1}},
                                "chromosome": {
                                    "terms": {
                                         "field": "chromosome",
                                        "order": {"_count": "desc"},
                                        "size": 24
                                    }
                                },
                                "gene_type": {
                                    "terms": {
                                        "field": "genes.biotype",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extref_hpo": {"terms": {"field": "ext_db.is_hpo", "size": 1}},
                                "extref_orphanet": {"terms": {"field": "ext_db.is_orphanet", "size": 1}},

                                "extref_omim": {"terms": {"field": "ext_db.is_omim", "size": 1}},
                                "gene_hpo": {
                                    "terms": {
                                        "field": "genes.hpo.hpo_term_label",
                                        "order": {"_count": "desc"},
                                        "size": 9999
                                    }
                                },

                                "genegroup_orphanet": {
                                    "terms": {
                                        "field": "genes.orphanet.panel",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "clinvar_clinsig": {
                                    "terms": {
                                        "field": "clinvar.clin_sig",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "impact": {
                                    "terms": {
                                        "field": "consequences.impact",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "prediction_fathmm": {
                                    "terms": {
                                        "field": "consequences.predictions.fathmm_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_fathmm_min": {"min": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_fathmm_max": {"max": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_sift": {
                                    "terms": {
                                        "field": "consequences.predictions.sift_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_sift_min": {"min": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_sift_max": {"max": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_polyphen2_hvar": {
                                    "terms": {
                                        "field": "consequences.predictions.polyphen2_hvar_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_polyphen2_hvar_min": {"min": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_polyphen2_hvar_max": {"max": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_lrt": {
                                    "terms": {
                                        "field": "consequences.predictions.lrt_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_lrt_min": {"min": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_lrt_max": {"max": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_dann_min": {"min": {"field": "consequences.predictions.dann_score"}},
                                "prediction_dann_max": {"max": {"field": "consequences.predictions.dann_score"}},
                                "prediction_cadd_min": {"min": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_cadd_max": {"max": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_revel_min": {"min": {"field": "consequences.predictions.revel_rankscore"}},
                                "prediction_revel_max": {"max": {"field": "consequences.predictions.revel_rankscore"}},
                                "conservation_phylop_min": {"min": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "conservation_phylop_max": {"max": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "cohort_rqdm_min": {"min": {"field": "frequencies.internal.af"}},
                                "cohort_rqdm_max": {"max": {"field": "frequencies.internal.af"}},

                                "cohort_gnomad_genomes_min": {"min": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_gnomad_genomes_max": {"max": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_exac_min": {"min": {"field": "frequencies.exac.af"}},
                                "cohort_exac_max": {"max": {"field": "frequencies.exac.af"}},

                                "cohort_1000gp3_min": {"min": {"field": "frequencies.1000_genomes.af"}},
                                "cohort_1000gp3_max": {"max": {"field": "frequencies.1000_genomes.af"}}
                            }, "filter": {"bool": {}}
                        },
                        "nested_donors": {
                            "nested": {"path": "donors"}, "aggs": {
                                "filtered": {
                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                    "aggs": {


                                        "zygosity": {
                                            "terms": {
                                                "field": "donors.zygosity",
                                                "order": {"_count": "desc"},
                                                "size": 9
                                            }
                                        },
                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}},
                                        "metric_allelic_alt_depth_min": {"min": {"field": "donors.ad_alt"}},
                                        "metric_allelic_alt_depth_max": {"max": {"field": "donors.ad_alt"}},
                                        "metric_total_depth_min": {"min": {"field": "donors.ad_total"}},
                                        "metric_total_depth_max": {"max": {"field": "donors.ad_total"}},
                                        "metric_ratio_min": {"min": {"field": "donors.ad_ratio"}},
                                        "metric_ratio_max": {"max": {"field": "donors.ad_ratio"}},
                                        "metric_genotype_quality_min": {"min": {"field": "donors.gq"}},
                                        "metric_genotype_quality_max": {"max": {"field": "donors.gq"}}
                                    }
                                }
                            }
                        },
                        "zygosity": {
                            "global": {},
                            "aggs": {
                                "filtered_except_zygosity": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "must": [{
                                                        "nested": {
                                                            "path": "donors",
                                                            "query": {"bool": {"filter": [{"term": {"donors.patient_id": "PA00001"}}, {"bool": {"must_not": []}}]}}
                                                        }
                                                    }]
                                                }
                                            }]
                                        }
                                    },
                                    "aggs": {
                                        "nested_donors": {
                                            "nested": {"path": "donors"},
                                            "aggs": {
                                                "filtered": {
                                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                                    "aggs": {
                                                        "zygosity": {
                                                            "terms": {
                                                                "field": "donors.zygosity",
                                                                "order": {"_count": "desc"},
                                                                "size": 9
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            )
        })

        it('should return correct translation for exclusion in Query Count translation', () => {
            const countQuery = generateCountQuery(PATIENT_ID, statementExclusion, statementExclusionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(countQuery).to.eql(
                {
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": [{
                                        "nested": {
                                            "path": "donors",
                                            "query": {"bool": {"filter": [{"term": {"donors.patient_id": "PA00001"}}, {"bool": {"must_not": [{"term": {"donors.zygosity": "HOM"}}]}}]}}
                                        }
                                    }]
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    }
                }
            )
        })

        it('should return correct translation for exclusion in Query Search translation', () => {
            const variantQuery = generateVariantQuery(PATIENT_ID, statementExclusion, statementExclusionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT)
            expect(variantQuery).to.eql(
                {
                    "from": 0,
                    "size": 25,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": [{
                                        "nested": {
                                            "path": "donors",
                                            "query": {"bool": {"filter": [{"term": {"donors.patient_id": "PA00001"}}, {"bool": {"must_not": [{"term": {"donors.zygosity": "HOM"}}]}}]}}
                                        }
                                    }]
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "sort": [{"impact_score": {"order": "desc"}}]

                }
            )
        })

    })

    describe('Solo Autocomplete - Generic Subtype', () => {
        const statementSingleUnionOneQueryKey = uniqid();
        const statementSingleUnionOne = [
            {
                "key": statementSingleUnionOneQueryKey,
                "title": "Query 1",
                "instructions": [
                    {
                        "type": "filter",
                        "data": {
                            "id": "gene_symbol",
                            "type": "autocomplete",
                            "subtype": {
                                "type": "generic",
                                "operand": "one",
                            },
                            "selection": ["BRaf"]
                        }
                    }
                ]
            }
        ]

        it('should return correct translation for single union in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery(PATIENT_ID, statementSingleUnionOne, statementSingleUnionOneQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(facetQuery).to.eql(
                {
                    "size": 0,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "should": [{"term": {"genes.genes_symbol": "BRaf"}}],
                                    "minimum_should_match": 1
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "aggs": {
                        "filtered": {
                            "aggs": {
                                "variant_type": {
                                    "terms": {
                                        "field": "variant_class",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "consequence": {
                                    "terms": {
                                        "field": "consequences.consequence",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extdb_pubmed": {"terms": {"field": "ext_db.is_pubmed", "size": 1}},
                                "extdb_clinvar": {"terms": {"field": "ext_db.is_clinvar", "size": 1}},
                                "extdb_dbsnp": {"terms": {"field": "ext_db.is_dbsnp", "size": 1}},
                                "chromosome": {
                                    "terms": {
                                         "field": "chromosome",
                                        "order": {"_count": "desc"},
                                        "size": 24
                                    }
                                },
                                "gene_type": {
                                    "terms": {
                                        "field": "genes.biotype",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extref_hpo": {"terms": {"field": "ext_db.is_hpo", "size": 1}},
                                "extref_orphanet": {"terms": {"field": "ext_db.is_orphanet", "size": 1}},

                                "extref_omim": {"terms": {"field": "ext_db.is_omim", "size": 1}},
                                "gene_hpo": {
                                    "terms": {
                                        "field": "genes.hpo.hpo_term_label",
                                        "order": {"_count": "desc"},
                                        "size": 9999
                                    }
                                },
                                "genegroup_orphanet": {
                                    "terms": {
                                        "field": "genes.orphanet.panel",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "clinvar_clinsig": {
                                    "terms": {
                                        "field": "clinvar.clin_sig",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "impact": {
                                    "terms": {
                                        "field": "consequences.impact",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "prediction_fathmm": {
                                    "terms": {
                                        "field": "consequences.predictions.fathmm_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_fathmm_min": {"min": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_fathmm_max": {"max": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_sift": {
                                    "terms": {
                                        "field": "consequences.predictions.sift_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_sift_min": {"min": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_sift_max": {"max": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_polyphen2_hvar": {
                                    "terms": {
                                        "field": "consequences.predictions.polyphen2_hvar_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_polyphen2_hvar_min": {"min": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_polyphen2_hvar_max": {"max": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_lrt": {
                                    "terms": {
                                        "field": "consequences.predictions.lrt_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_lrt_min": {"min": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_lrt_max": {"max": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_dann_min": {"min": {"field": "consequences.predictions.dann_score"}},
                                "prediction_dann_max": {"max": {"field": "consequences.predictions.dann_score"}},
                                "prediction_cadd_min": {"min": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_cadd_max": {"max": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_revel_min": {"min": {"field": "consequences.predictions.revel_rankscore"}},
                                "prediction_revel_max": {"max": {"field": "consequences.predictions.revel_rankscore"}},
                                "conservation_phylop_min": {"min": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "conservation_phylop_max": {"max": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "cohort_rqdm_min": {"min": {"field": "frequencies.internal.af"}},
                                "cohort_rqdm_max": {"max": {"field": "frequencies.internal.af"}},

                                "cohort_gnomad_genomes_min": {"min": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_gnomad_genomes_max": {"max": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_exac_min": {"min": {"field": "frequencies.exac.af"}},
                                "cohort_exac_max": {"max": {"field": "frequencies.exac.af"}},

                                "cohort_1000gp3_min": {"min": {"field": "frequencies.1000_genomes.af"}},
                                "cohort_1000gp3_max": {"max": {"field": "frequencies.1000_genomes.af"}}
                            }, "filter": {"bool": {}}
                        }, "nested_donors": {
                            "nested": {"path": "donors"}, "aggs": {
                                "filtered": {
                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                    "aggs": {
                                        "zygosity": {
                                            "terms": {
                                                "field": "donors.zygosity",
                                                "order": {"_count": "desc"},
                                                "size": 9
                                            }
                                        },
                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}},
                                        "metric_allelic_alt_depth_min": {"min": {"field": "donors.ad_alt"}},
                                        "metric_allelic_alt_depth_max": {"max": {"field": "donors.ad_alt"}},
                                        "metric_total_depth_min": {"min": {"field": "donors.ad_total"}},
                                        "metric_total_depth_max": {"max": {"field": "donors.ad_total"}},
                                        "metric_ratio_min": {"min": {"field": "donors.ad_ratio"}},
                                        "metric_ratio_max": {"max": {"field": "donors.ad_ratio"}},
                                        "metric_genotype_quality_min": {"min": {"field": "donors.gq"}},
                                        "metric_genotype_quality_max": {"max": {"field": "donors.gq"}}
                                    }
                                }
                            }
                        }
                    }
                }
            )
        })

        it('should return correct translation for single union in Query Count translation', () => {
            const countQuery = generateCountQuery(PATIENT_ID, statementSingleUnionOne, statementSingleUnionOneQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(countQuery).to.eql(
                {
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "should": [{"term": {"genes.genes_symbol": "BRaf"}}],
                                    "minimum_should_match": 1
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    }
                }
            )
        })

        it('should return correct translation for single union in Query Search translation', () => {
            const variantQuery = generateVariantQuery(PATIENT_ID, statementSingleUnionOne, statementSingleUnionOneQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT)
            expect(variantQuery).to.eql(
                {
                    "from": 0,
                    "size": 25,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "should": [{"term": {"genes.genes_symbol": "BRaf"}}],
                                    "minimum_should_match": 1
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "sort": [{"impact_score": {"order": "desc"}}]

                }
            )
        })

    })

    describe('Duo Nested', () => {
        const statementDuoIntersectionOneQueryKey = uniqid();
        const statementDuoIntersectionOne = [
            {
                "key": statementDuoIntersectionOneQueryKey,
                "title": "Query 1",
                "instructions": [
                    {
                        "type": "filter",
                        "data": {
                            "id": "zygosity",
                            "type": "generic",
                            "operand": "one",
                            "values": [
                                "HOM"
                            ]
                        }
                    },
                    {
                        "type": "operator",
                        "data": {
                            "type": "and"
                        }
                    },
                    {
                        "type": "filter",
                        "data": {
                            "id": "gene_type",
                            "type": "generic",
                            "operand": "one",
                            "values": [
                                "protein_coding"
                            ]
                        }
                    }
                ]
            }
        ]
        const statementDuoIntersectionTwoQueryKey = uniqid();
        const statementDuoIntersectionTwo = [
            {
                "key": statementDuoIntersectionTwoQueryKey,
                "title": "Query 2",
                "instructions": [
                    {
                        "type": "filter",
                        "data": {
                            "id": "metric_depth_quality",
                            "type": "numcomparison",
                            "values": [
                                {
                                    "comparator": ">=",
                                    "value": 26.06
                                }
                            ]
                        }
                    },
                    {
                        "type": "operator",
                        "data": {
                            "type": "and"
                        }
                    },
                    {
                        "type": "filter",
                        "data": {
                            "id": "extdb",
                            "type": "genericbool",
                            "values": [
                                "extdb_pubmed"
                            ]
                        }
                    }
                ]
            }
        ]
        const statementDuoIntersectionThreeQueryKey = uniqid();
        const statementDuoIntersectionThree = [
            {
                "key": statementDuoIntersectionThreeQueryKey,
                "title": "Query 4",
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
                    },
                    {
                        "type": "operator",
                        "data": {
                            "type": "and"
                        }
                    },
                    {
                        "type": "filter",
                        "data": {
                            "id": "extdb",
                            "type": "genericbool",
                            "values": [
                                "extdb_pubmed"
                            ]
                        }
                    }
                ]
            }
        ]
        const statementDuoUnionQueryKey = uniqid();
        const statementDuoUnion = [
            {
                "key": statementDuoUnionQueryKey,
                "title": "Query 3",
                "instructions": [
                    {
                        "type": "filter",
                        "data": {
                            "id": "metric_depth_quality",
                            "type": "numcomparison",
                            "values": [
                                {
                                    "comparator": ">=",
                                    "value": 15.58
                                }
                            ]
                        }
                    },
                    {
                        "type": "operator",
                        "data": {
                            "type": "or"
                        }
                    },
                    {
                        "type": "filter",
                        "data": {
                            "id": "cohort_exac",
                            "type": "numcomparison",
                            "values": [
                                {
                                    "comparator": ">=",
                                    "value": 0.4
                                },
                                {
                                    "comparator": "<=",
                                    "value": 0.71
                                }
                            ]
                        }
                    }
                ]
            }
        ]

        it('should return correct translation for intersection in Aggregation Count translation', () => {
            const facetQueryOne = generateFacetQuery(PATIENT_ID, statementDuoIntersectionOne, statementDuoIntersectionOneQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(facetQueryOne).to.eql(
                {
                    "size": 0,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": [{
                                        "bool": {
                                            "must": [{
                                                "nested": {
                                                    "path": "donors",
                                                    "query": {
                                                        "bool": {
                                                            "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                                "bool": {
                                                                    "should": [{"term": {"donors.zygosity": "HOM"}}],
                                                                    "minimum_should_match": 1
                                                                }
                                                            }]
                                                        }
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "bool": {
                                            "should": [{"term": {"genes.biotype": "protein_coding"}}],
                                            "minimum_should_match": 1
                                        }
                                    }]
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "aggs": {
                        "filtered": {
                            "aggs": {
                                "variant_type": {
                                    "terms": {
                                        "field": "variant_class",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "consequence": {
                                    "terms": {
                                        "field": "consequences.consequence",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extdb_pubmed": {"terms": {"field": "ext_db.is_pubmed", "size": 1}},
                                "extdb_clinvar": {"terms": {"field": "ext_db.is_clinvar", "size": 1}},
                                "extdb_dbsnp": {"terms": {"field": "ext_db.is_dbsnp", "size": 1}},
                                "chromosome": {
                                    "terms": {
                                         "field": "chromosome",
                                        "order": {"_count": "desc"},
                                        "size": 24
                                    }
                                },
                                "gene_type": {
                                    "terms": {
                                        "field": "genes.biotype",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extref_hpo": {"terms": {"field": "ext_db.is_hpo", "size": 1}},
                                "extref_orphanet": {"terms": {"field": "ext_db.is_orphanet", "size": 1}},

                                "extref_omim": {"terms": {"field": "ext_db.is_omim", "size": 1}},
                                "gene_hpo": {
                                    "terms": {
                                        "field": "genes.hpo.hpo_term_label",
                                        "order": {"_count": "desc"},
                                        "size": 9999
                                    }
                                },

                                "genegroup_orphanet": {
                                    "terms": {
                                        "field": "genes.orphanet.panel",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "clinvar_clinsig": {
                                    "terms": {
                                        "field": "clinvar.clin_sig",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "impact": {
                                    "terms": {
                                        "field": "consequences.impact",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "prediction_fathmm": {
                                    "terms": {
                                        "field": "consequences.predictions.fathmm_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_fathmm_min": {"min": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_fathmm_max": {"max": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_sift": {
                                    "terms": {
                                        "field": "consequences.predictions.sift_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_sift_min": {"min": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_sift_max": {"max": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_polyphen2_hvar": {
                                    "terms": {
                                        "field": "consequences.predictions.polyphen2_hvar_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_polyphen2_hvar_min": {"min": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_polyphen2_hvar_max": {"max": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_lrt": {
                                    "terms": {
                                        "field": "consequences.predictions.lrt_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_lrt_min": {"min": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_lrt_max": {"max": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_dann_min": {"min": {"field": "consequences.predictions.dann_score"}},
                                "prediction_dann_max": {"max": {"field": "consequences.predictions.dann_score"}},
                                "prediction_cadd_min": {"min": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_cadd_max": {"max": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_revel_min": {"min": {"field": "consequences.predictions.revel_rankscore"}},
                                "prediction_revel_max": {"max": {"field": "consequences.predictions.revel_rankscore"}},
                                "conservation_phylop_min": {"min": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "conservation_phylop_max": {"max": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "cohort_rqdm_min": {"min": {"field": "frequencies.internal.af"}},
                                "cohort_rqdm_max": {"max": {"field": "frequencies.internal.af"}},

                                "cohort_gnomad_genomes_min": {"min": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_gnomad_genomes_max": {"max": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_exac_min": {"min": {"field": "frequencies.exac.af"}},
                                "cohort_exac_max": {"max": {"field": "frequencies.exac.af"}},

                                "cohort_1000gp3_min": {"min": {"field": "frequencies.1000_genomes.af"}},
                                "cohort_1000gp3_max": {"max": {"field": "frequencies.1000_genomes.af"}}
                            }, "filter": {"bool": {}}
                        },
                        "nested_donors": {
                            "nested": {"path": "donors"}, "aggs": {
                                "filtered": {
                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                    "aggs": {


                                        "zygosity": {
                                            "terms": {
                                                "field": "donors.zygosity",
                                                "order": {"_count": "desc"},
                                                "size": 9
                                            }
                                        },
                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}},
                                        "metric_allelic_alt_depth_min": {"min": {"field": "donors.ad_alt"}},
                                        "metric_allelic_alt_depth_max": {"max": {"field": "donors.ad_alt"}},
                                        "metric_total_depth_min": {"min": {"field": "donors.ad_total"}},
                                        "metric_total_depth_max": {"max": {"field": "donors.ad_total"}},
                                        "metric_ratio_min": {"min": {"field": "donors.ad_ratio"}},
                                        "metric_ratio_max": {"max": {"field": "donors.ad_ratio"}},
                                        "metric_genotype_quality_min": {"min": {"field": "donors.gq"}},
                                        "metric_genotype_quality_max": {"max": {"field": "donors.gq"}}
                                    }
                                }
                            }
                        },
                        "zygosity": {
                            "global": {},
                            "aggs": {
                                "filtered_except_zygosity": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "must": [{
                                                        "bool": {
                                                            "must": [{
                                                                "nested": {
                                                                    "path": "donors",
                                                                    "query": {
                                                                        "bool": {
                                                                            "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                                                "bool": {
                                                                                    "should": [],
                                                                                    "minimum_should_match": 1
                                                                                }
                                                                            }]
                                                                        }
                                                                    }
                                                                }
                                                            }]
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "should": [{"term": {"genes.biotype": "protein_coding"}}],
                                                            "minimum_should_match": 1
                                                        }
                                                    }]
                                                }
                                            }]
                                        }
                                    },
                                    "aggs": {
                                        "nested_donors": {
                                            "nested": {"path": "donors"},
                                            "aggs": {
                                                "filtered": {
                                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                                    "aggs": {
                                                        "zygosity": {
                                                            "terms": {
                                                                "field": "donors.zygosity",
                                                                "order": {"_count": "desc"},
                                                                "size": 9
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "gene_type": {
                            "global": {},
                            "aggs": {
                                "filtered_except_gene_type": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "must": [{
                                                        "bool": {
                                                            "must": [{
                                                                "nested": {
                                                                    "path": "donors",
                                                                    "query": {
                                                                        "bool": {
                                                                            "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                                                "bool": {
                                                                                    "should": [{"term": {"donors.zygosity": "HOM"}}],
                                                                                    "minimum_should_match": 1
                                                                                }
                                                                            }]
                                                                        }
                                                                    }
                                                                }
                                                            }]
                                                        }
                                                    }, {"bool": {"should": [], "minimum_should_match": 1}}]
                                                }
                                            }, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]
                                        }
                                    },
                                    "aggs": {
                                        "gene_type": {
                                            "terms": {
                                                "field": "genes.biotype",
                                                "order": {"_count": "desc"},
                                                "size": 999
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            )
            const facetQueryTwo = generateFacetQuery(PATIENT_ID, statementDuoIntersectionTwo, statementDuoIntersectionTwoQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(facetQueryTwo).to.eql(
                {
                    "size": 0,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": [{
                                        "bool": {
                                            "must": [{
                                                "nested": {
                                                    "path": "donors",
                                                    "query": {"bool": {"filter": [{"term": {"donors.patient_id": "PA00001"}}, {"bool": {"must": {"range": {"donors.qd": {"gte": 26.06}}}}}]}}
                                                }
                                            }]
                                        }
                                    }, {
                                        "bool": {
                                            "should": [{"term": {"ext_db.is_pubmed": true}}],
                                            "minimum_should_match": 1
                                        }
                                    }]
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "aggs": {
                        "filtered": {
                            "aggs": {
                                "variant_type": {
                                    "terms": {
                                        "field": "variant_class",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "consequence": {
                                    "terms": {
                                        "field": "consequences.consequence",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extdb_pubmed": {"terms": {"field": "ext_db.is_pubmed", "size": 1}},
                                "extdb_clinvar": {"terms": {"field": "ext_db.is_clinvar", "size": 1}},
                                "extdb_dbsnp": {"terms": {"field": "ext_db.is_dbsnp", "size": 1}},
                                "chromosome": {
                                    "terms": {
                                         "field": "chromosome",
                                        "order": {"_count": "desc"},
                                        "size": 24
                                    }
                                },
                                "gene_type": {
                                    "terms": {
                                        "field": "genes.biotype",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extref_hpo": {"terms": {"field": "ext_db.is_hpo", "size": 1}},
                                "extref_orphanet": {"terms": {"field": "ext_db.is_orphanet", "size": 1}},

                                "extref_omim": {"terms": {"field": "ext_db.is_omim", "size": 1}},
                                "gene_hpo": {
                                    "terms": {
                                        "field": "genes.hpo.hpo_term_label",
                                        "order": {"_count": "desc"},
                                        "size": 9999
                                    }
                                },

                                "genegroup_orphanet": {
                                    "terms": {
                                        "field": "genes.orphanet.panel",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "clinvar_clinsig": {
                                    "terms": {
                                        "field": "clinvar.clin_sig",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "impact": {
                                    "terms": {
                                        "field": "consequences.impact",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "prediction_fathmm": {
                                    "terms": {
                                        "field": "consequences.predictions.fathmm_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_fathmm_min": {"min": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_fathmm_max": {"max": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_sift": {
                                    "terms": {
                                        "field": "consequences.predictions.sift_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_sift_min": {"min": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_sift_max": {"max": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_polyphen2_hvar": {
                                    "terms": {
                                        "field": "consequences.predictions.polyphen2_hvar_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_polyphen2_hvar_min": {"min": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_polyphen2_hvar_max": {"max": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_lrt": {
                                    "terms": {
                                        "field": "consequences.predictions.lrt_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_lrt_min": {"min": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_lrt_max": {"max": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_dann_min": {"min": {"field": "consequences.predictions.dann_score"}},
                                "prediction_dann_max": {"max": {"field": "consequences.predictions.dann_score"}},
                                "prediction_cadd_min": {"min": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_cadd_max": {"max": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_revel_min": {"min": {"field": "consequences.predictions.revel_rankscore"}},
                                "prediction_revel_max": {"max": {"field": "consequences.predictions.revel_rankscore"}},
                                "conservation_phylop_min": {"min": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "conservation_phylop_max": {"max": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "cohort_rqdm_min": {"min": {"field": "frequencies.internal.af"}},
                                "cohort_rqdm_max": {"max": {"field": "frequencies.internal.af"}},

                                "cohort_gnomad_genomes_min": {"min": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_gnomad_genomes_max": {"max": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_exac_min": {"min": {"field": "frequencies.exac.af"}},
                                "cohort_exac_max": {"max": {"field": "frequencies.exac.af"}},

                                "cohort_1000gp3_min": {"min": {"field": "frequencies.1000_genomes.af"}},
                                "cohort_1000gp3_max": {"max": {"field": "frequencies.1000_genomes.af"}}
                            }, "filter": {"bool": {}}
                        },
                        "nested_donors": {
                            "nested": {"path": "donors"}, "aggs": {
                                "filtered": {
                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                    "aggs": {


                                        "zygosity": {
                                            "terms": {
                                                "field": "donors.zygosity",
                                                "order": {"_count": "desc"},
                                                "size": 9
                                            }
                                        },
                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}},
                                        "metric_allelic_alt_depth_min": {"min": {"field": "donors.ad_alt"}},
                                        "metric_allelic_alt_depth_max": {"max": {"field": "donors.ad_alt"}},
                                        "metric_total_depth_min": {"min": {"field": "donors.ad_total"}},
                                        "metric_total_depth_max": {"max": {"field": "donors.ad_total"}},
                                        "metric_ratio_min": {"min": {"field": "donors.ad_ratio"}},
                                        "metric_ratio_max": {"max": {"field": "donors.ad_ratio"}},
                                        "metric_genotype_quality_min": {"min": {"field": "donors.gq"}},
                                        "metric_genotype_quality_max": {"max": {"field": "donors.gq"}}
                                    }
                                }
                            }
                        },
                        "metric_depth_quality": {
                            "global": {},
                            "aggs": {
                                "filtered_except_metric_depth_quality": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "must": [{
                                                        "bool": {
                                                            "must": [{
                                                                "nested": {
                                                                    "path": "donors",
                                                                    "query": {"bool": {"filter": [{"term": {"donors.patient_id": "PA00001"}}, {"bool": {"must": {"range": {"donors.qd": {}}}}}]}}
                                                                }
                                                            }]
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "should": [{"term": {"ext_db.is_pubmed": true}}],
                                                            "minimum_should_match": 1
                                                        }
                                                    }]
                                                }
                                            }]
                                        }
                                    },
                                    "aggs": {
                                        "nested_donors": {
                                            "nested": {"path": "donors"},
                                            "aggs": {
                                                "filtered": {
                                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                                    "aggs": {
                                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}}
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "extdb_pubmed": {
                            "global": {},
                            "aggs": {
                                "filtered_except_extdb_pubmed": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "must": [{
                                                        "bool": {
                                                            "must": [{
                                                                "nested": {
                                                                    "path": "donors",
                                                                    "query": {"bool": {"filter": [{"term": {"donors.patient_id": "PA00001"}}, {"bool": {"must": {"range": {"donors.qd": {"gte": 26.06}}}}}]}}
                                                                }
                                                            }]
                                                        }
                                                    }, {"bool": {"should": [], "minimum_should_match": 1}}]
                                                }
                                            }, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]
                                        }
                                    },
                                    "aggs": {"extdb_pubmed": {"terms": {"field": "ext_db.is_pubmed", "size": 1}}}
                                }
                            }
                        },
                        "extdb_clinvar": {
                            "global": {},
                            "aggs": {
                                "filtered_except_extdb_clinvar": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "must": [{
                                                        "bool": {
                                                            "must": [{
                                                                "nested": {
                                                                    "path": "donors",
                                                                    "query": {"bool": {"filter": [{"term": {"donors.patient_id": "PA00001"}}, {"bool": {"must": {"range": {"donors.qd": {"gte": 26.06}}}}}]}}
                                                                }
                                                            }]
                                                        }
                                                    }, {"bool": {"should": [], "minimum_should_match": 1}}]
                                                }
                                            }, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]
                                        }
                                    },
                                    "aggs": {"extdb_clinvar": {"terms": {"field": "ext_db.is_clinvar", "size": 1}}}
                                }
                            }
                        },
                        "extdb_dbsnp": {
                            "global": {},
                            "aggs": {
                                "filtered_except_extdb_dbsnp": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "must": [{
                                                        "bool": {
                                                            "must": [{
                                                                "nested": {
                                                                    "path": "donors",
                                                                    "query": {"bool": {"filter": [{"term": {"donors.patient_id": "PA00001"}}, {"bool": {"must": {"range": {"donors.qd": {"gte": 26.06}}}}}]}}
                                                                }
                                                            }]
                                                        }
                                                    }, {"bool": {"should": [], "minimum_should_match": 1}}]
                                                }
                                            }, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]
                                        }
                                    }, "aggs": {"extdb_dbsnp": {"terms": {"field": "ext_db.is_dbsnp", "size": 1}}}
                                }
                            }
                        }
                    }
                }
            )
            const facetQueryThree = generateFacetQuery(PATIENT_ID, statementDuoIntersectionThree, statementDuoIntersectionThreeQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(facetQueryThree).to.eql(
                {
                    "size": 0,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": [{
                                        "bool": {
                                            "must": [{
                                                "nested": {
                                                    "path": "donors",
                                                    "query": {
                                                        "bool": {
                                                            "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                                "bool": {
                                                                    "should": [{"term": {"donors.zygosity": "HET"}}],
                                                                    "minimum_should_match": 1
                                                                }
                                                            }]
                                                        }
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "bool": {
                                            "should": [{"term": {"ext_db.is_pubmed": true}}],
                                            "minimum_should_match": 1
                                        }
                                    }]
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "aggs": {
                        "filtered": {
                            "aggs": {
                                "variant_type": {
                                    "terms": {
                                        "field": "variant_class",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "consequence": {
                                    "terms": {
                                        "field": "consequences.consequence",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extdb_pubmed": {"terms": {"field": "ext_db.is_pubmed", "size": 1}},
                                "extdb_clinvar": {"terms": {"field": "ext_db.is_clinvar", "size": 1}},
                                "extdb_dbsnp": {"terms": {"field": "ext_db.is_dbsnp", "size": 1}},
                                "chromosome": {
                                    "terms": {
                                         "field": "chromosome",
                                        "order": {"_count": "desc"},
                                        "size": 24
                                    }
                                },
                                "gene_type": {
                                    "terms": {
                                        "field": "genes.biotype",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extref_hpo": {"terms": {"field": "ext_db.is_hpo", "size": 1}},
                                "extref_orphanet": {"terms": {"field": "ext_db.is_orphanet", "size": 1}},

                                "extref_omim": {"terms": {"field": "ext_db.is_omim", "size": 1}},
                                "gene_hpo": {
                                    "terms": {
                                        "field": "genes.hpo.hpo_term_label",
                                        "order": {"_count": "desc"},
                                        "size": 9999
                                    }
                                },

                                "genegroup_orphanet": {
                                    "terms": {
                                        "field": "genes.orphanet.panel",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "clinvar_clinsig": {
                                    "terms": {
                                        "field": "clinvar.clin_sig",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "impact": {
                                    "terms": {
                                        "field": "consequences.impact",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "prediction_fathmm": {
                                    "terms": {
                                        "field": "consequences.predictions.fathmm_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_fathmm_min": {"min": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_fathmm_max": {"max": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_sift": {
                                    "terms": {
                                        "field": "consequences.predictions.sift_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_sift_min": {"min": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_sift_max": {"max": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_polyphen2_hvar": {
                                    "terms": {
                                        "field": "consequences.predictions.polyphen2_hvar_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_polyphen2_hvar_min": {"min": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_polyphen2_hvar_max": {"max": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_lrt": {
                                    "terms": {
                                        "field": "consequences.predictions.lrt_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_lrt_min": {"min": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_lrt_max": {"max": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_dann_min": {"min": {"field": "consequences.predictions.dann_score"}},
                                "prediction_dann_max": {"max": {"field": "consequences.predictions.dann_score"}},
                                "prediction_cadd_min": {"min": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_cadd_max": {"max": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_revel_min": {"min": {"field": "consequences.predictions.revel_rankscore"}},
                                "prediction_revel_max": {"max": {"field": "consequences.predictions.revel_rankscore"}},
                                "conservation_phylop_min": {"min": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "conservation_phylop_max": {"max": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "cohort_rqdm_min": {"min": {"field": "frequencies.internal.af"}},
                                "cohort_rqdm_max": {"max": {"field": "frequencies.internal.af"}},

                                "cohort_gnomad_genomes_min": {"min": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_gnomad_genomes_max": {"max": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_exac_min": {"min": {"field": "frequencies.exac.af"}},
                                "cohort_exac_max": {"max": {"field": "frequencies.exac.af"}},

                                "cohort_1000gp3_min": {"min": {"field": "frequencies.1000_genomes.af"}},
                                "cohort_1000gp3_max": {"max": {"field": "frequencies.1000_genomes.af"}}
                            }, "filter": {"bool": {}}
                        },
                        "nested_donors": {
                            "nested": {"path": "donors"}, "aggs": {
                                "filtered": {
                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                    "aggs": {


                                        "zygosity": {
                                            "terms": {
                                                "field": "donors.zygosity",
                                                "order": {"_count": "desc"},
                                                "size": 9
                                            }
                                        },
                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}},
                                        "metric_allelic_alt_depth_min": {"min": {"field": "donors.ad_alt"}},
                                        "metric_allelic_alt_depth_max": {"max": {"field": "donors.ad_alt"}},
                                        "metric_total_depth_min": {"min": {"field": "donors.ad_total"}},
                                        "metric_total_depth_max": {"max": {"field": "donors.ad_total"}},
                                        "metric_ratio_min": {"min": {"field": "donors.ad_ratio"}},
                                        "metric_ratio_max": {"max": {"field": "donors.ad_ratio"}},
                                        "metric_genotype_quality_min": {"min": {"field": "donors.gq"}},
                                        "metric_genotype_quality_max": {"max": {"field": "donors.gq"}}
                                    }
                                }
                            }
                        },
                        "zygosity": {
                            "global": {},
                            "aggs": {
                                "filtered_except_zygosity": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "must": [{
                                                        "bool": {
                                                            "must": [{
                                                                "nested": {
                                                                    "path": "donors",
                                                                    "query": {
                                                                        "bool": {
                                                                            "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                                                "bool": {
                                                                                    "should": [],
                                                                                    "minimum_should_match": 1
                                                                                }
                                                                            }]
                                                                        }
                                                                    }
                                                                }
                                                            }]
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "should": [{"term": {"ext_db.is_pubmed": true}}],
                                                            "minimum_should_match": 1
                                                        }
                                                    }]
                                                }
                                            }]
                                        }
                                    },
                                    "aggs": {
                                        "nested_donors": {
                                            "nested": {"path": "donors"},
                                            "aggs": {
                                                "filtered": {
                                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                                    "aggs": {
                                                        "zygosity": {
                                                            "terms": {
                                                                "field": "donors.zygosity",
                                                                "order": {"_count": "desc"},
                                                                "size": 9
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "extdb_pubmed": {
                            "global": {},
                            "aggs": {
                                "filtered_except_extdb_pubmed": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "must": [{
                                                        "bool": {
                                                            "must": [{
                                                                "nested": {
                                                                    "path": "donors",
                                                                    "query": {
                                                                        "bool": {
                                                                            "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                                                "bool": {
                                                                                    "should": [{"term": {"donors.zygosity": "HET"}}],
                                                                                    "minimum_should_match": 1
                                                                                }
                                                                            }]
                                                                        }
                                                                    }
                                                                }
                                                            }]
                                                        }
                                                    }, {"bool": {"should": [], "minimum_should_match": 1}}]
                                                }
                                            }, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]
                                        }
                                    },
                                    "aggs": {"extdb_pubmed": {"terms": {"field": "ext_db.is_pubmed", "size": 1}}}
                                }
                            }
                        },
                        "extdb_clinvar": {
                            "global": {},
                            "aggs": {
                                "filtered_except_extdb_clinvar": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "must": [{
                                                        "bool": {
                                                            "must": [{
                                                                "nested": {
                                                                    "path": "donors",
                                                                    "query": {
                                                                        "bool": {
                                                                            "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                                                "bool": {
                                                                                    "should": [{"term": {"donors.zygosity": "HET"}}],
                                                                                    "minimum_should_match": 1
                                                                                }
                                                                            }]
                                                                        }
                                                                    }
                                                                }
                                                            }]
                                                        }
                                                    }, {"bool": {"should": [], "minimum_should_match": 1}}]
                                                }
                                            }, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]
                                        }
                                    },
                                    "aggs": {"extdb_clinvar": {"terms": {"field": "ext_db.is_clinvar", "size": 1}}}
                                }
                            }
                        },
                        "extdb_dbsnp": {
                            "global": {},
                            "aggs": {
                                "filtered_except_extdb_dbsnp": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "must": [{
                                                        "bool": {
                                                            "must": [{
                                                                "nested": {
                                                                    "path": "donors",
                                                                    "query": {
                                                                        "bool": {
                                                                            "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                                                "bool": {
                                                                                    "should": [{"term": {"donors.zygosity": "HET"}}],
                                                                                    "minimum_should_match": 1
                                                                                }
                                                                            }]
                                                                        }
                                                                    }
                                                                }
                                                            }]
                                                        }
                                                    }, {"bool": {"should": [], "minimum_should_match": 1}}]
                                                }
                                            }, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]
                                        }
                                    }, "aggs": {"extdb_dbsnp": {"terms": {"field": "ext_db.is_dbsnp", "size": 1}}}
                                }
                            }
                        }
                    }
                }
            )
        })

        it('should return correct translation for intersection in Query Count translation', () => {
            const countQueryOne = generateCountQuery(PATIENT_ID, statementDuoIntersectionOne, statementDuoIntersectionOneQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(countQueryOne).to.eql(
                {
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": [{
                                        "bool": {
                                            "must": [{
                                                "nested": {
                                                    "path": "donors",
                                                    "query": {
                                                        "bool": {
                                                            "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                                "bool": {
                                                                    "should": [{"term": {"donors.zygosity": "HOM"}}],
                                                                    "minimum_should_match": 1
                                                                }
                                                            }]
                                                        }
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "bool": {
                                            "should": [{"term": {"genes.biotype": "protein_coding"}}],
                                            "minimum_should_match": 1
                                        }
                                    }]
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    }
                }
            )
            const countQueryTwo = generateCountQuery(PATIENT_ID, statementDuoIntersectionTwo, statementDuoIntersectionTwoQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(countQueryTwo).to.eql(
                {
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": [{
                                        "bool": {
                                            "must": [{
                                                "nested": {
                                                    "path": "donors",
                                                    "query": {"bool": {"filter": [{"term": {"donors.patient_id": "PA00001"}}, {"bool": {"must": {"range": {"donors.qd": {"gte": 26.06}}}}}]}}
                                                }
                                            }]
                                        }
                                    }, {
                                        "bool": {
                                            "should": [{"term": {"ext_db.is_pubmed": true}}],
                                            "minimum_should_match": 1
                                        }
                                    }]
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    }
                }
            )
            const countQueryThree = generateCountQuery(PATIENT_ID, statementDuoIntersectionThree, statementDuoIntersectionThreeQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(countQueryThree).to.eql(
                {
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": [{
                                        "bool": {
                                            "must": [{
                                                "nested": {
                                                    "path": "donors",
                                                    "query": {
                                                        "bool": {
                                                            "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                                "bool": {
                                                                    "should": [{"term": {"donors.zygosity": "HET"}}],
                                                                    "minimum_should_match": 1
                                                                }
                                                            }]
                                                        }
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "bool": {
                                            "should": [{"term": {"ext_db.is_pubmed": true}}],
                                            "minimum_should_match": 1
                                        }
                                    }]
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    }
                }
            )
        })

        it('should return correct translation for intersection in Query Search translation', () => {
            const variantQueryOne = generateVariantQuery(PATIENT_ID, statementDuoIntersectionOne, statementDuoIntersectionOneQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT)
            expect(variantQueryOne).to.eql(
                {
                    "from": 0,
                    "size": 25,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": [{
                                        "bool": {
                                            "must": [{
                                                "nested": {
                                                    "path": "donors",
                                                    "query": {
                                                        "bool": {
                                                            "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                                "bool": {
                                                                    "should": [{"term": {"donors.zygosity": "HOM"}}],
                                                                    "minimum_should_match": 1
                                                                }
                                                            }]
                                                        }
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "bool": {
                                            "should": [{"term": {"genes.biotype": "protein_coding"}}],
                                            "minimum_should_match": 1
                                        }
                                    }]
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "sort": [{"impact_score": {"order": "desc"}}]

                }
            )
            const variantQueryTwo = generateVariantQuery(PATIENT_ID, statementDuoIntersectionTwo, statementDuoIntersectionTwoQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT)
            expect(variantQueryTwo).to.eql(
                {
                    "from": 0,
                    "size": 25,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": [{
                                        "bool": {
                                            "must": [{
                                                "nested": {
                                                    "path": "donors",
                                                    "query": {"bool": {"filter": [{"term": {"donors.patient_id": "PA00001"}}, {"bool": {"must": {"range": {"donors.qd": {"gte": 26.06}}}}}]}}
                                                }
                                            }]
                                        }
                                    }, {
                                        "bool": {
                                            "should": [{"term": {"ext_db.is_pubmed": true}}],
                                            "minimum_should_match": 1
                                        }
                                    }]
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "sort": [{"impact_score": {"order": "desc"}}]

                }
            )
            const variantQueryThree = generateVariantQuery(PATIENT_ID, statementDuoIntersectionThree, statementDuoIntersectionThreeQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT)
            expect(variantQueryThree).to.eql(
                {
                    "from": 0,
                    "size": 25,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": [{
                                        "bool": {
                                            "must": [{
                                                "nested": {
                                                    "path": "donors",
                                                    "query": {
                                                        "bool": {
                                                            "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                                "bool": {
                                                                    "should": [{"term": {"donors.zygosity": "HET"}}],
                                                                    "minimum_should_match": 1
                                                                }
                                                            }]
                                                        }
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "bool": {
                                            "should": [{"term": {"ext_db.is_pubmed": true}}],
                                            "minimum_should_match": 1
                                        }
                                    }]
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "sort": [{"impact_score": {"order": "desc"}}]

                }
            )
        })

        it('should return correct translation for union in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery(PATIENT_ID, statementDuoUnion, statementDuoUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(facetQuery).to.eql(
                {
                    "size": 0,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "should": [{
                                        "bool": {
                                            "must": [{
                                                "nested": {
                                                    "path": "donors",
                                                    "query": {"bool": {"filter": [{"term": {"donors.patient_id": "PA00001"}}, {"bool": {"must": {"range": {"donors.qd": {"gte": 15.58}}}}}]}}
                                                }
                                            }]
                                        }
                                    }, {
                                        "bool": {
                                            "must": {
                                                "range": {
                                                    "frequencies.exac.af": {
                                                        "gte": 0.4,
                                                        "lte": 0.71
                                                    }
                                                }
                                            }
                                        }
                                    }], "minimum_should_match": 1
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "aggs": {
                        "filtered": {
                            "aggs": {
                                "variant_type": {
                                    "terms": {
                                        "field": "variant_class",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "consequence": {
                                    "terms": {
                                        "field": "consequences.consequence",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extdb_pubmed": {"terms": {"field": "ext_db.is_pubmed", "size": 1}},
                                "extdb_clinvar": {"terms": {"field": "ext_db.is_clinvar", "size": 1}},
                                "extdb_dbsnp": {"terms": {"field": "ext_db.is_dbsnp", "size": 1}},
                                "chromosome": {
                                    "terms": {
                                         "field": "chromosome",
                                        "order": {"_count": "desc"},
                                        "size": 24
                                    }
                                },
                                "gene_type": {
                                    "terms": {
                                        "field": "genes.biotype",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extref_hpo": {"terms": {"field": "ext_db.is_hpo", "size": 1}},
                                "extref_orphanet": {"terms": {"field": "ext_db.is_orphanet", "size": 1}},

                                "extref_omim": {"terms": {"field": "ext_db.is_omim", "size": 1}},
                                "gene_hpo": {
                                    "terms": {
                                        "field": "genes.hpo.hpo_term_label",
                                        "order": {"_count": "desc"},
                                        "size": 9999
                                    }
                                },
                                "genegroup_orphanet": {
                                    "terms": {
                                        "field": "genes.orphanet.panel",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "clinvar_clinsig": {
                                    "terms": {
                                        "field": "clinvar.clin_sig",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "impact": {
                                    "terms": {
                                        "field": "consequences.impact",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "prediction_fathmm": {
                                    "terms": {
                                        "field": "consequences.predictions.fathmm_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_fathmm_min": {"min": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_fathmm_max": {"max": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_sift": {
                                    "terms": {
                                        "field": "consequences.predictions.sift_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_sift_min": {"min": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_sift_max": {"max": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_polyphen2_hvar": {
                                    "terms": {
                                        "field": "consequences.predictions.polyphen2_hvar_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_polyphen2_hvar_min": {"min": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_polyphen2_hvar_max": {"max": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_lrt": {
                                    "terms": {
                                        "field": "consequences.predictions.lrt_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_lrt_min": {"min": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_lrt_max": {"max": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_dann_min": {"min": {"field": "consequences.predictions.dann_score"}},
                                "prediction_dann_max": {"max": {"field": "consequences.predictions.dann_score"}},
                                "prediction_cadd_min": {"min": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_cadd_max": {"max": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_revel_min": {"min": {"field": "consequences.predictions.revel_rankscore"}},
                                "prediction_revel_max": {"max": {"field": "consequences.predictions.revel_rankscore"}},
                                "conservation_phylop_min": {"min": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "conservation_phylop_max": {"max": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "cohort_rqdm_min": {"min": {"field": "frequencies.internal.af"}},
                                "cohort_rqdm_max": {"max": {"field": "frequencies.internal.af"}},

                                "cohort_gnomad_genomes_min": {"min": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_gnomad_genomes_max": {"max": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_exac_min": {"min": {"field": "frequencies.exac.af"}},
                                "cohort_exac_max": {"max": {"field": "frequencies.exac.af"}},

                                "cohort_1000gp3_min": {"min": {"field": "frequencies.1000_genomes.af"}},
                                "cohort_1000gp3_max": {"max": {"field": "frequencies.1000_genomes.af"}}
                            }, "filter": {"bool": {}}
                        },
                        "nested_donors": {
                            "nested": {"path": "donors"}, "aggs": {
                                "filtered": {
                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                    "aggs": {
                                        "zygosity": {
                                            "terms": {
                                                "field": "donors.zygosity",
                                                "order": {"_count": "desc"},
                                                "size": 9
                                            }
                                        },
                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}},
                                        "metric_allelic_alt_depth_min": {"min": {"field": "donors.ad_alt"}},
                                        "metric_allelic_alt_depth_max": {"max": {"field": "donors.ad_alt"}},
                                        "metric_total_depth_min": {"min": {"field": "donors.ad_total"}},
                                        "metric_total_depth_max": {"max": {"field": "donors.ad_total"}},
                                        "metric_ratio_min": {"min": {"field": "donors.ad_ratio"}},
                                        "metric_ratio_max": {"max": {"field": "donors.ad_ratio"}},
                                        "metric_genotype_quality_min": {"min": {"field": "donors.gq"}},
                                        "metric_genotype_quality_max": {"max": {"field": "donors.gq"}}
                                    }
                                }
                            }
                        },
                        "metric_depth_quality": {
                            "global": {},
                            "aggs": {
                                "filtered_except_metric_depth_quality": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "should": [{
                                                        "bool": {
                                                            "must": [{
                                                                "nested": {
                                                                    "path": "donors",
                                                                    "query": {"bool": {"filter": [{"term": {"donors.patient_id": "PA00001"}}, {"bool": {"must": {"range": {"donors.qd": {}}}}}]}}
                                                                }
                                                            }]
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "must": {
                                                                "range": {
                                                                    "frequencies.exac.af": {
                                                                        "gte": 0.4,
                                                                        "lte": 0.71
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }], "minimum_should_match": 1
                                                }
                                            }]
                                        }
                                    },
                                    "aggs": {
                                        "nested_donors": {
                                            "nested": {"path": "donors"},
                                            "aggs": {
                                                "filtered": {
                                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                                    "aggs": {
                                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}}
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "cohort_exac": {
                            "global": {},
                            "aggs": {
                                "filtered_except_cohort_exac": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "should": [{
                                                        "bool": {
                                                            "must": [{
                                                                "nested": {
                                                                    "path": "donors",
                                                                    "query": {"bool": {"filter": [{"term": {"donors.patient_id": "PA00001"}}, {"bool": {"must": {"range": {"donors.qd": {"gte": 15.58}}}}}]}}
                                                                }
                                                            }]
                                                        }
                                                    }, {"bool": {"must": {"range": {"frequencies.exac.af": {}}}}}],
                                                    "minimum_should_match": 1
                                                }
                                            }, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]
                                        }
                                    },
                                    "aggs": {
                                        "cohort_exac_min": {"min": {"field": "frequencies.exac.af"}},
                                        "cohort_exac_max": {"max": {"field": "frequencies.exac.af"}}
                                    }
                                }
                            }
                        }
                    }
                }
            )
        })

        it('should return correct translation for union in Query Count translation', () => {
            const countQuery = generateCountQuery(PATIENT_ID, statementDuoUnion, statementDuoUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(countQuery).to.eql(
                {
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "should": [{
                                        "bool": {
                                            "must": [{
                                                "nested": {
                                                    "path": "donors",
                                                    "query": {"bool": {"filter": [{"term": {"donors.patient_id": "PA00001"}}, {"bool": {"must": {"range": {"donors.qd": {"gte": 15.58}}}}}]}}
                                                }
                                            }]
                                        }
                                    }, {
                                        "bool": {
                                            "must": {
                                                "range": {
                                                    "frequencies.exac.af": {
                                                        "gte": 0.4,
                                                        "lte": 0.71
                                                    }
                                                }
                                            }
                                        }
                                    }], "minimum_should_match": 1
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    }
                }
            )
        })

        it('should return correct translation for union in Query Search translation', () => {
            const variantQuery = generateVariantQuery(PATIENT_ID, statementDuoUnion, statementDuoUnionQueryKey, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT)
            expect(variantQuery).to.eql(
                {
                    "from": 0,
                    "size": 25,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "should": [{
                                        "bool": {
                                            "must": [{
                                                "nested": {
                                                    "path": "donors",
                                                    "query": {"bool": {"filter": [{"term": {"donors.patient_id": "PA00001"}}, {"bool": {"must": {"range": {"donors.qd": {"gte": 15.58}}}}}]}}
                                                }
                                            }]
                                        }
                                    }, {
                                        "bool": {
                                            "must": {
                                                "range": {
                                                    "frequencies.exac.af": {
                                                        "gte": 0.4,
                                                        "lte": 0.71
                                                    }
                                                }
                                            }
                                        }
                                    }], "minimum_should_match": 1
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "sort": [{"impact_score": {"order": "desc"}}]
                }
            )
        })

    })

    describe('Complex Query Unions & Intersections', () => {
        const statementComplexQueryKeyOne = uniqid();
        const statementComplexQueryKeyTwo = uniqid();
        const statementComplexQueryKeyThree = uniqid();
        const statementComplexQueryKeyFour = uniqid();
        const statementComplexQueryKeyFive = uniqid();
        const statementComplexQueryKeySix = uniqid();
        const statementComplex = [
            {
                "key": statementComplexQueryKeyOne,
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
            },
            {
                "key": statementComplexQueryKeyTwo,
                "title": "Query 2",
                "instructions": [
                    {
                        "type": "filter",
                        "data": {
                            "id": "zygosity",
                            "type": "generic",
                            "operand": "one",
                            "values": [
                                "HOM"
                            ]
                        }
                    }
                ]
            },
            {
                "key": statementComplexQueryKeyThree,
                "title": "Query 3",
                "instructions": [
                    {
                        "type": "filter",
                        "data": {
                            "id": "extdb",
                            "type": "genericbool",
                            "values": [
                                "extdb_pubmed"
                            ]
                        }
                    }
                ]
            },
            {
                "key": statementComplexQueryKeyFour,
                "title": "Query 4",
                "instructions": [
                    {
                        "type": "filter",
                        "data": {
                            "id": "cohort_rqdm",
                            "type": "numcomparison",
                            "values": [
                                {
                                    "comparator": ">=",
                                    "value": 0.29
                                },
                                {
                                    "comparator": "<=",
                                    "value": 0.61
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "key": statementComplexQueryKeyFive,
                "title": "Query 5",
                "instructions": [
                    {
                        "type": "subquery",
                        "data": {
                            "query": statementComplexQueryKeyOne
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
                            "query": statementComplexQueryKeyTwo
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
                            "query": statementComplexQueryKeyThree
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
                            "query": statementComplexQueryKeyFour
                        }
                    }
                ]
            },
            {
                "key": statementComplexQueryKeySix,
                "title": "Query 6",
                "instructions": [
                    {
                        "type": "subquery",
                        "data": {
                            "query": statementComplexQueryKeyOne
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
                            "query": statementComplexQueryKeyTwo
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
                            "query": statementComplexQueryKeyThree
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
                            "query": statementComplexQueryKeyFour
                        }
                    }
                ]
            }
        ]

        it('should return correct translation for complex intersection in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery(PATIENT_ID, statementComplex, statementComplexQueryKeyFive, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(facetQuery).to.eql(
                {
                    "size": 0,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": [{
                                        "bool": {
                                            "should": [{"term": {"variant_class": "SNV"}}],
                                            "minimum_should_match": 1
                                        }
                                    }, {
                                        "bool": {
                                            "must": [{
                                                "nested": {
                                                    "path": "donors",
                                                    "query": {
                                                        "bool": {
                                                            "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                                "bool": {
                                                                    "should": [{"term": {"donors.zygosity": "HOM"}}],
                                                                    "minimum_should_match": 1
                                                                }
                                                            }]
                                                        }
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "bool": {
                                            "should": [{"term": {"ext_db.is_pubmed": true}}],
                                            "minimum_should_match": 1
                                        }
                                    }, {
                                        "bool": {
                                            "must": {
                                                "range": {
                                                    "frequencies.internal.af": {
                                                        "gte": 0.29,
                                                        "lte": 0.61
                                                    }
                                                }
                                            }
                                        }
                                    }]
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "aggs": {
                        "filtered": {
                            "aggs": {
                                "variant_type": {
                                    "terms": {
                                        "field": "variant_class",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "consequence": {
                                    "terms": {
                                        "field": "consequences.consequence",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extdb_pubmed": {"terms": {"field": "ext_db.is_pubmed", "size": 1}},
                                "extdb_clinvar": {"terms": {"field": "ext_db.is_clinvar", "size": 1}},
                                "extdb_dbsnp": {"terms": {"field": "ext_db.is_dbsnp", "size": 1}},
                                "chromosome": {
                                    "terms": {
                                         "field": "chromosome",
                                        "order": {"_count": "desc"},
                                        "size": 24
                                    }
                                },
                                "gene_type": {
                                    "terms": {
                                        "field": "genes.biotype",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extref_hpo": {"terms": {"field": "ext_db.is_hpo", "size": 1}},
                                "extref_orphanet": {"terms": {"field": "ext_db.is_orphanet", "size": 1}},

                                "extref_omim": {"terms": {"field": "ext_db.is_omim", "size": 1}},
                                "gene_hpo": {
                                    "terms": {
                                        "field": "genes.hpo.hpo_term_label",
                                        "order": {"_count": "desc"},
                                        "size": 9999
                                    }
                                },

                                "genegroup_orphanet": {
                                    "terms": {
                                        "field": "genes.orphanet.panel",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "clinvar_clinsig": {
                                    "terms": {
                                        "field": "clinvar.clin_sig",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "impact": {
                                    "terms": {
                                        "field": "consequences.impact",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "prediction_fathmm": {
                                    "terms": {
                                        "field": "consequences.predictions.fathmm_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_fathmm_min": {"min": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_fathmm_max": {"max": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_sift": {
                                    "terms": {
                                        "field": "consequences.predictions.sift_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_sift_min": {"min": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_sift_max": {"max": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_polyphen2_hvar": {
                                    "terms": {
                                        "field": "consequences.predictions.polyphen2_hvar_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_polyphen2_hvar_min": {"min": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_polyphen2_hvar_max": {"max": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_lrt": {
                                    "terms": {
                                        "field": "consequences.predictions.lrt_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_lrt_min": {"min": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_lrt_max": {"max": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_dann_min": {"min": {"field": "consequences.predictions.dann_score"}},
                                "prediction_dann_max": {"max": {"field": "consequences.predictions.dann_score"}},
                                "prediction_cadd_min": {"min": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_cadd_max": {"max": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_revel_min": {"min": {"field": "consequences.predictions.revel_rankscore"}},
                                "prediction_revel_max": {"max": {"field": "consequences.predictions.revel_rankscore"}},
                                "conservation_phylop_min": {"min": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "conservation_phylop_max": {"max": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "cohort_rqdm_min": {"min": {"field": "frequencies.internal.af"}},
                                "cohort_rqdm_max": {"max": {"field": "frequencies.internal.af"}},

                                "cohort_gnomad_genomes_min": {"min": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_gnomad_genomes_max": {"max": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_exac_min": {"min": {"field": "frequencies.exac.af"}},
                                "cohort_exac_max": {"max": {"field": "frequencies.exac.af"}},

                                "cohort_1000gp3_min": {"min": {"field": "frequencies.1000_genomes.af"}},
                                "cohort_1000gp3_max": {"max": {"field": "frequencies.1000_genomes.af"}}
                            }, "filter": {"bool": {}}
                        },
                        "nested_donors": {
                            "nested": {"path": "donors"}, "aggs": {
                                "filtered": {
                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                    "aggs": {


                                        "zygosity": {
                                            "terms": {
                                                "field": "donors.zygosity",
                                                "order": {"_count": "desc"},
                                                "size": 9
                                            }
                                        },
                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}},
                                        "metric_allelic_alt_depth_min": {"min": {"field": "donors.ad_alt"}},
                                        "metric_allelic_alt_depth_max": {"max": {"field": "donors.ad_alt"}},
                                        "metric_total_depth_min": {"min": {"field": "donors.ad_total"}},
                                        "metric_total_depth_max": {"max": {"field": "donors.ad_total"}},
                                        "metric_ratio_min": {"min": {"field": "donors.ad_ratio"}},
                                        "metric_ratio_max": {"max": {"field": "donors.ad_ratio"}},
                                        "metric_genotype_quality_min": {"min": {"field": "donors.gq"}},
                                        "metric_genotype_quality_max": {"max": {"field": "donors.gq"}}
                                    }
                                }
                            }
                        },
                        "variant_type": {
                            "global": {},
                            "aggs": {
                                "filtered_except_variant_type": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "must": [{
                                                        "bool": {
                                                            "should": [],
                                                            "minimum_should_match": 1
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "must": [{
                                                                "nested": {
                                                                    "path": "donors",
                                                                    "query": {
                                                                        "bool": {
                                                                            "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                                                "bool": {
                                                                                    "should": [{"term": {"donors.zygosity": "HOM"}}],
                                                                                    "minimum_should_match": 1
                                                                                }
                                                                            }]
                                                                        }
                                                                    }
                                                                }
                                                            }]
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "should": [{"term": {"ext_db.is_pubmed": true}}],
                                                            "minimum_should_match": 1
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "must": {
                                                                "range": {
                                                                    "frequencies.internal.af": {
                                                                        "gte": 0.29,
                                                                        "lte": 0.61
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }]
                                                }
                                            }, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]
                                        }
                                    },
                                    "aggs": {
                                        "variant_type": {
                                            "terms": {
                                                "field": "variant_class",
                                                "order": {"_count": "desc"},
                                                "size": 999
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "zygosity": {
                            "global": {},
                            "aggs": {
                                "filtered_except_zygosity": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "must": [{
                                                        "bool": {
                                                            "should": [{"term": {"variant_class": "SNV"}}],
                                                            "minimum_should_match": 1
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "must": [{
                                                                "nested": {
                                                                    "path": "donors",
                                                                    "query": {
                                                                        "bool": {
                                                                            "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                                                "bool": {
                                                                                    "should": [],
                                                                                    "minimum_should_match": 1
                                                                                }
                                                                            }]
                                                                        }
                                                                    }
                                                                }
                                                            }]
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "should": [{"term": {"ext_db.is_pubmed": true}}],
                                                            "minimum_should_match": 1
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "must": {
                                                                "range": {
                                                                    "frequencies.internal.af": {
                                                                        "gte": 0.29,
                                                                        "lte": 0.61
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }]
                                                }
                                            }]
                                        }
                                    },
                                    "aggs": {
                                        "nested_donors": {
                                            "nested": {"path": "donors"},
                                            "aggs": {
                                                "filtered": {
                                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                                    "aggs": {
                                                        "zygosity": {
                                                            "terms": {
                                                                "field": "donors.zygosity",
                                                                "order": {"_count": "desc"},
                                                                "size": 9
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "extdb_pubmed": {
                            "global": {},
                            "aggs": {
                                "filtered_except_extdb_pubmed": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "must": [{
                                                        "bool": {
                                                            "should": [{"term": {"variant_class": "SNV"}}],
                                                            "minimum_should_match": 1
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "must": [{
                                                                "nested": {
                                                                    "path": "donors",
                                                                    "query": {
                                                                        "bool": {
                                                                            "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                                                "bool": {
                                                                                    "should": [{"term": {"donors.zygosity": "HOM"}}],
                                                                                    "minimum_should_match": 1
                                                                                }
                                                                            }]
                                                                        }
                                                                    }
                                                                }
                                                            }]
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "should": [],
                                                            "minimum_should_match": 1
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "must": {
                                                                "range": {
                                                                    "frequencies.internal.af": {
                                                                        "gte": 0.29,
                                                                        "lte": 0.61
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }]
                                                }
                                            }, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]
                                        }
                                    },
                                    "aggs": {"extdb_pubmed": {"terms": {"field": "ext_db.is_pubmed", "size": 1}}}
                                }
                            }
                        },
                        "extdb_clinvar": {
                            "global": {},
                            "aggs": {
                                "filtered_except_extdb_clinvar": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "must": [{
                                                        "bool": {
                                                            "should": [{"term": {"variant_class": "SNV"}}],
                                                            "minimum_should_match": 1
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "must": [{
                                                                "nested": {
                                                                    "path": "donors",
                                                                    "query": {
                                                                        "bool": {
                                                                            "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                                                "bool": {
                                                                                    "should": [{"term": {"donors.zygosity": "HOM"}}],
                                                                                    "minimum_should_match": 1
                                                                                }
                                                                            }]
                                                                        }
                                                                    }
                                                                }
                                                            }]
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "should": [],
                                                            "minimum_should_match": 1
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "must": {
                                                                "range": {
                                                                    "frequencies.internal.af": {
                                                                        "gte": 0.29,
                                                                        "lte": 0.61
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }]
                                                }
                                            }, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]
                                        }
                                    },
                                    "aggs": {"extdb_clinvar": {"terms": {"field": "ext_db.is_clinvar", "size": 1}}}
                                }
                            }
                        },
                        "extdb_dbsnp": {
                            "global": {},
                            "aggs": {
                                "filtered_except_extdb_dbsnp": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "must": [{
                                                        "bool": {
                                                            "should": [{"term": {"variant_class": "SNV"}}],
                                                            "minimum_should_match": 1
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "must": [{
                                                                "nested": {
                                                                    "path": "donors",
                                                                    "query": {
                                                                        "bool": {
                                                                            "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                                                "bool": {
                                                                                    "should": [{"term": {"donors.zygosity": "HOM"}}],
                                                                                    "minimum_should_match": 1
                                                                                }
                                                                            }]
                                                                        }
                                                                    }
                                                                }
                                                            }]
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "should": [],
                                                            "minimum_should_match": 1
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "must": {
                                                                "range": {
                                                                    "frequencies.internal.af": {
                                                                        "gte": 0.29,
                                                                        "lte": 0.61
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }]
                                                }
                                            }, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]
                                        }
                                    }, "aggs": {"extdb_dbsnp": {"terms": {"field": "ext_db.is_dbsnp", "size": 1}}}
                                }
                            }
                        },
                        "cohort_rqdm": {
                            "global": {},
                            "aggs": {
                                "filtered_except_cohort_rqdm": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "must": [{
                                                        "bool": {
                                                            "should": [{"term": {"variant_class": "SNV"}}],
                                                            "minimum_should_match": 1
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "must": [{
                                                                "nested": {
                                                                    "path": "donors",
                                                                    "query": {
                                                                        "bool": {
                                                                            "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                                                "bool": {
                                                                                    "should": [{"term": {"donors.zygosity": "HOM"}}],
                                                                                    "minimum_should_match": 1
                                                                                }
                                                                            }]
                                                                        }
                                                                    }
                                                                }
                                                            }]
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "should": [{"term": {"ext_db.is_pubmed": true}}],
                                                            "minimum_should_match": 1
                                                        }
                                                    }, {"bool": {"must": {"range": {"frequencies.internal.af": {}}}}}]
                                                }
                                            }, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]
                                        }
                                    },
                                    "aggs": {
                                        "cohort_rqdm_min": {"min": {"field": "frequencies.internal.af"}},
                                        "cohort_rqdm_max": {"max": {"field": "frequencies.internal.af"}}
                                    }
                                }
                            }
                        }
                    }
                }
            )
        })

        it('should return correct translation for complex intersection in Query Count translation', () => {
            const countQuery = generateCountQuery(PATIENT_ID, statementComplex, statementComplexQueryKeyFive, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(countQuery).to.eql(
                {
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": [{
                                        "bool": {
                                            "should": [{"term": {"variant_class": "SNV"}}],
                                            "minimum_should_match": 1
                                        }
                                    }, {
                                        "bool": {
                                            "must": [{
                                                "nested": {
                                                    "path": "donors",
                                                    "query": {
                                                        "bool": {
                                                            "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                                "bool": {
                                                                    "should": [{"term": {"donors.zygosity": "HOM"}}],
                                                                    "minimum_should_match": 1
                                                                }
                                                            }]
                                                        }
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "bool": {
                                            "should": [{"term": {"ext_db.is_pubmed": true}}],
                                            "minimum_should_match": 1
                                        }
                                    }, {
                                        "bool": {
                                            "must": {
                                                "range": {
                                                    "frequencies.internal.af": {
                                                        "gte": 0.29,
                                                        "lte": 0.61
                                                    }
                                                }
                                            }
                                        }
                                    }]
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    }
                }
            )
        })

        it('should return correct translation for complex intersection in Query Search translation', () => {
            const variantQuery = generateVariantQuery(PATIENT_ID, statementComplex, statementComplexQueryKeyFive, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT)
            expect(variantQuery).to.eql(
                {
                    "from": 0,
                    "size": 25,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "must": [{
                                        "bool": {
                                            "should": [{"term": {"variant_class": "SNV"}}],
                                            "minimum_should_match": 1
                                        }
                                    }, {
                                        "bool": {
                                            "must": [{
                                                "nested": {
                                                    "path": "donors",
                                                    "query": {
                                                        "bool": {
                                                            "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                                "bool": {
                                                                    "should": [{"term": {"donors.zygosity": "HOM"}}],
                                                                    "minimum_should_match": 1
                                                                }
                                                            }]
                                                        }
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "bool": {
                                            "should": [{"term": {"ext_db.is_pubmed": true}}],
                                            "minimum_should_match": 1
                                        }
                                    }, {
                                        "bool": {
                                            "must": {
                                                "range": {
                                                    "frequencies.internal.af": {
                                                        "gte": 0.29,
                                                        "lte": 0.61
                                                    }
                                                }
                                            }
                                        }
                                    }]
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "sort": [{"impact_score": {"order": "desc"}}]

                }
            )
        })

        it('should return correct translation for complex union in Aggregation Count translation', () => {
            const facetQuery = generateFacetQuery(PATIENT_ID, statementComplex, statementComplexQueryKeySix, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(facetQuery).to.eql(
                {
                    "size": 0,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "should": [{
                                        "bool": {
                                            "should": [{"term": {"variant_class": "SNV"}}],
                                            "minimum_should_match": 1
                                        }
                                    }, {
                                        "bool": {
                                            "must": [{
                                                "nested": {
                                                    "path": "donors",
                                                    "query": {
                                                        "bool": {
                                                            "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                                "bool": {
                                                                    "should": [{"term": {"donors.zygosity": "HOM"}}],
                                                                    "minimum_should_match": 1
                                                                }
                                                            }]
                                                        }
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "bool": {
                                            "should": [{"term": {"ext_db.is_pubmed": true}}],
                                            "minimum_should_match": 1
                                        }
                                    }, {
                                        "bool": {
                                            "must": {
                                                "range": {
                                                    "frequencies.internal.af": {
                                                        "gte": 0.29,
                                                        "lte": 0.61
                                                    }
                                                }
                                            }
                                        }
                                    }], "minimum_should_match": 1
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "aggs": {
                        "filtered": {
                            "aggs": {
                                "variant_type": {
                                    "terms": {
                                        "field": "variant_class",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "consequence": {
                                    "terms": {
                                        "field": "consequences.consequence",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extdb_pubmed": {"terms": {"field": "ext_db.is_pubmed", "size": 1}},
                                "extdb_clinvar": {"terms": {"field": "ext_db.is_clinvar", "size": 1}},
                                "extdb_dbsnp": {"terms": {"field": "ext_db.is_dbsnp", "size": 1}},
                                "chromosome": {
                                    "terms": {
                                         "field": "chromosome",
                                        "order": {"_count": "desc"},
                                        "size": 24
                                    }
                                },
                                "gene_type": {
                                    "terms": {
                                        "field": "genes.biotype",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "extref_hpo": {"terms": {"field": "ext_db.is_hpo", "size": 1}},
                                "extref_orphanet": {"terms": {"field": "ext_db.is_orphanet", "size": 1}},

                                "extref_omim": {"terms": {"field": "ext_db.is_omim", "size": 1}},
                                "gene_hpo": {
                                    "terms": {
                                        "field": "genes.hpo.hpo_term_label",
                                        "order": {"_count": "desc"},
                                        "size": 9999
                                    }
                                },

                                "genegroup_orphanet": {
                                    "terms": {
                                        "field": "genes.orphanet.panel",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "clinvar_clinsig": {
                                    "terms": {
                                        "field": "clinvar.clin_sig",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "impact": {
                                    "terms": {
                                        "field": "consequences.impact",
                                        "order": {"_count": "desc"},
                                        "size": 999
                                    }
                                },
                                "prediction_fathmm": {
                                    "terms": {
                                        "field": "consequences.predictions.fathmm_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_fathmm_min": {"min": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_fathmm_max": {"max": {"field": "consequences.predictions.fathmm_converted_rank_score"}},
                                "prediction_sift": {
                                    "terms": {
                                        "field": "consequences.predictions.sift_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_sift_min": {"min": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_sift_max": {"max": {"field": "consequences.predictions.sift_converted_rank_score"}},
                                "prediction_polyphen2_hvar": {
                                    "terms": {
                                        "field": "consequences.predictions.polyphen2_hvar_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_polyphen2_hvar_min": {"min": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_polyphen2_hvar_max": {"max": {"field": "consequences.predictions.polyphen2_hvar_score"}},
                                "prediction_lrt": {
                                    "terms": {
                                        "field": "consequences.predictions.lrt_pred",
                                        "order": {"_count": "desc"},
                                        "size": 9
                                    }
                                },
                                "prediction_lrt_min": {"min": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_lrt_max": {"max": {"field": "consequences.predictions.lrt_converted_rankscore"}},
                                "prediction_dann_min": {"min": {"field": "consequences.predictions.dann_score"}},
                                "prediction_dann_max": {"max": {"field": "consequences.predictions.dann_score"}},
                                "prediction_cadd_min": {"min": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_cadd_max": {"max": {"field": "consequences.predictions.cadd_score"}},
                                "prediction_revel_min": {"min": {"field": "consequences.predictions.revel_rankscore"}},
                                "prediction_revel_max": {"max": {"field": "consequences.predictions.revel_rankscore"}},
                                "conservation_phylop_min": {"min": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "conservation_phylop_max": {"max": {"field": "consequences.conservations.phylo_p17way_primate_rankscore"}},
                                "cohort_rqdm_min": {"min": {"field": "frequencies.internal.af"}},
                                "cohort_rqdm_max": {"max": {"field": "frequencies.internal.af"}},

                                "cohort_gnomad_genomes_min": {"min": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_gnomad_genomes_max": {"max": {"field": "frequencies.gnomad_genomes_3_0.af"}},
                                "cohort_exac_min": {"min": {"field": "frequencies.exac.af"}},
                                "cohort_exac_max": {"max": {"field": "frequencies.exac.af"}},

                                "cohort_1000gp3_min": {"min": {"field": "frequencies.1000_genomes.af"}},
                                "cohort_1000gp3_max": {"max": {"field": "frequencies.1000_genomes.af"}}
                            }, "filter": {"bool": {}}
                        },
                        "nested_donors": {
                            "nested": {"path": "donors"}, "aggs": {
                                "filtered": {
                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                    "aggs": {


                                        "zygosity": {
                                            "terms": {
                                                "field": "donors.zygosity",
                                                "order": {"_count": "desc"},
                                                "size": 9
                                            }
                                        },
                                        "metric_depth_quality_min": {"min": {"field": "donors.qd"}},
                                        "metric_depth_quality_max": {"max": {"field": "donors.qd"}},
                                        "metric_allelic_alt_depth_min": {"min": {"field": "donors.ad_alt"}},
                                        "metric_allelic_alt_depth_max": {"max": {"field": "donors.ad_alt"}},
                                        "metric_total_depth_min": {"min": {"field": "donors.ad_total"}},
                                        "metric_total_depth_max": {"max": {"field": "donors.ad_total"}},
                                        "metric_ratio_min": {"min": {"field": "donors.ad_ratio"}},
                                        "metric_ratio_max": {"max": {"field": "donors.ad_ratio"}},
                                        "metric_genotype_quality_min": {"min": {"field": "donors.gq"}},
                                        "metric_genotype_quality_max": {"max": {"field": "donors.gq"}}
                                    }
                                }
                            }
                        },
                        "variant_type": {
                            "global": {},
                            "aggs": {
                                "filtered_except_variant_type": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "should": [{
                                                        "bool": {
                                                            "should": [],
                                                            "minimum_should_match": 1
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "must": [{
                                                                "nested": {
                                                                    "path": "donors",
                                                                    "query": {
                                                                        "bool": {
                                                                            "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                                                "bool": {
                                                                                    "should": [{"term": {"donors.zygosity": "HOM"}}],
                                                                                    "minimum_should_match": 1
                                                                                }
                                                                            }]
                                                                        }
                                                                    }
                                                                }
                                                            }]
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "should": [{"term": {"ext_db.is_pubmed": true}}],
                                                            "minimum_should_match": 1
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "must": {
                                                                "range": {
                                                                    "frequencies.internal.af": {
                                                                        "gte": 0.29,
                                                                        "lte": 0.61
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }], "minimum_should_match": 1
                                                }
                                            }, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]
                                        }
                                    },
                                    "aggs": {
                                        "variant_type": {
                                            "terms": {
                                                "field": "variant_class",
                                                "order": {"_count": "desc"},
                                                "size": 999
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "zygosity": {
                            "global": {},
                            "aggs": {
                                "filtered_except_zygosity": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "should": [{
                                                        "bool": {
                                                            "should": [{"term": {"variant_class": "SNV"}}],
                                                            "minimum_should_match": 1
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "must": [{
                                                                "nested": {
                                                                    "path": "donors",
                                                                    "query": {
                                                                        "bool": {
                                                                            "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                                                "bool": {
                                                                                    "should": [],
                                                                                    "minimum_should_match": 1
                                                                                }
                                                                            }]
                                                                        }
                                                                    }
                                                                }
                                                            }]
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "should": [{"term": {"ext_db.is_pubmed": true}}],
                                                            "minimum_should_match": 1
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "must": {
                                                                "range": {
                                                                    "frequencies.internal.af": {
                                                                        "gte": 0.29,
                                                                        "lte": 0.61
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }], "minimum_should_match": 1
                                                }
                                            }]
                                        }
                                    },
                                    "aggs": {
                                        "nested_donors": {
                                            "nested": {"path": "donors"},
                                            "aggs": {
                                                "filtered": {
                                                    "filter": {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}},
                                                    "aggs": {
                                                        "zygosity": {
                                                            "terms": {
                                                                "field": "donors.zygosity",
                                                                "order": {"_count": "desc"},
                                                                "size": 9
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "extdb_pubmed": {
                            "global": {},
                            "aggs": {
                                "filtered_except_extdb_pubmed": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "should": [{
                                                        "bool": {
                                                            "should": [{"term": {"variant_class": "SNV"}}],
                                                            "minimum_should_match": 1
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "must": [{
                                                                "nested": {
                                                                    "path": "donors",
                                                                    "query": {
                                                                        "bool": {
                                                                            "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                                                "bool": {
                                                                                    "should": [{"term": {"donors.zygosity": "HOM"}}],
                                                                                    "minimum_should_match": 1
                                                                                }
                                                                            }]
                                                                        }
                                                                    }
                                                                }
                                                            }]
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "should": [],
                                                            "minimum_should_match": 1
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "must": {
                                                                "range": {
                                                                    "frequencies.internal.af": {
                                                                        "gte": 0.29,
                                                                        "lte": 0.61
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }], "minimum_should_match": 1
                                                }
                                            }, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]
                                        }
                                    },
                                    "aggs": {"extdb_pubmed": {"terms": {"field": "ext_db.is_pubmed", "size": 1}}}
                                }
                            }
                        },
                        "extdb_clinvar": {
                            "global": {},
                            "aggs": {
                                "filtered_except_extdb_clinvar": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "should": [{
                                                        "bool": {
                                                            "should": [{"term": {"variant_class": "SNV"}}],
                                                            "minimum_should_match": 1
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "must": [{
                                                                "nested": {
                                                                    "path": "donors",
                                                                    "query": {
                                                                        "bool": {
                                                                            "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                                                "bool": {
                                                                                    "should": [{"term": {"donors.zygosity": "HOM"}}],
                                                                                    "minimum_should_match": 1
                                                                                }
                                                                            }]
                                                                        }
                                                                    }
                                                                }
                                                            }]
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "should": [],
                                                            "minimum_should_match": 1
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "must": {
                                                                "range": {
                                                                    "frequencies.internal.af": {
                                                                        "gte": 0.29,
                                                                        "lte": 0.61
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }], "minimum_should_match": 1
                                                }
                                            }, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]
                                        }
                                    },
                                    "aggs": {"extdb_clinvar": {"terms": {"field": "ext_db.is_clinvar", "size": 1}}}
                                }
                            }
                        },
                        "extdb_dbsnp": {
                            "global": {},
                            "aggs": {
                                "filtered_except_extdb_dbsnp": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "should": [{
                                                        "bool": {
                                                            "should": [{"term": {"variant_class": "SNV"}}],
                                                            "minimum_should_match": 1
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "must": [{
                                                                "nested": {
                                                                    "path": "donors",
                                                                    "query": {
                                                                        "bool": {
                                                                            "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                                                "bool": {
                                                                                    "should": [{"term": {"donors.zygosity": "HOM"}}],
                                                                                    "minimum_should_match": 1
                                                                                }
                                                                            }]
                                                                        }
                                                                    }
                                                                }
                                                            }]
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "should": [],
                                                            "minimum_should_match": 1
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "must": {
                                                                "range": {
                                                                    "frequencies.internal.af": {
                                                                        "gte": 0.29,
                                                                        "lte": 0.61
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }], "minimum_should_match": 1
                                                }
                                            }, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]
                                        }
                                    }, "aggs": {"extdb_dbsnp": {"terms": {"field": "ext_db.is_dbsnp", "size": 1}}}
                                }
                            }
                        },
                        "cohort_rqdm": {
                            "global": {},
                            "aggs": {
                                "filtered_except_cohort_rqdm": {
                                    "filter": {
                                        "bool": {
                                            "filter": [{
                                                "bool": {
                                                    "should": [{
                                                        "bool": {
                                                            "should": [{"term": {"variant_class": "SNV"}}],
                                                            "minimum_should_match": 1
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "must": [{
                                                                "nested": {
                                                                    "path": "donors",
                                                                    "query": {
                                                                        "bool": {
                                                                            "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                                                "bool": {
                                                                                    "should": [{"term": {"donors.zygosity": "HOM"}}],
                                                                                    "minimum_should_match": 1
                                                                                }
                                                                            }]
                                                                        }
                                                                    }
                                                                }
                                                            }]
                                                        }
                                                    }, {
                                                        "bool": {
                                                            "should": [{"term": {"ext_db.is_pubmed": true}}],
                                                            "minimum_should_match": 1
                                                        }
                                                    }, {"bool": {"must": {"range": {"frequencies.internal.af": {}}}}}],
                                                    "minimum_should_match": 1
                                                }
                                            }, {"bool": {"filter": {"term": {"donors.patient_id": "PA00001"}}}}]
                                        }
                                    },
                                    "aggs": {
                                        "cohort_rqdm_min": {"min": {"field": "frequencies.internal.af"}},
                                        "cohort_rqdm_max": {"max": {"field": "frequencies.internal.af"}}
                                    }
                                }
                            }
                        }
                    }
                }
            )
        })

        it('should return correct translation for complex union in Query Count translation', () => {
            const countQuery = generateCountQuery(PATIENT_ID, statementComplex, statementComplexQueryKeySix, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1)
            expect(countQuery).to.eql(
                {
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "should": [{
                                        "bool": {
                                            "should": [{"term": {"variant_class": "SNV"}}],
                                            "minimum_should_match": 1
                                        }
                                    }, {
                                        "bool": {
                                            "must": [{
                                                "nested": {
                                                    "path": "donors",
                                                    "query": {
                                                        "bool": {
                                                            "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                                "bool": {
                                                                    "should": [{"term": {"donors.zygosity": "HOM"}}],
                                                                    "minimum_should_match": 1
                                                                }
                                                            }]
                                                        }
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "bool": {
                                            "should": [{"term": {"ext_db.is_pubmed": true}}],
                                            "minimum_should_match": 1
                                        }
                                    }, {
                                        "bool": {
                                            "must": {
                                                "range": {
                                                    "frequencies.internal.af": {
                                                        "gte": 0.29,
                                                        "lte": 0.61
                                                    }
                                                }
                                            }
                                        }
                                    }], "minimum_should_match": 1
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    }
                }
            )
        })

        it('should return correct translation for complex union in Query Search translation', () => {
            const variantQuery = generateVariantQuery(PATIENT_ID, statementComplex, statementComplexQueryKeySix, ADMINISTRATOR_ACL, ELASTIC_SEARCH_SCHEMA_V1, DEFAULT_GROUP, DEFAULT_INDEX, DEFAULT_LIMIT)
            expect(variantQuery).to.eql(
                {
                    "from": 0,
                    "size": 25,
                    "query": {
                        "bool": {
                            "filter": [{
                                "bool": {
                                    "should": [{
                                        "bool": {
                                            "should": [{"term": {"variant_class": "SNV"}}],
                                            "minimum_should_match": 1
                                        }
                                    }, {
                                        "bool": {
                                            "must": [{
                                                "nested": {
                                                    "path": "donors",
                                                    "query": {
                                                        "bool": {
                                                            "filter": [{"term": {"donors.patient_id": "PA00001"}}, {
                                                                "bool": {
                                                                    "should": [{"term": {"donors.zygosity": "HOM"}}],
                                                                    "minimum_should_match": 1
                                                                }
                                                            }]
                                                        }
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "bool": {
                                            "should": [{"term": {"ext_db.is_pubmed": true}}],
                                            "minimum_should_match": 1
                                        }
                                    }, {
                                        "bool": {
                                            "must": {
                                                "range": {
                                                    "frequencies.internal.af": {
                                                        "gte": 0.29,
                                                        "lte": 0.61
                                                    }
                                                }
                                            }
                                        }
                                    }], "minimum_should_match": 1
                                }
                            }, {"term": {"donors.patient_id": "PA00001"}}]
                        }
                    },
                    "sort": [{"impact_score": {"order": "desc"}}]

                }
            )
        })

    })

})
