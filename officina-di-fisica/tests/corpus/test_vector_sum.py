from copy import deepcopy
from pathlib import Path
import unittest
from fractions import Fraction

from hypothesis import given,settings,strategies as st
from tools.corpus_engineering.vector_sum_authoring import assemble
from tools.corpus_engineering.vector_sum_verifier import verify,walk
from tools.corpus_engineering.pipeline import digest

APP=Path(__file__).resolve().parents[2]
SOURCE="5cfbdcb055ba3ba136f97fb56e997f06e6cf3605"


class VectorSum(unittest.TestCase):
    @classmethod
    def setUpClass(cls):cls.pkg,cls.bindings=assemble(APP.parent,SOURCE)

    def test_sixteen_statements_have_independent_results(self):
        result=verify(self.pkg,self.bindings)
        self.assertEqual(len(result),16)
        self.assertTrue(all(r['ok'] for r in result),[(r['id'],r['errors']) for r in result if not r['ok']])

    def test_rebinding_wrong_coordinate_or_unit_fails(self):
        for index,value in ((5,"7"),(7,"−4 m"),(13,24)):
            pkg=deepcopy(self.pkg);bindings=deepcopy(self.bindings)
            pkg['records'][index]['answer']['value']=value
            bindings[index]['candidateSha256']=digest(pkg['records'][index])
            self.assertFalse(verify(pkg,bindings)[index]['ok'])

    def test_missing_result_or_binding_cannot_pass(self):
        with self.assertRaises(ValueError):verify({'records':self.pkg['records'][:5]},self.bindings)
        with self.assertRaises(ValueError):verify(self.pkg,self.bindings[:-1])

    @settings(max_examples=80,derandomize=True)
    @given(st.integers(-20,20),st.integers(1,15),st.integers(1,15))
    def test_position_and_displacement_are_distinct_but_consistent(self,origin,a,b):
        final=walk(origin,a,b)
        self.assertEqual(final-origin,walk(0,a,b))
        self.assertEqual(Fraction(walk(0,2*a,2*b),walk(0,a,b)),2)


if __name__=='__main__':unittest.main()
