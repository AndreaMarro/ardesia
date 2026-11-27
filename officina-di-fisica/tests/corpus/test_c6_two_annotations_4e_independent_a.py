import unittest,json,copy,math,hashlib
from fractions import Fraction
from tools.corpus_engineering import c6_two_annotations_4e_review_a as v

class C6TwoAnnotations(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.cases=v.actual();cls.prepared=json.loads((v.BASE/'prepared.json').read_bytes());cls.states=[c for c in cls.cases if'interaction'in c]
 def test_current104_exact_case_set_and_88_states(self):self.assertEqual((len(self.cases),len(self.states)),(104,88))
 def test_two_ids_all_eight_profiles_real_accessibility(self):
  for id_ in ['SIM-C6-L02-01','SIM-C6-L05-01']:
   setups=[c for c in self.cases if c['id']==id_ and'interaction'not in c];self.assertEqual(len(setups),8)
   for c in setups:self.assertEqual(c['axe'],[]);self.assertTrue(all(q['status'].startswith('Corretto. ')for q in c['questions']))
 def test_legend_names_and_layout_all_states(self):
  for c in self.states:
   for label in (['entrata','uscita']if c['id']=='SIM-C6-L02-01'else['carrello']):self.assertIn(label,c['legend'].lower())
   self.assertTrue(c['legendLayout']['visible']);self.assertLessEqual(c['legendLayout']['scrollWidth'],c['legendLayout']['width']+1)
 def test_same_browser_isolated_exact_parity_all_states(self):
  for c in self.states:self.assertEqual(c['model'],c['baselineReference']['model']);self.assertEqual(c['actualDOMControls'],c['baselineReference']['actualDOMControls'])
 def test_clock_mass_and_turn_vectors_are_independently_checked(self):
  for c in self.states:self.assertTrue(v.scene_contract(c))
  turns=[c for c in self.states if c['id']=='SIM-C6-L05-01'and c['sourceReplayedX']==2];self.assertEqual(len(turns),8)
 def test_wrong_cart_vector_rejected(self):
  c=copy.deepcopy(next(c for c in self.states if c['id']=='SIM-C6-L05-01'and c['sourceReplayedX']==4));a=next(e for e in c['elements']if e['kind']=='arrow');a['b'][0]=a['a'][0]+.65
  with self.assertRaises(ValueError):v.scene_contract(c)
 def test_wrong_clock_collected_mass_rejected(self):
  c=copy.deepcopy(next(c for c in self.states if c['id']=='SIM-C6-L02-01'and c['sourceReplayedClockTime']==2));c['readings']=c['readings'].replace('Massa già raccolta20 g','Massa già raccolta40 g')
  with self.assertRaises(ValueError):v.scene_contract(c)
 def test_wrong_physics_rejected_even_if_baseline_is_mutated_too(self):
  c=copy.deepcopy(self.states[0]);c['model']['y']+=1;c['baselineReference']['model']['y']=c['model']['y']
  with self.assertRaises(ValueError):v.validate_case(c,self.prepared)
 def test_wrong_identity_and_claimed_approval_rejected(self):
  for k,value in [('runtimeSha256','0'*64),('sourceCommit','0'*40),('scientificApproval',True),('humanApproval','PASS'),('technicalOk',False),('activityCredit',1)]:
   c=copy.deepcopy(self.cases[0]);c[k]=value
   with self.assertRaises(ValueError):v.validate_case(c,self.prepared)
 def test_restored_opaque_label_or_lost_name_rejected(self):
  for mode in ['opaque','legend']:
   c=copy.deepcopy(self.states[0])
   if mode=='opaque':c['elements'].append(dict(kind='label',text='Entrata'))
   else:c['legend']=''
   with self.assertRaises(ValueError):v.validate_case(c,self.prepared)
 def test_finite_real_original_domains_before_conversion(self):
  for bad in [True,False,math.inf,-math.inf,math.nan,1j,'1',None]:
   with self.assertRaises(ValueError):v.exact('L02-01',bad)
  for key,x in [('L02-01',-1),('L04-01',Fraction(1,2)),('L06-01',0),('L05-01',5)]:
   with self.assertRaises(ValueError):v.exact(key,x)
 def test_independent_source_results_and_units_really_run(self):
  p=json.loads((v.BASE/'independent-physics.json').read_bytes());self.assertEqual(p['exactGridValues'],97);self.assertEqual(p['pintDimensionalChecks'],6);self.assertEqual(v.exact('L02-01',40),5);self.assertEqual(v.exact('L05-01',Fraction(9,4)),Fraction(15,4));self.assertEqual(v.exact('L06-01',1),0)
 def test_all_six_static_scene_changes_only_three_named_labels(self):
  j=json.loads((v.BASE/'static.stdout.txt').read_bytes());self.assertEqual(j['totalControls'],97);self.assertEqual(sum(len(r['removedLabels'])for r in j['records']),3);self.assertEqual(len([r for r in j['records']if r['currentUIScope']=='NOT_RUN_STATIC_ONLY']),4)
 def test_other_four_historical_raw_is_not_retagged(self):
  rows=json.loads((v.BASE/'historical-other-four-analysis.json').read_bytes());self.assertEqual(len(rows),18);self.assertEqual(len({r['id']for r in rows}),4)
  for r in rows:self.assertNotEqual(r['sourceRuntime'],v.RUNTIME);self.assertFalse(r['currentRuntimeUI']);self.assertTrue(r['noVisualClosure'])
 def test_all_sixteen_whole_overviews_and_88_frames_read(self):
  rows=json.loads((v.BASE/'overview-index.json').read_bytes());self.assertEqual(len(rows),16);self.assertEqual(sum(len(r['tiles'])for r in rows),88);self.assertTrue(all(r['wholeOpenedAndRead']for r in rows))
  for r in rows:self.assertEqual(hashlib.sha256((v.APP/r['file']).read_bytes()).hexdigest(),r['sha256'])
 def test_no_macro_acceptance(self):
  r=json.loads((v.BASE/'disposition.json').read_bytes());self.assertFalse(r['completeC6Renewal']);self.assertFalse(r['scientificAcceptanceGranted']);self.assertEqual(r['activityCredit'],0);self.assertEqual(r['humanApproval'],'NOT_RUN')
if __name__=='__main__':unittest.main()
