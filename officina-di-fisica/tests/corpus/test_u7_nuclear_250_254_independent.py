"""Independent nuclear populations, activity, cumulative counts, mixture and alpha bookkeeping."""
import ast
from copy import deepcopy
from fractions import Fraction
import importlib,json,math,os,re
from pathlib import Path
import unittest
from unittest.mock import patch
import xml.etree.ElementTree as ET
from hypothesis import given,settings,strategies as st
import sympy as sp
from tools.corpus_engineering.pipeline import digest,sha,git_bytes
from tools.corpus_engineering.batches import assert_record_identity
APP=Path(__file__).resolve().parents[2]
CANDIDATE=Path(os.environ.get('CRIC_REVIEW_CANDIDATE_APP',str(APP)))
POS=st.builds(Fraction,st.integers(1,30),st.integers(1,12))
BOUNDED=settings(max_examples=40,derandomize=True,deadline=None)
COUNTS={}
NAMES=('radioactive_survivors','radioactive_activity','radioactive_decayed_count','radioisotope_mixture','alpha_mass_number')
BASELINES=(
 {'solve':(64,1,1),'inverse_first':(32,1,1),'inverse_second':(32,64,1),'infer_origin':(1,48,3,12)},
 {'solve':(20,2,sp.Rational(7,10)),'inverse_first':(7,2,sp.Rational(7,10)),'inverse_second':(7,20,sp.Rational(7,10)),'constrained_family':(20,)},
 {'solve':(64,1,1),'inverse_first':(32,1,1),'inverse_second':(32,64,1),'infer_time':(12,14,1,1)},
 {'solve':(8,8),'inverse_first':(6,8),'inverse_second':(6,8),'equal_activity':(6,)},
 {'solve':(220,1),'inverse_first':(216,1),'inverse_second':(216,220),'constrained_count':(216,)})
class NuclearIndependent(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  COUNTS.clear();cls.rows=[]
  for name in NAMES:
   m=importlib.import_module('tools.corpus_engineering.'+name+'_verifier');p=json.loads((CANDIDATE/'editorial/batches'/(m.BATCH+'.json')).read_bytes());b=json.loads((CANDIDATE/'editorial/batches'/(m.BATCH+'-bindings.json')).read_bytes());cls.rows.append((m,p,b))
 @classmethod
 def tearDownClass(cls):
  print('INDEPENDENT_CONFIGURATIONS '+json.dumps({'hypothesis':COUNTS,'finiteExactGuardAssertions':getattr(cls,'guard_count',0),'invalidCalibrationAssertions':30},sort_keys=True),flush=True)
 def test_fresh_saved_identity_modes_primary_and_exact_dependency(self):
  primary=APP/'editorial/reviews/u7-nuclei-250-254-primary-source-only-20261126.md';modes={'EXACT_ORACLE':0,'AI_CONCEPTUAL':0}
  for m,p,b in self.rows:
   fresh=m.report(p,b,CANDIDATE/'editorial/assets');saved=json.loads((APP/'editorial/reviews'/(m.BATCH+'.json')).read_bytes());self.assertEqual(fresh,saved);dep=sha(Path(m.exact_numbers.__file__).read_bytes());self.assertEqual(dep,m.EXACT_LITERAL_DEPENDENCY_SHA256)
   for result in (fresh,saved):
    assert_record_identity(result['records'],m.EXPECTED_IDS,p,b);self.assertEqual(len(result['records']),16);self.assertTrue(all(x['ok'] for x in result['records']))
    self.assertEqual(result['verifierSha256'],sha(Path(m.__file__).read_bytes()));self.assertEqual(result['contractSha256'],sha(Path(m.__file__).with_name('review_contract.py').read_bytes()));self.assertEqual(result['primaryBeforeCandidateKeys']['sha256'],sha(primary.read_bytes()));self.assertEqual(result['packageSha256'],m.REVIEWED_PACKAGE_SHA256);self.assertEqual(result['bindingsSha256'],m.REVIEWED_BINDINGS_SHA256);self.assertEqual(result['humanApproval'],'NOT_RUN');self.assertEqual(result['publication'],'DRAFT')
    for r in result['records']:
     self.assertIn(r['verificationMode'],modes);self.assertEqual(r['reviewDependencySha256'],{'exact_arithmetic_literals.py':dep})
   for r in fresh['records']:modes[r['verificationMode']]+=1
  self.assertEqual(modes,{'EXACT_ORACLE':54,'AI_CONCEPTUAL':26})
 def test_actual_catalog_mapping_nuclear_lesson_and_foundations(self):
  raw=git_bytes(APP.parent,'5d1dc8dc7b601aef959d10d564c75462be74708d','officina-di-fisica/content/C5.json');self.assertEqual(sha(raw),'dac4490e6a900f5da191bf7a1f5b8463ddc57c8bbaa36cb7a4a375c70fa77422');catalog={r['id']:r for r in json.loads(raw)}
  self.assertEqual(catalog['C5-L08']['title'],'Una popolazione di nuclei che cambia nel tempo');self.assertEqual(catalog['C5-L08']['prerequisites'],[])
  for m,p,b in self.rows:
   self.assertEqual(m.LESSON_REFERENCE['sourceSha256'],sha(raw));self.assertEqual(m.LESSON_REFERENCE['primarySkill'],'C5-L08')
   for r in p['records']:self.assertEqual((r['skill'],r['error']['target'],r['prerequisites']),('C5-L08','C5-L08',['C1-L001','C5-L08']))
 def test_hostile_rebinding_retokenized_math_units_geometry_and_labels(self):
  for m,p,b in self.rows:
   before=(digest(p),digest(b),dict(m.REVIEWED_CANDIDATES),m.REVIEWED_PACKAGE_SHA256,m.REVIEWED_BINDINGS_SHA256);audit=m.mutation_audit(p,b,CANDIDATE/'editorial/assets');self.assertEqual(audit,json.loads((APP/'editorial/reviews'/(m.BATCH+'-independent-mutations.json')).read_bytes()));self.assertEqual(audit['caseCount'],29);self.assertTrue(audit['allRejected'])
   self.assertEqual(sum(x['case']=='wrong_key_rebound_and_all_edition_tokens_replaced' for x in audit['cases']),16)
   for n in ('decimal_lexeme_below_float_ulp_rebound_and_retokenized','numeric_JSON_binary_float_rebound_and_retokenized','wrong_SVG_quantity_label_all_hashes_bindings_and_tokens_replaced'):self.assertEqual(sum(x['case']==n for x in audit['cases']),1)
   self.assertEqual(before,(digest(p),digest(b),dict(m.REVIEWED_CANDIDATES),m.REVIEWED_PACKAGE_SHA256,m.REVIEWED_BINDINGS_SHA256))

 def test_identity_rejects_invalid_claims_and_dependency_drift(self):
     for m, p, b in self.rows:
         original = m.report(p, b, CANDIDATE / 'editorial/assets')['records']
         for field, value in [('verificationMode', 'AI_SCIENTIFIC_PASS'), ('candidateSha256', '0' * 64), ('sourceSha256', '0' * 64), ('humanApproval', 'PASS'), ('publication', 'PUBLISHED')]:
             bad = deepcopy(original)
             bad[0][field] = value
             with self.assertRaises(ValueError):
                 assert_record_identity(bad, m.EXPECTED_IDS, p, b)
         with patch.object(m, 'EXACT_LITERAL_DEPENDENCY_SHA256', '0' * 64):
             rows = m.verify(p, b, CANDIDATE / 'editorial/assets')
             self.assertTrue(all((not r['ok'] and 'Independent exact literal dependency edition mismatch' in r['errors'] for r in rows)))

 def test_literal_lexemes_do_not_roundtrip_through_binary_float(self):
     for m, _, _ in self.rows:
         self.assertNotEqual(m.parse_literal('2.0000000000000000001'), 2)
         self.assertEqual(m.parse_literal('0.25'), sp.Rational(1, 4))
         self.assertEqual(m.parse_literal('−4/5'), -sp.Rational(4, 5))
         self.assertEqual(m.parse_literal('(1+√3)'), 1 + sp.sqrt(3))
         for bad in ('nan', 'inf', '1/0', '__import__("os")', '2**100000', '1e400', '√10001', '0x10'):
             with self.assertRaises(ValueError):
                 m.parse_literal(bad)

 def test_all_eighty_source_hashes_and_no_authoring_imports(self):
     for m, p, b in self.rows:
         source = m.source_records()
         for z in b:
             self.assertEqual(digest(source[z['sourceId']]), z['sourceSha256'])
         imports = []
         for node in ast.walk(ast.parse(Path(m.__file__).read_text())):
             if isinstance(node, ast.Import):
                 imports.extend((x.name for x in node.names))
             if isinstance(node, ast.ImportFrom):
                 imports.append(node.module or '')
         self.assertFalse(any(('authoring' in x for x in imports)))

 @BOUNDED
 @given(first=POS,gap=POS,gain=POS,offset=st.integers(-20,20))
 def test_calibration_exact_algebraic_positive_references_and_gain(self,first,gap,gain,offset):
  COUNTS['calibration']=COUNTS.get('calibration',0)+1;a=sp.Rational(first)*sp.sqrt(2);b=a+sp.Rational(gap);c=b+sp.Rational(gap)
  for m,_,_ in self.rows:
   actual=m.calibrate(a,gain*a+offset,b,gain*b+offset,gain*c+offset)
   for x,y in zip(actual,(gain,offset,c)):self.assertEqual(sp.simplify(x-y),0)
 @BOUNDED
 @given(n0=st.integers(1,80),t=st.integers(1,6),half=st.integers(1,4))
 def test_parent_survival_positive_fraction_inverse_and_unknown_half(self,n0,t,half):
  COUNTS['survivors']=COUNTS.get('survivors',0)+1;m=self.rows[0][0];out=m.solve(n0,t,half)
  self.assertTrue(0<out<n0);self.assertEqual(m.inverse_first(out,t,half),n0);self.assertEqual(sp.simplify(m.inverse_second(out,n0,half)-t),0)
  fitted=m.infer_origin(half,m.solve(n0,half,half),3*half,m.solve(n0,3*half,half));self.assertEqual(fitted,(half,n0))
 @BOUNDED
 @given(n=st.integers(1,80),half=POS,new_n=st.integers(1,80),scale=POS)
 def test_activity_integer_count_exact_model_inverse_and_scaling(self,n,half,new_n,scale):
  COUNTS['activity']=COUNTS.get('activity',0)+1;m=self.rows[1][0];out=m.solve(n,half)
  self.assertEqual(out,sp.Rational(7,10)*n/half);self.assertEqual(m.inverse_first(out,half),n);self.assertEqual(m.inverse_second(out,n),half);self.assertEqual(m.solve(new_n,half*scale)/out,sp.Rational(new_n,n)/scale)
  self.assertEqual(m.constrained_family(n),(n,sp.Rational(n,10),7));self.assertEqual(sp.simplify(m.solve(n,half,sp.log(2))-sp.log(2)*n/half),0)
 @BOUNDED
 @given(n0=st.integers(1,80),t=st.integers(1,6),half=st.integers(1,4))
 def test_cumulative_parent_complement_inverse_and_two_cumulative_measurements(self,n0,t,half):
  COUNTS['cumulative']=COUNTS.get('cumulative',0)+1;m=self.rows[2][0];survive=self.rows[0][0];out=m.solve(n0,t,half)
  self.assertTrue(0<out<n0);self.assertEqual(sp.simplify(out+survive.solve(n0,t,half)),n0);self.assertEqual(m.inverse_first(out,t,half),n0);self.assertEqual(sp.simplify(m.inverse_second(out,n0,half)-t),0)
  fitted=m.infer_time(m.solve(n0,t,half),m.solve(n0,t+half,half),half,half);self.assertEqual(fitted,(t,n0))
 @BOUNDED
 @given(a1=POS,a2=POS,b1=POS,b2=POS)
 def test_mixture_weighted_sum_two_inverses_and_linearity(self,a1,a2,b1,b2):
  COUNTS['mixture']=COUNTS.get('mixture',0)+1;m=self.rows[3][0];out=m.solve(a1,a2)
  self.assertEqual(out,a1/2+a2/4);self.assertEqual(m.inverse_first(out,a2),a1);self.assertEqual(m.inverse_second(out,a1),a2);self.assertEqual((out+m.solve(b1,b2))/2,m.solve((a1+b1)/2,(a2+b2)/2));self.assertEqual(m.equal_activity(m.solve(a1,a1)),a1)
 @BOUNDED
 @given(n=st.integers(1,20),remaining=st.integers(1,230))
 def test_alpha_integer_bookkeeping_inverse_and_constraint(self,n,remaining):
  COUNTS['alpha']=COUNTS.get('alpha',0)+1;m=self.rows[4][0];a0=remaining+4*n
  self.assertEqual(m.solve(a0,n),remaining);self.assertEqual(m.inverse_first(remaining,n),a0);self.assertEqual(m.inverse_second(remaining,a0),n);self.assertEqual(m.constrained_count(216*n),(n,220*n))
 def test_manual_means_discrete_domains_and_final_alpha_parameterization(self):
  s,a,c,m,n=(r[0] for r in self.rows)
  self.assertEqual((s.solve(64,1)+s.solve(32,2))/2,20);self.assertEqual(s.solve(48,sp.Rational(3,2)),12*sp.sqrt(2));self.assertEqual((c.solve(64,1)+c.solve(32,2))/2,28);self.assertEqual(c.solve(48,sp.Rational(3,2)),48-12*sp.sqrt(2))
  self.assertEqual((a.solve(20,2)+a.solve(1,1))/2,sp.Rational(77,20))
  with self.assertRaises(ValueError):a.solve(sp.Rational(21,2),sp.Rational(3,2))
  self.assertEqual(n.solve(228,2)/n.solve(220,1),sp.Rational(55,54));self.assertEqual(n.solve(10,2)/n.solve(220,1),sp.Rational(1,108));self.assertEqual((n.solve(220,1)+n.solve(228,2))/2,218)
  with self.assertRaises(ValueError):n.solve(224,sp.Rational(3,2))
 def test_strict_physical_domains_including_inverse_residuals(self):
  s,a,c,m,n=(r[0] for r in self.rows)
  invalid=[(s.inverse_second,(64,64)),(s.inverse_second,(65,64)),(s.infer_origin,(3,12,1,48)),(s.infer_origin,(1,12,3,48)),(a.solve,(Fraction(1,2),2)),(a.inverse_first,(1,1)),(c.inverse_second,(64,64)),(c.inverse_second,(65,64)),(c.infer_time,(12,12)),(c.infer_time,(14,12)),(m.inverse_first,(2,8)),(m.inverse_first,(1,8)),(m.inverse_second,(4,8)),(m.inverse_second,(3,8)),(n.solve,(8,2)),(n.inverse_second,(215,220)),(n.constrained_count,(217,))]
  for fn,args in invalid:
   with self.assertRaises(ValueError):fn(*args)
 def test_calibration_invalid_gains_references_and_decoded_outputs(self):
  # Six independent invalid configurations per module, with a valid baseline first.
  bad=[(1,3,1,5,7),(0,3,2,5,7),(-1,3,2,5,7),(1,5,2,3,7),(1,3,2,5,1),(1,3,2,5,0)]
  for m,_,_ in self.rows:
   self.assertEqual(m.calibrate(1,3,2,5,7),(2,1,3))
   for args in bad:
    with self.assertRaises(ValueError):m.calibrate(*args)
 def test_all_public_numeric_helpers_reject_nonfinite_nonreal_and_binary_floats(self):
  forbidden=[sp.oo,-sp.oo,sp.zoo,sp.I,sp.nan,0.1,sp.Float('0.1'),sp.Add(sp.sqrt(2),sp.Float('0.1'),evaluate=False),1+sp.I,float('inf'),float('nan'),sp.Symbol('unknown',positive=True),True,'1','1 + 1'];count=0
  for (m,_,_),seed in zip(self.rows,BASELINES):
   cases=[(getattr(m,name),args) for name,args in seed.items()]+[(m.calibrate,(1,3,2,5,7)),(m.equivalent_literal,(Fraction(1,2),))]
   for fn,args in cases:
    fn(*args)
    for i in range(len(args)):
     for invalid in forbidden:
      bad=list(args);bad[i]=invalid
      with self.subTest(family=m.FAMILY,helper=fn.__name__,index=i,bad=repr(invalid)):
       with self.assertRaises(ValueError):fn(*bad)
      count+=1
     if fn.__name__ not in ('calibrate','equivalent_literal'):
      for invalid in (0,-1):
       bad=list(args);bad[i]=invalid
       with self.assertRaises(ValueError):fn(*bad)
       count+=1
  type(self).guard_count=count
 def test_prekey_model_math_AST_and_disclosed_strict_guard_only(self):
  path=APP/'editorial/reviews/u7-nuclear-250-254-independent-models.py';self.assertEqual(sha(path.read_bytes()),'58e478edc733fb198a7711e2a5fdfa8c7f46d3537f331562cf531737f04ed4bc');models=ast.literal_eval(next(n.value for n in ast.parse(path.read_text()).body if isinstance(n,ast.Assign)))
  receipt=json.loads((APP/'editorial/reviews/u7-nuclear-250-254-models-pre-candidates-20261126.json').read_bytes());self.assertEqual((receipt['exitCode'],receipt['signal'],receipt['sourceChecks'],receipt['invalidFiniteExactInputsRejected']),(0,None,25,600));self.assertFalse(receipt['candidateOptionsKeysSolutionsSVGOpened'])
  for m,p,b in self.rows:
   actual={n.name:n for n in ast.parse(Path(m.__file__).read_text()).body if isinstance(n,ast.FunctionDef)};self.assertEqual(m.INDEPENDENT_MODELS_IMPLEMENTATION_SHA256,sha(path.read_bytes()))
   for fn in ast.parse(models[m.FAMILY]).body:
    if isinstance(fn,ast.FunctionDef):
     if fn.name=='_finite_exact':fn=ast.parse(ast.unparse(fn).replace('sp.sympify(value)','sp.sympify(value,strict=True)')).body[0]
     self.assertEqual(ast.dump(fn,include_attributes=False),ast.dump(actual[fn.name],include_attributes=False))
 def test_native_terminal_full_reading_and_independent_svg_curve_samples(self):
  for m,p,b in self.rows:
   r=json.loads((APP/'editorial/reviews/u7-nuclear-250-254-svg-independent-evidence'/(m.FAMILY+'-terminal.json')).read_bytes());self.assertEqual(r['exitCode'],0);self.assertIsNone(r['signal']);self.assertTrue(r['fullImageReadByReviewer']);self.assertTrue(r['fullXmlReadByReviewer']);self.assertEqual(r['assetSha256'],sha((CANDIDATE/'editorial/assets'/m.ASSET_NAME).read_bytes()))
   root=ET.parse(CANDIDATE/'editorial/assets'/m.ASSET_NAME).getroot();self.assertIn('640 1600',root.get('viewBox'));self.assertTrue(m.asset_geometry(CANDIDATE/'editorial/assets'))
   if m.FAMILY in ('radioactive-survivors','radioactive-decayed-count'):
    path=next(x.get('d') for x in root.iter() if x.tag.endswith('path') and x.get('stroke-width')=='3');coords=[tuple(map(float,pair)) for pair in re.findall(r'[ML]([0-9.]+) ([0-9.]+)',path)];self.assertEqual(len(coords),121)
    for x,y in coords:
     t=(x-150)/110;expected=64*2**(-t) if m.FAMILY=='radioactive-survivors' else 64*(1-2**(-t));self.assertLessEqual(abs(y-(1000-5*expected)),0.000051)
 def test_semantic_units_and_exact_literal_equivalence(self):
  for m,_,_ in self.rows:
   self.assertEqual(m.alternative_identity('32 milioni di nuclei'),m.alternative_identity('32000000 nuclei'));self.assertEqual(m.alternative_identity('1 Bq'),m.alternative_identity('1 s⁻¹'));self.assertEqual(m.alternative_identity('1 h'),m.alternative_identity('3600 s'));self.assertNotEqual(m.parse_literal('2.0000000000000000001'),2)
 def test_wrong_constitutive_and_inverse_models_fail_without_frozen_key_reliance(self):
  laws=[lambda n,t,*rest:sp.sympify(n)/(2*t),lambda n,t,*rest:sp.sympify(n)*t,lambda n,t,*rest:sp.sympify(n)*sp.Pow(2,-sp.sympify(t)),lambda a,b:sp.sympify(a)/2+sp.sympify(b)/2,lambda a,n:sp.sympify(a)-2*n]
  inverses=[lambda y,t,*rest:sp.sympify(y)/sp.Pow(2,sp.sympify(t)),lambda y,t,*rest:sp.sympify(y)*t*sp.Rational(7,10),lambda y,t,*rest:sp.sympify(y)*(1-sp.Pow(2,-sp.sympify(t))),lambda y,b:sp.sympify(y)+b,lambda y,n:sp.sympify(y)-4*n]
  for (m,p,b),law,inverse in zip(self.rows,laws,inverses):
   for name,bad in (('solve',law),('inverse_first',inverse)):
    m.oracle.cache_clear()
    try:
     with patch.object(m,name,bad):
      try:rows=m.verify(p,b,CANDIDATE/'editorial/assets')
      except AssertionError:pass
      else:self.assertTrue(any(not r['ok'] for r in rows))
    finally:m.oracle.cache_clear()
   self.assertTrue(all(r['ok'] for r in m.verify(p,b,CANDIDATE/'editorial/assets')))
if __name__=='__main__':unittest.main()
