"""Independent magnification, signed images, focal compatibility and nonidentifiability."""
import ast,json,os,unittest
from copy import deepcopy
from pathlib import Path
from fractions import Fraction
from unittest.mock import patch
import sympy as sp
from hypothesis import given,settings,strategies as st
from tools.corpus_engineering import lens_magnification_verifier as m
from tools.corpus_engineering.pipeline import digest,sha,git_bytes
from tools.corpus_engineering.batches import assert_record_identity
APP=Path(__file__).resolve().parents[2]
CANDIDATE=Path(os.environ.get('CRIC_REVIEW_CANDIDATE_APP',str(APP)))
POS=st.builds(Fraction,st.integers(1,30),st.integers(1,12))
BOUNDED=settings(max_examples=40,derandomize=True,deadline=None)
COUNTS={}
class LensIndependent(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.p=json.loads((CANDIDATE/'editorial/batches'/f'{m.BATCH}.json').read_bytes());cls.b=json.loads((CANDIDATE/'editorial/batches'/f'{m.BATCH}-bindings.json').read_bytes());COUNTS.clear()
 @classmethod
 def tearDownClass(cls):print('INDEPENDENT_CONFIGURATIONS '+json.dumps({'hypothesis':COUNTS,'finiteExactGuardAssertions':getattr(cls,'guards',0)},sort_keys=True),flush=True)
 def test_actual_report_identity_fresh_saved_exact_modes_and_pins(self):
  fresh=m.report(self.p,self.b,CANDIDATE/'editorial/assets');saved=json.loads((APP/'editorial/reviews'/f'{m.BATCH}.json').read_bytes());self.assertEqual(fresh,saved)
  for r in (fresh,saved):
   assert_record_identity(r['records'],m.EXPECTED_IDS,self.p,self.b);self.assertTrue(all(x['ok'] for x in r['records']));self.assertEqual(len(r['records']),16);self.assertEqual(r['verifierSha256'],sha(Path(m.__file__).read_bytes()));self.assertEqual(r['contractSha256'],sha(Path(m.__file__).with_name('review_contract.py').read_bytes()));self.assertEqual(r['humanApproval'],'NOT_RUN');self.assertEqual(r['publication'],'DRAFT');self.assertTrue(all(x['verificationMode'] in ('EXACT_ORACLE','AI_CONCEPTUAL') for x in r['records']))
 def test_all_source_hashes_catalog_and_independence(self):
  for b in self.b:self.assertEqual(digest(m.source_records()[b['sourceId']]),b['sourceSha256'])
  raw=git_bytes(APP.parent,'5d1dc8dc7b601aef959d10d564c75462be74708d','officina-di-fisica/content/C5.json');self.assertEqual(sha(raw),m.LESSON_REFERENCE['sourceSha256']);catalog={r['id']:r for r in json.loads(raw)};self.assertEqual(catalog['C5-L10']['prerequisites'],['C5-L09'])
  for r in self.p['records']:self.assertEqual((r['skill'],r['error']['target'],r['prerequisites']),('C5-L10','C5-L10',['C1-L001','C1-L002','C5-L09','C5-L10']))
  imports=[x.module or '' for x in ast.walk(ast.parse(Path(m.__file__).read_text())) if isinstance(x,ast.ImportFrom)];self.assertFalse(any('authoring' in x for x in imports))
 def test_hostile_retoken_rebind_math_units_source_geometry(self):
  before=(digest(self.p),digest(self.b),dict(m.REVIEWED_CANDIDATES));audit=m.mutation_audit(self.p,self.b,CANDIDATE/'editorial/assets');self.assertTrue(audit['allRejected']);self.assertEqual(audit['caseCount'],29);self.assertEqual(audit,json.loads((APP/'editorial/reviews'/f'{m.BATCH}-independent-mutations.json').read_bytes()));self.assertEqual(sum(x['case']=='wrong_key_rebound_and_all_edition_tokens_replaced' for x in audit['cases']),16);self.assertEqual(before,(digest(self.p),digest(self.b),dict(m.REVIEWED_CANDIDATES)))
 def test_identity_rejects_false_claims_and_dependency_drift(self):
  records=m.report(self.p,self.b,CANDIDATE/'editorial/assets')['records']
  for field,value in [('verificationMode','AI_SCIENTIFIC_PASS'),('candidateSha256','0'*64),('humanApproval','PASS'),('publication','PUBLISHED')]:
   r=deepcopy(records);r[0][field]=value
   with self.assertRaises(ValueError):assert_record_identity(r,m.EXPECTED_IDS,self.p,self.b)
  with patch.object(m,'EXACT_LITERAL_DEPENDENCY_SHA256','0'*64):self.assertTrue(all(not r['ok'] for r in m.verify(self.p,self.b,CANDIDATE/'editorial/assets')))
 def test_exact_lexemes_and_units(self):
  self.assertNotEqual(m.parse_literal('2.0000000000000000001'),2);self.assertEqual(m.parse_literal('0.25'),sp.Rational(1,4));self.assertEqual(m.alternative_identity('1 cm'),m.alternative_identity('10 mm'))
  for bad in ('nan','inf','1/0','__import__("os")','2**100000','1e400','√10001'):
   with self.assertRaises(ValueError):m.parse_literal(bad)
 def test_prekey_math_AST_identical_and_actual_receipt(self):
  p=APP/'editorial/reviews/u7-lens-260-independent-models.py';self.assertEqual(sha(p.read_bytes()),m.INDEPENDENT_MODELS_IMPLEMENTATION_SHA256);models=ast.literal_eval(next(n.value for n in ast.parse(p.read_text()).body if isinstance(n,ast.Assign)));actual={n.name:n for n in ast.parse(Path(m.__file__).read_text()).body if isinstance(n,ast.FunctionDef)}
  for fn in ast.parse(models[m.FAMILY]).body:
   if isinstance(fn,ast.FunctionDef):self.assertEqual(ast.dump(fn,include_attributes=False),ast.dump(actual[fn.name],include_attributes=False))
  r=json.loads((APP/'editorial/reviews/u7-lens-260-model-before-candidates-20261126.json').read_bytes());self.assertEqual((r['exitCode'],r['signal'],r['sourceChecks'],r['invalidFiniteExactInputsRejected']),(0,None,8,162));self.assertFalse(r['candidateKeysOpened']);self.assertFalse(r['candidatePriorExposure'])
 def test_every_numeric_helper_finite_real_exact_and_positive(self):
  baselines={'solve':(6,3),'inverse_first':(2,3),'inverse_second':(2,6),'compatible_focal':(6,3),'scaled':(6,3,1,1),'constrained_pair':(3,),'calibrate':(1,3,2,5,7),'equivalent_literal':(Fraction(1,2),)};count=0
  invalid=(sp.oo,-sp.oo,sp.zoo,sp.I,sp.nan,0.1,sp.Float('0.1'),1+sp.I,float('inf'),float('nan'),sp.Symbol('a',positive=True),True,'1','1+1')
  for name,args in baselines.items():
   fn=getattr(m,name);fn(*args)
   for i in range(len(args)):
    for bad in invalid:
     a=list(args);a[i]=bad
     with self.assertRaises(ValueError):fn(*a)
     count+=1
    if name not in ('calibrate','equivalent_literal'):
     for bad in (0,-1):
      a=list(args);a[i]=bad
      with self.assertRaises(ValueError):fn(*a)
      count+=1
  type(self).guards=count
 def test_invalid_calibration_and_wrong_models_fail(self):
  for args in ((1,3,1,5,7),(0,3,2,5,7),(-1,3,2,5,7),(1,5,2,3,7),(1,3,2,5,1),(1,3,2,5,0)):
   with self.assertRaises(ValueError):m.calibrate(*args)
  for name,bad in [('solve',lambda q,p:sp.sympify(p)/q),('inverse_first',lambda M,p:sp.sympify(p)/M),('compatible_focal',lambda q,p:sp.sympify(q)+p)]:
   m.oracle.cache_clear()
   try:
    with patch.object(m,name,bad):
     with self.assertRaises(AssertionError):m.verify(self.p,self.b,CANDIDATE/'editorial/assets')
   finally:m.oracle.cache_clear()
  self.assertTrue(all(r['ok'] for r in m.verify(self.p,self.b,CANDIDATE/'editorial/assets')))
 def test_full_native_receipt_and_physical_ray_intersections(self):
  r=json.loads((APP/'editorial/reviews/u7-lens-260-svg-independent-evidence/lens-magnification-terminal.json').read_bytes());self.assertEqual((r['exitCode'],r['signal']),(0,None));self.assertTrue(r['fullImageReadByReviewer'] and r['fullXmlReadByReviewer']);self.assertEqual(r['assetSha256'],sha((CANDIDATE/'editorial/assets'/m.ASSET_NAME).read_bytes()));self.assertTrue(m.asset_geometry(CANDIDATE/'editorial/assets'))
  # Independent geometry from physical p=3,q=6,f=2, all axial coordinates /50 cm.
  self.assertEqual(Fraction(560-260,260-110),2);self.assertEqual(Fraction(360-300,300-270),2)
  self.assertEqual(Fraction(360-270,560-260),Fraction(300-270,360-260));self.assertEqual(Fraction(360-270,560-110),Fraction(300-270,260-110))
  self.assertEqual((240,180,210),(120*2,120*Fraction(3,2),120*Fraction(7,4)))
 @BOUNDED
 @given(q=POS,p=POS)
 def test_optical_conjugates_inverses_and_sign(self,q,p):
  COUNTS['conjugates']=COUNTS.get('conjugates',0)+1;M=m.solve(q,p);f=m.compatible_focal(q,p);self.assertEqual(M,q/p);self.assertEqual(m.inverse_first(M,p),q);self.assertEqual(m.inverse_second(M,q),p);self.assertEqual(sp.simplify(1/f-1/p-1/q),0);self.assertTrue(0<f<min(q,p));self.assertLess(-M,0)
 @BOUNDED
 @given(q=POS,p=POS,k1=POS,k2=POS)
 def test_two_preparations_scaling(self,q,p,k1,k2):
  COUNTS['scaling']=COUNTS.get('scaling',0)+1;self.assertEqual(m.scaled(q,p,k1,k2),k1/k2)
 @BOUNDED
 @given(first=POS,gap=POS,gain=POS,offset=st.integers(-20,20))
 def test_display_calibration(self,first,gap,gain,offset):
  COUNTS['calibration']=COUNTS.get('calibration',0)+1;a=sp.Rational(first)*sp.sqrt(2);b=a+sp.Rational(gap);c=b+sp.Rational(gap);actual=m.calibrate(a,gain*a+offset,b,gain*b+offset,gain*c+offset)
  for x,y in zip(actual,(gain,offset,c)):self.assertEqual(sp.simplify(x-y),0)
 @BOUNDED
 @given(p=POS)
 def test_continuous_nonidentifiability_and_mean_counterexample(self,p):
  COUNTS['constraint']=COUNTS.get('constraint',0)+1;q,p,M,f=m.constrained_pair(p);self.assertEqual((q,M,f),(2*p,2,2*p/3));self.assertEqual((m.solve(6,3)+m.solve(9,6))/2,sp.Rational(7,4));self.assertEqual(m.solve(sp.Rational(15,2),sp.Rational(9,2)),sp.Rational(5,3))
if __name__=='__main__':unittest.main()
