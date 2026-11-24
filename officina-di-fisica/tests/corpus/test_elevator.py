import json
from pathlib import Path
import unittest
from unittest.mock import patch
from hypothesis import given,settings,strategies as st
import sympy as sp
from tools.corpus_engineering import elevator_apparent_weight_verifier as verifier
from tools.corpus_engineering.pipeline import digest
from tools.corpus_engineering.review_contract import reviewed_rows

APP=Path(__file__).resolve().parents[2]


class InertialNormalForceEvidence(unittest.TestCase):
    def load(self):
        home=APP/'editorial/batches'
        return json.loads((home/'elevator-apparent-weight-032.json').read_text()),json.loads((home/'elevator-apparent-weight-032-bindings.json').read_text())

    def test_all_sixteen_final_editions_pass(self):
        p,b=self.load();records=verifier.verify(p,b)
        self.assertEqual(len(records),16)
        self.assertTrue(all(r['ok'] and r['manualArithmetic'] for r in records))

    def test_every_wrong_answer_fails_even_when_binding_and_review_token_are_forged(self):
        for index in range(16):
            p,b=self.load();row=p['records'][index];answer=row['answer']
            answer['value']=answer['value']+1 if answer['type']=='numeric' else next(v for v in answer['options'] if v!=answer['value'])
            b[index]['candidateSha256']=digest(row)
            token=next(s for r,bind,s,assets,errors in reviewed_rows(p,b,{},verifier.EXPECTED_IDS,APP/'editorial/assets') if r['id']==row['id'])
            with patch.dict(verifier.REVIEWED_CANDIDATES,{row['id']:token}):
                result=next(r for r in verifier.verify(p,b) if r['id']==row['id'])
            self.assertFalse(result['ok'])
            self.assertIn('Independent inertial normal-force solution mismatch',result['errors'])

    @settings(max_examples=50,deadline=None)
    @given(st.integers(1,1000),st.integers(1,100),st.integers(1,30))
    def test_upward_contact_and_mass_scaling(self,mass,acceleration,scale):
        m,a,g,law=verifier.model();normal=law.subs({m:mass,a:acceleration,g:10})
        self.assertGreater(normal,10*mass)
        self.assertEqual(normal-10*mass,mass*acceleration)
        self.assertEqual(law.subs({m:scale*mass,a:acceleration,g:10}),scale*normal)
        self.assertEqual(sp.simplify((normal/mass)-10),acceleration)
