from pathlib import Path
import importlib.util,json,shutil,tempfile,unittest
B=Path(__file__).resolve().parents[2]/'editorial/reviews/independent-flight-gravity-0fdcc-20261127'
def module(name,path):
 spec=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
CHECK=module('g0fdcheck',B/'artifact-check.py')
class DistinctGravityAxisNegative(unittest.TestCase):
 def test_actual70_preserves_label_failure_despite_resolved_solids(self):
  result=CHECK.check();self.assertIs(result['ok'],False);self.assertEqual(result['actualCases'],70);self.assertEqual(result['particleOccludedUiCaptures'],0);self.assertEqual(result['axisMaskedUiCaptures'],4);self.assertEqual(result['activityCredit'],0)
 def test_core_measurement_reproduces_from_original_png_without_edge_overclaim(self):
  current=module('g0fdpng',B/'observe-x-cart.py').observe(B,B/'actual-ui-70');self.assertEqual(current,json.loads((B/'x-cart-observation.json').read_bytes()))
  for row in current['results']:
   if '-320-'in row['case']:self.assertTrue(row['tipInsideConservativeOpaqueCore'])
   else:self.assertFalse(row['tipInsideConservativeOpaqueCore'])
 def test_real_source_controls_and_two_stages_are_recorded(self):
  report=json.loads((B/'actual-ui-70/report.json').read_bytes());rows=[r for r in report['records']if r['key'].startswith('axis-x-risk')];self.assertEqual(len(rows),4);self.assertEqual({(r['width'],r['actualPhase'])for r in rows},{(w,p)for w in[320,1280]for p in[2,3]})
  for row in rows:self.assertEqual(row['actualParameters'],{'speed':'4','elevation':'69','azimuth':'15'});self.assertEqual(row['requestedTime'],0)
 def test_missing_or_altered_proof_cannot_be_retold_as_pass(self):
  for name in['actual-ui-70/axis-x-risk69-stage2-320-side.png','actual-full-glyph-geometry.json.gz','independent-judgment.json']:
   with self.subTest(file=name),tempfile.TemporaryDirectory()as tmp:
    dest=Path(tmp)/'peer';shutil.copytree(B,dest);p=dest/name;p.write_bytes(p.read_bytes()+b'changed')
    with self.assertRaises(ValueError):CHECK.check(dest)
if __name__=='__main__':unittest.main()
