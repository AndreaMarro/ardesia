import copy
import hashlib
import json
import math
from pathlib import Path
from fractions import Fraction as Q
import unittest
from tools.corpus_engineering import c2_pitot_label_geometry_a as geometry

APP=Path(__file__).resolve().parents[2]
BASE=APP/'editorial/reviews/c2-fluid-labels-final-independent-a-20261127'
RUNTIME='3427e7b01ac90755c824e23fe0aca9b92ecf367528e39f078c977d16ff1559e2'


class Pitot3427Independent(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.report=json.loads((BASE/'canary-actual/report.json').read_bytes())
        cls.prepared=json.loads((BASE/'canary-prepared.json').read_bytes())
        cls.cases={}
        for item in cls.report['cases']:
            raw=(BASE/'canary-actual'/item['file']).read_bytes()
            if hashlib.sha256(raw).hexdigest()!=item['sha256']:raise ValueError('Actual case drift')
            cls.cases[item['caseKey']]=geometry.load_exact(raw)

    def test_actual_new_epoch_and_terminal(self):
        terminal=json.loads((BASE/'canary-actual-terminal.json').read_bytes())
        self.assertEqual(terminal['actualObservedExitCode'],0)
        self.assertIsNone(terminal['signal'])
        self.assertEqual(self.report['runtimeFingerprint']['sha256'],RUNTIME)
        self.assertEqual(self.report['sourceCommit'],'45c8c4bb42926e99b564bba697ed352bf7ee82d5')
        self.assertEqual(self.report['preparedSha256'],hashlib.sha256((BASE/'canary-prepared.json').read_bytes()).hexdigest())
        self.assertEqual(self.report['errors'],[])

    def test_twelve_cases_all_actual_screenshots_unchanged(self):
        self.assertEqual(len(self.cases),12)
        self.assertEqual(set(self.cases),set(self.prepared['expectedCaseKeys']))
        for c in self.cases.values():
            self.assertEqual(c['runtimeSha256'],RUNTIME)
            self.assertTrue(c['technicalOk'])
            self.assertFalse(c['scientificApproval'])
            for p in c['screenshots']:
                self.assertEqual(hashlib.sha256((BASE/'canary-actual'/p['file']).read_bytes()).hexdigest(),p['sha256'])

    def test_remaining_single_native_label(self):
        for c in self.cases.values():
            if 'interaction'in c and not c['profile']['fallback']:
                self.assertEqual([l['text']for l in c['labels']],['Uscita'])

    def test_exact_cone_area_is_over_ninety_five_percent(self):
        c=self.cases['SIM-C2-L006-02|published|320|top|grid|1']
        fraction=geometry.part_coverage(c,14,1,'Uscita')
        self.assertIsInstance(fraction,Q)
        self.assertGreater(fraction,Q(95,100))
        self.assertLess(fraction,Q(96,100))
        frozen=json.loads((BASE/'exact-label-intersection-inventory.json').read_bytes())
        row=next(r for r in frozen['canaryCases']if r['caseKey']==c['caseKey'])
        self.assertEqual(str(fraction),row['intersections'][0]['coveredFraction']['exactFraction'])
        self.assertEqual(row['intersections'][0]['insideStoredVertexCount'],1)
        self.assertEqual(row['intersections'][0]['totalStoredVertices'],34)
        self.assertNotEqual(fraction,Q(1,34))

    def test_no_overlap_at_minimum_or_wider_profile(self):
        for key in ['SIM-C2-L006-02|published|320|top|grid|0',
                    'SIM-C2-L006-02|published|1280|top|grid|0',
                    'SIM-C2-L006-02|published|1280|top|grid|1']:
            self.assertEqual(geometry.part_coverage(self.cases[key],14,1,'Uscita'),0)

    def test_clear_rectangle_removes_area_intersection(self):
        c=copy.deepcopy(self.cases['SIM-C2-L006-02|published|320|top|grid|1'])
        c['labels'][0]['box']['x']+=10000
        self.assertEqual(geometry.part_coverage(c,14,1,'Uscita'),0)

    def test_exact_clip_synthetic_rational_triangle(self):
        poly=geometry.hull([(0,0),(10,0),(0,10)])
        box={'x':Q(15,2),'y':5,'w':5,'h':10}
        self.assertEqual(geometry.area(poly),50)
        self.assertEqual(geometry.area(geometry.clip(poly,box)),Q(25,2))
        self.assertEqual(geometry.clip(poly,{'x':100,'y':100,'w':1,'h':1}),[])

    def test_rejects_float_roundtrip_nonfinite_and_bad_dimensions(self):
        for value in [1.0,math.inf,-math.inf,math.nan,True,'1',None,1j]:
            with self.assertRaises(ValueError):geometry.exact(value)
        for raw in ['NaN','Infinity','-Infinity']:
            with self.assertRaises(ValueError):geometry.load_exact(raw)
        with self.assertRaises(ValueError):geometry.clip([(Q(0),Q(0))],{'x':0,'y':0,'w':0,'h':1})
        self.assertEqual(geometry.load_exact('1.25'),Q(5,4))
        self.assertEqual(geometry.load_exact('294'),Q(294))

    def test_source_predicted_cone_inside_metal_at_three_middle_controls(self):
        for x in [Q(17,4),Q(9,2),Q(19,4)]:
            p=geometry.middle_control_cone_inside_probe(x)
            self.assertTrue(p['insideOpaqueMetalCylinder'])
            self.assertGreater(p['jointX'],Q(51,50))
            self.assertLess(p['tipX'],Q(7,5))
            self.assertLess(p['coneMaximumRadius'],p['metalRadius'])
        self.assertFalse(geometry.middle_control_cone_inside_probe(Q(1,4))['insideOpaqueMetalCylinder'])
        self.assertFalse(geometry.middle_control_cone_inside_probe(5)['insideOpaqueMetalCylinder'])

    def test_previous_tip_contact_is_not_vertex_fraction_area(self):
        p=APP/'editorial/reviews/c2-41-cb9-actual-ui-peer-a-20261127/additional-full-frame-witnesses/03-SIM-C2-L009-03.json'
        fraction=geometry.part_coverage(geometry.load_exact(p.read_bytes()),5,1,'Presa intermedia')
        self.assertGreater(fraction,Q(18,100))
        self.assertLess(fraction,Q(19,100))
        self.assertNotEqual(fraction,Q(1,34))

    def test_physical_fields_and_five_stages_unchanged_except_twenty_one_labels(self):
        p=json.loads((BASE/'actual-independent-static-comparison.json').read_bytes())
        self.assertEqual((p['originalEditions'],p['controls'],p['states'],p['sceneComparisons']),(41,555,875,4375))
        self.assertEqual(sum(len(r['onlyRemovedLabels'])for r in p['records']),21)
        self.assertTrue(all(r['allFiveStagesExactExceptAuthorizedLabel']for r in p['records']))
        self.assertTrue(all(r['numericalAndGraphAndTaskFieldsIdentical']for r in p['records']))

    def test_fallback_and_names_preserved_without_granting_acceptance(self):
        for c in self.cases.values():
            if 'interaction'in c:
                self.assertIn('entrata',c['legend'].lower())
                self.assertIn('uscita',c['legend'].lower())
                self.assertIn('presa frontale',c['legend'].lower())
                self.assertEqual(c['legendLayout']['scrollWidth'],c['legendLayout']['width'])
                if c['profile']['fallback']:
                    with self.assertRaises(ValueError):geometry.part_coverage(c,14,1,'Uscita')
            self.assertEqual(c['activityCredit'],0)
            self.assertEqual(c['humanApproval'],'NOT_RUN')


if __name__=='__main__':unittest.main()
