"""Ten distinct vector problems; independently derived numerical and conceptual results."""
import ast,json,os,tempfile,unittest
from pathlib import Path
from fractions import Fraction
from copy import deepcopy
from unittest.mock import patch
import sympy as sp
from hypothesis import given,settings,strategies as st
from tools.corpus_engineering import cric_c1_l005_verifier as m
from tools.corpus_engineering.pipeline import sha,digest,git_bytes
from tools.corpus_engineering.batches import assert_record_identity
APP=Path(__file__).resolve().parents[2]
CANDIDATE=Path(os.environ.get('CRIC_REVIEW_CANDIDATE_APP',str(APP)))
MODEL_REF='7a2a3784421f346b4784a581e275760a623b4adf'
MODEL_PATH='officina-di-fisica/editorial/reviews/cric-c1-001-050-independent-models.py'
BOUNDED=settings(max_examples=40,derandomize=True,deadline=None)
COUNTS={}
class IndependentDistinctMechanics(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.p=json.loads((CANDIDATE/'editorial/batches/cric-c1-l005.json').read_bytes());cls.b=json.loads((CANDIDATE/'editorial/batches/cric-c1-l005-bindings.json').read_bytes());COUNTS.clear()
 @classmethod
 def tearDownClass(cls):print('INDEPENDENT_CONFIGURATIONS '+json.dumps(COUNTS,sort_keys=True),flush=True)
 def test_actual_fresh_saved_identity_and_distinct_verification_modes(self):
  fresh=m.report(self.p,self.b,CANDIDATE/'editorial/assets');saved=json.loads((APP/'editorial/reviews/cric-c1-l005.json').read_bytes());self.assertEqual(fresh,saved)
  for report in (fresh,saved):
   assert_record_identity(report['records'],m.EXPECTED_IDS,self.p,self.b);self.assertEqual(len(report['records']),10);self.assertTrue(all(r['ok'] for r in report['records']));self.assertEqual(report['verifierSha256'],sha(Path(m.__file__).read_bytes()));self.assertEqual(report['contractSha256'],sha(Path(m.__file__).with_name('review_contract.py').read_bytes()));self.assertEqual(report['humanApproval'],'NOT_RUN');self.assertEqual(report['publication'],'DRAFT')
  self.assertEqual({x:sum(r['verificationMode']==x for r in fresh['records']) for x in ('EXACT_ORACLE','AI_CONCEPTUAL')},{'EXACT_ORACLE': 5, 'AI_CONCEPTUAL': 5})
 def test_actual_catalog_and_all_ten_original_hashes_context_versions(self):
  raw=git_bytes(APP.parent,m.SOURCE_REF,m.SOURCE_PATH);self.assertEqual(sha(raw),m.LESSON_REFERENCE['sourceSha256']);rows={r['id']:r for r in json.loads(raw)};lesson=rows['C1-L005'];self.assertEqual(lesson['title'],m.LESSON_REFERENCE['title']);self.assertEqual(lesson['prerequisites'],['C1-L002', 'C1-L004'])
  for row,link in zip(self.p['records'],self.b):
   original=rows[row['id']];self.assertEqual(digest(original),link['sourceSha256']);self.assertEqual((row['baseVersion'],row['version']),(original['version'],original['version']+1))
   for field in ('id','kind','course','order','skill','family','difficulty','prerequisites','exam'):self.assertEqual(row.get(field),original.get(field))
 def test_wrong_keys_and_identity_after_hostile_tokens_and_bindings(self):
  before=digest(self.p),digest(self.b),dict(m.REVIEWED_CANDIDATES);audit=m.mutation_audit(self.p,self.b,CANDIDATE/'editorial/assets');self.assertEqual(audit,json.loads((APP/'editorial/reviews/cric-c1-l005-independent-mutations.json').read_bytes()));self.assertEqual(audit['caseCount'],28);self.assertEqual(sum(x['case']=='wrong_key_rebound_and_all_edition_tokens_replaced' for x in audit['cases']),10)
  for field in ('baseVersion','version','exam','family','difficulty','prerequisites'):self.assertTrue(any(x['case']=='Cric_'+field+'_rebound_and_retokenized' for x in audit['cases']))
  self.assertEqual(before,(digest(self.p),digest(self.b),dict(m.REVIEWED_CANDIDATES)))
 def test_false_claims_dependencies_and_canonical_contract(self):
  rows=m.report(self.p,self.b,CANDIDATE/'editorial/assets')['records']
  for field,value in [('verificationMode','AI_SCIENTIFIC_PASS'),('candidateSha256','0'*64),('humanApproval','PASS'),('publication','PUBLISHED')]:
   bad=deepcopy(rows);bad[0][field]=value
   with self.assertRaises(ValueError):assert_record_identity(bad,m.EXPECTED_IDS,self.p,self.b)
  for field in ('EXACT_LITERAL_DEPENDENCY_SHA256','INDEPENDENT_MODELS_IMPLEMENTATION_SHA256'):
   with patch.object(m,field,'0'*64):self.assertTrue(all(not r['ok'] for r in m.verify(self.p,self.b,CANDIDATE/'editorial/assets')))
 def test_exact_lexemes_radicals_and_dimensions(self):
  self.assertEqual(m.parse_literal('1,2'),sp.Rational(6,5));self.assertNotEqual(m.parse_literal('1,2000000000000000001'),sp.Rational(6,5));self.assertEqual(m.parse_literal('√13')**2,13)
  self.assertEqual(m.alternative_identity('100 cm'),m.alternative_identity('1 m'));self.assertNotEqual(m.alternative_identity('1 N'),m.alternative_identity('1 J'));self.assertNotEqual(m.alternative_identity('1 m/s'),m.alternative_identity('1 m/s²'))
  for bad in ('nan','inf','1/0','__import__("os")','2**100000','1e400','√10001'):
   with self.assertRaises(ValueError):m.parse_literal(bad)
  for bad in (0.1,sp.Float('0.1'),True,sp.oo,-sp.oo,sp.I,sp.nan,None,[],{}):
   for fn in (m._finite_exact,m._rational_exact,m.equivalent_literal):
    with self.assertRaises(ValueError):fn(bad)
 def test_prekey_models_unchanged_and_git_snapshot_verbatim(self):
  raw=git_bytes(APP.parent,MODEL_REF,MODEL_PATH);self.assertEqual(sha(raw),m.INDEPENDENT_MODELS_IMPLEMENTATION_SHA256);self.assertEqual(raw,(APP/'editorial/reviews/cric-c1-001-050-independent-models.py').read_bytes());actual={n.name:n for n in ast.parse(Path(m.__file__).read_text()).body if isinstance(n,ast.FunctionDef)}
  for n in ast.parse(raw).body:
   if isinstance(n,ast.FunctionDef):self.assertEqual(ast.dump(n,include_attributes=False),ast.dump(actual[n.name],include_attributes=False))
  home=APP/'editorial/reviews/cric-c1-001-050-git-evidence';row=json.loads((home/'git-inputs.json').read_bytes())['inputs'][0];self.assertEqual((row['commit'],row['path'],row['sha256']),(MODEL_REF,MODEL_PATH,m.INDEPENDENT_MODELS_IMPLEMENTATION_SHA256));self.assertEqual((home/row['snapshot']).read_bytes(),raw)
  receipt=json.loads((APP/'editorial/reviews/cric-c1-001-050-model-before-candidates-20261126.json').read_bytes());self.assertEqual((receipt['exitCode'],receipt['signal'],receipt['sourceChecks'],receipt['PintCrosschecks']),(0,None,28,5));self.assertFalse(receipt['candidateKeysOpened'])
 def test_native_receipt_full_read_and_independent_physical_scales(self):
  r=json.loads((APP/'editorial/reviews/cric-c1-l005-svg-independent-evidence/cric-c1-l005-terminal.json').read_bytes());self.assertEqual((r['exitCode'],r['signal']),(0,None));self.assertTrue(r['fullImageReadByReviewer'] and r['fullXmlReadByReviewer']);self.assertEqual(r['assetSha256'],sha((CANDIDATE/'editorial/assets'/m.ASSET_NAME).read_bytes()));self.assertTrue(m.asset_geometry(CANDIDATE/'editorial/assets'))
  self.assertEqual(Fraction(152,4),38);self.assertEqual(Fraction(48,4),12);self.assertEqual(Fraction(200,4),50);self.assertEqual(sp.sqrt(180**2+240**2),300);self.assertEqual(Fraction(140,70),2)
 def test_direct_geometry_rejects_shape_and_viewport_without_key_guards(self):
  raw=(CANDIDATE/'editorial/assets'/m.ASSET_NAME).read_bytes()
  for changed in (raw.replace(*m.SVG_MUTATION,1),raw.replace(b'viewBox="0 0 640 1900"',b'viewBox="0 0 640 1901"',1)):
   self.assertNotEqual(changed,raw)
   with tempfile.TemporaryDirectory() as home:
    home=Path(home);(home/m.ASSET_NAME).write_bytes(changed)
    with self.assertRaisesRegex(ValueError,'physical scale'):m.asset_geometry(home)
 def test_each_constitutive_error_fails_without_pinned_keys(self):
  true=m.source_only_predictions
  for key in ('C1-Q042', 'C1-Q044', 'C1-Q046', 'C1-Q048', 'C1-Q050'):
   def wrong():
    values=true();values[key]+=1;return values
   m.oracle.cache_clear()
   try:
    with patch.object(m,'source_only_predictions',wrong):
     with self.assertRaises(AssertionError):m.verify(self.p,self.b,CANDIDATE/'editorial/assets')
   finally:m.oracle.cache_clear()
  self.assertTrue(all(r['ok'] for r in m.verify(self.p,self.b,CANDIDATE/'editorial/assets')))
 @BOUNDED
 @given(mass=st.integers(1,1000),g=st.integers(1,1000),fraction=st.integers(0,100))
 def test_normal_support_after_upward_tension(self,mass,g,fraction):
  COUNTS['normal_balance']=COUNTS.get('normal_balance',0)+1;weight=mass*g;tension=sp.Rational(fraction,100)*weight;normal=weight-tension;self.assertGreaterEqual(normal,0);self.assertEqual(normal+tension,weight)
 @BOUNDED
 @given(mass=st.integers(1,1000),g1=st.integers(1,1000),g2=st.integers(1,1000))
 def test_mass_invariant_under_gravity_change(self,mass,g1,g2):
  COUNTS['weight_ratio']=COUNTS.get('weight_ratio',0)+1;p1=mass*g1;p2=mass*g2;self.assertEqual(sp.Rational(p2,p1),sp.Rational(g2,g1));self.assertEqual((m.SI.Quantity(p2,'newton')/m.SI.Quantity(g2,'meter/second**2')).to('kilogram').magnitude,mass)
 @BOUNDED
 @given(fx=st.integers(1,1000),fy=st.integers(1,1000),mass=st.integers(1,1000))
 def test_perpendicular_resultant_precedes_mass_division(self,fx,fy,mass):
  COUNTS['force_resultant']=COUNTS.get('force_resultant',0)+1;a=sp.sqrt(fx**2+fy**2)/mass;self.assertEqual(sp.simplify((mass*a)**2),fx**2+fy**2);self.assertLessEqual(a,sp.Rational(fx+fy,mass))
if __name__=='__main__':unittest.main()
