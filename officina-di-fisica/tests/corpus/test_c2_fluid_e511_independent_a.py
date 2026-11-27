import copy
import hashlib
import json
import math
import unittest
from fractions import Fraction
from tools.corpus_engineering import c2_fluid_e511_review_a as v
from tools.corpus_engineering import c2_pitot_label_geometry_a as geometry


class FluidE511Independent(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.canary=v.observed_run('canary')
        cls.targeted=v.observed_run('targeted')
        cls.witnesses=json.loads((v.BASE/'targeted-residual-witnesses.json').read_bytes())

    def test_actual56_and624_are_complete_distinct_requests(self):
        self.assertEqual((len(self.canary),len(self.targeted)),(56,624))
        a=json.loads((v.BASE/'canary-prepared.json').read_bytes())
        b=json.loads((v.BASE/'targeted-prepared.json').read_bytes())
        self.assertNotEqual(a['requestSha256'],b['requestSha256'])
        self.assertEqual(len(b['records']),26)

    def test_isolated_same_browser_parity_is_strict_for_all416_states(self):
        states=[c for c in self.targeted if 'interaction'in c]
        self.assertEqual(len(states),416)
        for c in states:
            self.assertEqual(c['model'],c['baselineReference']['model'])
            self.assertEqual(c['actualDOMControls'],c['baselineReference']['actualDOMControls'])
            self.assertEqual(c['baselineReference']['isolation'],'DISTINCT_CONTEXT_AND_ORIGIN')

    def test_six_full_cone_labels_are_different_from_partial_contacts(self):
        full=[w for w in self.witnesses if w['classification']=='FULL_CONE_OPAQUE_LABEL']
        self.assertEqual(len(full),6)
        self.assertEqual({x['id']for x in full},{'SIM-C2-L005-01','SIM-C2-L005-02','SIM-C2-L005-03','SIM-C2-L006-01','SIM-C2-L006-03','SIM-C2-L008-01'})
        for w in full:
            self.assertEqual(w['label'],'Uscita')
            self.assertTrue(w['fullPngOpenedAndRead'])
            self.assertEqual(Fraction(w['parts'][1]['coveredFractionExact']),1)

    def test_exact_selected_whole_png_witnesses(self):
        for w in self.witnesses:
            self.assertEqual(hashlib.sha256((v.APP/w['screenshot']['file']).read_bytes()).hexdigest(),w['screenshot']['sha256'])
            raw=(v.APP/w['sourceCaseFile']).read_bytes()
            self.assertEqual(hashlib.sha256(raw).hexdigest(),w['sourceCaseSha256'])
            case=geometry.load_exact(raw)
            self.assertEqual(str(geometry.part_coverage(case,w['elementIndex'],1,w['label'])),w['parts'][1]['coveredFractionExact'])

    def test_small_contacts_are_not_called_whole_heads(self):
        w=next(w for w in self.witnesses if w['id']=='SIM-C2-L008-02')
        self.assertGreater(w['coveredPercent'],2)
        self.assertLess(w['coveredPercent'],3)
        self.assertTrue(w['headTipInsideLabel'])
        w=next(w for w in self.witnesses if w['id']=='SIM-C2-L001-02')
        self.assertGreater(w['coveredPercent'],0)
        self.assertLess(w['coveredPercent'],1)
        self.assertFalse(w['headTipInsideLabel'])

    def test_cleared_label_rectangle_removes_the_intersection(self):
        w=self.witnesses[0]
        case=geometry.load_exact((v.APP/w['sourceCaseFile']).read_bytes())
        label=next(x for x in case['labels']if x['text']==w['label'])
        label['box']['x']+=10000
        self.assertEqual(geometry.part_coverage(case,w['elementIndex'],1,w['label']),0)

    def test_pitot_canary_checks_are_current_and_clear(self):
        proof=v.pitot_canary_checks()
        self.assertEqual(len(proof),48)
        self.assertEqual(sum(p['zero']for p in proof),8)
        self.assertTrue(all(p['checksOk']for p in proof))

    def test_pitot_targeted_fallback_retains_complete_head_paint_order(self):
        for c in self.targeted:
            if c['id']=='SIM-C2-L006-02'and 'interaction'in c and c['profile']['fallback']:
                self.assertEqual(v.svg_geometry.fallback_metal_coverage(c),[])
                self.assertEqual([e['kind']for e in c['elements'][-2:]],['arrow','arrow'])

    def test_original_stefino_failure_and_draft_success_are_separate(self):
        original=[c for c in self.targeted if c['id']=='SIM-C2-L002-01'and c['variant']=='published'and 'interaction'not in c]
        draft=[c for c in self.targeted if c['id']=='SIM-C2-L002-01'and c['variant']=='draft'and 'interaction'not in c]
        self.assertEqual((len(original),len(draft)),(8,8))
        self.assertTrue(all(any(q['input']=='15.0'and not q['expectedAccepted']and q['status'].startswith('Rivedi')for q in c['questions'])for c in original))
        self.assertTrue(all(all(q['expectedAccepted']and q['status'].startswith('Corretto.')for q in c['questions'])for c in draft))

    def test_source_equations_reject_wrong_values_even_if_both_models_agree(self):
        c=next(c for c in self.targeted if 'interaction'in c)
        fake=copy.deepcopy(c)
        fake['model']['y']+=1
        fake['baselineReference']['model']['y']=fake['model']['y']
        self.assertEqual(fake['model'],fake['baselineReference']['model'])
        with self.assertRaises(ValueError):v.independent_measure(fake['id'],fake['sourceReplayedX'],fake['model']['y'])

    def test_finite_and_physical_selector_domains_before_cast(self):
        for bad in [math.inf,-math.inf,math.nan,True,'1',None,1j]:
            with self.assertRaises(ValueError):v.independent_measure('SIM-C2-L006-02',bad,1)
            with self.assertRaises(ValueError):v.independent_measure('SIM-C2-L006-02',1,bad)
        with self.assertRaises(ValueError):v.independent_measure('SIM-C2-L008-02',2.5,1)
        with self.assertRaises(ValueError):v.independent_measure('SIM-C2-L005-03',0,1)

    def test_all26_whole_overviews_and_selected_full_pngs_really_read(self):
        rows=json.loads((v.BASE/'manual-targeted-reading.json').read_bytes())
        views=json.loads((v.BASE/'targeted-overview-index.json').read_bytes())
        self.assertEqual(len(rows),26)
        self.assertTrue(all(x['wholeOverviewOpenedAndRead']for x in rows))
        self.assertTrue(all(x['wholeOpenedAndRead']for x in views))
        self.assertEqual(sum(len(x['tiles'])for x in views),416)

    def test_graph_and_numerical_code_invariance_has_only_named_scene_delta(self):
        p=json.loads((v.BASE/'actual-independent-static-comparison.json').read_bytes())
        self.assertEqual((p['originalEditions'],p['controls'],p['states'],p['sceneComparisons']),(41,555,875,4375))
        self.assertEqual(sum(len(r['onlyRemovedLabels'])for r in p['records']),22)
        self.assertTrue(all(r['allFiveStagesExactExceptAuthorizedLabelsAndPitotTranslationAndPaintOrder']for r in p['records']))

    def test_no_macro_acceptance_or_human_credit(self):
        result=json.loads((v.BASE/'final-independent-disposition.json').read_bytes())
        self.assertEqual(result['overallStatus'],'PITOT_CLEARED_TARGETED_RESIDUAL_EXIT_LABELS')
        self.assertFalse(result['completeC2Renewal'])
        self.assertFalse(result['scientificAcceptanceGranted'])
        self.assertEqual(result['activityCredit'],0)
        self.assertEqual(result['humanApproval'],'NOT_RUN')


if __name__=='__main__':unittest.main()
