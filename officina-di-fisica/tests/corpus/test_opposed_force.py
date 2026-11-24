import json
from pathlib import Path
import unittest
from unittest.mock import patch

from hypothesis import given,settings,strategies as st
import sympy as sp

from tools.corpus_engineering import opposed_force_acceleration_verifier as verifier
from tools.corpus_engineering.pipeline import digest
from tools.corpus_engineering.review_contract import reviewed_rows

APP=Path(__file__).resolve().parents[2]


class OneBodyNewtonEvidence(unittest.TestCase):
    def load(self):
        home=APP/'editorial/batches'
        return json.loads((home/'opposed-force-acceleration-031.json').read_text()),json.loads((home/'opposed-force-acceleration-031-bindings.json').read_text())

    def test_sixteen_individually_read_tasks_have_fresh_evidence(self):
        p,b=self.load();rows=verifier.verify(p,b)
        self.assertEqual(len(rows),16)
        self.assertTrue(all(r['ok'] and r['manualArithmetic'] for r in rows))

    def test_every_rebound_and_retokened_wrong_answer_fails_the_physics(self):
        for index in range(16):
            p,b=self.load();row=p['records'][index];a=row['answer']
            a['value']=a['value']+1 if a['type']=='numeric' else next(v for v in a['options'] if v!=a['value'])
            b[index]['candidateSha256']=digest(row)
            token=next(s for r,bind,s,assets,errors in reviewed_rows(p,b,{},verifier.EXPECTED_IDS,APP/'editorial/assets') if r['id']==row['id'])
            with patch.dict(verifier.REVIEWED_CANDIDATES,{row['id']:token}):
                result=next(r for r in verifier.verify(p,b) if r['id']==row['id'])
            self.assertFalse(result['ok'],row['id'])
            self.assertIn('Independent one-body Newton solution mismatch',result['errors'])

    @settings(max_examples=50,deadline=None)
    @given(st.integers(1,1000),st.integers(1,1000),st.integers(1,100),st.integers(1,100))
    def test_common_force_offset_and_common_mass_force_scaling(self,opposition,excess,mass,scale):
        F,R,M,law=verifier.dynamics();force=opposition+excess
        a=law.subs({F:force,R:opposition,M:mass})
        self.assertEqual(law.subs({F:force+scale,R:opposition+scale,M:mass}),a)
        self.assertEqual(law.subs({F:scale*force,R:scale*opposition,M:scale*mass}),a)
        self.assertEqual(sp.simplify(a-sp.Rational(excess,mass)),0)
