import json,unittest
from tools.corpus_engineering import c3_l0304_53bd_browser_a as v
class MixtureActual(unittest.TestCase):
 def test_fresh_saved(self):self.assertEqual(v.report(),json.loads((v.BASE/'independent-browser-review.json').read_bytes()))
 def test_exact_balance_and_inverse(self):
  p=v.legacy.cpu.primary
  for x in range(50,301,25):
   t=p.law(v.ID,x);self.assertEqual(x*(80-t),200*(t-20));self.assertEqual(p.inverse(v.ID,t),x)
  self.assertEqual(p.law(v.ID,200),50);self.assertEqual(p.law(v.ID,175),48)
 def test_all48_actual_and_8setups(self):
  actual,_=v.bind();rows=[c for w in (320,1280)for c in actual(v.BASE/str(w),v.ID)];self.assertEqual(len(rows),48);self.assertEqual(sum('interaction'not in c for c in rows),8);v.verify_mixture_cues()
 def test_legacy_globals_unchanged(self):
  before=(v.legacy.cpu.SOURCE,v.legacy.cpu.RUNTIME);v.report();self.assertEqual(before,(v.legacy.cpu.SOURCE,v.legacy.cpu.RUNTIME));self.assertNotEqual(v.RUNTIME,before[1])
 def test_exact_domain_and_zero_credit(self):
  for x in [True,50.0,0,301,float('inf')]:
   with self.assertRaises(ValueError):v.legacy.cpu.primary.law(v.ID,x)
  r=v.report();self.assertEqual(r['runtimeSha256'],v.RUNTIME);self.assertEqual(r['activityCredit'],0);self.assertEqual(r['humanApproval'],'NOT_RUN')
if __name__=='__main__':unittest.main(verbosity=2)
