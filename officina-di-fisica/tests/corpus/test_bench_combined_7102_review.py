from pathlib import Path
import importlib.util,tempfile,unittest
BASE=Path(__file__).resolve().parents[2]/'editorial/reviews/independent-bench-combined-7102-20261127'
spec=importlib.util.spec_from_file_location('independent_bench7102_artifact',BASE/'artifact-check.py');v=importlib.util.module_from_spec(spec);spec.loader.exec_module(v)
class BenchPeer(unittest.TestCase):
 def test_actual22_technical0_remains_semantically_not_accepted(self):
  got=v.check();self.assertFalse(got['ok']);self.assertTrue(got['technicalOk']);self.assertEqual(got['activityCredit'],0);self.assertEqual(set(got['unresolvedIds']),{'LAB3D-01','LAB3D-02','LAB3D-07'})
 def test_nonzero_velocity_is_hidden_not_mathematically_zero(self):
  geo=v.load(BASE/'near-peak-velocity-actual-geometry.json');self.assertGreater(geo['sourceSample']['vy'],.09);self.assertLess(geo['sourceSample']['vy'],.1)
  for row in geo['vectors']:
   self.assertTrue(row['visibleFlagFromSource']);self.assertTrue(row['allCpuVerticesBehindSphereInSide']);self.assertLess(row['maximumRadius'],geo['sphere']['radius']);self.assertTrue(all(p['frontSphereHit']<p['ownDistance']for p in row['actualFloat32Vertices']))
 def test_aria_and_wave_targeted_positives_are_separate_from_failed_ids(self):
  report=v.load(BASE/'actual-ui-22/report.json');caps=[r for r in report['records']if r['id']=='LAB3D-04'];self.assertEqual(len(caps),2)
  for row in caps:self.assertEqual({(r['name'],r['role'])for r in row['svgGroups']},{('Pareti del capillare','group'),('Tracciante della sonda','group')});self.assertFalse(row['observed']['axe'])
  self.assertEqual(len([r for r in report['records']if r['id']=='LAB3D-10']),4);judgment=v.load(BASE/'independent-judgment.json');self.assertEqual(len(judgment['images']),22);self.assertTrue(judgment['all22OriginalPngIndividuallyOpened'])
 def test_changed_actual_evidence_default_denied(self):
  with tempfile.TemporaryDirectory()as tmp:
   root=Path(tmp);(root/'actual-proof-index.json').write_bytes((BASE/'actual-proof-index.json').read_bytes());name=next(iter(v.load(BASE/'actual-proof-index.json')['files']));target=root/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(b'changed actual proof')
   with self.assertRaisesRegex(ValueError,'actual peer bytes missing/changed'):v.check(root)
if __name__=='__main__':unittest.main()
