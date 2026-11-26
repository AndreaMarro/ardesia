"""Author regression for complete production-buffer framing; not SCI approval."""
from pathlib import Path
import unittest,subprocess,tempfile,json
APP=Path(__file__).resolve().parents[1];B=APP/'editorial/author-notes/native-vector-framing-correction-20261126'
class NativeVectorFraming(unittest.TestCase):
 def test_actual_production_buffers_fit_all_native_grids_and_presets(self):
  with tempfile.TemporaryDirectory(prefix='cric-framing-grid-')as folder:
   output=Path(folder)/'result.json';p=subprocess.run(['node',str(B/'check-full-grid-framing.mjs'),str(APP),str(output)],capture_output=True,text=True,timeout=120);self.assertEqual(p.returncode,0,p.stderr+p.stdout[-1200:]);r=json.loads(output.read_bytes());self.assertEqual(r['contexts'],740);self.assertEqual(r['projected'],6660);self.assertEqual(r['uncontained'],0);self.assertEqual(r['activityCredit'],0)
 def test_frozen_real_historical_pair_matches_geometry_not_png_bytes(self):
  r=json.loads((B/'historical-pair-comparison.json').read_bytes());self.assertEqual(len(r['records']),2)
  for c in r['records']:
   self.assertTrue(c['nativeWholeGlyphVerticesAndCameraIdentical']);self.assertTrue(c['nonLabelElementsIdentical']);self.assertTrue(c['actualHistoricalPngOpened']);self.assertNotEqual(c['historicalPng']['sha256'],c['currentPng']['sha256'])
if __name__=='__main__':unittest.main()
