"""Independent bench physics, source identity, caller domain and adversarial checks."""
from copy import deepcopy
import json
from pathlib import Path
import shutil
import tempfile
import unittest
from unittest.mock import patch
from hypothesis import given,settings,strategies as st
from tools.corpus_engineering import bench_mechanics_fluids_activity_verifier as m
from tools.corpus_engineering.batches import assert_activity_identity
from tools.corpus_engineering.pipeline import digest


class BenchMechanicsFluidsReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources={r['id']:r for r in json.loads((m.APP/'content/banchi.json').read_text()) if r['id'] in m.READ_SOURCE_SHA256}

    def test_independent_exact_and_current_consumer_oracles_cover_all_five(self):
        r=m.report(self.sources)
        self.assertEqual((r['acceptedCount'],r['failedCount'],r['draftReviewedCount']),(5,0,0))
        self.assertEqual(r['runtimeCaseCount'],378)
        assert_activity_identity(r['records'],set(self.sources),self.sources)
        for row in r['records']:
            self.assertTrue(row['checks']);self.assertTrue(row['consumerChecks'])
            self.assertEqual(row['publicationAction'],'NONE');self.assertEqual(row['humanApproval'],'NOT_RUN')
            self.assertTrue(all(c['ok'] for c in row['checks']+row['consumerChecks']))

    def test_frozen_report_and_identity_match_fresh_verification(self):
        report=m.report(self.sources)
        for suffix in ['', '-originals']:
            saved=json.loads((m.APP/'editorial/reviews'/(m.BATCH+suffix+'.json')).read_text())
            self.assertEqual(report,saved)
        assert_activity_identity(report['records'],set(self.sources),self.sources)

    def test_wrong_source_assessment_prediction_units_cannot_pass_rebound_read_pin(self):
        for key in self.sources:
            for mode in ['value','unit','prediction']:
                rows=deepcopy(self.sources)
                if mode=='value':rows[key]['assessment'][0]['value']+=17
                elif mode=='unit':rows[key]['assessment'][0]['unit']='kg'
                else:rows[key]['prediction']['correct']=(rows[key]['prediction']['correct']+1)%3
                rebound={**m.READ_SOURCE_SHA256,key:digest(rows[key])}
                with self.subTest(key=key,mode=mode),patch.object(m,'READ_SOURCE_SHA256',rebound):
                    result=m.report(rows)
                    self.assertFalse(next(r for r in result['records'] if r['id']==key)['ok'])

    def test_empty_or_missing_independent_physics_cannot_inherit_pass(self):
        with patch.object(m,'exact_checks',return_value={k:[] for k in self.sources}):
            with self.assertRaises((ValueError,IndexError)):
                m.report(self.sources)
        with patch.object(m,'runtime_checks',return_value={k:[] for k in self.sources}):
            self.assertTrue(all(not r['ok'] for r in m.report(self.sources)['records']))
        with self.assertRaises(ValueError):m.report({})

    def test_bad_consumer_output_is_rejected_independently_of_source_keys(self):
        changed=deepcopy(m.runtime_values());changed[0]['s']['normal']*=2
        with patch.object(m,'runtime_values',return_value=changed):
            self.assertFalse(m.report(self.sources)['records'][0]['ok'])
        changed=deepcopy(m.runtime_values());changed[0]['p']['m']=3
        with patch.object(m,'runtime_values',return_value=changed),self.assertRaises(ValueError):m.report(self.sources)

    def test_actual_consumer_bytes_cannot_change_without_invalidating_reading(self):
        with tempfile.TemporaryDirectory() as home:
            root=Path(home)
            for path in m.READ_CONSUMERS:
                target=root/path;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(m.APP/path,target)
            path=root/'static/js/banchi/banco.js';path.write_text(path.read_text()+'\n// changed caller\n')
            with patch.object(m,'APP',root):self.assertTrue(all(not r['ok'] for r in m.verify(self.sources)))

    def test_caller_domain_proof_and_direct_solver_counterexample_are_separate(self):
        code=(m.APP/'static/js/banchi/banco.js').read_text()
        self.assertIn("if (r.model === 'piano' && p.mk > p.ms)",code)
        self.assertIn("if (el.name === 'mk') p.ms = p.mk",code)
        self.assertIn('else p.mk = p.ms',code)
        self.assertIn('outside the consumer domain',m.MANUAL['LAB3D-01'])
        for changed in ['mk','ms','F']:
            p={'ms':0,'mk':1}
            if p['mk']>p['ms']:
                if changed=='mk':p['ms']=p['mk']
                else:p['mk']=p['ms']
            self.assertLessEqual(p['mk'],p['ms'])

    def test_private_ui_report_is_bound_to_actual_protocol_runtime_and_images(self):
        report=m.browser_evidence();self.assertEqual(report['actualBrowserCases'],10)
        with patch.object(m,'runtime_fingerprint',return_value={'changed':True}):
            with self.assertRaises(ValueError):m.browser_evidence()

    @settings(max_examples=16,deadline=None,derandomize=True)
    @given(mass=st.integers(1,10),angle=st.sampled_from([0,30,45]),static=st.integers(0,20),fraction=st.integers(0,20),force=st.integers(-25,25))
    def test_generated_reachable_coulomb_states_have_independent_numeric_solutions(self,mass,angle,static,fraction,force):
        ms=static/20;mk=ms*fraction/20;p=dict(m=mass/2,angle=angle,ms=ms,mk=mk,F=force)
        m.runtime_values.cache_clear()
        try:
            with patch.object(m,'runtime_inputs',return_value=[['piano',p]]):
                checks=m.runtime_checks();self.assertEqual(len(checks['LAB3D-01']),1);self.assertTrue(checks['LAB3D-01'][0]['ok'])
        finally:m.runtime_values.cache_clear()


if __name__=='__main__':unittest.main()
