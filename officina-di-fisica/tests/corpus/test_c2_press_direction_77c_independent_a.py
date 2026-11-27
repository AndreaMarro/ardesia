import unittest,copy,json
from tools.corpus_engineering import c2_press_direction_77c_review_a as v
class PressDirectionRepair(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.cases=v.actual();cls.p=json.loads((v.BASE/'prepared.json').read_bytes());cls.states=[c for c in cls.cases if'interaction'in c]
 def test_01_actual40(self):
  self.assertEqual(len(self.cases),40);self.assertEqual(len(self.states),32);self.assertEqual(sum(len(c['questions'])for c in self.cases if'interaction'not in c),16)
 def test_02_static77_385(self):
  r=json.loads((v.BASE/'static-comparison.json').read_bytes());self.assertEqual(sum(c['states']for c in r['records']),77);self.assertEqual(sum(c['scenes']for c in r['records']),385);self.assertTrue(all(c['numericalAndTasksAndSpecEqual']for c in r['records']))
 def test_03_old_finding_not_retagged(self):
  old=json.loads((v.negative.BASE/'visual-review-per-id.json').read_bytes());self.assertEqual(old['records'][0]['visualReview'],'FAIL');self.assertEqual(old['runtimeSha256'],v.negative.RUNTIME);self.assertNotEqual(old['runtimeSha256'],v.RUNTIME)
 def test_04_zero_arrows_absent_all_profiles(self):
  rows=[c for c in self.states if c['sourceReplayedX']==0];self.assertEqual(len(rows),8);self.assertFalse(any(e['kind']=='arrow'for c in rows for e in c['elements']))
 def test_05_nonzero_directions_remain(self):
  rows=[c for c in self.states if c['sourceReplayedX']!=0];self.assertEqual(len(rows),24)
  for c in rows:
   a=[e for e in c['elements']if e['kind']=='arrow'];self.assertEqual(len(a),2);self.assertLess(a[0]['b'][1],a[0]['a'][1]);self.assertGreater(a[1]['b'][1],a[1]['a'][1])
 def test_06_missing_delimiting_legend_rejected(self):
  for c in self.states:
   q=copy.deepcopy(c);q['legend']=q['legend'].replace('solo i versi','i moduli')
   with self.assertRaises(ValueError):v.shape(q)
 def test_07_geometry_mutation_rejected(self):
  q=copy.deepcopy(self.states[0]);q['elements'][0]['r']*=2
  with self.assertRaises(ValueError):v.shape(q)
 def test_08_epoch_and_approval_rejected(self):
  for field,value in [('runtimeSha256',v.negative.RUNTIME),('sourceCommit',v.negative.CANDIDATE),('activityCredit',1),('scientificApproval',True),('humanApproval','PASS')]:
   q=copy.deepcopy(self.states[0]);q[field]=value
   with self.assertRaises(ValueError):v.validate_case(q,self.p)
 def test_09_wrong_answers_still_rejected(self):
  q=copy.deepcopy(next(c for c in self.cases if'interaction'not in c));q['questions'][0]['status']='Non ancora.'
  with self.assertRaises(ValueError):v.validate_case(q,self.p)
 def test_10_current_read_pngs_each_profile(self):
  d=json.loads((v.BASE/'visual-review-per-id.json').read_bytes());self.assertEqual(d['sourceCommit'],v.CANDIDATE);self.assertEqual(d['runtimeSha256'],v.RUNTIME);self.assertEqual(d['activityCredit'],0);self.assertEqual(len(d['records']),1);r=d['records'][0];self.assertEqual(r['visualReview'],'PASS');self.assertEqual(len(r['readPngSha256']),18)
  sel=json.loads((v.BASE/'raw-png-reading-selection.json').read_bytes());self.assertTrue(all(s['wholeRawPngOpenedAndRead']for s in sel));self.assertEqual({q['sha256']for q in sel},set(r['readPngSha256']))
  for q in sel:self.assertEqual(v.sha((v.APP/q['file']).read_bytes()),q['sha256'])
if __name__=='__main__':unittest.main()
