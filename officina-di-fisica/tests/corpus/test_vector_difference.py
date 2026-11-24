from copy import deepcopy
from fractions import Fraction
from pathlib import Path
import json
import unittest
from unittest.mock import patch

from hypothesis import given,settings,strategies as st

from tools.corpus_engineering import vector_difference_verifier as verifier
from tools.corpus_engineering.review_contract import reviewed_rows
from tools.corpus_engineering.pipeline import digest

APP=Path(__file__).resolve().parents[2]


class OppositeDisplacements(unittest.TestCase):
    def load(self):
        home=APP/'editorial/batches'
        return json.loads((home/'vectors-difference-004.json').read_text()),json.loads((home/'vectors-difference-004-bindings.json').read_text())

    def test_all_independently_read_tasks_pass_on_the_exact_edition(self):
        package,bindings=self.load()
        result=verifier.verify(package,bindings)
        self.assertEqual(len(result),16)
        self.assertTrue(all(r['ok'] and r['manualArithmetic'] for r in result))

    def test_rebound_wrong_answer_is_rejected_by_mathematics_even_with_a_new_review_token(self):
        for index in (0,4,5,12,13,14,15):
            package,bindings=self.load();row=package['records'][index];binding=bindings[index]
            row['answer']['value']=row['answer']['value']+1 if row['answer']['type']=='numeric' else '7 m'
            binding['candidateSha256']=digest(row)
            key=row['id']
            signature=next(s for r,b,s,a,e in reviewed_rows(package,bindings,{},verifier.EXPECTED_IDS,APP/'editorial/assets') if r['id']==key)
            with patch.dict(verifier.REVIEWED_CANDIDATES,{key:signature}):
                result=next(r for r in verifier.verify(package,bindings) if r['id']==key)
                self.assertFalse(result['ok'])
                self.assertTrue(any('Independent coordinate/' in error for error in result['errors']))

    @settings(max_examples=60,deadline=None)
    @given(st.integers(1,10000),st.integers(1,10000),st.integers(1,100))
    def test_opposite_path_compensation_sign_and_common_scaling(self,back,remaining,scale):
        outward=back+remaining
        D=verifier.endpoint(outward,-back)
        self.assertEqual(D,remaining)
        self.assertEqual(verifier.endpoint(back,-outward),D)
        self.assertLess(D,outward+back)
        self.assertEqual(verifier.endpoint(scale*outward,-scale*back),scale*D)
        self.assertEqual(Fraction(D,outward+back),Fraction(remaining,2*back+remaining))
