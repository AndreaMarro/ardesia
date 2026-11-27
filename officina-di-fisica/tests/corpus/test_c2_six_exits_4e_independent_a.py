import copy,json,hashlib,unittest
from fractions import Fraction
from tools.corpus_engineering import c2_six_exits_4e_review_a as v
from tools.corpus_engineering import c2_pitot_label_geometry_a as geometry

class SixExitIndependent(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.exits=v.actual('exits');cls.pitot=v.actual('pitot');cls.oldexit=v.old.observed_run('targeted');cls.oldpitot=v.old.observed_run('canary')
 @staticmethod
 def prev(c,rows):return next(o for o in rows if 'interaction'in o and o['id']==c['id']and o['profile']==c['profile']and o['sourceReplayedX']==c['sourceReplayedX'])
 def test_all74_actual_cases(self):self.assertEqual((len(self.exits),len(self.pitot)),(42,32))
 def test_all52_mesh_camera_physics_and_primitive_deltas(self):
  for rows,old in [(self.exits,self.oldexit),(self.pitot,self.oldpitot)]:
   for c in rows:
    if 'interaction'in c:self.assertTrue(v.compare_new_to_old(c,self.prev(c,old)))
 def test_six_names_remain_in_readable_legend(self):
  states=[c for c in self.exits if 'interaction'in c and c['id']in v.SIX];self.assertEqual(len(states),24)
  for c in states:
   self.assertIn('uscita',c['legend'].lower());self.assertTrue(c['legendLayout']['visible']);self.assertLessEqual(c['legendLayout']['scrollWidth'],c['legendLayout']['width']);self.assertFalse(any(l['text']=='Uscita'for l in c['labels']))
 def test_pitot_eight_zero_states_and_full_nonzero_heads(self):
  states=[c for c in self.pitot if 'interaction'in c];self.assertEqual(len(states),24);self.assertEqual(sum(c['sourceReplayedX']==0 for c in states),8)
  for c in states:
   arrows=[e for e in c['elements']if e['kind']=='arrow']
   if c['sourceReplayedX']==0:self.assertEqual(arrows,[]);self.assertFalse(c.get('nativeGlyphs',[]))
   else:self.assertEqual(len(arrows),2);self.assertEqual([e['kind']for e in c['elements'][-2:]],['arrow','arrow'])
   if c['profile']['fallback']:self.assertEqual(v.svg.fallback_metal_coverage(c),[])
 def test_retained_contact_is_exactly_the_historical_small_contact(self):
  report=json.loads((v.BASE/'exits-actual/report.json').read_bytes());i=next(i for i in report['cases']if i['caseKey']=='SIM-C2-L008-02|published|320|top|grid|1');c=geometry.load_exact((v.BASE/'exits-actual'/i['file']).read_bytes());g=next(g for g in c['nativeGlyphs']if g['tipInsideOpaqueLabel']);ratio=geometry.part_coverage(c,g['elementIndex'],1,'Uscita');self.assertGreater(ratio,Fraction(2,100));self.assertLess(ratio,Fraction(3,100))
 def test_reintroduced_opaque_label_is_rejected(self):
  c=next(c for c in self.exits if 'interaction'in c and c['id']in v.SIX);old=self.prev(c,self.oldexit);bad=copy.deepcopy(c);bad['elements']=old['elements']
  with self.assertRaises(ValueError):v.compare_new_to_old(bad,old)
 def test_changed_mesh_rejected(self):
  c=next(c for c in self.exits if 'interaction'in c);old=self.prev(c,self.oldexit);bad=copy.deepcopy(c);bad['nativeGlyphs'][0]['tail'][0]+=1
  with self.assertRaises(ValueError):v.compare_new_to_old(bad,old)
 def test_false_identity_or_approval_rejected(self):
  p=json.loads((v.BASE/'exits-prepared.json').read_bytes());c=self.exits[0]
  for field,value in [('sourceCommit','0'*40),('runtimeSha256',v.old.RUNTIME),('scientificApproval',True),('technicalOk',False),('activityCredit',1),('humanApproval','PASS')]:
   bad=copy.deepcopy(c);bad[field]=value
   with self.assertRaises(ValueError):v.accept_case(bad,p)
 def test_shared_wrong_models_do_not_bypass_independent_equations(self):
  c=next(c for c in self.pitot if 'interaction'in c);bad=copy.deepcopy(c);bad['model']['y']+=1;bad['baselineReference']['model']['y']=bad['model']['y'];p=json.loads((v.BASE/'pitot-prepared.json').read_bytes())
  with self.assertRaises(ValueError):v.accept_case(bad,p)
 def test_all_eight_whole_overviews_and_two_extra_full_pngs_read(self):
  rows=json.loads((v.BASE/'overview-index.json').read_bytes());self.assertEqual(len(rows),8);self.assertEqual(sum(len(r['tiles'])for r in rows),52);self.assertTrue(all(r['wholeOpenedAndRead']for r in rows))
  for row in rows:self.assertEqual(hashlib.sha256((v.APP/row['file']).read_bytes()).hexdigest(),row['sha256'])
  extra=json.loads((v.BASE/'extra-full-png-reading.json').read_bytes());self.assertEqual(len(extra),2)
  for row in extra:self.assertTrue(row['wholeOpenedAndRead']);self.assertEqual(hashlib.sha256((v.BASE/row['file']).read_bytes()).hexdigest(),row['sha256'])
 def test_current_static_whole_source_comparison(self):
  p=json.loads((v.BASE/'static-comparison.json').read_bytes());self.assertEqual((p['originalEditions'],p['controls'],p['states'],p['sceneComparisons']),(41,555,875,4375));self.assertEqual(sum(len(r['onlyRemovedLabels'])for r in p['records']),28)
 def test_no_macro_or_human_credit(self):
  for name in ['exits','pitot']:
   r=json.loads((v.BASE/(name+'-actual/report.json')).read_bytes());self.assertEqual(r['activityCredit'],0);self.assertEqual(r['humanApproval'],'NOT_RUN')
if __name__=='__main__':unittest.main()
