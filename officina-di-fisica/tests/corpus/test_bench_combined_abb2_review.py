from pathlib import Path
import importlib.util,shutil,tempfile,unittest
B=Path(__file__).resolve().parents[2]/'editorial/reviews/independent-bench-combined-abb2-20261127'
spec=importlib.util.spec_from_file_location('benchabb2check',B/'artifact-check.py');CHECK=importlib.util.module_from_spec(spec);spec.loader.exec_module(CHECK)
class DistinctBenchCanary(unittest.TestCase):
 def test_current_actual_bounded_proof_has_zero_global_credit(self):
  actual=CHECK.check();self.assertTrue(actual['ok']);self.assertEqual(actual['actualCases'],22);self.assertEqual(actual['activityCredit'],0);self.assertEqual(actual['scope'],'TARGETED_CANARY_ONLY')
 def test_missing_screenshot_rejected(self):
  with tempfile.TemporaryDirectory()as tmp:
   dest=Path(tmp)/'peer';shutil.copytree(B,dest);(dest/'actual-ui-22/flight-side-0.5-1280.png').unlink()
   with self.assertRaises(ValueError):CHECK.check(dest)
 def test_stale_or_altered_source_and_geometry_rejected(self):
  for name in ['candidate-source-snapshot/static/js/banchi/scene/volo.js','flight-positive-actual-geometry.json']:
   with self.subTest(file=name),tempfile.TemporaryDirectory()as tmp:
    dest=Path(tmp)/'peer';shutil.copytree(B,dest);p=dest/name;p.write_bytes(p.read_bytes()+b'\nchanged')
    with self.assertRaises(ValueError):CHECK.check(dest)
 def test_ui_case_cannot_be_omitted_or_scope_promoted(self):
  for name in ['actual-ui-22/report.json','independent-judgment.json']:
   with self.subTest(file=name),tempfile.TemporaryDirectory()as tmp:
    dest=Path(tmp)/'peer';shutil.copytree(B,dest);p=dest/name;p.write_bytes(p.read_bytes().replace(b'22',b'21',1)+b'\n')
    with self.assertRaises(ValueError):CHECK.check(dest)
if __name__=='__main__':unittest.main()
