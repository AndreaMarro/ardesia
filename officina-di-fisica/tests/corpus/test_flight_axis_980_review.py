from pathlib import Path
import gzip,importlib.util,json,shutil,tempfile,unittest
B=Path(__file__).resolve().parents[2]/'editorial/reviews/independent-flight-axis-980518-20261127'
spec=importlib.util.spec_from_file_location('axis980check',B/'artifact-check.py');CHECK=importlib.util.module_from_spec(spec);spec.loader.exec_module(CHECK)
class DistinctAxisGravityPeer(unittest.TestCase):
 def test_actual70_current_epoch_bounded_scope(self):
  result=CHECK.check();self.assertIs(result['ok'],True);self.assertEqual(result['actualCases'],70);self.assertEqual(result['nativeGeometryStates'],58);self.assertEqual(result['activityCredit'],0)
 def test_actual_exact_previous_mask_cases_two_stages_and_widths(self):
  rows=json.loads((B/'actual-ui-70/report.json').read_bytes())['records'];critical=[r for r in rows if r['key'].startswith('axis-x-risk')];self.assertEqual(len(critical),4);self.assertEqual({(r['width'],r['actualPhase'])for r in critical},{(w,p)for w in[320,1280]for p in[2,3]})
  for r in critical:self.assertEqual(r['actualParameters'],{'speed':'4','elevation':'69','azimuth':'15'});self.assertEqual(r['requestedTime'],0)
  self.assertEqual(sum(r['fallback']for r in rows),12)
 def test_actual_float32_full_sampled_rims_preserve_vertical_length_and_no_labels(self):
  geo=json.loads(gzip.decompress((B/'actual-full-glyph-geometry.json.gz').read_bytes()))
  for r in geo['results']:
   self.assertEqual(r['sampleCount'],1344);self.assertEqual({(s['kind'],s['ring'],s['axial'])for s in r['samples']},{(k,i,j)for k in['shaft','cone']for i in range(32)for j in range(21)})
   self.assertEqual(r['delta'][0],0);self.assertEqual(r['delta'][2],0);self.assertAlmostEqual(r['delta'][1],-.64,places=14);self.assertGreaterEqual(r['tip'][1],.139999999999);self.assertEqual(r['labels'],[])
 def test_missing_or_altered_actual_proof_fails_closed(self):
  for name in['actual-ui-70/axis-x-risk69-stage2-320-side.png','actual-full-glyph-geometry.json.gz','independent-judgment.json','candidate-source-snapshot/static/js/banchi/scene/volo.js']:
   with self.subTest(file=name),tempfile.TemporaryDirectory()as tmp:
    dest=Path(tmp)/'peer';shutil.copytree(B,dest);p=dest/name;p.write_bytes(p.read_bytes()+b'changed')
    with self.assertRaises(ValueError):CHECK.check(dest)
if __name__=='__main__':unittest.main()
