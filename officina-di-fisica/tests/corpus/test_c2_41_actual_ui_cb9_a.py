"""Actual remote evidence and independently interpreted geometry, never auto-closure."""
import copy
import hashlib
import json
import math
import unittest

from tools.corpus_engineering import c2_41_actual_ui_cb9_review_a as v


class ActualC2Evidence(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.praw = (v.BASE/'actual-remote-prepared.json').read_bytes()
        cls.rraw = (v.BASE/'actual-remote-report.json').read_bytes()
        cls.traw = (v.BASE/'actual-remote-terminal-receipt.json').read_bytes()
        cls.p, cls.r, cls.t = map(json.loads, (cls.praw, cls.rraw, cls.traw))
        cls.rows = json.loads((v.BASE/'negative-witness-selection.json').read_bytes())
        cls.additional = json.loads((v.BASE/'additional-full-frame-selection.json').read_bytes())

    def test_actual_metadata_whole_original_and_draft_identity(self):
        self.assertTrue(v.validate_verbatim_metadata(self.praw, self.rraw, self.traw))

    def test_corrupt_prepared_bytes_are_rejected(self):
        with self.assertRaises(ValueError):
            v.validate_verbatim_metadata(self.praw+b' ', self.rraw, self.traw)

    def test_failed_or_unfinished_acquisition_is_rejected(self):
        for field, value in [('observedExitCode', 1), ('observedExitCode', None), ('error', 'disk I/O')]:
            t = copy.deepcopy(self.t); t[field] = value
            with self.assertRaises(ValueError): v.validate_envelope(self.p, self.r, t)

    def test_epoch_and_request_cannot_be_retagged(self):
        for field in ['runtimeSha256', 'requestSha256']:
            t = copy.deepcopy(self.t); t[field] = '0'*64
            with self.assertRaises(ValueError): v.validate_envelope(self.p, self.r, t)

    def test_missing_or_duplicate_actual_case_rejected(self):
        for cases in [self.r['cases'][:-1], self.r['cases'][:-1]+[self.r['cases'][0]]]:
            r = copy.deepcopy(self.r); r['cases'] = cases
            with self.assertRaises(ValueError): v.validate_envelope(self.p, r, self.t)

    def test_record_source_and_draft_versions_not_interchangeable(self):
        for variant in ['published', 'draft']:
            p = copy.deepcopy(self.p)
            row = next(x for x in p['records'] if x['id']=='SIM-C2-L002-01' and x['variant']==variant)
            row['record']['version'] += 1
            with self.assertRaises(ValueError): v.validate_record_identity(p)
        p=copy.deepcopy(self.p); p['records'][0]['sourceSha256']='f'*64
        with self.assertRaises(ValueError): v.validate_record_identity(p)

    def test_acquisition_cannot_manufacture_credit(self):
        for field, value in [('activityCredit', 41), ('humanApproval', 'PASS')]:
            r = copy.deepcopy(self.r); r[field] = value
            with self.assertRaises(ValueError): v.validate_envelope(self.p, r, self.t)

    def test_all_extracted_whole_glyph_witnesses_are_actual(self):
        for row in self.rows:
            case = v.validate_witness(row)
            if row['kind'] == 'FULL_ARROW_UNDER_OPAQUE_LABEL':
                proof = v.glyph_evidence(case, row['elementIndex'], row['label'])
                self.assertTrue(proof['allVerticesInside'])
                self.assertGreater(proof['projectedAxisLengthPixels'], 1)
            else:
                proof = v.sphere_evidence(case, row['elementIndex'], row['label'])
                self.assertTrue(proof['entireProjectedDiskBoundingSquareInside'])
                self.assertGreater(proof['projectedDiameterPixels'], 0)

    def test_distinguishes_hidden_cone_from_single_tip_contact(self):
        for row, index, label, cone_inside in zip(self.additional[:3], [5,9,5], ['Presa intermedia','In parallelo','Presa intermedia'], [34,34,1]):
            case = v.validate_witness(row); proof = v.glyph_evidence(case, index, label)
            self.assertTrue(proof['tipInside']); self.assertFalse(proof['allVerticesInside'])
            self.assertEqual(proof['parts'][1]['insideOpaqueRectangle'], cone_inside)
            self.assertEqual(proof['parts'][1]['vertices'], 34)

    def test_stress_minimum_and_maximum_have_identical_actual_image(self):
        a,b=self.rows[-2:]
        self.assertNotEqual(a['model']['y'], b['model']['y'])
        self.assertEqual(a['fullFramePngSha256'], b['fullFramePngSha256'])
        for row in [a,b]:
            case=v.validate_witness(row); proof=v.glyph_evidence(case,row['elementIndex'],row['label'])
            self.assertTrue(proof['allVerticesInside'])

    def test_no_full_occlusion_claim_when_one_vertex_is_outside(self):
        row=self.rows[-1]; case=v.validate_witness(row)
        glyph=next(g for g in case['nativeGlyphs'] if g['elementIndex']==row['elementIndex'])
        glyph['parts'][0]['vertices'][0][0] += 100
        self.assertFalse(v.glyph_evidence(case,row['elementIndex'],row['label'])['allVerticesInside'])

    def test_no_occlusion_claim_after_label_is_moved_clear(self):
        row=self.rows[-1]; case=v.validate_witness(row)
        label=next(l for l in case['labels'] if l['text']==row['label'])
        label['box']['x'] += 10000
        self.assertFalse(v.glyph_evidence(case,row['elementIndex'],row['label'])['allVerticesInside'])

    def test_sphere_has_nonzero_projected_extent_at_both_widths(self):
        for row in self.additional[3:]:
            case=v.validate_witness(row); index=next(i for i,e in enumerate(case['elements']) if e.get('kind')=='ball')
            label='Goccia' if case['id'].endswith('02') else 'Film a due facce'
            proof=v.sphere_evidence(case,index,label)
            self.assertTrue(proof['entireProjectedDiskBoundingSquareInside'])
            self.assertGreater(proof['projectedDiameterPixels'],0)

    def test_geometry_finite_guards_and_fallback_boundary(self):
        for bad in [math.inf,-math.inf,math.nan,True,'1',None]:
            with self.assertRaises(ValueError): v.finite(bad)
        row=self.rows[-1]; case=v.validate_witness(row)
        case['profile']['fallback']=True
        with self.assertRaises(ValueError): v.glyph_evidence(case,row['elementIndex'],row['label'])

    def test_manual_reading_and_sha_are_required(self):
        for field,value in [('actualFullFrameManuallyRead',False),('caseSha256','0'*64),('fullFramePngSha256','0'*64)]:
            row=copy.deepcopy(self.rows[0]);row[field]=value
            with self.assertRaises(ValueError):v.validate_witness(row)

    def test_separate_stefino_original_failure_and_corrected_draft(self):
        coverage=json.loads((v.BASE/'per-edition-coverage.json').read_bytes())
        original=next(r for r in coverage if r['id']=='SIM-C2-L002-01' and r['variant']=='published')
        draft=next(r for r in coverage if r['id']=='SIM-C2-L002-01' and r['variant']=='draft')
        self.assertTrue(any(q['input']=='15.0' and not q['expectedAccepted'] and q['status'].startswith('Rivedi') for q in original['questionStatuses']))
        self.assertTrue(all(q['expectedAccepted'] and q['status'].startswith('Corretto.') for q in draft['questionStatuses']))

    def test_every_edition_has_actual_coverage_and_honest_reading_limits(self):
        rows=json.loads((v.BASE/'per-edition-independent-conclusions.json').read_bytes())
        self.assertEqual(len(rows),42)
        self.assertEqual(sum(r['variant']=='published' for r in rows),41)
        for r in rows:
            self.assertTrue(r['wholeOverviewReading']['overviewWholeOpenedAndRead'])
            self.assertEqual(len(r['actualCounts']['profiles']),8)
            self.assertFalse(r['allPNGsManuallyRead'])
            self.assertFalse(r['scientificAcceptanceGranted'])
            self.assertEqual(r['activityCredit'],0)


if __name__ == '__main__':
    unittest.main()
