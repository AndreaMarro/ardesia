from pathlib import Path
import importlib.util,unittest
B=Path(__file__).resolve().parents[2]/'editorial/reviews/c1-five-closures-95769-renewal-20261126';spec=importlib.util.spec_from_file_location('convex_review',B/'certify-convex-glyphs.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class CompleteConvex(unittest.TestCase):
 def test_whole_face_occlusion_is_not_certified_from_clear_vertex_rays(self):
  p=[[-1,-1,0],[-1,1,0],[1,1,0],[1,-1,0]];sphere={'kind':'ball','p':[0,0,1],'r':.2}
  # All four vertex rays miss; the centre-face ray intersects the foreground
  # sphere. No strict plane can separate the complete convex face/extrusion.
  self.assertTrue(all(abs(v[0])>.2 and abs(v[1])>.2 for v in p));self.assertIsNone(m.certificate(p,m.vec([0,0,1]),sphere,[0,0,0]))
 def test_viewer_direction_and_nonzero_full_clearance_are_required(self):
  p=[[-1,1,-1],[-1,1,1],[1,1,1],[1,1,-1]];sphere={'kind':'ball','p':[0,0,0],'r':.2}
  proof=m.certificate(p,m.vec([0,1,0]),sphere,[0,1,0]);self.assertTrue(proof['wholeConvexMeshAndAllForwardRaysSeparated']);self.assertGreater(proof['minimumSourceClearanceWorldUnits'],0)
  self.assertIsNone(m.certificate(p,m.vec([0,-1,0]),sphere,[0,1,0]));self.assertIsNone(m.certificate(p,m.vec([0,1,0]),{**sphere,'r':2},[0,1,0]))
if __name__=='__main__':unittest.main()
