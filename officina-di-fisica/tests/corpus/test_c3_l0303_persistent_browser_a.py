import json,unittest
from tools.corpus_engineering import c3_l0303_persistent_browser_a as v
class GasMayerActual(unittest.TestCase):
 def test_fresh_saved(self):self.assertEqual(v.report(),json.loads((v.BASE/'independent-browser-review.json').read_bytes()))
 def test_exact_independent_entries(self):
  p=v.common.cpu.primary;self.assertEqual(str(p.law(v.ID,10)),'4157/50');self.assertEqual(str(p.law(v.ID,11)),'45727/500')
 def test_eight_profiles_and_48_actual(self):
  rows=[c for w in (320,1280)for c in v.common.actual(v.BASE/str(w),v.ID)];self.assertEqual(len(rows),48);self.assertEqual(sum('interaction'not in c for c in rows),8)
if __name__=='__main__':unittest.main(verbosity=2)
