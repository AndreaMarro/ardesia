import unittest,json,copy,hashlib,math
from fractions import Fraction
from tools.corpus_engineering import c6_remaining_four_abb2_review_a as v

class C6RemainingFour(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.cases=v.actual();cls.states=[c for c in cls.cases if'interaction'in c];cls.plan=json.loads((v.BASE/'prepared.json').read_bytes());cls.lens=json.loads((v.BASE/'lens-exact-label-intersections.json').read_bytes());cls.beam=json.loads((v.BASE/'beam-outgoing-label-witnesses.json').read_bytes())
 def test_current216_and184_states(self):self.assertEqual((len(self.cases),len(self.states)),(216,184))
 def test_all32_actual_setup_accessibility(self):
  setup=[c for c in self.cases if'interaction'not in c];self.assertEqual(len(setup),32)
  for c in setup:self.assertEqual(c['axe'],[]);self.assertTrue(all(q['status'].startswith('Corretto. ')for q in c['questions']))
 def test_all_independent_geometry_and_scalar_states(self):
  for c in self.states:self.assertTrue(v.independent_scene(c));v.physics.scalar_observation(c['id'],c['sourceReplayedX'],c['model']['y'])
 def test_echo_zero_path_and_halfway_turn(self):
  zero=[c for c in self.states if c['id']=='SIM-C6-L01-01'and c['sourceReplayedX']==0];self.assertEqual(len(zero),8)
  for c in zero:self.assertFalse([e for e in c['elements']if e['kind']=='arrow'])
  peak=[c for c in self.states if c['id']=='SIM-C6-L01-01'and c['sourceReplayedClockTime']==10];self.assertEqual(len(peak),8)
  for c in peak:self.assertIn('Distanza dell’impulso dal microfono3,4 m',c['readings'])
 def test_heating_linear_useful_energy(self):
  rows=[c for c in self.states if c['id']=='SIM-C6-L03-01'];self.assertEqual(len(rows),40)
  for c in rows:self.assertEqual(v.physics.exact(c['id'],c['sourceReplayedX']),Fraction(str(c['sourceReplayedX']))/50)
 def test_layers_are_discrete_halvings(self):
  rows=[c for c in self.states if c['id']=='SIM-C6-L04-01'];self.assertEqual(len(rows),32)
  for c in rows:self.assertEqual(v.physics.exact(c['id'],c['sourceReplayedX']),Fraction(120,2**int(c['sourceReplayedX'])))
 def test_lens_exact_focus_and_signed_branches(self):
  rows=[c for c in self.states if c['id']=='SIM-C6-L06-01'];self.assertEqual(len(rows),48)
  for c in rows:
   x=c['sourceReplayedX'];y=c['model']['y'];self.assertEqual(y==0,x==1);self.assertEqual(y<0,x<1)
 def test_two_full_image_cones_are_real_nonaxial_negative(self):
  rows=[r for r in self.lens if r['profile']['width']==320 and r['profile']['view']in['orbit','side']];self.assertEqual(len(rows),2)
  for r in rows:
   cone=next(p for p in r['parts']if p['partIndex']==1);self.assertEqual(Fraction(cone['coveredFractionExact']),1);self.assertEqual((cone['projectedVertices'],cone['verticesInsideLabel']),(34,34));self.assertEqual(r['label'],'Oggetto')
 def test_1280_partial_cones_are_not_claimed_free(self):
  rows=[r for r in self.lens if r['profile']['width']==1280 and r['profile']['view']in['orbit','side']];self.assertEqual(len(rows),2)
  for r in rows:
   cone=next(p for p in r['parts']if p['partIndex']==1);self.assertGreater(cone['coveredPercent'],70);self.assertLess(cone['coveredPercent'],100)
 def test_exact_label_inventory_not_imagined_labels(self):
  i=json.loads((v.BASE/'lens-label-inventory.stdout.txt').read_bytes());self.assertEqual(len(i['states']),55);self.assertEqual(set(i['uniqueLabelTexts']),{'Oggetto','F′'});self.assertEqual(i['notEmitted'],['Immagine','Lente'])
  self.assertFalse(any(r['label']=='F′'and r['profile']['view']!='top'for r in self.lens))
 def test_transmitted_bundle_whole_containment320_only(self):
  for r in self.beam:
   self.assertEqual(len(r['outgoingRods']),12);self.assertEqual(r['label'],'Rivelatore');self.assertEqual(r['all12EntireCylinderEnclosuresInsideLabel'],r['profile']['width']==320)
   if r['profile']['width']==320:self.assertTrue(all(x['verticesInside']==16 for x in r['outgoingRods']))
 def test_axial_lens_cases_are_distinct_from_confirmed_failure(self):
  top=[r for r in self.lens if r['profile']['view']=='top'];self.assertTrue(top)
  self.assertTrue(all(r['classification'].startswith('AXIAL_PROJECTION')for r in top))
 def test_wrong_echo_motion_rejected(self):
  c=copy.deepcopy(next(c for c in self.states if c['id']=='SIM-C6-L01-01'and c['sourceReplayedClockTime']==15));p=next(e for e in c['elements']if e['kind']=='ball'and e.get('r')==.13);p['p'][0]+=1
  with self.assertRaises(ValueError):v.independent_scene(c)
 def test_wrong_temperature_column_rejected(self):
  c=copy.deepcopy(next(c for c in self.states if c['id']=='SIM-C6-L03-01'));p=next(e for e in c['elements']if e['kind']=='rod'and e.get('r')==.044);p['b'][1]+=.1
  with self.assertRaises(ValueError):v.independent_scene(c)
 def test_wrong_outgoing_opacity_rejected(self):
  c=copy.deepcopy(next(c for c in self.states if c['id']=='SIM-C6-L04-01'and c['sourceReplayedX']==5));p=next(e for e in c['elements']if e['kind']=='rod'and e['b'][0]==2.26);p['alpha']=1
  with self.assertRaises(ValueError):v.independent_scene(c)
 def test_wrong_lens_axis_origin_rejected(self):
  c=copy.deepcopy(next(c for c in self.states if c['id']=='SIM-C6-L06-01'and c['sourceReplayedX']==.5));p=next(e for e in c['elements']if e['kind']=='arrow');p['a'][1]=1.55
  with self.assertRaises(ValueError):v.independent_scene(c)
 def test_finite_and_domain_guards_before_cast(self):
  for x in [True,math.inf,-math.inf,math.nan,1j,'1',None]:
   with self.assertRaises(ValueError):v.physics.exact('L01-01',x)
  with self.assertRaises(ValueError):v.physics.exact('L04-01',Fraction(1,2))
  with self.assertRaises(ValueError):v.physics.exact('L06-01',0)
 def test_false_metadata_or_shared_wrong_values_rejected(self):
  for k,val in [('runtimeSha256','0'*64),('sourceCommit','0'*40),('humanApproval','PASS'),('scientificApproval',True),('activityCredit',1),('technicalOk',False)]:
   c=copy.deepcopy(self.cases[0]);c[k]=val
   with self.assertRaises(ValueError):v.validate_case(c,self.plan)
  c=copy.deepcopy(self.states[0]);c['model']['y']+=1;c['baselineReference']['model']['y']=c['model']['y']
  with self.assertRaises(ValueError):v.validate_case(c,self.plan)
 def test_all32_whole_overviews_184frames_and6full_pngs_read(self):
  rows=json.loads((v.BASE/'overview-index.json').read_bytes());self.assertEqual((len(rows),sum(len(r['tiles'])for r in rows)),(32,184));self.assertTrue(all(r['wholeOpenedAndRead']for r in rows))
  for r in rows:self.assertEqual(hashlib.sha256((v.APP/r['file']).read_bytes()).hexdigest(),r['sha256'])
  rows=json.loads((v.BASE/'full-png-readings.json').read_bytes());self.assertEqual(len(rows),6);self.assertTrue(all(r['wholeOpenedAndRead']for r in rows))
 def test_static_exact_and_visual_negatives_prevent_closure(self):
  s=json.loads((v.BASE/'static.stdout.txt').read_bytes());self.assertEqual((s['totalControls'],s['totalStates'],s['totalFiveStageScenes']),(97,493,2465));self.assertFalse(any(r['removedLabels']for r in s['records']))
  d=json.loads((v.BASE/'disposition.json').read_bytes());self.assertEqual(set(d['visualFailureIds']),{'SIM-C6-L04-01','SIM-C6-L06-01'});self.assertFalse(d['completeC6Renewal']);self.assertFalse(d['scientificAcceptanceGranted']);self.assertEqual(d['activityCredit'],0)
if __name__=='__main__':unittest.main()
