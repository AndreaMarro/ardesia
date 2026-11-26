"""These tests freeze regression conditions; they grant no activity acceptance."""
from pathlib import Path
import hashlib,json,math,unittest
from tests.corpus.consumer_glyph_contract import arrow_geometry,dot,point_strictly_inside_box
APP=Path(__file__).resolve().parents[2]
BASE=APP/'editorial/reviews/consumer-17-prepatch-contracts-20261126'
class Prepatch17(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.conditions=json.loads((BASE/'conditions.json').read_bytes());cls.plan=json.loads((BASE/'replay-plan-139.json').read_bytes());cls.controls=json.loads((BASE/'controls.json').read_bytes())
 def test_exact_17_acquired_failures_and_139_source_replay_targets(self):
  inv=json.loads((APP/'editorial/reviews/partial-experiments-139-archive-followup-20261125/inventory.json').read_bytes())
  expected={r['id']for r in inv['records']if r['consumerObservedUiFailure']or r['consumerCodeGeometryFailure']}
  self.assertEqual({r['id']for r in self.conditions['records']},expected);self.assertEqual(len(expected),17)
  self.assertEqual({r['id']for r in self.plan['records']},{r['id']for r in inv['records']});self.assertEqual(len(self.plan['records']),139)
 def test_pinned_existing_inputs_and_full_fixture_bytes(self):
  for name,pin in self.conditions['inputPins'].items():self.assertEqual(hashlib.sha256((APP/self.conditions.get('rendererSourceArchives',{}).get(name,name)).read_bytes()).hexdigest(),pin)
  for r in self.conditions['records']:self.assertEqual(hashlib.sha256((APP/r['path']).read_bytes()).hexdigest(),r['sha256'])
 def test_full_native_shaft_caps_cone_rim_and_original_delta(self):
  for row in self.conditions['records']:
   fixture=json.loads((APP/row['path']).read_bytes())
   for c in fixture['contexts']:
    for g in c['completeNativeArrowGeometry']:
     for name,radius,center in [('tailCapRim',.028,g['tail']),('shaftJointRim',.028,g['joint']),('coneBaseRim',.0812,g['joint'])]:
      self.assertEqual(len(g[name]),32)
      for p in g[name]:
       offset=[p[i]-center[i]for i in range(3)]
       self.assertAlmostEqual(dot(offset,g['axis']),0,places=11);self.assertAlmostEqual(math.sqrt(dot(offset,offset)),radius,places=11)
     self.assertAlmostEqual(g['headLength'],min(.24,g['length']*.32),places=12)
     self.assertEqual(g['delta'],[g['tip'][i]-g['tail'][i]for i in range(3)])
 def test_short_nonzero_arrow_and_antiparallel_geometry_not_silently_omitted(self):
  for end in ([0,-.02,0],[0,.02,0],[.02,0,0]):
   g=arrow_geometry({'a':[0,0,0],'b':end});self.assertEqual(len(g['coneBaseRim']),32);self.assertGreater(g['headLength'],0)
  with self.assertRaises(ValueError):arrow_geometry({'a':[0,0,0],'b':[0,0,0]})
 def test_negative_positive_box_controls_use_all_three_coordinates(self):
  center=[-2,1.05,0];size=[.68,1.45,.92]
  self.assertTrue(point_strictly_inside_box([-1.6825,1,0],center,size))
  self.assertFalse(point_strictly_inside_box([-1.639,1,0],center,size))
  self.assertFalse(point_strictly_inside_box([-1.6825,1,1],center,size))
 def test_native_and_fallback_camera_scope_is_honest_and_bounded(self):
  self.assertEqual(len(self.plan['profiles']),8)
  self.assertEqual({p['camera']for p in self.plan['profiles']if p['mode']=='fallback'},{'fixed_projection'})
  self.assertEqual({p['camera']for p in self.plan['profiles']if p['mode']=='native'},{'orbit','side','top'})
  self.assertEqual(self.plan['allLegalGridPoints'],2144);self.assertEqual(self.plan['staticGridProfileFramesPlanned'],17152)
 def test_failures_zero_credit_and_partial_positive_limits_never_become_pass(self):
  self.assertEqual(len(self.controls['records']),17)
  for doc in (self.conditions,self.plan,self.controls):self.assertEqual(doc['activityCredit'],0);self.assertEqual(doc['humanApproval'],'NOT_RUN');self.assertEqual(doc['publicationAction'],'NONE')
  for r in self.conditions['records']:
   d=json.loads((APP/r['path']).read_bytes());self.assertFalse(d['newRuntimeAcceptance']);self.assertEqual(d['newUiCases'],0)
if __name__=='__main__':unittest.main()
