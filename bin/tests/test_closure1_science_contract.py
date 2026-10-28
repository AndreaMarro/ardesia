"""Reference and honesty checks for the scientific commissioning contract.

These tests do not certify lesson quality, a human review, or a working lab.
"""
import hashlib
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[2]
DOC = ROOT / 'docs/ops/closure1-20261028'
CONTENT = ROOT / 'packages/engine/lessonos/study/content'

def read(path):
    return json.loads(path.read_text())

class ScienceContractTest(unittest.TestCase):
    def test_exact_57_canonical_targets_have_resolving_references(self):
        matrix = read(DOC / 'coverage-matrix.json')
        baseline = read(CONTENT / 'physics-curriculum-2026-v1.json')
        pack = read(CONTENT / 'sf-fluidi-termodinamica-v1.json')
        targets = {t['id'] for f in baseline['families'] if f['pathId'] == 'fluidi-termodinamica' for t in f['subtargets']}
        self.assertEqual(len(targets), 57)
        self.assertEqual({r['objectiveId'] for r in matrix['rows']}, targets)
        self.assertEqual(len(matrix['rows']), 57)
        self.assertEqual(matrix['baselineSha256'], hashlib.sha256((CONTENT / 'physics-curriculum-2026-v1.json').read_bytes()).hexdigest())
        lessons = {l['id']: l for l in pack['lessons']}
        items = {q['id']: q for q in pack['atomicFinalAssessment']}
        labs = {l['id']: l for l in read(DOC / 'laboratory-specifications.json')['labs']}
        for row in matrix['rows']:
            self.assertIn(row['objectiveId'], lessons[row['explanation']['lessonId']]['objectiveIds'])
            self.assertTrue(lessons[row['explanation']['lessonId']]['explanation'])
            self.assertEqual(items[row['exercise']['itemId']]['objectiveId'], row['objectiveId'])
            self.assertIn(row['objectiveId'], labs[row['laboratorySpecId']]['objectives'])
            self.assertIn(row['transfer']['lessonId'], lessons)
            self.assertTrue(row['prerequisites'])
            self.assertTrue(row['typicalError']['correction'])
            self.assertGreaterEqual(len(row['acceptance']['requiredEvidence']), 7)
            self.assertIn(row['status'], ['DRAFT', 'VALIDATED_TECHNICALLY', 'REVIEWED_HUMAN', 'ACCEPTED'])
        self.assertEqual(matrix['acceptedCount'], sum(r['status'] == 'ACCEPTED' for r in matrix['rows']))
        for row in matrix['rows']:
            if row['status'] == 'ACCEPTED':
                self.assertEqual(row['acceptance']['interactionTest'], 'PASS')
                self.assertNotEqual(row['acceptance']['humanReview'], 'NOT_RUN')

    def test_ten_labs_have_testable_controls_limits_and_followup(self):
        labs = read(DOC / 'laboratory-specifications.json')['labs']
        self.assertEqual(len(labs), 10)
        self.assertEqual(len({l['id'] for l in labs}), 10)
        self.assertEqual(len({o for l in labs for o in l['objectives']}), 57)
        for lab in labs:
            for field in ('misconception', 'variables', 'prediction', 'expectedBehavior', 'representations', 'interaction', 'modelLimits', 'followup', 'evidence', 'accessibility'):
                self.assertTrue(lab[field], (lab['id'], field))
            self.assertGreaterEqual(len(lab['independentScientificTests']), 2)
            for case in lab['independentScientificTests']:
                self.assertIn('expectedError' if 'invalid' in case else 'expected', case)
                if 'expected' in case:
                    self.assertGreater(case['absTolerance'], 0)
            for variable in lab['variables']:
                if 'min' in variable:
                    self.assertLess(variable['min'], variable['max'])
            self.assertEqual(lab['humanReview'], 'NOT_RUN')

    def test_official_source_bytes_match_preexisting_mirror(self):
        registry = read(DOC / 'scientific-sources.json')
        mirror = registry['officialMirrorByteEquality']
        self.assertEqual(hashlib.sha256((ROOT / mirror['repositoryMirror']).read_bytes()).hexdigest(), mirror['sha256'])
        sources = {s['id']: s for s in registry['sources']}
        self.assertTrue(sources['MUR-FISICA-2026-OFFICIAL']['url'].startswith('https://www.mur.gov.it/'))
        self.assertEqual(sources['MUR-FISICA-2026-OFFICIAL']['sha256'], mirror['sha256'])
        self.assertTrue(registry['limits'])

if __name__ == '__main__':
    unittest.main()
