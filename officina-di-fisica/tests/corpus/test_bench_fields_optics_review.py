"""Source+consumer integrity and adversarial physics for five distinct benches."""
from copy import deepcopy
import json
from pathlib import Path
import subprocess
import unittest
from unittest.mock import patch
import sympy as sp
from tools.corpus_engineering import bench_fields_optics_activity_verifier as review
from tools.corpus_engineering.pipeline import digest,sha,canonical
from tools.corpus_engineering.batches import assert_activity_identity


class BenchFieldsOpticsReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.raw=subprocess.check_output(['git','show',review.SOURCE_REF+':'+review.SOURCE_PATH],cwd=review.APP)
        cls.sources={r['id']:r for r in json.loads(cls.raw) if r['id'] in review.READ_SOURCE_SHA256}
        # Fresh execution once for mutation fixtures, not a production cache.
        cls.actual=review.runtime_values();cls.summary=review.compare_runtime(cls.actual)
        cls.physics=review.independent_checks()

    def snapshots(self):
        # Test-only stubs isolate identity/error branches. A separate test below
        # executes fresh runtime twice and checks no cached approval is used.
        from contextlib import ExitStack
        stack=ExitStack()
        stack.enter_context(patch.object(review,'runtime_values',return_value=self.actual))
        stack.enter_context(patch.object(review,'compare_runtime',return_value=self.summary))
        return stack

    def test_five_actual_benches_all_assigned_tasks_and_fresh_runtime_each_report(self):
        with patch.object(review,'runtime_values',wraps=review.runtime_values) as execute:
            first=review.report(self.sources);second=review.report(self.sources)
        self.assertEqual(execute.call_count,2)
        self.assertEqual(first,second);self.assertEqual(first,json.loads(canonical(first)))
        self.assertEqual((first['acceptedCount'],first['failedCount'],first['draftReviewedCount']),(5,0,0))
        self.assertEqual(sum(len(r['checks']) for r in first['records']),70)
        assert_activity_identity(first['records'],set(review.READ_SOURCE_SHA256),self.sources)
        self.assertEqual({r['id'] for r in first['records']},{f'LAB3D-{i:02}' for i in range(6,11)})
        self.assertEqual([r['runtimeComparison']['caseCount'] for r in first['records']],[33,11,18,968,15])
        for row in first['records']:
            self.assertTrue(row['ok']);self.assertTrue(all(c['ok'] for c in row['checks']))
            self.assertEqual(row['sourceVersion'],2 if row['id']=='LAB3D-07' else 1)
            self.assertEqual(row['humanApproval'],'NOT_RUN');self.assertEqual(row['publicationAction'],'NONE')
            self.assertTrue(row['originalEditionRetained']);self.assertFalse(row['failedPublishedEdition'])
            self.assertEqual(row['calculationScope'],'EXACT_MANUAL_CALCULATION')
            self.assertEqual(row['runtimeProfileSha256'],review.READ_RUNTIME_PROFILE_SHA256)

    def test_original_source_and_full_actual_runtime_identity(self):
        self.assertEqual(sha(self.raw),review.SOURCE_FILE_SHA256)
        self.assertEqual((review.APP/'content/banchi.json').read_bytes(),self.raw)
        self.assertEqual({k:digest(r) for k,r in self.sources.items()},review.READ_SOURCE_SHA256)
        self.assertEqual(review.runtime_hashes(),review.READ_RUNTIME)
        self.assertEqual(review.runtime_fingerprint(review.APP)['sha256'],review.READ_RUNTIME_PROFILE_SHA256)
        self.assertEqual(len(review.READ_RUNTIME),20)

    def test_mutated_or_missing_sources_empty_or_failed_models_are_not_approved(self):
        with self.snapshots():
            for key in review.READ_SOURCE_SHA256:
                sources=deepcopy(self.sources);sources[key]['summary']+=' changed interpretation'
                changed=next(r for r in review.verify(sources) if r['id']==key)
                self.assertFalse(changed['ok']);self.assertIn('Bench source differs from independently read original',changed['errors'])
                del sources[key]
                with self.assertRaises(ValueError):review.verify(sources)
                for replacement in ([],[{'claim':'failed theory','ok':False,'dimension':{}}]):
                    models=deepcopy(self.physics);models[key]=replacement
                    with patch.object(review,'independent_checks',return_value=models):
                        changed=next(r for r in review.verify(self.sources) if r['id']==key)
                        self.assertFalse(changed['ok']);self.assertIn('Independent bench physics missing or failed',changed['errors'])
                sources=deepcopy(self.sources);sources[key]['assessment'][0]['value']+=100
                changed=next(r for r in review.verify(sources) if r['id']==key)
                self.assertFalse(changed['ok']);self.assertIn('Source assigned assessment disagrees with independent solution',changed['errors'])

    def test_runtime_staleness_blocks_before_execution_and_runtime_errors_fail(self):
        for file in review.READ_RUNTIME:
            hashes=dict(review.READ_RUNTIME);hashes[file]='0'*64
            with patch.object(review,'runtime_hashes',return_value=hashes),patch.object(review,'runtime_values') as execute:
                rows=review.verify(self.sources)
                execute.assert_not_called();self.assertTrue(all(not r['ok'] for r in rows))
                self.assertTrue(all(any('no cached runtime approval' in e for e in r['errors']) for r in rows))
        with patch.object(review,'runtime_fingerprint',return_value={'sha256':'0'*64}),patch.object(review,'runtime_values') as execute:
            self.assertTrue(all(not r['ok'] for r in review.verify(self.sources)));execute.assert_not_called()
        changed=dict(review.READ_RUNTIME);changed[next(iter(changed))]='0'*64
        with self.snapshots(),patch.object(review,'runtime_hashes',side_effect=[review.READ_RUNTIME,changed]):
            rows=review.verify(self.sources)
            self.assertTrue(all('Runtime changed during independent check; discard in-flight evidence' in r['errors'] for r in rows))
        with patch.object(review,'runtime_values',side_effect=ValueError('consumer failed')):
            rows=review.verify(self.sources);self.assertTrue(all(not r['ok'] for r in rows))
        with patch.object(review,'runtime_values',return_value={}),patch.object(review,'compare_runtime',return_value={}):
            self.assertTrue(all(not r['ok'] for r in review.verify(self.sources)))

    def test_wrong_runtime_math_null_states_and_added_tasks_are_detected(self):
        for key,field in [('LAB3D-06','power'),('LAB3D-08','I'),('LAB3D-09','q'),('LAB3D-10','envelope')]:
            actual=deepcopy(self.actual);actual[key][0]['output'][field]=999999
            self.assertFalse(review.compare_runtime(actual)[key]['ok'])
        actual=deepcopy(self.actual);actual['LAB3D-07'][0]['output']['reading']['E'][0]=1
        self.assertFalse(review.compare_runtime(actual)['LAB3D-07']['ok'])
        actual=deepcopy(self.actual);actual['LAB3D-07'][5]['warning']=''
        self.assertFalse(review.compare_runtime(actual)['LAB3D-07']['ok'])
        actual=deepcopy(self.actual);actual['LAB3D-10'][1]['samples'][0]['y']=.002
        self.assertFalse(review.compare_runtime(actual)['LAB3D-10']['ok'])
        for key in review.MODEL_BY_ID:
            actual=deepcopy(self.actual);actual[key].pop()
            self.assertFalse(review.compare_runtime(actual)[key]['ok'])
        with self.snapshots():
            actual=deepcopy(self.actual);actual['_addedWaveAssessments'][0]['value']=0
            with patch.object(review,'runtime_values',return_value=actual):
                row=next(r for r in review.verify(self.sources) if r['id']=='LAB3D-10')
                self.assertFalse(row['ok']);self.assertIn('Consumer-added wave assessments differ from independent solutions',row['errors'])

    def test_observed_browser_evidence_is_content_bound_and_not_automatic_approval(self):
        evidence=review.consumer_evidence()
        self.assertTrue(evidence['ok']);self.assertEqual(evidence['observedCaseCount'],22)
        self.assertEqual(evidence['runtimeProfileSha256'],review.READ_RUNTIME_PROFILE_SHA256)
        with self.snapshots():
            for token in ('READ_BROWSER_PROOF_SHA256','READ_BROWSER_PROTOCOL_SHA256'):
                with patch.object(review,token,'0'*64):
                    self.assertFalse(review.consumer_evidence()['ok'])
                    rows=review.verify(self.sources)
                    self.assertTrue(all(not row['ok'] for row in rows))
                    self.assertTrue(all('Independent observed consumer evidence missing, altered or stale' in row['errors'] for row in rows))

    def test_domain_branches_physics_units_and_graphs(self):
        self.assertTrue(all(c['ok'] for checks in self.physics.values() for c in checks))
        for checks in self.physics.values():
            for c in checks:self.assertFalse(sp.sympify(c['independentExact']).atoms(sp.Float))
        field=review.exact_runtime_expected('campo',{**review.DEFAULTS['campo'],'sx':-1})
        self.assertIsNone(field['reading'])
        empty=review.exact_runtime_expected('campo',{**review.DEFAULTS['campo'],'q1':0,'q2':0,'sx':-1})
        self.assertEqual(empty['reading']['E'],[0,0,0]);self.assertEqual(empty['reading']['V'],0)
        atfocus=review.exact_runtime_expected('lente',{**review.DEFAULTS['lente'],'p':10,'f':10})
        self.assertEqual((atfocus['q'],atfocus['m'],atfocus['sharp']),('Infinity',None,False))
        virtual=review.exact_runtime_expected('lente',{**review.DEFAULTS['lente'],'p':5,'f':10,'screen':10})
        self.assertEqual((virtual['q'],virtual['m'],virtual['sharp']),(-10,2,False))
        normal=review.exact_runtime_expected('calore',review.DEFAULTS['calore'])
        reverse=review.exact_runtime_expected('calore',{**review.DEFAULTS['calore'],'left':20,'right':80})
        self.assertEqual(reverse['power'],-normal['power'])
        node=review.exact_runtime_expected('onde',{**review.DEFAULTS['onde'],'x':0,'phase':180})
        self.assertEqual(node['envelope'],0)
        actual=deepcopy(self.actual);actual['LAB3D-06'][0]['graphs'][0]['series'][0]['points'][10][1]+=1
        self.assertFalse(review.compare_runtime(actual)['LAB3D-06']['ok'])

if __name__=='__main__':unittest.main()
