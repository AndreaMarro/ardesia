"""Persistent distinct negative peer evidence must not become positive or lose source/images."""
from pathlib import Path
import importlib.util,json,shutil,tempfile,unittest
B=Path(__file__).resolve().parents[2]/'editorial/reviews/independent-bench-combined-4e75-20261127'
def module(name,path):
 spec=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
CHECK=module('bench4e75check',B/'artifact-check.py')
class IndependentCombinedBenchPeer(unittest.TestCase):
 def test_actual_complete_run_stays_scientifically_negative(self):
  result=CHECK.check();self.assertIs(result['ok'],False);self.assertEqual(result['actualCases'],22);self.assertEqual(set(result['unresolvedIds']),{'LAB3D-01','LAB3D-02'});self.assertEqual(result['activityCredit'],0)
 def test_measurement_is_reproduced_from_original_png(self):
  actual=module('bench4e75png',B/'observe-png-cart-rectangle.py').observe(B)
  self.assertEqual(actual,json.loads((B/'flight-label-framing-summary.json').read_bytes()))
 def test_missing_actual_image_fails_closed(self):
  with tempfile.TemporaryDirectory()as tmp:
   dest=Path(tmp)/'peer';shutil.copytree(B,dest);(dest/'actual-ui-22/flight-side-0.5-1280.png').unlink()
   with self.assertRaises(ValueError):CHECK.check(dest)
 def test_source_or_negative_decision_cannot_be_rebound(self):
  for name in ['candidate-source-snapshot/static/js/banchi/scene/volo.js','independent-judgment.json']:
   with self.subTest(file=name),tempfile.TemporaryDirectory()as tmp:
    dest=Path(tmp)/'peer';shutil.copytree(B,dest);p=dest/name;p.write_bytes(p.read_bytes()+b'\nchanged')
    with self.assertRaises(ValueError):CHECK.check(dest)
if __name__=='__main__':unittest.main()
