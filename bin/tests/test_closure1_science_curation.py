"""Scientific edition contract: original lesson structure, exact references, honest states."""
import hashlib
import json
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[2]
CONTENT=ROOT/'packages/engine/lessonos/study/content'
PACK=CONTENT/'sf-fluidi-termodinamica-v1.json'

class CurationTest(unittest.TestCase):
    def setUp(self):
        self.pack=json.loads(PACK.read_text())

    def test_acceptance_matrix_uses_current_prompt_rubric_and_expected_evidence(self):
        matrix=json.loads((ROOT/'docs/ops/closure1-20261028/coverage-matrix.json').read_text())
        items={q['id']:q for q in self.pack['atomicFinalAssessment']}
        for row in matrix['rows']:
            item=items[row['exercise']['itemId']]
            self.assertEqual(row['acceptance']['prompt'],item['prompt'])
            self.assertEqual(row['acceptance']['rubricRef']['itemId'],item['id'])
            self.assertEqual(row['acceptance']['expectedEvidence']['initial'],item['answer'])
            self.assertEqual(row['acceptance']['expectedEvidence']['transfer'],item['transfer']['expectedEvidence'])

    def test_selected_bank_refs_are_distinct_versioned_and_resolve(self):
        selection=self.pack['curatedPractice']
        bank=CONTENT/'physics-semestre-2026-bank'
        self.assertEqual(selection['manifestSha256'],hashlib.sha256((bank/'manifest.json').read_bytes()).hexdigest())
        questions={q['id']:q for f in (bank/'questions').glob('U[35]-*.json') for q in json.loads(f.read_text())}
        refs=selection['questionRefs']
        self.assertGreaterEqual(len(refs),150)
        self.assertEqual(len({r['id'] for r in refs}),len(refs))
        signatures=set()
        for ref in refs:
            q=questions[ref['id']]
            body={k:v for k,v in q.items() if k not in {'status','reviewer'}}
            sha=hashlib.sha256(json.dumps(body,ensure_ascii=False,sort_keys=True,separators=(',',':'),allow_nan=False).encode()).hexdigest()
            self.assertEqual(ref['sha256'],sha)
            self.assertEqual(ref['version'],q['version'])
            self.assertTrue(ref['objectiveIds'])
            self.assertNotIn('answer',ref)
            key=(q['lawFamily'],q['descriptors']['reasoningTask'])
            self.assertNotIn(key,signatures)
            signatures.add(key)
        worked=self.pack['workedProblemRefs']
        self.assertGreaterEqual(len(worked),40)
        self.assertTrue({r['id'] for r in worked}<={r['id'] for r in refs})
        self.assertEqual(len({questions[r['id']]['lawFamily'] for r in worked}),40)

    def test_two_disjoint_thematic_simulations_follow_verified_format(self):
        bank=CONTENT/'physics-semestre-2026-bank'
        qs={q['id']:q for f in (bank/'questions').glob('U[35]-*.json') for q in json.loads(f.read_text())}
        simulations=self.pack['examSimulations']
        self.assertEqual(len(simulations),2)
        sets=[]
        for sim in simulations:
            self.assertEqual(sim['scope'],'THEMATIC_U3_U5')
            self.assertEqual(sim['durationSeconds'],3000)
            refs=sim['questionRefs'];ids={r['id'] for r in refs};sets.append(ids)
            self.assertEqual(len(refs),31);self.assertEqual(len(ids),31)
            self.assertEqual(sum(qs[i]['format']=='multiple_choice' for i in ids),21)
            self.assertEqual(sum(qs[i]['format']=='completion' for i in ids),10)
            self.assertEqual(len({qs[i]['lawFamily'] for i in ids}),31)
            self.assertTrue(all(qs[i]['descriptors']['scope']=='syllabus_core' for i in ids))
            self.assertEqual(sum(qs[i]['taxonomy']['unitId']=='U3' for i in ids),15)
            self.assertEqual(sum(qs[i]['taxonomy']['unitId']=='U5' for i in ids),16)
            self.assertEqual(sim['scoring'],{'correct':1,'incorrect':-0.1,'omitted':0})
        self.assertFalse(sets[0]&sets[1])

if __name__=='__main__':unittest.main()
