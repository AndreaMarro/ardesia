import copy
import hashlib
import json
import math
import tempfile
import unittest
from pathlib import Path
from tools.corpus_engineering import c2_fluid_label_candidate_review_a as v


class FluidCandidateCanary(unittest.TestCase):
    def test_actual_twelve_cases_current_epoch(self):
        self.assertEqual(len(v.actual_canary()),12)

    def test_second_pitot_label_hides_complete_arrow_320_both_controls(self):
        rows=[r for r in v.residual_proofs() if r['profile']['width']==320]
        self.assertEqual([r['x'] for r in rows],[.25,5])
        for r in rows:
            self.assertTrue(r['proof']['allVerticesInside'])
            self.assertEqual([p['insideOpaqueRectangle']for p in r['proof']['parts']],[66,34])
            self.assertGreater(r['proof']['projectedAxisLengthPixels'],0)

    def test_1280_is_not_falsely_called_whole_arrow_occlusion(self):
        rows=[r for r in v.residual_proofs() if r['profile']['width']==1280]
        self.assertEqual(len(rows),2)
        self.assertTrue(all(not r['proof']['allVerticesInside'] for r in rows))

    def test_fallback_retained_as_separate_renderer(self):
        cases=[c for c in v.actual_canary() if c['profile']['fallback'] and 'interaction'in c]
        self.assertEqual(len(cases),4)
        for c in cases:
            self.assertEqual(c['actualRenderer'],'Tavola di misura')
            self.assertEqual(c['legendLayout']['scrollWidth'],c['legendLayout']['width'])
            with self.assertRaises(ValueError):v.geometry.glyph_evidence(c,14,'Presa frontale')

    def test_independent_all_five_stage_comparison(self):
        r=json.loads((v.BASE/'actual-independent-static-comparison.json').read_bytes())
        self.assertEqual((r['originalEditions'],r['controls'],r['states'],r['sceneComparisons']),(41,555,875,4375))
        self.assertTrue(all(x['allFiveStagesExactExceptAuthorizedLabel']and x['numericalAndGraphAndTaskFieldsIdentical']for x in r['records']))
        self.assertEqual(sum(bool(x['onlyRemovedLabels'])for x in r['records']),20)

    def test_original_source_identity_and_numbers(self):
        source=v.geometry.physics.frozen_sources()['SIM-C2-L006-02']
        p=json.loads((v.BASE/'canary-prepared.json').read_bytes())
        self.assertEqual(p['records'][0]['record'],source)
        for c in v.actual_canary():
            if 'interaction'in c:
                self.assertEqual(c['model']['y'],float(v.geometry.physics.model_for(c['id']).exact_value(c['id'],v.geometry.physics.Fraction(str(c['sourceReplayedX'])))))

    def test_full_arrow_classification_stays_sensitive(self):
        c=next(c for c in v.actual_canary()if c.get('interaction',{}).get('index')==0 and c['profile']['width']==320 and not c['profile']['fallback'])
        label=next(e for e in c['labels']if e['text']=='Presa frontale');label['box']['x']+=10000
        self.assertFalse(v.geometry.glyph_evidence(c,14,'Presa frontale')['allVerticesInside'])

    def test_guard_against_retaged_acquisition_and_fake_credit(self):
        prepared=json.loads((v.BASE/'canary-prepared.json').read_bytes())
        self.assertNotEqual(prepared['runtimeFingerprint']['sha256'],v.geometry.physics.RUNTIME)
        self.assertEqual(prepared['scope'],'INDEPENDENT_TARGETED_REMAINDER_CANARY_NOT_COMPLETE_C2_RENEWAL')
        summary=json.loads((v.BASE/'independent-candidate-conclusion.json').read_bytes())
        self.assertFalse(summary['completeC2Renewal'])
        self.assertFalse(summary['scientificAcceptanceGranted'])
        self.assertEqual(summary['status'],'RESIDUAL_UI_FINDING_CONFIRMATION')


if __name__=='__main__':unittest.main()
