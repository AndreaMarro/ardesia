from copy import deepcopy
from fractions import Fraction
import json,unittest
from tools.corpus_engineering import c3_l0402_53bd_browser_a as v
class SignedPhaseActual(unittest.TestCase):
 def case(self,i):
  actual,_=v.bind();return next(c for c in actual(v.BASE/'320',v.ID)if c.get('interaction',{}).get('index')==i)
 def test_fresh_saved_and48actual(self):
  r=v.report();self.assertEqual(r,json.loads((v.BASE/'independent-browser-review.json').read_bytes()));self.assertEqual(r['browserCases'],48);self.assertEqual(r['acceptedAnswers'],16)
 def test_exact_heat_balance_sign_and_inverse(self):
  p=v.legacy.cpu.primary
  for i in range(-10,11):
   x=Fraction(i,2);q=p.law(v.ID,x);self.assertEqual(50*q,113*x);self.assertEqual(p.inverse(v.ID,q),x)
  self.assertEqual(p.law(v.ID,3),Fraction(339,50));self.assertEqual(p.law(v.ID,0),0);self.assertEqual(p.law(v.ID,-2),Fraction(-113,25))
 def test_heat_sign_readout_mutations_rejected(self):
  for i in [0,1,3,4]:
   c=self.case(i);r=deepcopy(c);r['model']['y']=-c['model']['y']
   with self.assertRaises(ValueError):v.verify_case(r)
  c=self.case(1);r=deepcopy(c);r['readings']=r['readings'].replace('-4,52','4,52')
  with self.assertRaises(ValueError):v.verify_case(r)
 def test_phase_endpoints_and_particle_mutations(self):
  c=self.case(4);r=deepcopy(c);r['elements']=[e for e in r['elements']if not(e['kind']=='ball'and e.get('r')==.07)]
  with self.assertRaises(ValueError):v.verify_case(r)
  c=self.case(0);r=deepcopy(c);r['elements']=[e for e in r['elements']if not(e['kind']=='rod'and e.get('r')==.87)]
  with self.assertRaises(ValueError):v.verify_case(r)
 def test_exact_domains_and_epoch(self):
  for x in [True,-6,6,float('nan'),0.5]:
   with self.assertRaises(ValueError):v.legacy.cpu.primary.law(v.ID,x)
  before=(v.legacy.cpu.SOURCE,v.legacy.cpu.RUNTIME);r=v.report();self.assertEqual(before,(v.legacy.cpu.SOURCE,v.legacy.cpu.RUNTIME));self.assertEqual(r['runtimeSha256'],v.RUNTIME);self.assertEqual(r['activityCredit'],0)
if __name__=='__main__':unittest.main(verbosity=2)
