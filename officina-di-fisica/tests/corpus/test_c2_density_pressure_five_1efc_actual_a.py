import unittest,json,copy
from tools.corpus_engineering import c2_density_pressure_five_1efc_actual_review_a as v
class CurrentFiveActual(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.cases=v.actual();cls.p=json.loads((v.BASE/'prepared.json').read_bytes());cls.doc=json.loads((v.BASE/'visual-review-per-id.json').read_bytes())
 def test_complete224_eight_profiles_eighty_answers(self):
  self.assertEqual(len(self.cases),224);self.assertEqual(sum('interaction'in c for c in self.cases),184);self.assertEqual(sum(len(c.get('questions',[]))for c in self.cases),80)
 def test_current_local_visual_verdict(self):self.assertTrue(v.assert_visual_review(self.doc))
 def test_source_runtime_and_identity_mutations(self):
  for field,value in [('sourceCommit','0'*40),('runtimeSha256','0'*64),('sourceSha256','0'*64),('variant','draft'),('candidateSha256','0'*64)]:
   c=copy.deepcopy(self.cases[0]);c[field]=value
   with self.assertRaises(ValueError):v.validate_case(c,self.p)
 def test_no_technical_autoapproval(self):
  for field,value in [('scientificApproval',True),('activityCredit',1),('activityCredit',False),('humanApproval','PASS'),('technicalOk',False)]:
   c=copy.deepcopy(self.cases[0]);c[field]=value
   with self.assertRaises(ValueError):v.validate_case(c,self.p)
 def test_historical_upper_plate_plane_rejected(self):
  c=copy.deepcopy(next(c for c in self.cases if c['id']==v.IDS[1]and c.get('sourceReplayedX')==8));arrow=next(e for e in c['elements']if e['kind']=='arrow');arrow['a'][2]=arrow['b'][2]=0
  with self.assertRaises(ValueError):v.validate_case(c,self.p)
 def test_undisturbed_terminal_required(self):
  t=json.loads((v.BASE/'actual-terminal.json').read_bytes());v.require_undisturbed_terminal(t)
  for field,value in [('actualObservedExitCode',-9),('signal',9),('timedOut',True),('assistedTermination',True)]:
   x={**t,field:value}
   with self.assertRaises(ValueError):v.require_undisturbed_terminal(x)
 def test_read_png_and_per_id_scope_mutations(self):
  for action in ['drop-profile','change-png','credit']:
   d=copy.deepcopy(self.doc)
   if action=='drop-profile':d['records'][0]['scope']['profiles']=d['records'][0]['scope']['profiles'][:-1]
   if action=='change-png':d['records'][0]['readPngSha256'][0]='0'*64
   if action=='credit':d['activityCredit']=1
   with self.assertRaises(ValueError):v.assert_visual_review(d)
 def test_couette_zero_all_profiles_and_axial_limits(self):
  z=[c for c in self.cases if c['id']==v.IDS[1]and c.get('sourceReplayedX')==0];self.assertEqual(len(z),8)
  for c in z:self.assertFalse(any(e['kind']=='arrow'for e in c['elements']))
  self.assertIn('axial',self.doc['records'][3]['reason']);self.assertIn('Top',self.doc['records'][1]['reason'])
if __name__=='__main__':unittest.main()
