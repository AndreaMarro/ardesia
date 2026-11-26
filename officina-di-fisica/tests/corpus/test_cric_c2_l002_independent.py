"""Distinct Cric measurements: original identities, exact calculations and manual concepts."""
import ast,json,os,tempfile,unittest
from copy import deepcopy
from pathlib import Path
from fractions import Fraction
from unittest.mock import patch
import sympy as sp
from hypothesis import given,settings,strategies as st
from tools.corpus_engineering import cric_c2_l002_verifier as m
from tools.corpus_engineering.pipeline import digest,sha,git_bytes
from tools.corpus_engineering.batches import assert_record_identity
APP=Path(__file__).resolve().parents[2]
CANDIDATE=Path(os.environ.get('CRIC_REVIEW_CANDIDATE_APP',str(APP)))
MODEL_REF='e37686ebab9f1ac50919592f189ab8cf7f37184f'
MODEL_PATH='officina-di-fisica/editorial/reviews/cric-c2-001-050-independent-models.py'
BOUNDED=settings(max_examples=40,derandomize=True,deadline=None)
COUNTS={}
class CricFluidPressureIndependent(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.p=json.loads((CANDIDATE/'editorial/batches/cric-c2-l002.json').read_bytes());cls.b=json.loads((CANDIDATE/'editorial/batches/cric-c2-l002-bindings.json').read_bytes());COUNTS.clear()
 @classmethod
 def tearDownClass(cls):print('INDEPENDENT_CONFIGURATIONS '+json.dumps(COUNTS,sort_keys=True),flush=True)
 def test_actual_fresh_saved_identity_and_verification_modes(self):
  fresh=m.report(self.p,self.b,CANDIDATE/'editorial/assets');saved=json.loads((APP/'editorial/reviews/cric-c2-l002.json').read_bytes());self.assertEqual(fresh,saved)
  for report in (fresh,saved):
   assert_record_identity(report['records'],m.EXPECTED_IDS,self.p,self.b);self.assertEqual(len(report['records']),10);self.assertTrue(all(r['ok'] for r in report['records']));self.assertEqual(report['verifierSha256'],sha(Path(m.__file__).read_bytes()));self.assertEqual(report['contractSha256'],sha(Path(m.__file__).with_name('review_contract.py').read_bytes()));self.assertEqual(report['humanApproval'],'NOT_RUN');self.assertEqual(report['publication'],'DRAFT')
  self.assertEqual({x:sum(r['verificationMode']==x for r in fresh['records']) for x in ('EXACT_ORACLE','AI_CONCEPTUAL')},{'EXACT_ORACLE': 5, 'AI_CONCEPTUAL': 5})
 def test_pinned_catalog_source_hashes_and_individual_versions_context(self):
  raw=git_bytes(APP.parent,m.SOURCE_REF,m.SOURCE_PATH);self.assertEqual(sha(raw),m.LESSON_REFERENCE['sourceSha256']);rows={r['id']:r for r in json.loads(raw)};lesson=rows['C2-L002'];self.assertEqual(lesson['title'],m.LESSON_REFERENCE['title']);self.assertEqual(lesson['prerequisites'],['C2-L001'])
  for row,link in zip(self.p['records'],self.b):
   original=rows[row['id']];self.assertEqual(digest(original),link['sourceSha256']);self.assertEqual((row['baseVersion'],row['version']),(original['version'],original['version']+1))
   for field in ('id','kind','course','order','skill','family','difficulty','prerequisites','exam'):self.assertEqual(row.get(field),original.get(field))
   self.assertEqual(link['provenance']['sourceOrigin'],'cric');self.assertEqual(link['provenance']['sourceVersion'],original['version'])
 def test_hostile_retokenized_keys_identity_context_units_and_geometry(self):
  before=(digest(self.p),digest(self.b),dict(m.REVIEWED_CANDIDATES));audit=m.mutation_audit(self.p,self.b,CANDIDATE/'editorial/assets');self.assertEqual(audit,json.loads((APP/'editorial/reviews/cric-c2-l002-independent-mutations.json').read_bytes()));self.assertEqual(audit['caseCount'],29);self.assertEqual(sum(x['case']=='wrong_key_rebound_and_all_edition_tokens_replaced' for x in audit['cases']),10)
  for field in ('baseVersion','version','exam','family','difficulty','prerequisites'):self.assertTrue(any(x['case']=='Cric_'+field+'_rebound_and_retokenized' for x in audit['cases']))
  self.assertEqual(before,(digest(self.p),digest(self.b),dict(m.REVIEWED_CANDIDATES)))
 def test_false_claims_dependency_drift_and_model_drift_fail(self):
  rows=m.report(self.p,self.b,CANDIDATE/'editorial/assets')['records']
  for field,value in [('verificationMode','AI_SCIENTIFIC_PASS'),('candidateSha256','0'*64),('humanApproval','PASS'),('publication','PUBLISHED')]:
   bad=deepcopy(rows);bad[0][field]=value
   with self.assertRaises(ValueError):assert_record_identity(bad,m.EXPECTED_IDS,self.p,self.b)
  for field in ('EXACT_LITERAL_DEPENDENCY_SHA256','INDEPENDENT_MODELS_IMPLEMENTATION_SHA256'):
   with patch.object(m,field,'0'*64):self.assertTrue(all(not r['ok'] for r in m.verify(self.p,self.b,CANDIDATE/'editorial/assets')))
 def test_decimal_lexemes_and_finite_exact_inputs(self):
  self.assertEqual(m.parse_literal('1,04'),sp.Rational(26,25));self.assertNotEqual(m.parse_literal('1,0400000000000000001'),sp.Rational(26,25))
  for bad in ('nan','inf','1/0','__import__("os")','2**100000','1e400','√10001'):
   with self.assertRaises(ValueError):m.parse_literal(bad)
  for bad in (0.1,sp.Float('0.1'),True,sp.oo,-sp.oo,sp.I,sp.nan,None,[],{}):
   for fn in (m._finite_exact,m._rational_exact,m.equivalent_literal):
    with self.assertRaises(ValueError):fn(bad)
 def test_si_equivalent_density_and_pressure_alternatives(self):
  self.assertEqual(m.alternative_identity('1 g/mL'),m.alternative_identity('1000 kg/m³'));self.assertEqual(m.alternative_identity('1 kPa'),m.alternative_identity('1000 Pa'));self.assertEqual(m.alternative_identity('1 m²'),m.alternative_identity('10000 cm²'));self.assertNotEqual(m.alternative_identity('1 Pa'),m.alternative_identity('1 N'));self.assertNotEqual(m.alternative_identity('1,04 g/mL'),m.alternative_identity('1,0400000000000000001 g/mL'))
 def test_prekey_models_unchanged_AST_and_explicit_git_snapshot(self):
  raw=git_bytes(APP.parent,MODEL_REF,MODEL_PATH);self.assertEqual(sha(raw),m.INDEPENDENT_MODELS_IMPLEMENTATION_SHA256);self.assertEqual(raw,(APP/'editorial/reviews/cric-c2-001-050-independent-models.py').read_bytes());actual={n.name:n for n in ast.parse(Path(m.__file__).read_text()).body if isinstance(n,ast.FunctionDef)}
  for n in ast.parse(raw).body:
   if isinstance(n,ast.FunctionDef):self.assertEqual(ast.dump(n,include_attributes=False),ast.dump(actual[n.name],include_attributes=False))
  home=APP/'editorial/reviews/cric-c2-001-050-git-evidence';manifest=json.loads((home/'git-inputs.json').read_bytes());self.assertEqual(manifest['schemaVersion'],'1.0.0');row=manifest['inputs'][0];self.assertEqual((row['commit'],row['path'],row['sha256']),(MODEL_REF,MODEL_PATH,m.INDEPENDENT_MODELS_IMPLEMENTATION_SHA256));self.assertEqual((home/row['snapshot']).read_bytes(),raw)
  receipt=json.loads((APP/'editorial/reviews/cric-c2-001-050-model-before-candidates-20261126.json').read_bytes());self.assertEqual((receipt['exitCode'],receipt['signal'],receipt['sourceChecks'],receipt['PintCrosschecks']),(0,None,28,8));self.assertFalse(receipt['candidateKeysOpened'])
 def test_native_receipt_and_independent_hydraulic_geometry(self):
  r=json.loads((APP/'editorial/reviews/cric-c2-l002-svg-independent-evidence/cric-c2-l002-terminal.json').read_bytes());self.assertEqual((r['exitCode'],r['signal']),(0,None));self.assertTrue(r['fullImageReadByReviewer'] and r['fullXmlReadByReviewer']);self.assertEqual(r['assetSha256'],sha((CANDIDATE/'editorial/assets'/m.ASSET_NAME).read_bytes()));self.assertTrue(m.asset_geometry(CANDIDATE/'editorial/assets'))
  self.assertEqual(Fraction(450-150,2000),Fraction(3,20));self.assertEqual(Fraction(390-180,210),1);self.assertEqual(sp.simplify(sp.Rational(1,2)*sp.sin(sp.pi/6)),sp.Rational(1,4));self.assertEqual(Fraction(360,1)/Fraction(1,2),720)
 def test_area_scale_and_viewport_changes_fail_without_edition_pins(self):
  raw=(CANDIDATE/'editorial/assets'/m.ASSET_NAME).read_bytes()
  for changed in (raw.replace(*m.SVG_MUTATION,1),raw.replace(b'viewBox="0 0 640 1490"',b'viewBox="0 0 640 1491"',1)):
   self.assertNotEqual(changed,raw)
   with tempfile.TemporaryDirectory() as home:
    home=Path(home);(home/m.ASSET_NAME).write_bytes(changed)
    with self.assertRaisesRegex(ValueError,'physical scale'):m.asset_geometry(home)
 def test_wrong_physical_models_fail_without_key_pins(self):
  true=m.source_only_predictions
  for key in ('C2-Q011', 'C2-Q013', 'C2-Q015', 'C2-Q017', 'C2-Q019'):
   def wrong():
    values=true();values[key]=2*values[key];return values
   m.oracle.cache_clear()
   try:
    with patch.object(m,'source_only_predictions',wrong):
     with self.assertRaises(AssertionError):m.verify(self.p,self.b,CANDIDATE/'editorial/assets')
   finally:m.oracle.cache_clear()
  self.assertTrue(all(r['ok'] for r in m.verify(self.p,self.b,CANDIDATE/'editorial/assets')))
 @BOUNDED
 @given(rho=st.integers(1,10000),g=st.integers(1,100),h=st.integers(1,1000))
 def test_hydrostatic_inverse_and_gradient(self,rho,g,h):
  COUNTS['hydrostatic_inverse']=COUNTS.get('hydrostatic_inverse',0)+1;dp=rho*g*h;self.assertEqual(sp.Rational(dp,rho*g),h);self.assertEqual(sp.Rational(dp,h*g),rho)
 @BOUNDED
 @given(rho=st.integers(1,10000),g=st.integers(1,100),b=st.integers(1,100),h=st.integers(1,100))
 def test_vertical_wall_integral_matches_mean_pressure(self,rho,g,b,h):
  COUNTS['wall_integral']=COUNTS.get('wall_integral',0)+1;z=sp.Symbol('z');integral=sp.integrate(rho*g*z*b,(z,0,h));self.assertEqual(integral,sp.Rational(rho*g*b*h*h,2));self.assertEqual(integral/(b*h),sp.Rational(rho*g*h,2))
 @BOUNDED
 @given(length=st.integers(1,10000),rho=st.integers(1,1000))
 def test_thirty_degree_projection_precedes_pressure(self,length,rho):
  COUNTS['vertical_projection']=COUNTS.get('vertical_projection',0)+1;vertical=sp.Rational(length,2);self.assertEqual(sp.simplify(length*sp.sin(sp.pi/6)),vertical);self.assertEqual(rho*10*vertical,5*rho*length)
 def test_exact_barometer_underlying_pressure_and_rounded_display(self):
  exact=m.source_only_predictions()['C2-Q013'];self.assertEqual(exact,sp.Rational(617049,6250));self.assertTrue(sp.Rational(1973,20)<=exact<sp.Rational(395,4));self.assertEqual(m.oracle()[2],sp.Rational(987,10));self.assertEqual(m.alternative_identity('Circa 98,7 kPa'),m.alternative_identity('Circa 98700 Pa'));self.assertNotEqual(m.alternative_identity('Circa 98,7 kPa'),m.alternative_identity('98,7 kPa'))
  real=m.source_only_predictions
  def near():
   values=real();values['C2-Q013']+=sp.Rational(1,1000);return values
  m.oracle.cache_clear()
  try:
   with patch.object(m,'source_only_predictions',near):
    with self.assertRaises(AssertionError):m.verify(self.p,self.b,CANDIDATE/'editorial/assets')
  finally:m.oracle.cache_clear()
if __name__=='__main__':unittest.main()
