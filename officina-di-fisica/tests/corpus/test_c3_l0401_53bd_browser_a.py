from copy import deepcopy
from fractions import Fraction
import json,unittest
from tools.corpus_engineering import c3_l0401_53bd_browser_a as v
class FusionClockActual(unittest.TestCase):
 def case(self,kind,index):
  actual,_=v.bind();return next(c for c in actual(v.BASE/'320',v.ID)if c.get('interaction',{}).get('kind')==kind and c['interaction']['index']==index)
 def test_fresh_saved_and80actual(self):
  r=v.report();self.assertEqual(r,json.loads((v.BASE/'independent-browser-review.json').read_bytes()));self.assertEqual(r['browserCases'],80);self.assertEqual(r['actualClockCases'],32)
 def test_exact_energy_units_and_clock_mass(self):
  p=v.legacy.cpu.primary;self.assertEqual(p.law(v.ID,Fraction(167,10)),50);self.assertEqual(p.law(v.ID,Fraction(1837,100)),55)
  self.assertEqual([v.exact_instant_mass(Fraction(167,5),t)for t in v.TIMES],[0,Fraction(5,8),50,100]);self.assertEqual(v.exact_instant_mass(0,20),0)
  for q,m in [(Fraction(167,100)*n,5*n)for n in range(21)]:self.assertEqual(p.law(v.ID,q),m);self.assertEqual(p.inverse(v.ID,m),q)
 def test_clock_interaction_and_readout_mutations_rejected(self):
  c=self.case('clock',1)
  for mutate in [lambda r:r['interaction'].update(time=10),lambda r:r.update(sourceReplayedClockTime=10),lambda r:r.update(clockReadout='10'),lambda r:r.update(readings=r['readings'].replace('Massa già fusa0,625','Massa già fusa100')),lambda r:r['model'].update(y=99)]:
   r=deepcopy(c);mutate(r)
   with self.assertRaises(ValueError):v.verify_case(r)
 def test_zero_full_and_small_nonzero_phases(self):
  zero=self.case('clock',0);small=self.case('clock',1);full=self.case('clock',3)
  solid=next(e for e in zero['elements']if e['kind']=='box');liquid=next(e for e in small['elements']if e['kind']=='rod'and e.get('r')==.87)
  for source,mutate in [(zero,lambda r:r['elements'].append(liquid)),(small,lambda r:r.update(elements=[e for e in r['elements']if not(e['kind']=='rod'and e.get('r')==.87)])),(full,lambda r:r['elements'].append(solid))]:
   r=deepcopy(source);mutate(r)
   with self.assertRaises(ValueError):v.verify_case(r)
 def test_constant_zero_temperature_and_shape_mutations(self):
  c=self.case('clock',2)
  for kind in ['thermometer','solid']:
   r=deepcopy(c)
   if kind=='thermometer':next(e for e in r['elements']if e['kind']=='rod'and e.get('r')==.047)['b'][1]=.90
   else:next(e for e in r['elements']if e['kind']=='box')['size'][0]*=2
   with self.assertRaises(ValueError):v.verify_case(r)
 def test_exact_domains_before_cast(self):
  for q,t in [(True,0),(0,True),(1.67,0),(0,.125),(34,0),(0,-1),(0,21),(Fraction(167,5),float('inf'))]:
   with self.assertRaises(ValueError):v.exact_instant_mass(q,t)
 def test_legacy_epoch_unchanged_and_credit0(self):
  before=(v.legacy.cpu.SOURCE,v.legacy.cpu.RUNTIME);r=v.report();self.assertEqual(before,(v.legacy.cpu.SOURCE,v.legacy.cpu.RUNTIME));self.assertNotEqual(v.RUNTIME,before[1]);self.assertEqual(r['activityCredit'],0);self.assertEqual(r['humanApproval'],'NOT_RUN')
if __name__=='__main__':unittest.main(verbosity=2)
