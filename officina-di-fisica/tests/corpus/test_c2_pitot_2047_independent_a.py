import copy
import hashlib
import json
from fractions import Fraction as Q
import unittest
from tools.corpus_engineering import c2_pitot_2047_review_a as v


class Pitot2047Independent(unittest.TestCase):
    @classmethod
    def setUpClass(cls):cls.cases={c['caseKey']:c for c in v.actual_cases()}

    def test_current_fifty_six_real_cases_include_previous_twelve(self):
        self.assertEqual(len(self.cases),56)
        prior=json.loads((v.APP/'editorial/reviews/c2-fluid-labels-final-independent-a-20261127/canary-prepared.json').read_bytes())
        self.assertTrue(set(prior['expectedCaseKeys'])<set(self.cases))
        self.assertNotEqual(v.RUNTIME,prior['runtimeFingerprint']['sha256'])

    def test_all_eight_profiles_six_controls_and_actual_position(self):
        profiles={}
        for c in self.cases.values():
            if 'interaction'not in c:continue
            key=c['profile']['width'],c['profile']['view']
            profiles.setdefault(key,set()).add(c['sourceReplayedX'])
            self.assertEqual(c['sourceReplayedX'],c['model']['x'])
            self.assertEqual(c['model']['y'],c['sourceReplayedX']**2/2)
        self.assertEqual(len(profiles),8)
        self.assertTrue(all(x=={0,.25,4.25,4.5,4.75,5}for x in profiles.values()))

    def test_zero_has_no_source_arrows_or_native_glyphs(self):
        zeros=[c for c in self.cases.values()if c.get('sourceReplayedX')==0]
        self.assertEqual(len(zeros),8)
        for c in zeros:
            self.assertFalse(any(e['kind']=='arrow'for e in c['elements']))
            self.assertEqual(c.get('nativeGlyphs',[]),[])
            if c['profile']['fallback']:self.assertEqual(v.fallback_metal_coverage(c),[])

    def test_both_vector_origins_height_length_and_z_translation(self):
        for c in self.cases.values():
            if 'interaction'not in c or c['sourceReplayedX']==0:continue
            arrows=[e for e in c['elements']if e['kind']=='arrow']
            self.assertEqual(len(arrows),2)
            for arrow in arrows:
                self.assertEqual(arrow['a'][1:], [1.05,.23])
                self.assertEqual(arrow['b'][1:], [1.05,.23])
                self.assertEqual(arrow['b'][0],arrow['a'][0]+.8*(c['sourceReplayedX']/4))
            self.assertEqual(arrows[0]['a'][0],-2.17)
            self.assertEqual(arrows[1]['a'][0],.44)

    def test_native_no_labels_and_mesh_separated_from_probe_axis(self):
        count=0
        for c in self.cases.values():
            if 'interaction'not in c or c['profile']['fallback']:continue
            self.assertEqual(c['labels'],[])
            for glyph in c['nativeGlyphs']:
                for part in glyph['parts']:
                    self.assertGreater(min(p[2]for p in part['vertices']),.14)
                    count+=1
        self.assertEqual(count,120)

    def test_fallback_intermediate_apex_and_area_are_still_covered(self):
        for width in [320,1280]:
            case=self.cases[f'SIM-C2-L006-02|published|{width}|fixed_projection|grid|3']
            proof=v.fallback_metal_coverage(case)
            self.assertEqual(len(proof),1)
            self.assertTrue(proof[0]['apexHidden'])
            self.assertGreater(proof[0]['fraction'],Q(75,100))
            self.assertLess(proof[0]['fraction'],Q(76,100))
            self.assertGreater(proof[0]['opaqueProbeOrder'],proof[0]['headOrder'])

    def test_svg_paint_order_fault_is_distinct_from_geometry(self):
        case=copy.deepcopy(self.cases['SIM-C2-L006-02|published|1280|fixed_projection|grid|3'])
        import xml.etree.ElementTree as ET
        root=ET.fromstring(case['svg'])
        head=next(e for e in root if e.tag.split('}')[-1]=='polygon'and e.get('fill')=='#7350b0')
        root.remove(head);root.append(head)
        case['svg']=ET.tostring(root,encoding='unicode')
        self.assertEqual(v.fallback_metal_coverage(case),[])

    def test_partial_head_coverage_at_other_high_controls(self):
        for width in [320,1280]:
            for index,lower,upper in [(1,35,36),(4,74,75),(5,60,61)]:
                p=v.fallback_metal_coverage(self.cases[f'SIM-C2-L006-02|published|{width}|fixed_projection|grid|{index}'])
                self.assertEqual(len(p),1)
                self.assertGreater(p[0]['fraction'],Q(lower,100))
                self.assertLess(p[0]['fraction'],Q(upper,100))

    def test_small_control_is_not_claimed_occluded(self):
        for width in [320,1280]:
            self.assertEqual(v.fallback_metal_coverage(self.cases[f'SIM-C2-L006-02|published|{width}|fixed_projection|grid|0']),[])

    def test_names_offset_explanation_and_keyboard_legend_metrics(self):
        for c in self.cases.values():
            if 'interaction'not in c:continue
            for text in ['entrata','uscita','presa frontale','spostate di lato']:
                self.assertIn(text,c['legend'].lower())
            self.assertEqual(c['legendLayout']['scrollWidth'],c['legendLayout']['width'])

    def test_static_source_fields_unchanged_and_only_authorized_scene_delta(self):
        p=json.loads((v.BASE/'actual-independent-static-comparison.json').read_bytes())
        self.assertEqual((p['originalEditions'],p['controls'],p['states'],p['sceneComparisons']),(41,555,875,4375))
        self.assertEqual(sum(len(r['onlyRemovedLabels'])for r in p['records']),22)
        self.assertTrue(all(r['allFiveStagesExactExceptAuthorizedLabelsAndPitotParallelZTranslation']for r in p['records']))
        self.assertTrue(all(r['numericalAndGraphAndTaskFieldsIdentical']for r in p['records']))

    def test_624_not_started_and_no_false_acceptance(self):
        p=json.loads((v.BASE/'independent-disposition.json').read_bytes())
        self.assertEqual(p['next624Status'],'SUSPENDED_ON2047_PENDING_SVG_PAINT_ORDER_CORRECTION')
        self.assertFalse(p['scientificAcceptanceGranted'])
        self.assertEqual(p['activityCredit'],0)
        self.assertEqual(p['humanApproval'],'NOT_RUN')


if __name__=='__main__':unittest.main()
