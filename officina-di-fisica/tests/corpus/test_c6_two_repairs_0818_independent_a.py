import unittest,json,copy,hashlib
from tools.corpus_engineering import c6_two_repairs_0818_review_a as v

class C6Repairs0818(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.cases=v.actual();cls.old=v.prior.actual();cls.states=[c for c in cls.cases if'interaction'in c];cls.plan=json.loads((v.BASE/'prepared.json').read_bytes())
 @staticmethod
 def previous(c,rows):return next(o for o in rows if'interaction'in o and o['id']==c['id']and o['profile']==c['profile']and o['sourceReplayedX']==c['sourceReplayedX'])
 def test_current88_72states(self):self.assertEqual((len(self.cases),len(self.states)),(88,72))
 def test_all16_actual_setup_accessibility(self):
  rows=[c for c in self.cases if'interaction'not in c];self.assertEqual(len(rows),16)
  for c in rows:self.assertEqual(c['axe'],[]);self.assertTrue(all(q['status'].startswith('Corretto. ')for q in c['questions']))
 def test_all72_whole_physical_mesh_camera_comparisons(self):
  for c in self.states:self.assertTrue(v.compare_physical(c,self.previous(c,self.old)))
 def test_virtual_image_heads_clear_in_all_four_previous_nonaxial_cases(self):
  rows=[c for c in self.states if c['id']=='SIM-C6-L06-01'and c['sourceReplayedX']==.5 and c['profile']['view']in['orbit','side']];self.assertEqual(len(rows),4)
  for c in rows:
   self.assertEqual(len(c['nativeGlyphs']),2);self.assertTrue(all(not g['tipInsideOpaqueLabel']for g in c['nativeGlyphs']));self.assertEqual([l['text']for l in c['labels']],['F′'])
 def test_outgoing_bundle_scale_opacity_and_free_label_space(self):
  rows=[c for c in self.states if c['id']=='SIM-C6-L04-01'and c['sourceReplayedX']==5 and c['profile']['view']=='top'];self.assertEqual(len(rows),2)
  for c in rows:self.assertTrue(v.prior.independent_scene(c));self.assertEqual([l['text']for l in c['labels']],['Fascio'])
 def test_both_accessible_names_preserved(self):
  for c in self.states:self.assertIn(v.LABELS[c['id']].lower(),c['legend'].lower());self.assertTrue(c['legendLayout']['visible']);self.assertLessEqual(c['legendLayout']['scrollWidth'],c['legendLayout']['width']+1)
 def test_false_approval_and_stale_runtime_rejected(self):
  for k,value in [('runtimeSha256',v.prior.RUNTIME),('sourceCommit',v.prior.CANDIDATE),('scientificApproval',True),('humanApproval','PASS'),('activityCredit',1),('technicalOk',False)]:
   c=copy.deepcopy(self.cases[0]);c[k]=value
   with self.assertRaises(ValueError):v.validate_case(c,self.plan)
 def test_reintroduced_label_rejected(self):
  for id_ in v.LABELS:
   c=copy.deepcopy(next(c for c in self.states if c['id']==id_));c['elements'].append(dict(kind='label',text=v.LABELS[id_]))
   with self.assertRaises(ValueError):v.validate_case(c,self.plan)
 def test_wrong_mesh_rejected(self):
  c=next(c for c in self.states if c['id']=='SIM-C6-L06-01');bad=copy.deepcopy(c);bad['nativeGlyphs'][0]['parts'][1]['vertices'][0][0]+=1
  with self.assertRaises(ValueError):v.compare_physical(bad,self.previous(c,self.old))
 def test_shared_wrong_numerical_model_rejected(self):
  c=copy.deepcopy(self.states[0]);c['model']['y']+=1;c['baselineReference']['model']['y']=c['model']['y']
  with self.assertRaises(ValueError):v.validate_case(c,self.plan)
 def test_lost_legend_name_rejected(self):
  c=copy.deepcopy(self.states[0]);c['legend']=''
  with self.assertRaises(ValueError):v.validate_case(c,self.plan)
 def test_all_six_static_exact_except_two_labels(self):
  s=json.loads((v.BASE/'static.stdout.txt').read_bytes());self.assertEqual((s['totalControls'],s['totalStates'],s['totalFiveStageScenes']),(97,493,2465));self.assertEqual(sum(len(r['removedLabels'])for r in s['records']),2)
 def test_all16_overviews_and4_extra_full_pngs_read(self):
  rows=json.loads((v.BASE/'overview-index.json').read_bytes());self.assertEqual((len(rows),sum(len(r['tiles'])for r in rows)),(16,72));self.assertTrue(all(r['wholeOpenedAndRead']for r in rows))
  for r in rows:self.assertEqual(hashlib.sha256((v.APP/r['file']).read_bytes()).hexdigest(),r['sha256'])
  rows=json.loads((v.BASE/'full-png-readings.json').read_bytes());self.assertEqual(len(rows),4)
  for r in rows:self.assertTrue(r['wholeOpenedAndRead']);self.assertEqual(hashlib.sha256((v.BASE/r['file']).read_bytes()).hexdigest(),r['sha256'])
 def test_old_negative_is_preserved_and_macro_credit_not_granted(self):
  old=json.loads((v.prior.BASE/'disposition.json').read_bytes());self.assertEqual(set(old['visualFailureIds']),set(v.LABELS))
  now=json.loads((v.BASE/'disposition.json').read_bytes());self.assertEqual(now['twoRepairs'],'POSITIVE_WITHIN_CURRENT88_SCOPE');self.assertFalse(now['completeC6Renewal']);self.assertFalse(now['scientificAcceptanceGranted']);self.assertEqual(now['activityCredit'],0)
if __name__=='__main__':unittest.main()
