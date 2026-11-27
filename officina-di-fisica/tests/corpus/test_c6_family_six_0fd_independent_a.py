import unittest,json,copy,math
from fractions import Fraction
from tools.corpus_engineering import c6_family_six_0fd_review_a as v

class FamilySixC6(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.cases=v.actual();cls.states=[c for c in cls.cases if'interaction'in c];cls.plan=json.loads((v.BASE/'prepared.json').read_bytes());cls.doc=json.loads((v.BASE/'visual-review-per-id.json').read_bytes())
 def test_current312_48setup_264states(self):self.assertEqual((len(self.cases),len(self.cases)-len(self.states),len(self.states)),(312,48,264))
 def test_all_six_original_versions_and_sources(self):
  self.assertEqual({c['id']for c in self.cases},v.IDS);self.assertTrue(all(r['record']['version']==1 and r['variant']=='published'and r['candidateSha256']is None for r in self.plan['records']))
 def test_each_id_all_eight_native_and_fallback_profiles(self):
  for id_ in v.IDS:self.assertEqual({(c['profile']['width'],c['profile']['view'],c['profile']['fallback'])for c in self.cases if c['id']==id_},{(p['width'],p['view'],p['fallback'])for p in self.plan['profiles']})
 def test_96_installed_answers_and_four_phase_texts(self):
  setup=[c for c in self.cases if'interaction'not in c];self.assertEqual(sum(len(c['questions'])for c in setup),96)
  for c in setup:self.assertEqual(len(c['phases']),4);self.assertTrue(all(q['expectedAccepted']and q['status'].startswith('Corretto. ')for q in c['questions']))
 def test_no_invented_authored_reading(self):
  for c in self.cases:
   if'interaction'not in c:self.assertIsNone(c['reading'])
  self.assertTrue(all(r['record']['blocks']==[]for r in self.plan['records']))
 def test_all48_accessibility_setups(self):
  for c in self.cases:
   if'interaction'not in c:self.assertEqual(c['axe'],[])
 def test_all264_independent_physics_and_exact_reference(self):
  for c in self.states:self.assertTrue(v.check_shape(c));v.foundational.scalar_observation(c['id'],c['sourceReplayedX'],c['model']['y']);self.assertEqual(c['model'],c['baselineReference']['model'])
 def test_echo_zero_and_full_reflection_clock(self):
  c=[c for c in self.states if c['id']=='SIM-C6-L01-01'];self.assertEqual(sum(c['sourceReplayedX']==0 for c in c),8)
  for t in [5,10,15,20]:self.assertEqual(sum(r['sourceReplayedX']==20 and r['sourceReplayedClockTime']==t for r in c),8)
 def test_collection_clock_and_positive_mass(self):
  rows=[c for c in self.states if c['id']=='SIM-C6-L02-01'and c['sourceReplayedClockTime']==2];self.assertEqual(len(rows),8)
  for c in rows:self.assertIn('Massa già raccolta20 g',c['readings'])
 def test_turn_and_path_displacement_distinct(self):
  turns=[c for c in self.states if c['id']=='SIM-C6-L05-01'and c['sourceReplayedX']==2];self.assertEqual(len(turns),8)
  for c in turns:self.assertFalse([e for e in c['elements']if e['kind']=='arrow'])
 def test_focus_has_no_finite_image_arrow(self):
  rows=[c for c in self.states if c['id']=='SIM-C6-L06-01'and c['sourceReplayedX']==1];self.assertEqual(len(rows),8)
  for c in rows:self.assertEqual(c['model']['y'],0);self.assertEqual(len([e for e in c['elements']if e['kind']=='arrow']),1)
 def test_old_label_failures_do_not_return(self):
  labels={'SIM-C6-L02-01':['Entrata','Uscita'],'SIM-C6-L04-01':['Rivelatore'],'SIM-C6-L05-01':['Carrello'],'SIM-C6-L06-01':['Oggetto']}
  for c in self.states:
   for name in labels.get(c['id'],[]):self.assertFalse(any(e['kind']=='label'and e['text']==name for e in c['elements']));self.assertIn(name.lower(),c['legend'].lower())
 def test_current264_unchanged_physical_observations_no_retag(self):
  rows=json.loads((v.BASE/'all264-independent-physical-comparison.json').read_bytes());self.assertEqual(len(rows),264)
  for row in rows:self.assertNotEqual(row['priorRuntime'],v.RUNTIME);self.assertTrue(row['oldRasterNotRetagged'])
 def test_all_six_static_source_controls_clocks_scenes(self):
  s=json.loads((v.BASE/'static.stdout.txt').read_bytes());self.assertEqual((s['totalControls'],s['totalStates'],s['totalFiveStageScenes']),(97,493,2465));self.assertFalse(any(r['removedLabels']for r in s['records']))
 def test_current_canonical_pins_and_six_explicit_local_verdicts(self):self.assertTrue(v.assert_visual_review(self.doc));self.assertTrue(all(r['visualReview']=='PASS'for r in self.doc['records']))
 def test48_actual_raw_pngs_read_eight_per_id(self):
  read=json.loads((v.BASE/'raw-png-reading-selection.json').read_bytes());self.assertEqual(len(read),48);self.assertTrue(all(r['wholeRawPngOpenedAndRead']for r in read))
  for row in self.doc['records']:self.assertEqual(len(row['readPngSha256']),8);self.assertEqual(row['scope']['manualWholeRawPngCount'],8);self.assertFalse(row['scope']['all264FramesManuallyOpened'])
 def test_bad_artifact_pin_and_missing_read_png_rejected(self):
  for kind in ['pin','png']:
   d=copy.deepcopy(self.doc)
   if kind=='pin':d['artifactPins']['actual/report.json']['sha256']='0'*64
   else:d['records'][0]['readPngSha256'].pop()
   with self.assertRaises(ValueError):v.assert_visual_review(d)
 def test_false_epoch_or_credit_rejected(self):
  for key,value in [('runtimeSha256',v.repairs.RUNTIME),('sourceCommit',v.repairs.CANDIDATE),('scientificApproval',True),('activityCredit',1),('activityCredit',False),('humanApproval','PASS'),('technicalOk',False)]:
   c=copy.deepcopy(self.cases[0]);c[key]=value
   with self.assertRaises(ValueError):v.validate_case(c,self.plan)
 def test_wrong_model_even_when_both_references_agree_rejected(self):
  c=copy.deepcopy(self.states[0]);c['model']['y']+=1;c['baselineReference']['model']['y']=c['model']['y']
  with self.assertRaises(ValueError):v.validate_case(c,self.plan)
 def test_wrong_cart_direction_rejected(self):
  c=copy.deepcopy(next(c for c in self.states if c['id']=='SIM-C6-L05-01'and c['sourceReplayedX']==4));a=next(e for e in c['elements']if e['kind']=='arrow');a['b'][0]+=2
  with self.assertRaises(ValueError):v.check_shape(c)
 def test_finite_domains_and_discrete_layer_count(self):
  for x in [True,math.inf,-math.inf,math.nan,1j,'1',None]:
   with self.assertRaises(ValueError):v.foundational.exact('L01-01',x)
  for key,x in [('L01-01',-1),('L04-01',Fraction(1,2)),('L06-01',0)]:
   with self.assertRaises(ValueError):v.foundational.exact(key,x)
 def test_macro_and_human_credit_not_granted(self):
  self.assertEqual(self.doc['activityCredit'],0);self.assertEqual(self.doc['humanApproval'],'NOT_RUN');self.assertFalse(self.doc['completeAllControlRasterReview'])
if __name__=='__main__':unittest.main()
