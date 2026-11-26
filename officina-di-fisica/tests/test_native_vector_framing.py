"""Author regression for complete production-buffer framing; not SCI approval."""
from pathlib import Path
import unittest,subprocess,tempfile,json
APP=Path(__file__).resolve().parents[1];B=APP/'editorial/author-notes/native-vector-framing-correction-20261126'
class NativeVectorFraming(unittest.TestCase):
 def test_actual_production_buffers_fit_all_native_grids_and_presets(self):
  with tempfile.TemporaryDirectory(prefix='cric-framing-grid-')as folder:
   output=Path(folder)/'result.json';p=subprocess.run(['node',str(B/'check-full-grid-framing.mjs'),str(APP),str(output)],capture_output=True,text=True,timeout=120);self.assertEqual(p.returncode,0,p.stderr+p.stdout[-1200:]);r=json.loads(output.read_bytes());self.assertEqual(r['contexts'],740);self.assertEqual(r['projected'],6660);self.assertEqual(r['uncontained'],0);self.assertEqual(r['activityCredit'],0)
 def test_final264_actual_cases_are_fresh_bound_to_final_source_and_clear(self):
  root=B/'actual-final-ui-264';r=json.loads((root/'report.json').read_bytes());t=json.loads((root/'terminal-receipt.json').read_bytes());self.assertEqual(t['observedExitCode'],0);self.assertEqual(t['runtimeSha256'],'9279713a1f2cbb27fbb2014ae68d15b70f71ea3249c4ec33d7430a54a3fdcd0d');self.assertEqual(r['sourceCommit'],'ae842c451e3335b4d4caaee5d2656bdd3e58253c');self.assertEqual(len(r['cases']),264)
  import hashlib
  for c in r['cases']:
   raw=(root/c['file']).read_bytes();self.assertEqual(hashlib.sha256(raw).hexdigest(),c['sha256']);row=json.loads(raw);self.assertTrue(row['technicalOk']);self.assertEqual(row['runtimeSha256'],t['runtimeSha256']);self.assertEqual(row['activityCredit'],0)
   for img in row['screenshots']:self.assertEqual(hashlib.sha256((root/img['file']).read_bytes()).hexdigest(),img['sha256'])
  geometry=json.loads((B/'technical-geometry-final.json').read_bytes());self.assertEqual(len(geometry['cases']),200);self.assertEqual(geometry['observationsRequiringReview'],[])
 def test_frozen_real_historical_pair_matches_geometry_not_png_bytes(self):
  r=json.loads((B/'historical-pair-comparison.json').read_bytes());self.assertEqual(len(r['records']),2)
  for c in r['records']:
   self.assertTrue(c['nativeWholeGlyphVerticesAndCameraIdentical']);self.assertTrue(c['nonLabelElementsIdentical']);self.assertTrue(c['actualHistoricalPngOpened']);self.assertNotEqual(c['historicalPng']['sha256'],c['currentPng']['sha256'])
if __name__=='__main__':unittest.main()
