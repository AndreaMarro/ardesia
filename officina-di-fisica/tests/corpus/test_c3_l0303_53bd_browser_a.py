import json,unittest
from tools.corpus_engineering import c3_l0303_53bd_browser_a as v
class NewMayerEpoch(unittest.TestCase):
 def test_fresh_saved(self):self.assertEqual(v.report(),json.loads((v.BASE/'independent-browser-review.json').read_bytes()))
 def test_exact48fields_and_observed46raster_pairs(self):self.assertEqual(v.compare(),{'pairedCases':48,'equalFields':48,'equalRasterPairs':46})
 def test_legacy_globals_remain_separate(self):
  before=(v.legacy.cpu.SOURCE,v.legacy.cpu.RUNTIME);v.report();self.assertEqual(before,(v.legacy.cpu.SOURCE,v.legacy.cpu.RUNTIME));self.assertNotEqual(v.SOURCE,before[0]);self.assertNotEqual(v.RUNTIME,before[1])
 def test_two_different_raster_identities_are_pinned(self):
  from hashlib import sha256
  raw=(v.BASE/'actual-7c-to-53bd-raster-comparison.json').read_bytes();self.assertEqual(sha256(raw).hexdigest(),'f432b2aed7d46af5aa2e455bd8960479f181ec003c647d9fe0ad2a0fdbd43b88');r=json.loads(raw);self.assertEqual(sum(not p['rasterBytesEqual'] for p in r['pairs']),2)
 def test_exact_mayer_and_constant_pressure_cue(self):
  p=v.legacy.cpu.primary;self.assertEqual(str(p.law(v.ID,10)),'4157/50');self.assertEqual(str(p.law(v.ID,11)),'45727/500');v.verify_pressure_cue()
 def test_new_epoch_exact_source_and_no_credit(self):
  r=v.report();self.assertEqual(r['sourceCommit'],v.SOURCE);self.assertEqual(r['runtimeSha256'],v.RUNTIME);self.assertEqual(r['activityCredit'],0);self.assertEqual(r['humanApproval'],'NOT_RUN')
if __name__=='__main__':unittest.main(verbosity=2)
