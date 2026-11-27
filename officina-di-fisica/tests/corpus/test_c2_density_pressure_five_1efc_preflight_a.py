import unittest,json,copy,math
from fractions import Fraction
from tools.corpus_engineering import c2_density_pressure_five_1efc_review_a as v
class FirstFiveSourcePreflight(unittest.TestCase):
 def test_scope_and_current_math(self):
  r=v.static_report();self.assertEqual((len(r['records']),r['sourceCaseCount'],r['sourceStageCount']),(5,51,255));self.assertEqual(r['browser'],'NOT_RUN');self.assertEqual(r['activityCredit'],0)
 def test_domains_before_cast(self):
  import sympy as sp
  for key in v.IDS:
   for x in [sp.I,sp.oo,-sp.oo,sp.nan,True,1.,None,'1']:
    with self.assertRaises(ValueError):v.exact_value(key,x)
   lo,hi=v.LIMITS[key]
   for x in [lo-1,hi+1]:
    with self.assertRaises(ValueError):v.exact_value(key,x)
  with self.assertRaises(ValueError):v.exact_value(v.IDS[0],Fraction(3,2))
 def test_discrete_state_mass_preservation(self):
  for state,density in [(1,Fraction(1)),(2,Fraction(4,5)),(3,Fraction(1,10))]:self.assertEqual(v.exact_value(v.IDS[0],state)*density,6)
 def test_plate_arrow_geometry_rejects_old_plane(self):
  r=json.loads((v.BASE/'current-node.json').read_bytes());row=next(r for r in r['records']if r['id']==v.IDS[1]);case=copy.deepcopy(row['cases'][-1]);v.source_geometry(v.IDS[1],case['x'],case['elements']);a=next(e for e in case['elements']if e['kind']=='arrow');a['a'][2]=a['b'][2]=0
  with self.assertRaises(ValueError):v.source_geometry(v.IDS[1],case['x'],case['elements'])
 def test_wrong_numeric_models_rejected(self):
  r=json.loads((v.BASE/'current-node.json').read_bytes())
  for row in r['records']:
   for c in row['cases']:
    with self.assertRaises(ValueError):v.observed(row['id'],c['x'],c['output']['y']+1)
 def test_plan_requires_future_producer_and_auth(self):
  p=json.loads((v.BASE/'prepared-plan.json').read_bytes());m=json.loads((v.BASE/'metadata.json').read_bytes());self.assertEqual((len(p['records']),len(p['profiles']),len(p['expectedCaseKeys'])),(5,8,224));self.assertIsNone(m['futureBrowserProducerSha256']);self.assertIn('NOT_RUN',m['browserExecution'])
if __name__=='__main__':unittest.main()
