from pathlib import Path
from fractions import Fraction
import unittest,json,hashlib
APP=Path(__file__).resolve().parents[2];B=APP/'editorial/reviews/c1-five-closures-float32-addendum-95769-20261126'
class Float32Supports(unittest.TestCase):
 def test_guarded_real_construction_is_byte_reproducible_without_new_ui(self):
  r=json.loads((B/'guarded-reconstruction-repeat.json').read_bytes());self.assertEqual(r['observedProcessExitCode'],0);self.assertEqual(r['actualRuntimeBefore'],r['actualRuntimeAfter']);self.assertEqual(r['actualRuntimeBefore']['sha256'],'95769a789a6eed2cb2dde6bef3bce79d24d0f627af4dd7edcbb373a5d094202d');self.assertTrue(r['noNewBrowserOrUI']);self.assertTrue(r['matchesFirstConstructionBytes']);self.assertEqual(hashlib.sha256((B/'actual-float32-meshes.jsonl').read_bytes()).hexdigest(),r['actualRepeatPayloadSha256'])
 def test_every_reconstructed_mesh_part_and_body_has_strict_exact_support(self):
  d=json.loads((B/'actual-mesh-support-certificates.json').read_bytes());self.assertEqual(d['sourceMeshPartCount'],1332);self.assertEqual(d['physicalSupportComparisonCount'],8040);self.assertEqual(d['actualBaseSupportComparisonCount'],6660);self.assertFalse(d['unresolved'])
  for p in d['parts']:
   self.assertEqual(p['sourcePositionBufferType'],'Float32Array')
   for c in p['physicalMeshSupportChecks']:self.assertTrue(c['ok']);self.assertGreater(Fraction(c['strictExactSupportGap']),0);self.assertGreaterEqual(Fraction(c['exactViewerDot']),0)
   for c in p['actualBaseSupportChecks']:self.assertTrue(c['ok']);self.assertGreater(Fraction(c['strictExactGap']),0)
 def test_actual_float32_box_exceeds_its_nominal_size_and_is_not_ignored(self):
  found=False
  with (B/'actual-float32-meshes.jsonl').open()as f:
   for line in f:
    frame=json.loads(line)
    for mesh in frame['physicalMeshes']:
     if mesh['geometryType']=='BoxGeometry'and mesh['geometryParameters']['height']==1.7:
      self.assertEqual(mesh['positionStorageType'],'Float32Array');actual=max(v[1]for v in mesh['vertices']);nominal=mesh['actualObjectMatrixWorldCPU'][13]+1.7/2;self.assertGreater(actual,nominal);found=True;break
    if found:break
  self.assertTrue(found,'Real stored Float32 overshoot must be present; ideal primitives are not silently called supersets')
if __name__=='__main__':unittest.main()
