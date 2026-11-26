"""Original/source and consumer defects stay distinct despite correct physics."""
from copy import deepcopy
import json
from pathlib import Path
import subprocess
import unittest
from unittest.mock import patch
import sympy as sp
from tools.corpus_engineering import experiments_foundations_activity_verifier as review
from tools.corpus_engineering.pipeline import canonical,digest,sha
from tools.corpus_engineering.batches import assert_activity_identity
from tests.corpus.historical_runtime import reviewed_runtime


class FoundationsExperimentsReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.raw=subprocess.check_output(['git','show',review.SOURCE_REF+':'+review.SOURCE_PATH],cwd=review.APP)
        cls.enterClassContext(reviewed_runtime(review))
        cls.sources={r['id']:r for r in json.loads(cls.raw) if r['id'] in review.READ_SOURCE_SHA256}
        cls.actual=review.runtime_values(cls.sources);cls.summary=review.compare_runtime(cls.actual)
        cls.physics=review.independent_checks()

    def snapshot(self):
        from contextlib import ExitStack
        stack=ExitStack()
        stack.enter_context(patch.object(review,'runtime_values',return_value=self.actual))
        stack.enter_context(patch.object(review,'compare_runtime',return_value=self.summary))
        return stack

    def test_six_originals_keep_three_failures_and_do_not_claim_human_approval(self):
        with patch.object(review,'runtime_values',wraps=review.runtime_values) as fresh:
            first=review.report(self.sources);second=review.report(self.sources)
        self.assertEqual(fresh.call_count,2);self.assertEqual(first,second)
        self.assertEqual(first,json.loads(canonical(first)))
        self.assertEqual((first['acceptedCount'],first['failedCount'],first['draftReviewedCount']),(3,3,0))
        self.assertEqual(first['sourceManualityIssueIds'],['SIM-C1-L001-06'])
        self.assertEqual(first['consumerInterfaceIssueIds'],['SIM-C1-L001-01','SIM-C1-L001-04'])
        self.assertEqual(sum(len(r['checks']) for r in first['records']),57)
        with self.assertRaises(ValueError):assert_activity_identity(first['records'],set(review.READ_SOURCE_SHA256),self.sources)
        for r in first['records']:
            self.assertEqual(r['humanApproval'],'NOT_RUN');self.assertEqual(r['publicationAction'],'NONE')
            self.assertTrue(r['originalEditionRetained'])
            self.assertEqual(r['sourceScientificReview']['ok'],r['id'] not in review.SOURCE_ISSUES)
            self.assertEqual(r['consumerReview']['ok'],r['id'] not in review.CONSUMER_ISSUES)
            self.assertTrue(r['runtimeComparison']['numericPhysicsMatches'])
        self.assertEqual([r['runtimeComparison']['caseCount'] for r in first['records']],[5,5,51,5,5,37])

    def test_source_file_records_and_actual_dependencies_are_frozen(self):
        self.assertEqual(sha(self.raw),review.SOURCE_FILE_SHA256)
        self.assertEqual((review.APP/'content/esperienze-C1.json').read_bytes(),self.raw)
        self.assertEqual({k:digest(v) for k,v in self.sources.items()},review.READ_SOURCE_SHA256)
        self.assertEqual(review.runtime_hashes(),review.READ_RUNTIME)
        self.assertEqual(review.runtime_fingerprint(review.APP)['sha256'],review.READ_RUNTIME_PROFILE_SHA256)
        self.assertEqual(len(review.READ_RUNTIME),16)
        self.assertEqual(self.sources['SIM-C1-L001-04']['version'],2)

    def test_unreviewed_source_never_executes_an_engine_and_nested_review_fails(self):
        for key in review.SPECS:
            sources=deepcopy(self.sources);sources[key]['interpretation']+=' changed model'
            with patch.object(review,'runtime_values') as execute:
                rows=review.verify(sources);execute.assert_not_called()
                changed=next(r for r in rows if r['id']==key)
                self.assertFalse(changed['ok']);self.assertFalse(changed['sourceScientificReview']['ok'])
                self.assertIn('Experiment source differs from independent full reading',changed['errors'])
            del sources[key]
            with self.assertRaises(ValueError):review.verify(sources)
        for field,value in [('kind','example'),('review','APPROVED BY HUMAN'),('engine',{'id':'unseen','version':'1.0.0'})]:
            sources=deepcopy(self.sources);sources['SIM-C1-L001-02'][field]=value
            with patch.object(review,'runtime_values') as execute:
                self.assertTrue(all(not r['ok'] for r in review.verify(sources)));execute.assert_not_called()

    def test_stale_changed_or_missing_runtime_cannot_reuse_approval(self):
        for file in review.READ_RUNTIME:
            hashes=dict(review.READ_RUNTIME);hashes[file]='MISSING'
            with patch.object(review,'runtime_hashes',return_value=hashes),patch.object(review,'runtime_values') as execute:
                self.assertTrue(all(not r['ok'] for r in review.verify(self.sources)));execute.assert_not_called()
        with patch.object(review,'runtime_fingerprint',return_value={'sha256':'0'*64}),patch.object(review,'runtime_values') as execute:
            self.assertTrue(all(not r['ok'] for r in review.verify(self.sources)));execute.assert_not_called()
        with patch.object(review,'runtime_values',side_effect=ValueError('actual consumer failed')):
            self.assertTrue(all(not r['ok'] for r in review.verify(self.sources)))
        changed=dict(review.READ_RUNTIME);changed[next(iter(changed))]='0'*64
        with self.snapshot(),patch.object(review,'runtime_hashes',side_effect=[review.READ_RUNTIME,changed]):
            self.assertTrue(all('Runtime changed during check; discard evidence' in r['errors'] for r in review.verify(self.sources)))

    def test_every_empty_or_failed_physical_model_is_rejected(self):
        with self.snapshot():
            for key in review.SPECS:
                for replacement in ([],[{'ok':False,'claim':'bad physical relation','dimension':{}}]):
                    models=deepcopy(self.physics);models[key]=replacement
                    with patch.object(review,'independent_checks',return_value=models):
                        row=next(r for r in review.verify(self.sources) if r['id']==key)
                        self.assertFalse(row['ok']);self.assertFalse(row['sourceScientificReview']['ok'])
                        self.assertIn('Independent experiment physics missing or failed',row['errors'])

    def test_actual_law_apparatus_parameters_graphs_and_assignments_are_challenged(self):
        for key in review.SPECS:
            actual=deepcopy(self.actual);actual[key]['cases'][0]['output']['y']=999999
            self.assertFalse(review.compare_runtime(actual)[key]['ok'])
            actual=deepcopy(self.actual);actual[key]['cases'].pop()
            self.assertFalse(review.compare_runtime(actual)[key]['ok'])
            actual=deepcopy(self.actual);actual[key]['params'][0]['step']*=2
            self.assertFalse(review.compare_runtime(actual)[key]['ok'])
            actual=deepcopy(self.actual);actual[key]['assessment'][1]['value']=999999
            self.assertFalse(review.compare_runtime(actual)[key]['ok'])
            actual=deepcopy(self.actual);actual[key]['graph'][0]['series'][0]['points'][0][1]=999999
            self.assertFalse(review.compare_runtime(actual)[key]['ok'])
        actual=deepcopy(self.actual);actual['SIM-C1-L001-05']['cases'][0]['elements']=[]
        self.assertFalse(review.compare_runtime(actual)['SIM-C1-L001-05']['ok'])
        # An unexpected roundtrip failure in a previously good source blocks it.
        actual=deepcopy(self.actual);actual['SIM-C1-L001-03']['formatRoundtrip'][0]['parsed']=2500
        summary=review.compare_runtime(actual)
        with patch.object(review,'runtime_values',return_value=actual),patch.object(review,'compare_runtime',return_value=summary):
            row=next(r for r in review.verify(self.sources) if r['id']=='SIM-C1-L001-03')
            self.assertFalse(row['ok']);self.assertIn('New unreviewed formatted-answer roundtrip failure',row['errors'])

    def test_exact_manual_assignments_and_three_different_failure_proofs(self):
        self.assertTrue(all(c['ok'] for checks in self.physics.values() for c in checks))
        for checks in self.physics.values():
            for c in checks:self.assertFalse(sp.sympify(c['independentExact']).atoms(sp.Float))
        values=[review.exact_value(key,review.SPECS[key][5]) for key in sorted(review.SPECS)]
        self.assertEqual(values[:5],[200,64,sp.Rational(13,5),64000,180])
        self.assertEqual(sp.simplify(values[5]+4*sp.sin(sp.pi/36)),0)
        self.assertEqual(self.actual['SIM-C1-L001-06']['assessment'][0]['value'],0)
        self.assertIn('95',self.actual['SIM-C1-L001-06']['assessment'][1]['prompt'])
        self.assertNotIn(95,[0,30,45,60,90,120,135,150,180])
        self.assertEqual(self.actual['SIM-C1-L001-01']['formatRoundtrip'][0],{'display':'2.000','parsed':2})
        self.assertEqual(self.actual['SIM-C1-L001-04']['formatRoundtrip'][0],{'display':'8.000','parsed':8})
        self.assertNotEqual(2,2000);self.assertNotEqual(8,8000)
        # Exact symbolic response is physicallyvalid, but Number-only input has
        # no parse route to it; actual browser fixture reproduces rejection.
        node=subprocess.check_output(['node','--input-type=module','-e',"console.log(JSON.stringify({symbolic:Number.isNaN(Number('-4*sin(pi/36)')),grouped:Number('2.000'),plain:Number('2000')}))"],text=True)
        self.assertEqual(json.loads(node),{'symbolic':True,'grouped':2,'plain':2000})

    def test_observed_diagnostic_proof_is_bound_and_never_scientific_approval(self):
        evidence=review.consumer_evidence()
        self.assertTrue(evidence['ok']);self.assertFalse(evidence['scientificApproval'])
        self.assertEqual(evidence['observedCaseCount'],18)
        for field in ('READ_BROWSER_PROOF_SHA256','READ_BROWSER_PROTOCOL_SHA256'):
            with patch.object(review,field,'0'*64):
                self.assertFalse(review.consumer_evidence()['ok'])
        with self.snapshot(),patch.object(review,'consumer_evidence',return_value={'ok':False,'error':'stale diagnostic proof'}):
            rows=review.verify(self.sources)
            self.assertTrue(all(not r['ok'] and not r['consumerReview']['ok'] for r in rows))
            self.assertTrue(all('Observed actual consumer evidence missing, altered or stale' in r['errors'] for r in rows))

if __name__=='__main__':unittest.main()
