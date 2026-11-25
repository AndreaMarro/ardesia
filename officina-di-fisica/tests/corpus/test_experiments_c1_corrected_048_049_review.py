"""Independent current-runtime C1 review: no source edition/registry mutation."""
from copy import deepcopy
from contextlib import ExitStack
import json,subprocess,unittest
from unittest.mock import patch
import sympy as s
from tools.corpus_engineering import experiments_force_work_corrected_048_verifier as force
from tools.corpus_engineering import experiments_energy_momentum_corrected_049_verifier as energy
from tools.corpus_engineering.pipeline import sha,digest
from tools.corpus_engineering.batches import assert_activity_identity

class CorrectedC1ConsumerReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.raw=subprocess.check_output(['git','show',force.SOURCE_REF+':'+force.SOURCE_PATH],cwd=force.APP)
        cls.rows=json.loads(cls.raw);cls.sources={};cls.actual={}
        for v in (force,energy):
            cls.sources[v.BATCH]={r['id']:r for r in cls.rows if r['id'] in v.SPECS}
            cls.actual[v.BATCH]=v.runtime_values(cls.sources[v.BATCH])
    def snapshot(self,v):
        ctx=ExitStack();a=self.actual[v.BATCH];ctx.enter_context(patch.object(v,'runtime_values',return_value=a));ctx.enter_context(patch.object(v,'compare_runtime',return_value=v.compare_runtime(a)));return ctx

    def test_all_sixteen_current_sources_and_gates_are_fresh(self):
        for v,count in ((force,6),(energy,10)):
            with patch.object(v,'runtime_values',wraps=v.runtime_values) as execute:
                one=v.report(self.sources[v.BATCH]);two=v.report(self.sources[v.BATCH])
            self.assertEqual(execute.call_count,2);self.assertEqual(one,two)
            self.assertEqual((one['acceptedCount'],one['failedCount'],one['draftReviewedCount']),(count,0,0))
            self.assertEqual(sha(self.raw),v.SOURCE_FILE_SHA256);self.assertEqual(v.runtime_hashes(),v.READ_RUNTIME)
            self.assertTrue(v.consumer_evidence()['ok']);assert_activity_identity(one['records'],set(self.sources[v.BATCH]),self.sources[v.BATCH])
            for row in one['records']:
                self.assertTrue(all(c['ok'] for c in row['checks']));self.assertEqual(row['humanApproval'],'NOT_RUN');self.assertEqual(row['publicationAction'],'NONE');self.assertTrue(row['originalEditionRetained']);self.assertFalse(row['failedPublishedEdition'])
            self.assertEqual(sum(r['runtimeComparison']['caseCount'] for r in one['records']),118 if v is force else 145)
            self.assertEqual(sum(r['runtimeComparison']['clockSampleCount'] for r in one['records']),68 if v is force else 177)

    def test_each_source_mutation_blocks_before_engine_execution(self):
        for v in (force,energy):
            for key in v.SPECS:
                rows=deepcopy(self.sources[v.BATCH]);rows[key]['interpretation']+=' changed assumption'
                with patch.object(v,'runtime_values',side_effect=AssertionError('Unreviewed input executed')):self.assertEqual(v.report(rows)['acceptedCount'],0)
                del rows[key]
                with self.assertRaises(ValueError):v.verify(rows)

    def test_every_scalar_rebound_assessment_and_partial_grid_is_rejected(self):
        for v in (force,energy):
            for key in v.SPECS:
                a=deepcopy(self.actual[v.BATCH]);a[key]['cases'][0]['output']['y']+=1;self.assertFalse(v.compare_runtime(a)[key]['ok'])
                a=deepcopy(self.actual[v.BATCH]);a[key]['assessment'][0]['value']+=1;y=a[key]['assessment'][0]['value'];a[key]['formatRoundtrip'][0]={'display':str(y),'parsed':y};self.assertFalse(v.compare_runtime(a)[key]['ok'])
                a=deepcopy(self.actual[v.BATCH]);a[key]['cases'].pop();self.assertFalse(v.compare_runtime(a)[key]['ok'])

    def test_force_origins_directions_and_support_are_physical_not_retokened(self):
        for v,key in ((force,'SIM-C1-L006-02'),(energy,'SIM-C1-L010-03'),(energy,'SIM-C1-L010-04'),(energy,'SIM-C1-L010-05')):
            a=deepcopy(self.actual[v.BATCH]);case=next(c for c in a[key]['cases'] if any(e.get('kind')=='arrow' for e in c['elements']));arrow=next(e for e in case['elements'] if e.get('kind')=='arrow')
            # Same delta and force scale but a transverse shift alters line/moment.
            arrow['a'][2]+=1;arrow['b'][2]+=1;self.assertFalse(v.compare_runtime(a)[key]['ok'])
            a=deepcopy(self.actual[v.BATCH]);case=next(c for c in a[key]['cases'] if any(e.get('kind')=='arrow' for e in c['elements']));next(e for e in case['elements'] if e.get('kind')=='arrow')['b'][1]+=1;self.assertFalse(v.compare_runtime(a)[key]['ok'])
        a=deepcopy(self.actual[energy.BATCH]);case=a['SIM-C1-L010-02']['cases'][0];post=next(e for e in case['elements'] if e.get('kind')=='rod' and energy.near(e.get('r'),s.Rational(13,100)));post['a'][2]=post['b'][2]=0
        self.assertFalse(energy.corrected_scene_checks(a)['SIM-C1-L010-02'][0]['ok'])
        # The actual47c3 regression: full glyph must not extend below table top.
        a=deepcopy(self.actual[energy.BATCH]);case=next(c for c in a['SIM-C1-L010-04']['cases'] if c['x']==10);arrow=next(e for e in case['elements'] if e.get('kind')=='arrow');arrow['a'][1]=1.07;arrow['b'][1]=-.13
        self.assertFalse(next(c for c in energy.corrected_scene_checks(a)['SIM-C1-L010-04'] if 'x=10' in c['claim'])['ok'])

    def test_zero_mean_domain_and_instantaneous_value_are_distinct(self):
        self.assertEqual(force.exact_value('SIM-C1-L007-02',0),0)
        a=deepcopy(self.actual[force.BATCH]);zero=next(c for c in a['SIM-C1-L007-02']['cases'] if c['x']==0);self.assertEqual(zero['readings'][2][1],'Non definita (intervallo nullo)');self.assertEqual(zero['readings'][2][2],'')
        for bad in (0,'0 W','Non definita'):
            a=deepcopy(self.actual[force.BATCH]);next(c for c in a['SIM-C1-L007-02']['cases'] if c['x']==0)['readings'][2][1]=bad;self.assertFalse(force.compare_runtime(a)['SIM-C1-L007-02']['ok'])
        for case in self.actual[force.BATCH]['SIM-C1-L007-02']['cases']:
            if case['x']>0:self.assertEqual(case['readings'][2][1],3*case['x'])

    def test_full_runtime_profile_missing_comparison_proof_or_engine_failure_denies(self):
        for v in (force,energy):
            with patch.object(v,'runtime_fingerprint',return_value={'sha256':'0'*64}),patch.object(v,'runtime_values') as run:self.assertEqual(v.report(self.sources[v.BATCH])['acceptedCount'],0);run.assert_not_called()
            with patch.object(v,'runtime_values',return_value={}),patch.object(v,'compare_runtime',return_value={}):self.assertEqual(v.report(self.sources[v.BATCH])['acceptedCount'],0)
            with patch.object(v,'runtime_values',side_effect=ValueError('execution failed')):self.assertEqual(v.report(self.sources[v.BATCH])['acceptedCount'],0)
            for name in ('READ_BROWSER_PROOF_SHA256','READ_BROWSER_PROTOCOL_SHA256','READ_EVIDENCE_MANIFEST_SHA256'):
                with self.snapshot(v),patch.object(v,name,'0'*64):self.assertFalse(v.consumer_evidence()['ok']);self.assertEqual(v.report(self.sources[v.BATCH])['acceptedCount'],0)
            changed=dict(v.READ_RUNTIME);changed[next(iter(changed))]='0'*64
            with self.snapshot(v),patch.object(v,'runtime_hashes',side_effect=[v.READ_RUNTIME,changed]):self.assertEqual(v.report(self.sources[v.BATCH])['acceptedCount'],0)

    def test_clock_image_and_invalidation_are_bound_independently(self):
        self.assertTrue(energy.clock_scene_evidence()['ok'])
        for name in ('READ_CLOCK_PROOF_SHA256','READ_CLOCK_PROTOCOL_SHA256','READ_CLOCK_MANIFEST_SHA256'):
            with self.snapshot(energy),patch.object(energy,name,'0'*64):self.assertFalse(energy.consumer_evidence()['ok']);self.assertEqual(energy.report(self.sources[energy.BATCH])['acceptedCount'],0)

    def test_translation_along_force_preserves_moment_independently(self):
        rx,ry,rz,fx,fy,fz,l=s.symbols('rx ry rz fx fy fz l',real=True);r=s.Matrix([rx,ry,rz]);f=s.Matrix([fx,fy,fz]);self.assertEqual(s.simplify((r+l*f).cross(f)-r.cross(f)),s.zeros(3,1))
        for v in (force,energy):self.assertTrue(all(c['ok'] for rows in v.independent_checks().values() for c in rows))
        self.assertEqual(energy.exact_value('SIM-C1-L010-02',45),10*s.sqrt(2));self.assertEqual(energy.exact_value('SIM-C1-L010-04',26),s.Rational(60,13));self.assertEqual(energy.exact_value('SIM-C1-L010-05',4),75)
        self.assertLess(abs(s.Rational(4615,1000)-s.Rational(60,13))/s.Rational(60,13),s.Rational(1,200))

    def test_collision_signed_clock_and_all_graphs_remain_independent(self):
        a=deepcopy(self.actual[energy.BATCH]);key='SIM-C1-L009-02';case=next(c for c in a[key]['cases'] if c['x']==3);case['timeSamples'][2]['signal']+=1;self.assertFalse(energy.compare_runtime(a)[key]['ok'])
        for v in (force,energy):
            for key in v.SPECS:
                a=deepcopy(self.actual[v.BATCH]);a[key]['cases'][0]['graphs'][0]['series'][0]['points'][0][1]=999;self.assertFalse(v.compare_runtime(a)[key]['ok'])

if __name__=='__main__':unittest.main()
