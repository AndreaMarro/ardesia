"""Independent exact/domain/consumer counterprobes for original046.
Three native visibility failures remain failures; no automatic registry credit.
"""
from copy import deepcopy
from pathlib import Path
import json,subprocess,unittest
from unittest.mock import patch
import sympy as sp
from tools.corpus_engineering import experiments_energy_momentum_046_verifier as review
from tools.corpus_engineering.pipeline import digest,sha
from tools.corpus_engineering.batches import assert_activity_identity
from tests.corpus.historical_runtime import reviewed_runtime

class EnergyMomentum046Review(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.raw=subprocess.check_output(['git','show',review.SOURCE_REF+':'+review.SOURCE_PATH],cwd=review.APP)
        cls.enterClassContext(reviewed_runtime(review))
        cls.sources={r['id']:r for r in json.loads(cls.raw) if r['id'] in review.SPECS};cls.actual=review.runtime_values(cls.sources);cls.summary=review.compare_runtime(cls.actual)
    def snapshots(self):
        from contextlib import ExitStack
        stack=ExitStack();stack.enter_context(patch.object(review,'runtime_values',return_value=self.actual));stack.enter_context(patch.object(review,'compare_runtime',return_value=self.summary));return stack

    def test_all_ten_originals_and_all_assigned_work_fresh_runtime_each_report(self):
        with patch.object(review,'runtime_values',wraps=review.runtime_values) as run:first=review.report(self.sources);second=review.report(self.sources)
        self.assertEqual(run.call_count,2);self.assertEqual(first,second);self.assertEqual((first['acceptedCount'],first['failedCount'],first['draftReviewedCount']),(7,3,0))
        self.assertEqual(len(first['records']),10);self.assertEqual(sum(len(r['checks']) for r in first['records']),114)
        self.assertEqual(sum(r['runtimeComparison']['caseCount'] for r in first['records']),145);self.assertEqual(sum(r['runtimeComparison']['clockSampleCount'] for r in first['records']),177)
        self.assertEqual(first['failedPublishedEditionIds'],['SIM-C1-L010-02','SIM-C1-L010-03','SIM-C1-L010-05'])
        self.assertTrue(all(r['sourceScientificReview']['ok'] and r['manualFeasibility']=='PASS_AI_EXACT_ASSIGNED_TASKS' for r in first['records']))
        with self.assertRaises(ValueError):assert_activity_identity(first['records'],set(self.sources),self.sources)
        good=[r for r in first['records'] if r['ok']];assert_activity_identity(good,{r['id'] for r in good},self.sources)
        for row in first['records']:
            self.assertEqual(row['humanApproval'],'NOT_RUN');self.assertEqual(row['publicationAction'],'NONE');self.assertTrue(row['originalEditionRetained']);self.assertEqual(row['calculationScope'],'EXACT_MANUAL_CALCULATION')

    def test_sources_runtime_units_and_all_exact_models(self):
        self.assertEqual(sha(self.raw),review.SOURCE_FILE_SHA256);self.assertEqual((review.APP/'content/esperienze-C1.json').read_bytes(),self.raw)
        self.assertEqual({k:digest(r) for k,r in self.sources.items()},review.READ_SOURCE_SHA256);self.assertEqual(review.runtime_hashes(),review.READ_RUNTIME);self.assertEqual(review.runtime_fingerprint(review.APP)['sha256'],review.READ_RUNTIME_PROFILE_SHA256)
        self.assertEqual([v['caseCount'] for v in self.summary.values()],[9,11,21,13,13,13,19,21,16,9]);self.assertTrue(all(v['ok'] for v in self.summary.values()))
        checks=review.independent_checks();self.assertEqual(sum(len(v) for v in checks.values()),79);self.assertTrue(all(c['ok'] for cs in checks.values() for c in cs))
        for cs in checks.values():
            for c in cs:self.assertFalse(sp.sympify(c['independentExact']).atoms(sp.Float))
        self.assertEqual(self.sources['SIM-C1-L009-02']['version'],2)

    def test_changed_or_missing_source_never_executes_unreviewed_engine(self):
        for key in review.SPECS:
            sources=deepcopy(self.sources);sources[key]['interpretation']+=' changed hypothesis'
            with patch.object(review,'runtime_values',side_effect=AssertionError('Unreviewed source executed')):self.assertEqual(review.report(sources)['acceptedCount'],0)
            del sources[key]
            with self.assertRaises(ValueError):review.verify(sources)

    def test_every_wrong_scalar_rebound_answer_and_incomplete_grid_is_detected(self):
        for key in review.SPECS:
            actual=deepcopy(self.actual);actual[key]['cases'][0]['output']['y']+=1;self.assertFalse(review.compare_runtime(actual)[key]['ok'])
            actual=deepcopy(self.actual);actual[key]['assessment'][0]['value']+=1;value=actual[key]['assessment'][0]['value'];actual[key]['formatRoundtrip'][0]={'display':str(value),'parsed':value};self.assertFalse(review.compare_runtime(actual)[key]['ok'])
            actual=deepcopy(self.actual);actual[key]['cases'].pop();self.assertFalse(review.compare_runtime(actual)[key]['ok'])

    def test_physical_path_body_force_geometry_and_clock_mutations(self):
        for key in review.SPECS:
            actual=deepcopy(self.actual);case=actual[key]['cases'][0]
            # Mutate the physical coordinate independently checked for this apparatus,
            # rather than an uncalibrated decorative spring/support.
            if key=='SIM-C1-L008-01':
                element=next(e for e in case['elements'] if e.get('kind')=='line' and e.get('c')==0x7350b0);element['points'][0][0]+=1
            elif key.startswith('SIM-C1-L008-'):
                element=next(e for e in case['elements'] if e.get('kind')=='ball' and e.get('c')==0xd49332);element['p'][1]+=1
            elif key in ('SIM-C1-L009-01','SIM-C1-L009-02','SIM-C1-L010-01'):
                element=next(e for e in case['elements'] if e.get('kind')=='box' and e.get('c')==0x7350b0);element['p'][0]+=1
            elif key=='SIM-C1-L010-02':
                element=next(e for e in case['elements'] if e.get('kind')=='rod' and e.get('c')==0xd49332);element['b'][0]+=1
            else:
                element=next(e for e in case['elements'] if e.get('kind')=='ball' and e.get('c')==0x147979);element['p'][0]+=1
            self.assertFalse(review.compare_runtime(actual)[key]['ok'],key)
        for key in ('SIM-C1-L009-01','SIM-C1-L009-02','SIM-C1-L010-01'):
            actual=deepcopy(self.actual);actual[key]['cases'][0]['timeSamples'][0]['output']['y']+=1;self.assertFalse(review.compare_runtime(actual)[key]['ok'])
        actual=deepcopy(self.actual);case=next(c for c in actual['SIM-C1-L009-02']['cases'] if c['x']==3);case['timeSamples'][2]['signal']+=1;self.assertFalse(review.compare_runtime(actual)['SIM-C1-L009-02']['ok'])
        actual=deepcopy(self.actual);actual['SIM-C1-L008-03']['cases'][0]['readings'][2][1]+=1;self.assertFalse(review.compare_runtime(actual)['SIM-C1-L008-03']['ok'])

    def test_whole_profile_individual_files_execution_failure_and_missing_comparison_block(self):
        for file in review.READ_RUNTIME:
            hashes=dict(review.READ_RUNTIME);hashes[file]='0'*64
            with patch.object(review,'runtime_hashes',return_value=hashes),patch.object(review,'runtime_values') as run:self.assertEqual(review.report(self.sources)['acceptedCount'],0);run.assert_not_called()
        with patch.object(review,'runtime_fingerprint',return_value={'sha256':'0'*64}),patch.object(review,'runtime_values') as run:self.assertEqual(review.report(self.sources)['acceptedCount'],0);run.assert_not_called()
        changed=dict(review.READ_RUNTIME);changed[next(iter(changed))]='0'*64
        with self.snapshots(),patch.object(review,'runtime_hashes',side_effect=[review.READ_RUNTIME,changed]):self.assertEqual(review.report(self.sources)['acceptedCount'],0)
        with patch.object(review,'runtime_values',side_effect=ValueError('bad runtime')):self.assertEqual(review.report(self.sources)['acceptedCount'],0)
        with patch.object(review,'runtime_values',return_value={}),patch.object(review,'compare_runtime',return_value={}):self.assertEqual(review.report(self.sources)['acceptedCount'],0)

    def test_observed_proof_critical_pixels_and_containment_are_distinct_from_physics_pass(self):
        evidence=review.consumer_evidence();self.assertTrue(evidence['ok']);self.assertEqual(evidence['observedCaseCount'],57)
        found=review.consumer_scene_checks(self.actual);self.assertTrue(found['SIM-C1-L010-02'][0]['observedEndpointFullyInsideOpaquePost']);self.assertTrue(found['SIM-C1-L010-03'][0]['observedArrowFullyInsideOpaquePost'])
        self.assertEqual(len(found['SIM-C1-L010-05']),3);self.assertTrue(all(not c['ok'] for cs in found.values() for c in cs))
        with self.snapshots():
            for name in ('READ_BROWSER_PROOF_SHA256','READ_BROWSER_PROTOCOL_SHA256','READ_EVIDENCE_MANIFEST_SHA256'):
                with patch.object(review,name,'0'*64):self.assertFalse(review.consumer_evidence()['ok']);self.assertEqual(review.report(self.sources)['acceptedCount'],0)

    def test_signed_collision_zero_domain_actual_angles_and_manual_bounds(self):
        self.assertEqual(review.SPECS['SIM-C1-L010-02'][5],45);self.assertEqual(review.exact_value('SIM-C1-L010-02',45),10*sp.sqrt(2))
        self.assertLess(sp.Rational(1414,100)**2,200);self.assertGreater(sp.Rational(1415,100)**2,200);self.assertLess(sp.Rational(1,100)/sp.Rational(1414,100),sp.Rational(1,200))
        self.assertEqual(review.exact_value('SIM-C1-L010-04',26),sp.Rational(60,13));self.assertLess(abs(sp.Rational(4615,1000)-sp.Rational(60,13))/sp.Rational(60,13),sp.Rational(1,200))
        self.assertEqual(review.exact_value('SIM-C1-L009-02',-3),-sp.Rational(3,2));self.assertEqual(review.exact_value('SIM-C1-L009-02',0),0)
        zero=next(c for c in self.actual['SIM-C1-L009-02']['cases'] if c['x']==0);self.assertEqual(zero['readings'][2][1],'Entrambe nulle');self.assertEqual(zero['duration'],0)
        for row in self.actual['SIM-C1-L010-01']['cases']:
            centres=[e['p'][0] for e in row['elements'] if e.get('kind')=='box' and e.get('c') in (0x7350b0,0x147979)];self.assertTrue(all(-2.65<x<2.65 for x in centres))

if __name__=='__main__':unittest.main()
