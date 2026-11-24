from pathlib import Path
import json
import unittest
from unittest.mock import patch

from hypothesis import given,settings,strategies as st
import sympy as sp
from tools.corpus_engineering import vector_perpendicular_verifier as perpendicular,scalar_product_verifier as scalar
from tools.corpus_engineering.review_contract import reviewed_rows
from tools.corpus_engineering.pipeline import digest

APP=Path(__file__).resolve().parents[2]
CASES=[('vectors-perpendicular-005',perpendicular),('scalar-product-006',scalar)]


class Components(unittest.TestCase):
    def load(self,batch):
        return (json.loads((APP/'editorial/batches'/(batch+'.json')).read_text()),
                json.loads((APP/'editorial/batches'/(batch+'-bindings.json')).read_text()))

    def test_all_thirty_two_independently_read_tasks_have_exact_evidence(self):
        for batch,module in CASES:
            pkg,bindings=self.load(batch);results=module.verify(pkg,bindings)
            self.assertEqual(len(results),16)
            self.assertTrue(all(r['ok'] and r['manualArithmetic'] for r in results))

    def test_wrong_choices_and_numbers_fail_even_when_rebound_and_retokenized(self):
        for batch,module in CASES:
            for index in (0,2,4,5,6,10,11,12,13,14,15):
                pkg,bindings=self.load(batch);row=pkg['records'][index];target=row['answer'];key=row['id']
                target['value']=(target['value']+1 if target['type']=='numeric' else next(o for o in target['options'] if o!=target['value']))
                bindings[index]['candidateSha256']=digest(row)
                token=next(s for r,b,s,a,e in reviewed_rows(pkg,bindings,{},module.EXPECTED_IDS,APP/'editorial/assets') if r['id']==key)
                with patch.dict(module.REVIEWED_CANDIDATES,{key:token}):
                    result=next(r for r in module.verify(pkg,bindings) if r['id']==key)
                    self.assertFalse(result['ok'])
                    self.assertTrue(any('Independent' in error for error in result['errors']))

    @settings(max_examples=50,deadline=None)
    @given(st.integers(1,1000),st.integers(1,1000),st.integers(1,20))
    def test_cartesian_norm_bounds_symmetry_and_scale(self,a,b,k):
        length=perpendicular.norm(a,b)
        self.assertGreater(length,max(a,b))
        self.assertLess(length,a+b)
        self.assertEqual(perpendicular.norm(b,a),length)
        self.assertEqual(perpendicular.norm(k*a,k*b),k*length)
        self.assertEqual(scalar.dot(a,b,sp.pi/2),0)
        self.assertEqual(scalar.dot(a,b,sp.pi),-scalar.dot(a,b))
