"""Durable exact, physical and governance counterprobes for original045.
Two observed independent consumer failures is required to remain a failure.
"""
from copy import deepcopy
import json
from pathlib import Path
import subprocess
import unittest
from unittest.mock import patch
import sympy as sp
from tools.corpus_engineering import experiments_force_work_045_verifier as review
from tools.corpus_engineering.pipeline import digest,sha
from tools.corpus_engineering.batches import assert_activity_identity


class ForceWork045Review(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.raw=subprocess.check_output(['git','show',review.SOURCE_REF+':'+review.SOURCE_PATH],cwd=review.APP)
        cls.sources={r['id']:r for r in json.loads(cls.raw) if r['id'] in review.SPECS}
        cls.actual=review.runtime_values(cls.sources);cls.summary=review.compare_runtime(cls.actual)

    def snapshots(self):
        from contextlib import ExitStack
        stack=ExitStack();stack.enter_context(patch.object(review,'runtime_values',return_value=self.actual));stack.enter_context(patch.object(review,'compare_runtime',return_value=self.summary));return stack

    def test_complete_six_originals_four_pass_two_consumer_failures_never_registered(self):
        with patch.object(review,'runtime_values',wraps=review.runtime_values) as run:
            first=review.report(self.sources);second=review.report(self.sources)
        self.assertEqual(run.call_count,2);self.assertEqual(first,second)
        self.assertEqual((first['acceptedCount'],first['failedCount'],first['draftReviewedCount']),(4,2,0))
        self.assertEqual(len(first['records']),6);self.assertEqual(sum(len(r['checks']) for r in first['records']),71)
        self.assertEqual(sum(r['runtimeComparison']['caseCount'] for r in first['records']),118)
        self.assertEqual(sum(r['runtimeComparison']['clockSampleCount'] for r in first['records']),68)
        bad=next(r for r in first['records'] if r['id']=='SIM-C1-L007-02')
        self.assertFalse(bad['ok']);self.assertTrue(bad['sourceScientificReview']['ok']);self.assertFalse(bad['consumerReview']['ok']);self.assertEqual(bad['manualFeasibility'],'PASS_AI_EXACT_ASSIGNED_TASKS')
        self.assertTrue(bad['failedPublishedEdition']);self.assertEqual(first['failedPublishedEditionIds'],['SIM-C1-L006-02','SIM-C1-L007-02'])
        with self.assertRaises(ValueError):assert_activity_identity(first['records'],set(self.sources),self.sources)
        good=[r for r in first['records'] if r['ok']];assert_activity_identity(good,{r['id'] for r in good},self.sources)
        for row in first['records']:
            self.assertEqual(row['publicationAction'],'NONE');self.assertEqual(row['humanApproval'],'NOT_RUN');self.assertTrue(row['originalEditionRetained']);self.assertEqual(row['calculationScope'],'EXACT_MANUAL_CALCULATION')

    def test_pinned_source_and_all_fresh_scalar_graph_clock_models(self):
        self.assertEqual(sha(self.raw),review.SOURCE_FILE_SHA256);self.assertEqual((review.APP/'content/esperienze-C1.json').read_bytes(),self.raw)
        self.assertEqual({k:digest(r) for k,r in self.sources.items()},review.READ_SOURCE_SHA256)
        self.assertEqual(review.runtime_hashes(),review.READ_RUNTIME);self.assertEqual(review.runtime_fingerprint(review.APP)['sha256'],review.READ_RUNTIME_PROFILE_SHA256)
        self.assertEqual([v['caseCount'] for v in self.summary.values()],[13,21,13,37,17,17]);self.assertTrue(all(r['ok'] for r in self.summary.values()))
        self.assertTrue(all(c['ok'] for cs in review.independent_checks().values() for c in cs))
        for cs in review.independent_checks().values():
            for c in cs:self.assertFalse(sp.sympify(c['independentExact']).atoms(sp.Float))
        self.assertEqual(self.sources['SIM-C1-L007-03']['version'],2)

    def test_unreviewed_source_blocks_before_any_engine_execution(self):
        for key in review.SPECS:
            sources=deepcopy(self.sources);sources[key]['interpretation']+=' changed physical assumption'
            with patch.object(review,'runtime_values',side_effect=AssertionError('Unreviewed input executed')):
                self.assertEqual(review.report(sources)['acceptedCount'],0)
            del sources[key]
            with self.assertRaises(ValueError):review.verify(sources)

    def test_every_wrong_scalar_and_rebound_assessment_rejected(self):
        for key in review.SPECS:
            actual=deepcopy(self.actual);actual[key]['cases'][0]['output']['y']+=1;self.assertFalse(review.compare_runtime(actual)[key]['ok'])
            actual=deepcopy(self.actual);actual[key]['assessment'][0]['value']+=1;value=actual[key]['assessment'][0]['value'];actual[key]['formatRoundtrip'][0]={'display':str(value),'parsed':value}
            self.assertFalse(review.compare_runtime(actual)[key]['ok'])
            actual=deepcopy(self.actual);actual[key]['cases'].pop();self.assertFalse(review.compare_runtime(actual)[key]['ok'])

    def test_real_apparatus_direction_distance_and_velocity_mutations(self):
        probes=[('SIM-C1-L006-01',7,0xb94f48),('SIM-C1-L006-02',-4,0x147979),('SIM-C1-L006-03',2,0x147979),('SIM-C1-L007-01',90,0xd49332),('SIM-C1-L007-02',2,0x7350b0),('SIM-C1-L007-03',4,0x7350b0)]
        for key,x,color in probes:
            actual=deepcopy(self.actual);case=next(c for c in actual[key]['cases'] if c['x']==x);arrow=next(e for e in case['elements'] if e.get('kind')=='arrow' and e.get('c')==color)
            arrow['b']=[a-2*(b-a) for a,b in zip(arrow['a'],arrow['b'])]
            self.assertFalse(review.compare_runtime(actual)[key]['ok'])
        actual=deepcopy(self.actual);actual['SIM-C1-L007-02']['cases'][0]['timeSamples'][1]['output']['y']+=1
        self.assertFalse(review.compare_runtime(actual)['SIM-C1-L007-02']['ok'])
        actual=deepcopy(self.actual);actual['SIM-C1-L006-01']['cases'][0]['graphs'][0]['series'][0]['points'][2]=[6,4.5]
        self.assertFalse(review.compare_runtime(actual)['SIM-C1-L006-01']['ok'])

    def test_stale_runtime_missing_comparison_and_execution_error_do_not_pass(self):
        for file in review.READ_RUNTIME:
            hashes=dict(review.READ_RUNTIME);hashes[file]='0'*64
            with patch.object(review,'runtime_hashes',return_value=hashes),patch.object(review,'runtime_values') as run:
                self.assertEqual(review.report(self.sources)['acceptedCount'],0);run.assert_not_called()
        with patch.object(review,'runtime_fingerprint',return_value={'sha256':'0'*64}),patch.object(review,'runtime_values') as run:
            self.assertEqual(review.report(self.sources)['acceptedCount'],0);run.assert_not_called()
        changed=dict(review.READ_RUNTIME);changed[next(iter(changed))]='0'*64
        with self.snapshots(),patch.object(review,'runtime_hashes',side_effect=[review.READ_RUNTIME,changed]):self.assertEqual(review.report(self.sources)['acceptedCount'],0)
        with patch.object(review,'runtime_values',side_effect=ValueError('model failed')):self.assertEqual(review.report(self.sources)['acceptedCount'],0)
        with patch.object(review,'runtime_values',return_value={}),patch.object(review,'compare_runtime',return_value={}):self.assertEqual(review.report(self.sources)['acceptedCount'],0)

    def test_terminal_observation_of_known_failure_is_not_scientific_approval(self):
        proof=review.consumer_evidence();self.assertTrue(proof['ok']);self.assertEqual(proof['observedCaseCount'],34);self.assertEqual(len(proof['observedOriginalConsumerFailures']),2)
        with self.snapshots():
            for token in ('READ_BROWSER_PROOF_SHA256','READ_BROWSER_PROTOCOL_SHA256'):
                with patch.object(review,token,'0'*64):self.assertFalse(review.consumer_evidence()['ok']);self.assertEqual(review.report(self.sources)['acceptedCount'],0)

    def test_independent_domain_manual_fraction_and_radical_bounds(self):
        t=sp.Symbol('t',positive=True);work=3*t*t
        self.assertEqual(sp.diff(work,t),6*t);self.assertEqual(sp.cancel(work/t),3*t);self.assertEqual(sp.limit(work/t,t,0,dir='+'),0)
        self.assertIs(sp.S.Zero/sp.S.Zero,sp.nan)
        hidden=review.spring_occlusion_checks(self.actual);self.assertEqual(len(hidden),4);self.assertTrue(all(r['observedFullyEnclosed'] and not r['ok'] for r in hidden))
        spring=review.exact_value('SIM-C1-L006-02',1);self.assertEqual(spring,-sp.Rational(1,2));self.assertLess(sp.Rational(1,5),sp.Rational(1,4))
        self.assertEqual(review.exact_value('SIM-C1-L006-01',6),6);self.assertEqual(review.exact_value('SIM-C1-L006-01',7),3)
        self.assertEqual(review.exact_value('SIM-C1-L007-01',90),0);self.assertEqual(review.SPECS['SIM-C1-L007-01'][5],90)
        self.assertEqual(review.exact_value('SIM-C1-L006-03',2.75),sp.Rational(16,121));self.assertLess(abs(sp.Rational(1322,10000)-sp.Rational(16,121))/sp.Rational(16,121),sp.Rational(1,200))
        self.assertLess(sp.Rational(282,100)**2,8);self.assertGreater(sp.Rational(283,100)**2,8);self.assertLess(sp.Rational(1,100)/sp.Rational(282,100),sp.Rational(1,200))

if __name__=='__main__':unittest.main()
