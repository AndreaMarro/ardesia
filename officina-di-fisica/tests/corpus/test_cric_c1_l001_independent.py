"""Distinct Cric measurements: original identities, exact calculations and manual concepts."""
import ast,json,os,tempfile,unittest
from copy import deepcopy
from pathlib import Path
from fractions import Fraction
from unittest.mock import patch
import sympy as sp
from hypothesis import given,settings,strategies as st
from tools.corpus_engineering import cric_c1_l001_verifier as m
from tools.corpus_engineering.pipeline import digest,sha,git_bytes
from tools.corpus_engineering.batches import assert_record_identity
APP=Path(__file__).resolve().parents[2]
CANDIDATE=Path(os.environ.get('CRIC_REVIEW_CANDIDATE_APP',str(APP)))
MODEL_REF='7a2a3784421f346b4784a581e275760a623b4adf'
MODEL_PATH='officina-di-fisica/editorial/reviews/cric-c1-001-050-independent-models.py'
BOUNDED=settings(max_examples=40,derandomize=True,deadline=None)
COUNTS={}
class CricMeasurementIndependent(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.p=json.loads((CANDIDATE/'editorial/batches/cric-c1-l001.json').read_bytes());cls.b=json.loads((CANDIDATE/'editorial/batches/cric-c1-l001-bindings.json').read_bytes());COUNTS.clear()
 @classmethod
 def tearDownClass(cls):print('INDEPENDENT_CONFIGURATIONS '+json.dumps(COUNTS,sort_keys=True),flush=True)
 def test_actual_fresh_saved_identity_and_verification_modes(self):
  fresh=m.report(self.p,self.b,CANDIDATE/'editorial/assets');saved=json.loads((APP/'editorial/reviews/cric-c1-l001.json').read_bytes());self.assertEqual(fresh,saved)
  for report in (fresh,saved):
   assert_record_identity(report['records'],m.EXPECTED_IDS,self.p,self.b);self.assertEqual(len(report['records']),10);self.assertTrue(all(r['ok'] for r in report['records']));self.assertEqual(report['verifierSha256'],sha(Path(m.__file__).read_bytes()));self.assertEqual(report['contractSha256'],sha(Path(m.__file__).with_name('review_contract.py').read_bytes()));self.assertEqual(report['humanApproval'],'NOT_RUN');self.assertEqual(report['publication'],'DRAFT')
  self.assertEqual({x:sum(r['verificationMode']==x for r in fresh['records']) for x in ('EXACT_ORACLE','AI_CONCEPTUAL')},{'EXACT_ORACLE':5,'AI_CONCEPTUAL':5})
 def test_pinned_catalog_source_hashes_and_individual_versions_context(self):
  raw=git_bytes(APP.parent,m.SOURCE_REF,m.SOURCE_PATH);self.assertEqual(sha(raw),m.LESSON_REFERENCE['sourceSha256']);rows={r['id']:r for r in json.loads(raw)};lesson=rows['C1-L001'];self.assertEqual(lesson['title'],m.LESSON_REFERENCE['title']);self.assertEqual(lesson['prerequisites'],[])
  for row,link in zip(self.p['records'],self.b):
   original=rows[row['id']];self.assertEqual(digest(original),link['sourceSha256']);self.assertEqual((row['baseVersion'],row['version']),(original['version'],original['version']+1))
   for field in ('id','kind','course','order','skill','family','difficulty','prerequisites','exam'):self.assertEqual(row.get(field),original.get(field))
   self.assertEqual(link['provenance']['sourceOrigin'],'cric');self.assertEqual(link['provenance']['sourceVersion'],original['version'])
 def test_hostile_retokenized_keys_identity_context_units_and_geometry(self):
  before=(digest(self.p),digest(self.b),dict(m.REVIEWED_CANDIDATES));audit=m.mutation_audit(self.p,self.b,CANDIDATE/'editorial/assets');self.assertEqual(audit,json.loads((APP/'editorial/reviews/cric-c1-l001-independent-mutations.json').read_bytes()));self.assertEqual(audit['caseCount'],29);self.assertEqual(sum(x['case']=='wrong_key_rebound_and_all_edition_tokens_replaced' for x in audit['cases']),10)
  for field in ('baseVersion','version','exam','family','difficulty','prerequisites'):self.assertTrue(any(x['case']=='Cric_'+field+'_rebound_and_retokenized' for x in audit['cases']))
  self.assertEqual(before,(digest(self.p),digest(self.b),dict(m.REVIEWED_CANDIDATES)))
 def test_false_claims_dependency_drift_and_model_drift_fail(self):
  rows=m.report(self.p,self.b,CANDIDATE/'editorial/assets')['records']
  for field,value in [('verificationMode','AI_SCIENTIFIC_PASS'),('candidateSha256','0'*64),('humanApproval','PASS'),('publication','PUBLISHED')]:
   bad=deepcopy(rows);bad[0][field]=value
   with self.assertRaises(ValueError):assert_record_identity(bad,m.EXPECTED_IDS,self.p,self.b)
  for field in ('EXACT_LITERAL_DEPENDENCY_SHA256','INDEPENDENT_MODELS_IMPLEMENTATION_SHA256'):
   with patch.object(m,field,'0'*64):self.assertTrue(all(not r['ok'] for r in m.verify(self.p,self.b,CANDIDATE/'editorial/assets')))
 def test_lexemes_and_known_scientific_expressions_remain_exact(self):
  self.assertEqual(m.parse_literal('12,6'),sp.Rational(63,5));self.assertNotEqual(m.parse_literal('12,6000000000000000001'),sp.Rational(63,5));self.assertEqual(m.mapped_literal('10⁻⁴'),sp.Rational(1,10000));self.assertEqual(m.mapped_literal('7,0 × 10⁻⁵'),sp.Rational(7,100000))
  for bad in ('nan','inf','1/0','__import__("os")','2**100000','1e400','√10001'):
   with self.assertRaises(ValueError):m.parse_literal(bad)
  for bad in (0.1,sp.Float('0.1'),True,sp.oo,sp.I,sp.nan,None,[],{}):
   with self.assertRaises(ValueError):m.mapped_literal(bad)
 def test_si_equivalent_alternatives_and_distinct_units(self):
  for x,y in [('1 mL','1000 mm³'),('1 µL','1 mm³'),('1 kg','1000 g'),('1 km/h','5/18 m/s')]:self.assertEqual(m.alternative_identity(x),m.alternative_identity(y))
  self.assertNotEqual(m.alternative_identity('1 m'),m.alternative_identity('1 kg'));self.assertNotEqual(m.alternative_identity('12,6 g'),m.alternative_identity('12,6000000000000000001 g'))
 def test_prekey_models_unchanged_AST_and_explicit_git_snapshot(self):
  raw=git_bytes(APP.parent,MODEL_REF,MODEL_PATH);self.assertEqual(sha(raw),m.INDEPENDENT_MODELS_IMPLEMENTATION_SHA256);self.assertEqual(raw,(APP/'editorial/reviews/cric-c1-001-050-independent-models.py').read_bytes());actual={n.name:n for n in ast.parse(Path(m.__file__).read_text()).body if isinstance(n,ast.FunctionDef)}
  for n in ast.parse(raw).body:
   if isinstance(n,ast.FunctionDef):self.assertEqual(ast.dump(n,include_attributes=False),ast.dump(actual[n.name],include_attributes=False))
  home=APP/'editorial/reviews/cric-c1-001-050-git-evidence';manifest=json.loads((home/'git-inputs.json').read_bytes());self.assertEqual(manifest['schemaVersion'],'1.0.0');row=manifest['inputs'][0];self.assertEqual((row['commit'],row['path'],row['sha256']),(MODEL_REF,MODEL_PATH,m.INDEPENDENT_MODELS_IMPLEMENTATION_SHA256));self.assertEqual((home/row['snapshot']).read_bytes(),raw)
  receipt=json.loads((APP/'editorial/reviews/cric-c1-001-050-model-before-candidates-20261126.json').read_bytes());self.assertEqual((receipt['exitCode'],receipt['signal'],receipt['sourceChecks'],receipt['PintCrosschecks']),(0,None,28,5));self.assertFalse(receipt['candidateKeysOpened'])
 def test_native_receipt_complete_read_and_independent_physical_scales(self):
  receipt=json.loads((APP/'editorial/reviews/cric-c1-l001-svg-independent-evidence/cric-c1-l001-terminal.json').read_bytes());self.assertEqual((receipt['exitCode'],receipt['signal']),(0,None));self.assertTrue(receipt['fullImageReadByReviewer'] and receipt['fullXmlReadByReviewer']);self.assertEqual(receipt['assetSha256'],sha((CANDIDATE/'editorial/assets'/m.ASSET_NAME).read_bytes()));self.assertTrue(m.asset_geometry(CANDIDATE/'editorial/assets'))
  self.assertEqual(Fraction(273,5),Fraction(546,10));self.assertEqual(Fraction(210,5),42);self.assertEqual(Fraction(63,5),Fraction(126,10));self.assertEqual(273-210,63);self.assertEqual(Fraction(1500-1300,50),4)
 def test_prism_and_viewport_geometry_reject_changes_without_package_hashes(self):
  raw=(CANDIDATE/'editorial/assets'/m.ASSET_NAME).read_bytes()
  for changed in (raw.replace(b'170,350 270,350',b'170,350 271,350',1),raw.replace(b'viewBox="0 0 640 1650"',b'viewBox="0 0 640 1651"',1)):
   self.assertNotEqual(changed,raw)
   with tempfile.TemporaryDirectory() as home:
    home=Path(home);(home/m.ASSET_NAME).write_bytes(changed)
    with self.assertRaisesRegex(ValueError,'physical scale'):m.asset_geometry(home)
 def test_wrong_physical_models_fail_without_key_pins(self):
  true=m.source_only_predictions
  for key in ('C1-Q001','C1-Q004','C1-Q005','C1-Q007','C1-Q009'):
   def wrong():
    values=true();values[key]=2*values[key];return values
   m.oracle.cache_clear()
   try:
    with patch.object(m,'source_only_predictions',wrong):
     with self.assertRaises(AssertionError):m.verify(self.p,self.b,CANDIDATE/'editorial/assets')
   finally:m.oracle.cache_clear()
  self.assertTrue(all(r['ok'] for r in m.verify(self.p,self.b,CANDIDATE/'editorial/assets')))
 @BOUNDED
 @given(n=st.integers(1,100000),den=st.integers(1,1000))
 def test_decimal_lexemes_and_unit_ratios_over_exact_rationals(self,n,den):
  COUNTS['exact_rationals']=COUNTS.get('exact_rationals',0)+1;self.assertEqual(m.parse_literal(f'{n}/{den}'),sp.Rational(n,den));self.assertEqual(m.alternative_identity(f'{n} g'),m.alternative_identity(f'{n}/1000 kg'))
 @BOUNDED
 @given(full=st.integers(2,100000),tare=st.integers(1,1000))
 def test_mass_tare_after_common_units(self,full,tare):
  COUNTS['mass_units']=COUNTS.get('mass_units',0)+1;grams=Fraction(full,10)+tare;self.assertEqual((m.SI.Quantity(grams,'gram')-m.SI.Quantity(Fraction(tare,1000),'kilogram')).to('gram').magnitude,Fraction(full,10))
 @BOUNDED
 @given(a=st.integers(1,1000),b=st.integers(1,1000))
 def test_energy_dimensions_are_homogeneous(self,a,b):
  COUNTS['energy_dimensions']=COUNTS.get('energy_dimensions',0)+1;force=m.SI.Quantity(a,'newton')*m.SI.Quantity(b,'meter');kinetic=m.SI.Quantity(a,'kilogram')*m.SI.Quantity(b,'meter/second')**2/2;self.assertEqual(force.dimensionality,kinetic.dimensionality)
if __name__=='__main__':unittest.main()
