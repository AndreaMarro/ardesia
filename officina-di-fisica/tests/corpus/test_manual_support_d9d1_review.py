"""Bounded separate epoch review, with real old-defect code mutations retained."""
from copy import deepcopy
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch
import json
import unittest
from tools.corpus_engineering import manual_support_d9d1_review as v


class ManualSupportD9d1(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rows=v.verify()
        cls.code=json.loads((v.BASE/'code-probe.json').read_bytes())
        cls.browser=json.loads((v.BASE/'browser-reading/report.json').read_bytes())
        cls.execution=json.loads((v.BASE/'browser-execution-receipt.json').read_bytes())

    def test_eight_limited_math_passes_do_not_accept_activities_or_erase_originals(self):
        self.assertEqual({r['id']for r in self.rows},v.previous.IDS)
        for r in self.rows:
            self.assertTrue(r['candidateTextMathManualReview']['ok'],r['candidateTextMathManualReview']['errors'])
            self.assertTrue(r['limitedGuideAndReadingDeliveryReview']['ok'])
            self.assertFalse(r['ok']);self.assertEqual(r['activityCredit'],0)
            self.assertEqual(r['fullSceneUiReview'],'NOT_RUN')
            self.assertEqual(r['humanApproval'],'NOT_RUN')
        for key in ('SIM-C4-L09-02','SIM-C5-L09-02'):
            r=next(r for r in self.rows if r['id']==key)
            self.assertTrue(r['originalPublishedEditionJudgmentPreserved']['consumerCodeGeometryFailure'])
            self.assertTrue(r['originalPublishedEditionJudgmentPreserved']['sourceManualityFailure'])

    def test_all_six_real_clock_code_paths_correct_and_legacy_mutation_rejected(self):
        self.assertEqual(self.code['openTimelineTransitions'],0)
        self.assertEqual(len(self.code['transitions']),6)
        for r in self.code['transitions']:
            self.assertFalse(r['staleTitleOrInstruction'])
            self.assertEqual(list(r['trace']['after'].values()),r['trace']['expected'][:3])
        self.assertEqual(len(self.code['mutationTransitions']),6)
        self.assertTrue(all(r['rejected']for r in self.code['mutationTransitions']))

    def test_actual_32_case_consumer_matrix_and_64_number_entries(self):
        self.assertEqual(v.guide_delivery_errors(self.browser,self.execution),[])
        cases=self.browser['cases'];self.assertEqual(len(cases),32)
        self.assertEqual(sum(len(c['guideCases'])for c in cases),96)
        self.assertEqual(sum(len(c['clockTransitions'])for c in cases),24)
        self.assertEqual(sum(len(c['manualEntries'])for c in cases),64)
        self.assertEqual({c['actualRenderer']for c in cases},{'3D interattivo','Tavola di misura'})

    def test_incomplete_or_stale_ui_proof_is_rejected(self):
        p=deepcopy(self.browser);p['cases'].pop()
        self.assertIn('Incomplete bounded consumer matrix',v.guide_delivery_errors(p,self.execution))
        p=deepcopy(self.browser);p['cases'][0]['audit']['formulas'].pop()
        self.assertIn('Incomplete actual formula rendering',v.guide_delivery_errors(p,self.execution))
        p=deepcopy(self.browser);next(c for c in p['cases']if c['clockTransitions'])['clockTransitions'][0]['guide']['step-title']='Controlla il calcolo'
        self.assertIn('Clock guide transition incomplete',v.guide_delivery_errors(p,self.execution))

    def test_runtime_source_or_terminal_drift_does_not_retag_evidence(self):
        self.assertEqual(v.execution_errors(self.execution),[])
        for key,bad in [('sourceCommit','0'*40),('actualRuntimeSha256','0'*64),('observedExitCode',1),('terminalStatus','NOT_TERMINAL'),('runtimeBeforeAndAfterIdentical',False)]:
            with self.subTest(key=key):
                e={**self.execution,key:bad};self.assertIn(key,v.execution_errors(e))
        self.assertNotEqual(v.previous.RUNTIME,v.PROFILE)
        self.assertEqual(v.previous.RUNTIME,'1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba')

    def test_six_new_interference_lines_reject_each_wrong_manual_step(self):
        p,_=v.inputs();row=next(r for r in p['records']if r['id']==v.INTERFERENCE)
        self.assertTrue(all(c['ok']for c in v.split_checks(row)))
        for formula in v.SPLIT_FORMULAS:
            with self.subTest(formula=formula):
                changed=deepcopy(row)
                next(b for b in changed['blocks']if b.get('text')==formula)['text']=formula+'=999'
                self.assertFalse(all(c['ok']for c in v.split_checks(changed)))

    def test_immutable_candidate_or_binding_tampering_rejected_before_review(self):
        for name in (v.previous.BATCH+'.json',v.previous.BATCH+'-bindings.json'):
            with TemporaryDirectory()as d:
                root=Path(d);folder=root/'candidate-input-snapshot/editorial/batches';folder.mkdir(parents=True)
                for f in (v.BASE/'candidate-input-snapshot/editorial/batches').iterdir():
                    (folder/f.name).write_bytes(f.read_bytes())
                f=folder/name;f.write_bytes(f.read_bytes()+b' ')
                with patch.object(v,'BASE',root):
                    with self.assertRaisesRegex(ValueError,'Immutable candidate input bytes changed'):v.inputs()

    def test_exact_regression_matrix_and_precision_matching(self):
        self.assertEqual(self.code['originalSourcesCompared'],139)
        self.assertEqual(self.code['originalGridStatesCompared'],2144)
        self.assertTrue(self.code['physicsEquivalent'])
        self.assertEqual([s['step'][0]=='Controlla il calcolo'for s in self.code['decimalSamples']],[True,True,False,False])
        self.assertNotEqual(self.code['nearQuadrant']['solve']['y'],0)
        self.assertTrue(self.code['nearQuadrant']['measureUnchanged'])
        self.assertEqual(sum(len(r['numberChecks'])for r in self.code['records']),16)

    def test_pilot_reasoning_priority_and_per_record_dependencies(self):
        samples=self.code['pilotGuideSamples'];self.assertTrue(samples)
        self.assertEqual({s['stage']for s in samples},{0,1,2,3})
        self.assertEqual({s['t']for s in samples},{0,1,2})
        self.assertEqual({s['selectedFrom']for s in samples},{'actual ragionamento override','actual guidaPilota fallback'})
        for r in self.rows:
            deps=r['reviewDependencySha256']
            for key in ('tools/corpus_engineering/manual_support_d9d1_review.py',v.DIR+'/probe-epoch.mjs',v.DIR+'/browser-reading/report.json'):
                self.assertEqual(deps[key],v.sha((v.APP/key).read_bytes()))


if __name__=='__main__':unittest.main()
