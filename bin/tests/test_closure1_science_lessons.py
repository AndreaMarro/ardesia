"""Scientific edition contract: original lesson structure, exact references, honest states."""
import hashlib
import json
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[2]
CONTENT=ROOT/'packages/engine/lessonos/study/content'
PACK=CONTENT/'sf-fluidi-termodinamica-v1.json'

class LessonsTest(unittest.TestCase):
    def setUp(self):
        self.pack=json.loads(PACK.read_text())

    def test_ten_families_have_full_learning_sequences_and_specific_transfer(self):
        lessons=[l for l in self.pack['lessons'] if l.get('familyId')]
        self.assertEqual(len(lessons),10)
        for lesson in lessons:
            self.assertTrue(lesson['observableObjective'])
            self.assertTrue(lesson['prerequisiteRecovery']['miniReview'])
            phases={s['kind'] for s in lesson['learningSequence']}
            self.assertTrue({'prediction','manipulation','comparison','explanation','annotation','guided','independent','transfer','feedback','recap'} <= phases)
            self.assertEqual(len(lesson['objectiveSections']),len(lesson['objectiveIds']))
            for oid,index in lesson['objectiveSections'].items():
                self.assertIn(oid,lesson['objectiveIds'])
                self.assertTrue(lesson['explanation'][index])
            self.assertIs(lesson['humanApproval'],False)
        assessment=self.pack['atomicFinalAssessment']
        self.assertEqual(len(assessment),57)
        self.assertEqual(len({q['transfer']['prompt'] for q in assessment}),57)
        for item in assessment:
            self.assertTrue(item['rubric']['criteria'])
            self.assertTrue(item['transfer']['expectedEvidence'])
            self.assertTrue(item['hints'])
            self.assertTrue(item['errorFeedback'])
            self.assertIs(item['rubric']['teacherReviewRequired'],True)

if __name__=='__main__':unittest.main()
