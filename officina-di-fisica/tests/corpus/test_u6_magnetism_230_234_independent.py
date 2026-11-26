"""Independent Lorentz/Newton/energy/flux laws, exact domains and hostile rebinding."""
import ast
from copy import deepcopy
from fractions import Fraction
import importlib,json,os,inspect
from pathlib import Path
import unittest
from unittest.mock import patch
from hypothesis import given,settings,strategies as st
import sympy as sp
from tools.corpus_engineering.pipeline import digest,sha,git_bytes
from tools.corpus_engineering.batches import assert_record_identity
APP=Path(__file__).resolve().parents[2]
CANDIDATE=Path(os.environ.get('CRIC_REVIEW_CANDIDATE_APP',str(APP)))
POS=st.builds(Fraction,st.integers(1,30),st.integers(1,12))
BOUNDED=settings(max_examples=40,derandomize=True,deadline=None)
HYPOTHESIS_COUNTS={}
NAMES=('force_current_wire','magnetic_circle_radius','accelerated_magnetic_radius','magnetic_orbit_period','magnetic_flux')
class MagnetismIndependent(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  HYPOTHESIS_COUNTS.clear();cls.rows=[]
  for name in NAMES:
   m=importlib.import_module('tools.corpus_engineering.'+name+'_verifier')
   p=json.loads((CANDIDATE/'editorial/batches'/(m.BATCH+'.json')).read_bytes());b=json.loads((CANDIDATE/'editorial/batches'/(m.BATCH+'-bindings.json')).read_bytes());cls.rows.append((m,p,b))
 @classmethod
 def tearDownClass(cls):
  print('INDEPENDENT_CONFIGURATIONS '+json.dumps({'hypothesis':HYPOTHESIS_COUNTS,'finiteExactGuardAssertions':getattr(cls,'finite_guard_assertions',0),'invalidCalibrationAssertions':30},sort_keys=True),flush=True)
 def test_fresh_saved_identity_modes_primary_and_exact_dependency(self):
  primary=APP/'editorial/reviews/u6-magnetism-induction-230-234-primary-source-only.md'
  total={'EXACT_ORACLE':0,'AI_CONCEPTUAL':0}
  for m,p,b in self.rows:
   fresh=m.report(p,b,CANDIDATE/'editorial/assets');saved=json.loads((APP/'editorial/reviews'/(m.BATCH+'.json')).read_bytes());self.assertEqual(fresh,saved)
   dependency=sha(Path(m.exact_numbers.__file__).read_bytes());self.assertEqual(dependency,m.EXACT_LITERAL_DEPENDENCY_SHA256)
   for result in (fresh,saved):
    assert_record_identity(result['records'],m.EXPECTED_IDS,p,b);self.assertEqual(len(result['records']),16);self.assertTrue(all(r['ok'] for r in result['records']))
    for r in result['records']:
     self.assertIn(r['verificationMode'],total);self.assertEqual(r['reviewDependencySha256'],{'exact_arithmetic_literals.py':dependency})
    self.assertEqual(result['verifierSha256'],sha(Path(m.__file__).read_bytes()));self.assertEqual(result['contractSha256'],sha(Path(m.__file__).with_name('review_contract.py').read_bytes()))
    self.assertEqual(result['primaryBeforeCandidateKeys']['sha256'],sha(primary.read_bytes()));self.assertEqual(result['packageSha256'],m.REVIEWED_PACKAGE_SHA256);self.assertEqual(result['bindingsSha256'],m.REVIEWED_BINDINGS_SHA256)
    self.assertEqual(result['humanApproval'],'NOT_RUN');self.assertEqual(result['publication'],'DRAFT')
   for r in fresh['records']:total[r['verificationMode']]+=1
  self.assertEqual(sum(total.values()),80);self.assertEqual(total,{'EXACT_ORACLE':53,'AI_CONCEPTUAL':27})
 def test_actual_catalog_mapping_and_autonomous_bar_magnet_exception(self):
  raw=git_bytes(APP.parent,'5d1dc8dc7b601aef959d10d564c75462be74708d','officina-di-fisica/content/C4.json');self.assertEqual(sha(raw),'19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c')
  catalog={x['id']:x for x in json.loads(raw)}
  self.assertEqual(catalog['C4-L09']['title'],'Correnti, bussole e traiettorie curve');self.assertEqual(catalog['C4-L10']['title'],'Indurre una tensione cambiando il flusso')
  for m,p,b in self.rows:
   self.assertEqual(m.LESSON_REFERENCE['sourceSha256'],sha(raw))
   for row in p['records']:
    n=int(row['id'].rsplit('-',1)[1]);skill='C4-L10' if m.FAMILY=='magnetic-flux' and n!=3 else 'C4-L09'
    self.assertEqual(row['skill'],skill);self.assertEqual(row['error']['target'],skill)
    for prereq in row['prerequisites']:
     if prereq.startswith('C4-'):self.assertIn(prereq,catalog)
 def test_all_hostile_rebinding_retokenized_wrong_math_units_geometry_and_labels(self):
  for m,p,b in self.rows:
   before=(digest(p),digest(b),dict(m.REVIEWED_CANDIDATES),m.REVIEWED_PACKAGE_SHA256,m.REVIEWED_BINDINGS_SHA256)
   audit=m.mutation_audit(p,b,CANDIDATE/'editorial/assets');saved=json.loads((APP/'editorial/reviews'/(m.BATCH+'-independent-mutations.json')).read_bytes());self.assertEqual(audit,saved);self.assertEqual(audit['caseCount'],29);self.assertTrue(audit['allRejected'])
   self.assertEqual(sum(x['case']=='wrong_key_rebound_and_all_edition_tokens_replaced' for x in audit['cases']),16)
   for label in ('decimal_lexeme_below_float_ulp_rebound_and_retokenized','numeric_JSON_binary_float_rebound_and_retokenized','wrong_SVG_quantity_label_all_hashes_bindings_and_tokens_replaced'):
    self.assertEqual(sum(x['case']==label for x in audit['cases']),1,label)
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

 def test_calibration_guards_are_explicit_and_reject_invalid_decoding(self):
     for m, _, _ in self.rows:
         for args in [(0, 2, 3, 6, 3, 5, 7), (1, 1, 3, 6, 3, 5, 7), (1, 2, 0, 6, 3, 5, 7), (1, 2, 3, 6, 5, 3, 7), (1, 2, 3, 0, 3, 5, 7), (1, 2, 3, 6, 3, 5, 0)]:
             with self.assertRaises(ValueError):
                 m.calibrate(*args, 'dimensionless')
         fn = next((n for n in ast.parse(Path(m.__file__).read_text()).body if isinstance(n, ast.FunctionDef) and n.name == 'calibrate'))
         self.assertFalse(any((isinstance(n, ast.Assert) for n in ast.walk(fn))))

 @BOUNDED
 @given(first=POS,gap=POS,gain=POS,offset=st.integers(-20,20))
 def test_calibration_exact_algebraic_refs_and_SI_dimensions(self,first,gap,gain,offset):
  HYPOTHESIS_COUNTS['calibration']=HYPOTHESIS_COUNTS.get('calibration',0)+1
  first=sp.Rational(first)*sp.sqrt(2);second=first+sp.Rational(gap);third=second+sp.Rational(gap)
  for (m,_,_),unit in zip(self.rows,('millinewton','meter','meter','second','weber')):
   actual=m.calibrate(first,second,gain*first,gain*third,gain*first+offset,gain*second+offset,gain*third+offset,unit)
   for x,y in zip(actual,(gain,offset,third,third)):self.assertEqual(sp.simplify(x-y),0)
 @BOUNDED
 @given(a=POS,b=POS,k1=POS,k2=POS)
 def test_wire_cross_product_inverses_scaling_and_constraint(self,a,b,k1,k2):
  HYPOTHESIS_COUNTS['wire']=HYPOTHESIS_COUNTS.get('wire',0)+1;m=self.rows[0][0];force=m.result(a,b)
  self.assertEqual(force,10*a*b);self.assertEqual(m.inverse_first(force,b),a);self.assertEqual(m.inverse_second(force,a),b);self.assertEqual(m.scaled(a,b,k1,k2),k1*k2)
  length=m.constrained_length(force);self.assertEqual(sp.simplify(m.result(2*length/3,length)-force),0)
 @BOUNDED
 @given(a=POS,b=POS,k1=POS,k2=POS)
 def test_circle_Newton_inverses_scaling_and_redundant_constraint(self,a,b,k1,k2):
  HYPOTHESIS_COUNTS['circle']=HYPOTHESIS_COUNTS.get('circle',0)+1;m=self.rows[1][0];radius=m.result(a,b)
  self.assertEqual(radius,a/b);self.assertEqual(m.inverse_first(radius,b),a);self.assertEqual(m.inverse_second(radius,a),b);self.assertEqual(m.scaled(a,b,k1,k2),k1/k2)
  self.assertEqual(m.result(m.constrained_speed(b),b),2)
 @BOUNDED
 @given(a=POS,b=POS,k1=POS,k2=POS)
 def test_acceleration_energy_Newton_inverses_and_linear_constraint(self,a,b,k1,k2):
  HYPOTHESIS_COUNTS['acceleration']=HYPOTHESIS_COUNTS.get('acceleration',0)+1;m=self.rows[2][0];radius=m.result(a,b)
  self.assertEqual(sp.simplify(radius**2-2*a/b**2),0);self.assertEqual(m.inverse_first(radius,b),a);self.assertEqual(sp.simplify(m.inverse_second(radius,a)-b),0)
  self.assertEqual(m.scaled(a,b,k1,k2),sp.sqrt(sp.Rational(k1))/k2)
  field=m.constrained_field(a);self.assertEqual(field,4/a**2);self.assertEqual(sp.simplify(m.result(2*field,field)-a),0)
 @BOUNDED
 @given(a=POS,b=POS,k1=POS,k2=POS)
 def test_cyclotron_tau_full_period_inverse_and_constraint(self,a,b,k1,k2):
  HYPOTHESIS_COUNTS['period']=HYPOTHESIS_COUNTS.get('period',0)+1;m=self.rows[3][0];tau=m.result(a,b)
  self.assertEqual(tau,a/b);self.assertEqual(m.full_period(tau),2*sp.pi*tau);self.assertEqual(m.inverse_first(tau,b),a);self.assertEqual(m.inverse_second(tau,a),b);self.assertEqual(m.scaled(a,b,k1,k2),k1/k2)
  self.assertEqual(m.result(m.constrained_mass(b),b),sp.Rational(1,2))
 @BOUNDED
 @given(a=POS,b=POS,k1=POS,k2=POS)
 def test_open_plane_flux_inverse_scaling_and_positive_constraint(self,a,b,k1,k2):
  HYPOTHESIS_COUNTS['flux']=HYPOTHESIS_COUNTS.get('flux',0)+1;m=self.rows[4][0];flux=m.result(a,b)
  self.assertEqual(flux,a*b);self.assertEqual(m.inverse_first(flux,b),a);self.assertEqual(m.inverse_second(flux,a),b);self.assertEqual(m.scaled(a,b,k1,k2),k1*k2)
  area=m.constrained_area(flux);self.assertEqual(sp.simplify(m.result(2*area/3,area)-flux),0)
 def test_vector_time_scope_and_parallel_motion_and_closed_surface(self):
  initial=sp.Matrix([1,0,0]);field=sp.Matrix([0,0,-1]);self.assertEqual(initial.cross(field),-(-initial.cross(field)))
  positive=sp.Matrix([0,1,0]).cross(field);negative=-sp.Matrix([0,-1,0]).cross(field);self.assertEqual(positive,negative)
  self.assertEqual(sp.Matrix([0,0,3]).cross(field),sp.zeros(3,1));self.assertEqual(sum((6,-6,0,0,0,0)),0)
  circle=self.rows[1][0];self.assertIn('(0)',(CANDIDATE/'editorial/batches'/(circle.BATCH+'.json')).read_text());self.assertEqual(circle.oracle()[2],'Stesso raggio e curvature iniziali opposte')
  period=self.rows[3][0];self.assertIn('parallelo',period.oracle()[2]);self.assertNotEqual(period.full_period(1),1)
 def test_noncommuting_means_all_five(self):
  w,c,a,t,f=(r[0] for r in self.rows)
  pairs=[(w,(2,3),(1,4)),(c,(2,1),(6,2)),(a,(2,1),(1,2)),(t,(1,2),(2,1)),(f,(2,3),(1,4))]
  for m,x,y in pairs:
   mean=(m.result(*x)+m.result(*y))/2;atmean=m.result(sp.Rational(x[0]+y[0],2),sp.Rational(x[1]+y[1],2));self.assertNotEqual(sp.simplify(mean-atmean),0)
 def test_prekey_models_AST_identity_and_producer_terminal_receipts(self):
  path=APP/'editorial/reviews/u6-magnetism-230-234-independent-models.py';self.assertEqual(sha(path.read_bytes()),'e2acf441bb9b7fc3e67c2bc103e6dce9c9790b571610e6838da30c3debbcba4b')
  tree=ast.parse(path.read_text());models={ast.literal_eval(n.targets[0].slice):ast.literal_eval(n.value) for n in tree.body if isinstance(n,ast.Assign) and len(n.targets)==1 and isinstance(n.targets[0],ast.Subscript) and isinstance(n.targets[0].value,ast.Name) and n.targets[0].value.id=='MODELS'}
  for m,p,b in self.rows:
   self.assertEqual(m.INDEPENDENT_MODELS_IMPLEMENTATION_SHA256,sha(path.read_bytes()))
   actual={n.name:n for n in ast.parse(Path(m.__file__).read_text()).body if isinstance(n,ast.FunctionDef)}
   for fn in ast.parse(models[m.FAMILY]).body:
    if isinstance(fn,ast.FunctionDef):self.assertEqual(ast.dump(fn,include_attributes=False),ast.dump(actual[fn.name],include_attributes=False))
   receipt=json.loads((APP/'editorial/reviews/u6-magnetism-230-234-svg-independent-evidence'/(m.FAMILY+'-terminal.json')).read_bytes());self.assertEqual(receipt['exitCode'],0);self.assertTrue(receipt['fullImageReadByReviewer']);self.assertEqual(receipt['assetSha256'],sha((CANDIDATE/'editorial/assets'/m.ASSET_NAME).read_bytes()))
 def test_every_public_math_helper_finite_real_exact_and_positive_domain(self):
  forbidden=[sp.oo,-sp.oo,sp.zoo,sp.I,sp.nan,0.1,sp.Float('0.1'),sp.Add(sp.sqrt(2),sp.Float('0.1'),evaluate=False),1+sp.I,float('inf'),float('nan'),sp.Symbol('unknown',positive=True),True]
  count=0
  for m,_,_ in self.rows:
   cases=[(m.result,(2,3)),(m.inverse_first,(2,3)),(m.inverse_second,(2,3)),(m.scaled,(2,3,1,2)),(m.equivalent_literal,(Fraction(1,2),)),(m.calibrate,(1,2,3,6,3,5,7,'dimensionless'))]
   for n in ('constrained_length','constrained_speed','constrained_field','constrained_mass','constrained_area','full_period'):
    if hasattr(m,n):cases.append((getattr(m,n),(2,)))
   for fn,args in cases:
    for index in range(len(args)-1 if fn.__name__=='calibrate' else len(args)):
     for bad in forbidden:
      changed=list(args);changed[index]=bad
      with self.subTest(family=m.FAMILY,helper=fn.__name__,index=index,value=repr(bad)):
       with self.assertRaises(ValueError):fn(*changed)
      count+=1
     if fn.__name__ not in ('calibrate','equivalent_literal'):
      for bad in (0,-1):
       changed=list(args);changed[index]=bad
       with self.assertRaises(ValueError):fn(*changed)
       count+=1
  type(self).finite_guard_assertions=count
 def test_five_plausible_wrong_constitutive_and_inverse_models_are_caught(self):
  badlaws=[lambda x,y:sp.sympify(x)*y,lambda x,y:sp.sympify(x)*y,lambda x,y:sp.sympify(x)/y,lambda x,y:2*sp.pi*sp.sympify(x)/y,lambda x,y:sp.sympify(x)/y]
  badinverse=[lambda x,y:sp.sympify(x)/y,lambda x,y:sp.sympify(x)/y,lambda x,y:sp.sympify(x)*y,lambda x,y:sp.sympify(x)/y,lambda x,y:sp.sympify(x)*y]
  for (m,p,b),badlaw,badinv in zip(self.rows,badlaws,badinverse):
   for target,wrong in (('result',badlaw),('inverse_first',badinv)):
    m.oracle.cache_clear()
    try:
     with patch.object(m,target,wrong):
      try:rows=m.verify(p,b,CANDIDATE/'editorial/assets')
      except AssertionError:pass
      else:self.assertTrue(any(not r['ok'] for r in rows))
    finally:m.oracle.cache_clear()
   self.assertTrue(all(x['ok'] for x in m.verify(p,b,CANDIDATE/'editorial/assets')))
if __name__=='__main__':unittest.main()
