import json,unittest
from tools.corpus_engineering import c3_l0301_53bd_browser_a as v
class NewEpoch(unittest.TestCase):
 def test_fresh_saved(self):self.assertEqual(v.report(),json.loads((v.BASE/'independent-browser-review.json').read_bytes()))
 def test_all48_pairs_same_fields_and_raster(self):self.assertEqual(v.compare(),{'pairedCases':48,'equalFields':48,'equalRasterPairs':48})
 def test_legacy_globals_remain_separate(self):
  before=(v.legacy.cpu.SOURCE,v.legacy.cpu.RUNTIME);v.report();self.assertEqual(before,(v.legacy.cpu.SOURCE,v.legacy.cpu.RUNTIME));self.assertNotEqual(v.SOURCE,before[0]);self.assertNotEqual(v.RUNTIME,before[1])
 def test_new_epoch_exact_source_and_no_credit(self):
  r=v.report();self.assertEqual(r['sourceCommit'],v.SOURCE);self.assertEqual(r['runtimeSha256'],v.RUNTIME);self.assertEqual(r['activityCredit'],0);self.assertEqual(r['humanApproval'],'NOT_RUN')
if __name__=='__main__':unittest.main(verbosity=2)
