import unittest,copy,json
from fractions import Fraction
from hypothesis import given,settings,strategies as st
from tools.corpus_engineering import c2_hydraulics_five_980_review_a as v

class FiveHydraulicOriginals(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.cases=v.actual();cls.p=json.loads((v.BASE/'prepared.json').read_bytes());cls.states=[c for c in cls.cases if'interaction'in c];cls.setup=[c for c in cls.cases if'interaction'not in c]
 def test_01_real_complete_observations(self):
  self.assertEqual((len(self.cases),len(self.states),len(self.setup)),(240,200,40));self.assertEqual(sum(len(c['questions'])for c in self.setup),80)
 def test_02_static_five_and_exact29(self):
  r=json.loads((v.BASE/'independent-math-and-installed-code.json').read_bytes());self.assertEqual(sum(map(len,r['exactChecks'].values())),29);self.assertTrue(all(c['ok']for cs in r['exactChecks'].values()for c in cs));self.assertTrue(all(c['ok']for c in r['installedCode'].values()))
 def test_03_physics_rejects_wrong_scalar_all200(self):
  for c in self.states:
   q=copy.deepcopy(c);q['model']['y']+=1
   with self.assertRaises(ValueError):v.validate_case(q,self.p)
 def test_04_identity_rejects_other_epoch(self):
  for field,value in [('id','SIM-C2-L003-01'),('sourceCommit','0'*40),('runtimeSha256','0'*64),('requestSha256','0'*64),('protocolSha256','0'*64),('sourceSha256','0'*64),('variant','draft'),('candidateSha256','1'*64)]:
   q=copy.deepcopy(self.states[0]);q[field]=value
   with self.assertRaises(ValueError):v.validate_case(q,self.p)
 def test_05_acquisition_cannot_approve(self):
  for field,value in [('scientificApproval',True),('activityCredit',1),('humanApproval','PASS'),('technicalOk',False)]:
   q=copy.deepcopy(self.states[0]);q[field]=value
   with self.assertRaises(ValueError):v.validate_case(q,self.p)
 def test_06_answers_and_phase_mutations(self):
  for field in ['questions','phases']:
   q=copy.deepcopy(self.setup[0]);q[field]=q[field][:-1]
   with self.assertRaises(ValueError):v.validate_case(q,self.p)
  q=copy.deepcopy(self.setup[0]);q['questions'][0]['status']='Non ancora.'
  with self.assertRaises(ValueError):v.validate_case(q,self.p)
 def test_07_invalid_exact_values_before_conversion(self):
  import sympy as sp
  for key in v.IDS:
   for x in [sp.I,sp.oo,-sp.oo,sp.nan,True,None,'1',1.0,complex(1,0)]:
    with self.assertRaises(ValueError):v.exact_value(key,x)
   lo,hi=v.LIMITS[key]
   for x in [lo-1,hi+1]:
    with self.assertRaises(ValueError):v.exact_value(key,x)
 def test_08_nonfinite_actual_observations(self):
  for key in v.IDS:
   for x,y in [(float('inf'),1),(float('nan'),1),(0,float('-inf')),(True,1),(v.LIMITS[key][0],True)]:
    with self.assertRaises(ValueError):v.observed(key,x,y)
 def test_09_scene_changes_rejected(self):
  for id_ in v.IDS:
   q=copy.deepcopy(next(c for c in self.states if c['id']==id_ and c['sourceReplayedX']==self.p['records'][v.IDS.index(id_)]['grid'][-1]));e=q['elements']
   if id_==v.IDS[0]:next(z for z in e if z['kind']=='rod'and z['c']==0x726d81 and z['r']>.2)['r']*=2
   elif id_==v.IDS[1]:next(z for z in e if z['kind']=='ball')['p'][1]+=.1
   else:next(z for z in e if z['kind']=='box'and z['c']==0xd49332)['p'][1]+=.1
   with self.assertRaises(ValueError):v.shape(q)
 def test_10_zero_increments_and_zero_buoyancy(self):
  for id_ in [v.IDS[1],v.IDS[2]]:
   for c in self.states:
    if c['id']==id_ and c['sourceReplayedX']==0:self.assertFalse(any(e['kind']=='arrow'for e in c['elements']))
 def test_11_individual_raster_document(self):
  self.assertTrue(v.assert_visual_review(json.loads((v.BASE/'visual-review-per-id.json').read_bytes())))
 def test_12_open_press_scale_cannot_be_silently_approved(self):
  d=json.loads((v.BASE/'visual-review-per-id.json').read_bytes());d['records'][0]['visualReview']='PASS'
  with self.assertRaises(ValueError):v.assert_visual_review(d)
 @settings(max_examples=120,deadline=None)
 @given(st.sampled_from(v.IDS),st.integers(min_value=0,max_value=10000))
 def test_13_positive_monotonicity_and_inverse(self,key,n):
  import sympy as s
  lo,hi=v.LIMITS[key];x=Fraction(lo)+Fraction(n,10000)*(hi-lo);y=v.exact_value(key,x)
  inverse=y*4 if key==v.IDS[0]else(y-20 if key==v.IDS[1]else(y/10 if key==v.IDS[2]else(y*50 if key==v.IDS[3]else y*10)))
  self.assertEqual(s.simplify(inverse-s.Rational(x.numerator,x.denominator)),0)

if __name__=='__main__':unittest.main()
