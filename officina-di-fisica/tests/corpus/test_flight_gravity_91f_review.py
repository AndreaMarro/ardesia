from pathlib import Path
from fractions import Fraction as F
import importlib.util,json,shutil,tempfile,unittest
B=Path(__file__).resolve().parents[2]/'editorial/reviews/independent-flight-gravity-91f0-20261127'
def module(name,path):
 spec=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
CHECK=module('g91check',B/'artifact-check.py')
class DistinctGravityNegative(unittest.TestCase):
 def test_actual_complete_run_preserves_semantic_negative(self):
  result=CHECK.check();self.assertIs(result['ok'],False);self.assertEqual(result['actualCases'],48);self.assertEqual(result['particleOccludedUiCaptures'],6);self.assertEqual(result['activityCredit'],0)
 def test_original_png_cart_measurement_reproduces_without_pil(self):
  actual=module('g91png',B/'observe-z-cart.py').observe(B,B/'actual-ui-48');self.assertEqual(actual,json.loads((B/'z-cart-observation.json').read_bytes()))
 def test_selected_physics_is_exact_and_graphic_units_are_separate(self):
  g=F(981,100);u=F(5);apex=u/g;landing=2*apex
  self.assertEqual(apex,F(500,981));self.assertEqual(landing,F(1000,981));self.assertEqual(u*apex-g*apex**2/2,F(1250,981));self.assertEqual(u-g*apex,0);self.assertEqual(u-g*landing,-5)
  self.assertEqual(u*F(1,2)-g*F(1,2)**2/2,F(1019,800));self.assertEqual(u-g*F(1,2),F(19,200));self.assertEqual(F(78,100)-F(64,100),F(14,100))
 def test_missing_or_mutated_capture_source_geometry_cannot_be_approved(self):
  for name in ['actual-ui-48/vertical-apex-1280-orbit.png','candidate-source-snapshot/static/js/banchi/scene/volo.js','actual-full-glyph-geometry.json.gz','independent-judgment.json']:
   with self.subTest(file=name),tempfile.TemporaryDirectory()as tmp:
    dest=Path(tmp)/'peer';shutil.copytree(B,dest);p=dest/name;p.write_bytes(p.read_bytes()+b'changed')
    with self.assertRaises(ValueError):CHECK.check(dest)
if __name__=='__main__':unittest.main()
