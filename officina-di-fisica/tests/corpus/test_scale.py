from copy import deepcopy
from pathlib import Path
import unittest

from hypothesis import given, settings, strategies as st
from tools.corpus_engineering.scale_authoring import assemble
from tools.corpus_engineering.scale_verifier import verify, decimal_scale
from tools.corpus_engineering.pipeline import digest

APP=Path(__file__).resolve().parents[2]
SOURCE="5cfbdcb055ba3ba136f97fb56e997f06e6cf3605"


class ScientificScale(unittest.TestCase):
    @classmethod
    def setUpClass(cls): cls.pkg,cls.bindings=assemble(APP.parent,SOURCE)

    def test_sixteen_individually_solved_tasks(self):
        result=verify(self.pkg,self.bindings)
        self.assertEqual(len(result),16)
        self.assertTrue(all(r["ok"] for r in result),[(r["id"],r["errors"]) for r in result if not r["ok"]])

    def test_mutated_statement_or_key_cannot_renew_the_review(self):
        for field,value in [("prompt","Il coefficiente ora vale nove."),("answer",{"type":"numeric","value":21,"unit":"1","tolerance":0})]:
            pkg=deepcopy(self.pkg);bindings=deepcopy(self.bindings)
            pkg["records"][0][field]=value
            bindings[0]["candidateSha256"]=digest(pkg["records"][0])
            self.assertFalse(verify(pkg,bindings)[0]["ok"])

    def test_rebound_source_and_missing_ids_fail(self):
        bindings=deepcopy(self.bindings);bindings[0]["sourceSha256"]="0"*64
        self.assertFalse(verify(self.pkg,bindings)[0]["ok"])
        for rows in ([],self.pkg["records"][:4],self.pkg["records"]+[self.pkg["records"][0]]):
            with self.assertRaises(ValueError):verify({"records":rows},self.bindings)

    def test_both_calibration_systems_and_unknown_exponent(self):
        rows={r["id"]:r for r in verify(self.pkg,self.bindings)}
        self.assertEqual(rows["AR-u1-scientific-scale-14"]["expectedExact"],"4")
        self.assertEqual(rows["AR-u1-scientific-scale-15"]["expectedExact"],"4")
        self.assertEqual(rows["AR-u1-scientific-scale-16"]["expectedExact"],"7")

    def test_unreviewed_orphan_asset_cannot_enter_a_verified_batch(self):
        import base64,hashlib
        pkg=deepcopy(self.pkg)
        raw=b'<svg xmlns="http://www.w3.org/2000/svg"><text>unreviewed</text></svg>'
        pkg["assets"].append({"id":hashlib.sha256(raw).hexdigest(),"name":"orphan.svg","mime":"image/svg+xml","data":base64.b64encode(raw).decode()})
        with self.assertRaises(ValueError):verify(pkg,self.bindings)

    @settings(max_examples=80,derandomize=True)
    @given(st.integers(1,9),st.integers(-8,8),st.integers(1,5))
    def test_decimal_scaling_inverse_and_exponent_increment(self,a,n,k):
        self.assertEqual(decimal_scale(a,n+1),10*decimal_scale(a,n))
        self.assertEqual(decimal_scale(k*a,n)/decimal_scale(a,n),k)
