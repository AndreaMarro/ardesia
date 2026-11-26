from pathlib import Path
import unittest,json,hashlib
APP=Path(__file__).resolve().parents[2];B=APP/'editorial/reviews/c1-work-axis-side-historical-1a-20261126';O=B/'actual-ui-2'
def read(p):return json.loads(p.read_bytes())
class HistoricalAxis(unittest.TestCase):
 def test_real_1a_runtime_and_terminal_exit(self):
  r=read(O/'report.json');self.assertEqual(r['runtimeFingerprint']['sha256'],'1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba');self.assertEqual(len(r['cases']),2);self.assertEqual(read(O/'terminal-receipt.json')['observedExitCode'],0)
  for item in r['cases']:self.assertEqual(hashlib.sha256((O/item['file']).read_bytes()).hexdigest(),item['sha256'])
 def test_actual_pixel_pair_and_full_geometry_are_identical(self):
  r=read(B/'independent-comparison.json');self.assertTrue(r['stagePngByteIdentical']);self.assertTrue(r['sourceReplayedPrimitivesGlyphsAndLabelsIdentical']);self.assertEqual(r['activityCredit'],0)
  p=O/'screens'/(r['stagePngSha256']+'.png');self.assertEqual(hashlib.sha256(p.read_bytes()).hexdigest(),r['stagePngSha256'])
 def test_real_partial_shaft_failure_retained_not_tip_failure(self):
  g=read(B/'geometry-observations.json');self.assertEqual(len(g['observationsRequiringReview']),2)
  for i in g['observationsRequiringReview']:self.assertEqual(i['part'],'shaft');self.assertTrue(any(l['text']=='y'and l['gapPixels']<=0 for l in i['labelProjectedHullGaps']))
if __name__=='__main__':unittest.main()
