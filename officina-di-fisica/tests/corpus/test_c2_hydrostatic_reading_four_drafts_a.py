import unittest,json,copy
from fractions import Fraction
import sympy as sp
from tools.corpus_engineering import c2_hydrostatic_reading_four_draft_review_a as v
class IndependentFourDrafts(unittest.TestCase):
 def package(self):
  p=json.loads((v.BASE/'experiment-c2-hydrostatic-reading-20261127.json').read_bytes());b=json.loads((v.BASE/'experiment-c2-hydrostatic-reading-20261127-bindings.json').read_bytes());s={r['id']:r for r in json.loads((v.APP/'editorial/reviews/c2-density-pressure-five-1efc-independent-a-20261127/original-source.json').read_bytes())};return p,b,s
 def test_installed_eight_tasks(self):
  r=v.report();self.assertEqual((r['draftCount'],r['actualTaskCount']), (4,8));self.assertEqual(r['UI'],'NOT_RUN');self.assertEqual(r['activityCredit'],0);self.assertEqual(sum(x['actualControlStates']for x in r['records']),76)
 def test_exact_finite_before_casts(self):
  for k in v.IDS:
   for x in [sp.I,sp.oo,-sp.oo,sp.nan,True,1.,'1',None]:
    with self.assertRaises(ValueError):v.law(k,x)
   lo,hi=v.DOMAIN[k]
   for x in [lo-1,hi+1]:
    with self.assertRaises(ValueError):v.law(k,x)
 def test_quota_is_not_depth(self):
  k=v.IDS[0];self.assertEqual(v.law(k,0),30);self.assertEqual(v.law(k,3),0)
  with self.assertRaises(ValueError):v.compare_observation(k,2,20)
 def test_barometer_prefix_and_assignment(self):
  k=v.IDS[1];self.assertEqual(v.law(k,102),75);self.assertEqual(v.law(k,Fraction(442,5)),65)
  for wrong in [sp.Rational(75,100),sp.Rational(7500),sp.Rational(102000,13600)*100/sp.Rational(981,100)]:self.assertNotEqual(v.law(k,102),wrong)
 def test_manometer_sign_and_half_arm(self):
  k=v.IDS[2];self.assertEqual(v.law(k,-1),-10);self.assertEqual(v.law(k,0),0);self.assertEqual(v.law(k,2),20)
  for wrong in [-20,10]:
   with self.assertRaises(ValueError):v.compare_observation(k,2,wrong)
 def test_pascal_squared_length_conversion(self):
  k=v.IDS[3];self.assertEqual(v.law(k,6),12);self.assertEqual(v.law(k,5),10);self.assertEqual(v.law(k,0),0)
  for wrong in [1200,120000,3]:
   with self.assertRaises(ValueError):v.compare_observation(k,6,wrong)
 def test_inverse_domains(self):
  for k,points in zip(v.IDS,[[0,Fraction(3,2),3],[68,Fraction(442,5),102,Fraction(544,5)],[-2,0,2],[0,5,10]],strict=True):
   for x in points:self.assertEqual(v.inverse(k,v.law(k,x)),sp.sympify(x))
  for k,y in [(v.IDS[0],31),(v.IDS[1],49),(v.IDS[2],21),(v.IDS[3],-1)]:
   with self.assertRaises(ValueError):v.inverse(k,y)
 def test_source_editions_and_binding(self):
  p,b,s=self.package();self.assertEqual([r['version']for r in v.validate(p,b,s)],[2,2,3,2])
  for i in range(4):
   q=copy.deepcopy(p);q['records'][i]['version']+=1
   with self.assertRaises(ValueError):v.validate(q,b,s)
 def test_rebinding_cannot_approve_other_task(self):
  p,b,s=self.package()
  for i in range(4):
   q=copy.deepcopy(p);links=copy.deepcopy(b);q['records'][i]['assessmentSelection']['points'][1]=q['records'][i]['assessmentSelection']['points'][0];links[i]['candidateSha256']=v.digest(q['records'][i])
   with self.assertRaises(ValueError):v.validate(q,links,s)
 def test_all_source_scalars_reject_wrong_models(self):
  raw=json.loads((v.BASE/'actual-installed-node.json').read_bytes())
  for r in raw['records']:
   for c in r['cases']:
    with self.assertRaises(ValueError):v.compare_observation(r['id'],c['x'],c['y']+1)
 def test_retokens_do_not_erase_section_or_prerequisite(self):
  p,b,s=self.package()
  for i in range(4):
   for field,value in [('section','Different'),('prerequisites',[])]:
    q=copy.deepcopy(p);links=copy.deepcopy(b);q['records'][i][field]=value;links[i]['candidateSha256']=v.digest(q['records'][i])
    with self.assertRaises(ValueError):v.validate(q,links,s)
if __name__=='__main__':unittest.main()
