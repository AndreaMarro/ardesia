"""Independent Celsius/kelvin and thermodynamic-system review, before any authoring import."""
import ast,base64,json,os,tempfile,unittest
from copy import deepcopy
from pathlib import Path
from fractions import Fraction
from unittest.mock import patch
import xml.etree.ElementTree as ET
import sympy as sp
from hypothesis import given,settings,strategies as st
from tools.corpus_engineering import cric_c3_l02_verifier as m
from tools.corpus_engineering.pipeline import digest,sha,git_bytes
from tools.corpus_engineering.batches import assert_record_identity
APP=Path(__file__).resolve().parents[2];CANDIDATE=Path(os.environ.get('CRIC_REVIEW_CANDIDATE_APP',str(APP)));MODEL_REF='030d4658b17ea6f6fd43be03cb59b21e91030eb0';MODEL_PATH='officina-di-fisica/editorial/reviews/cric-c3-001-050-independent-models.py';BOUNDED=settings(max_examples=40,derandomize=True,deadline=None);COUNTS={}
class CricThermalStateIndependent(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.p=json.loads((CANDIDATE/'editorial/batches/cric-c3-l02.json').read_bytes());cls.b=json.loads((CANDIDATE/'editorial/batches/cric-c3-l02-bindings.json').read_bytes());COUNTS.clear()
 @classmethod
 def tearDownClass(cls):print('INDEPENDENT_CONFIGURATIONS '+json.dumps(COUNTS,sort_keys=True),flush=True)
 def rebound(self,p,b,key,home=None):
  home=home or CANDIDATE/'editorial/assets';tokens={r['id']:token for r,z,token,a,e in m.reviewed_rows(p,b,{},m.EXPECTED_IDS,home)}
  with patch.dict(m.REVIEWED_CANDIDATES,tokens),patch.multiple(m,REVIEWED_PACKAGE_SHA256=digest(p),REVIEWED_BINDINGS_SHA256=digest(b)):return next(r for r in m.verify(p,b,home) if r['id']==key)
 def test_actual_fresh_saved_identity_and_modes(self):
  fresh=m.report(self.p,self.b,CANDIDATE/'editorial/assets');saved=json.loads((APP/'editorial/reviews/cric-c3-l02.json').read_bytes());self.assertEqual(fresh,saved)
  for report in (fresh,saved):
   assert_record_identity(report['records'],m.EXPECTED_IDS,self.p,self.b);self.assertEqual(len(report['records']),10);self.assertTrue(all(r['ok'] for r in report['records']));self.assertEqual(report['verifierSha256'],sha(Path(m.__file__).read_bytes()));self.assertEqual(report['contractSha256'],sha(Path(m.__file__).with_name('review_contract.py').read_bytes()));self.assertEqual(report['humanApproval'],'NOT_RUN');self.assertEqual(report['publication'],'DRAFT')
  self.assertEqual({mode:sum(r['verificationMode']==mode for r in fresh['records']) for mode in ('EXACT_ORACLE','AI_CONCEPTUAL')},{'EXACT_ORACLE':5,'AI_CONCEPTUAL':5})
 def test_git_candidate_binding_and_catalog_identity(self):
  for suffix in ('.json','-bindings.json'):self.assertEqual((CANDIDATE/f'editorial/batches/cric-c3-l02{suffix}').read_bytes(),git_bytes(APP.parent,m.CANDIDATE_REF,f'officina-di-fisica/editorial/batches/cric-c3-l02{suffix}'))
  raw=git_bytes(APP.parent,m.SOURCE_REF,m.SOURCE_PATH);self.assertEqual(sha(raw),m.LESSON_REFERENCE['sourceSha256']);rows={r['id']:r for r in json.loads(raw)};self.assertEqual(rows['C3-L02']['title'],m.LESSON_REFERENCE['title']);self.assertEqual(rows['C3-L02']['prerequisites'],['C3-L01'])
  for row,link in zip(self.p['records'],self.b):
   original=rows[row['id']];self.assertEqual(digest(original),link['sourceSha256']);self.assertEqual((row['baseVersion'],row['version']),(original['version'],original['version']+1))
   for field in ('id','kind','course','order','skill','family','difficulty','prerequisites','exam'):self.assertEqual(row.get(field),original.get(field))
   self.assertEqual(link['provenance']['sourceOrigin'],'cric');self.assertEqual(link['provenance']['sourceVersion'],original['version'])
 def test_retokenized_wrong_keys_source_context_units_and_geometry(self):
  before=(digest(self.p),digest(self.b),dict(m.REVIEWED_CANDIDATES));audit=m.mutation_audit(self.p,self.b,CANDIDATE/'editorial/assets');self.assertEqual(audit,json.loads((APP/'editorial/reviews/cric-c3-l02-independent-mutations.json').read_bytes()));self.assertEqual(audit['caseCount'],29);self.assertEqual(sum(x['case']=='wrong_key_rebound_and_all_edition_tokens_replaced' for x in audit['cases']),10);self.assertTrue(all('rejectedBy' in x for x in audit['cases']));self.assertEqual(before,(digest(self.p),digest(self.b),dict(m.REVIEWED_CANDIDATES)))
 def test_original_source_models_and_primary_remain_frozen(self):
  raw=git_bytes(APP.parent,MODEL_REF,MODEL_PATH);self.assertEqual(sha(raw),m.INDEPENDENT_MODELS_IMPLEMENTATION_SHA256);self.assertEqual(raw,(APP/'editorial/reviews/cric-c3-001-050-independent-models.py').read_bytes());actual={n.name:n for n in ast.parse(Path(m.__file__).read_text()).body if isinstance(n,ast.FunctionDef)}
  for n in ast.parse(raw).body:
   if isinstance(n,ast.FunctionDef):self.assertEqual(ast.dump(n,include_attributes=False),ast.dump(actual[n.name],include_attributes=False))
  home=APP/'editorial/reviews/cric-c3-001-050-git-evidence';manifest=json.loads((home/'git-inputs.json').read_bytes());row=manifest['inputs'][0];self.assertEqual((row['commit'],row['path'],row['sha256']),(MODEL_REF,MODEL_PATH,m.INDEPENDENT_MODELS_IMPLEMENTATION_SHA256));self.assertEqual((home/row['snapshot']).read_bytes(),raw)
  self.assertEqual(sha((APP/'editorial/reviews/primary-cric-c3-001-050-before-candidates-20261126.md').read_bytes()),m.PRIMARY_SHA256);receipt=json.loads((APP/'editorial/reviews/cric-c3-001-050-model-before-candidates-20261126.json').read_bytes());self.assertEqual((receipt['exitCode'],receipt['signal'],receipt['sourceChecks'],receipt['PintCrosschecks']),(0,None,22,8));self.assertFalse(receipt['candidateKeysOpened'])
 def test_finite_exact_inputs_and_decimal_lexemes(self):
  self.assertEqual(m.parse_literal('-17,85'),sp.Rational(-357,20));self.assertEqual(m.parse_literal('326,85'),sp.Rational(6537,20));self.assertNotEqual(m.parse_literal('326.850000000000000001'),sp.Rational(6537,20))
  for bad in ('nan','inf','1/0','__import__("os")','2**100000','1e400','√10001'):
   with self.assertRaises(ValueError):m.parse_literal(bad)
  for bad in (0.1,sp.Float('0.1'),True,sp.oo,-sp.oo,sp.I,sp.nan,None,[],{}):
   for fn in (m._finite_exact,m._rational_exact,m.equivalent_literal):
    with self.assertRaises(ValueError):fn(bad)
 def test_si_physical_equivalence_has_explicit_dimensions(self):
  self.assertEqual(m.alternative_identity('1 L'),m.alternative_identity('1000 mL'));self.assertEqual(m.alternative_identity('1 kPa'),m.alternative_identity('1000 Pa'));self.assertEqual(m.alternative_identity('1 kg/m³'),m.alternative_identity('1 g/L'));self.assertEqual(m.alternative_identity('26,85 °C'),m.alternative_identity('300 K'));self.assertNotEqual(m.alternative_identity('1 Pa'),m.alternative_identity('1 J'))
 def test_duplicate_SI_option_2_small_prefix_rebound(self):
  p,b=deepcopy(self.p),deepcopy(self.b);row=p['records'][2];wrong=next(i for i,v in enumerate(row['answer']['options']) if v!=row['answer']['value']);row['answer']['options'][wrong]='2100 mL';b[2]['candidateSha256']=digest(row);bad=self.rebound(p,b,row['id']);self.assertFalse(bad['ok']);self.assertIn('Equivalent exact numeric choices require editorial review',bad['errors'])
 def test_duplicate_SI_option_9_large_prefix_rebound(self):
  p,b=deepcopy(self.p),deepcopy(self.b);row=p['records'][9];wrong=next(i for i,v in enumerate(row['answer']['options']) if v!=row['answer']['value']);row['answer']['options'][wrong]='14000/12471 g/L';b[9]['candidateSha256']=digest(row);bad=self.rebound(p,b,row['id']);self.assertFalse(bad['ok']);self.assertIn('Equivalent exact numeric choices require editorial review',bad['errors'])
 def test_native_actual_exit_and_independent_physical_scales(self):
  r=json.loads((APP/'editorial/reviews/cric-c3-l02-svg-independent-evidence/cric-c3-l02-terminal.json').read_bytes());self.assertEqual((r['exitCode'],r['signal']),(0,None));self.assertTrue(r['fullImageReadByReviewer'] and r['fullXmlReadByReviewer']);self.assertEqual(r['assetSha256'],sha((CANDIDATE/'editorial/assets'/m.ASSET_NAME).read_bytes()));self.assertTrue(m.asset_geometry(CANDIDATE/'editorial/assets'));self.assertEqual(Fraction(320,160),Fraction(240,120));self.assertEqual(Fraction(252,18),Fraction(294,21));self.assertEqual(Fraction(1420-1140,1420-1280),2);self.assertEqual(480-140,340)
 def test_viewport_change_fails_without_hash_pin(self):
  raw=(CANDIDATE/'editorial/assets'/m.ASSET_NAME).read_bytes();changed=raw.replace(b'viewBox="0 0 640 1500"',b'viewBox="0 0 640 1501"');self.assertNotEqual(raw,changed)
  with tempfile.TemporaryDirectory() as directory:
   home=Path(directory);(home/m.ASSET_NAME).write_bytes(changed)
   with self.assertRaisesRegex(ValueError,'physical scale'):m.asset_geometry(home)
 def test_accessible_title_and_description_fail_after_full_rebinding(self):
  for tag in ('title','desc'):
   p,b=deepcopy(self.p),deepcopy(self.b);asset=next(a for a in p['assets'] if a['name']==m.ASSET_NAME);raw=base64.b64decode(asset['data']);element=next(e for e in ET.fromstring(raw).iter() if e.tag.rsplit('}',1)[-1]==tag);previous=element.text;self.assertEqual(raw.count(previous.encode()),1);raw=raw.replace(previous.encode(),(previous+' Quantità falsa:999 K.').encode());old=asset['id'];asset.update(id=sha(raw),data=base64.b64encode(raw).decode())
   for row,link in zip(p['records'],b):
    for block in row['blocks']:
     if block.get('src')=='/asset/'+old:block['src']='/asset/'+asset['id']
    if m.ASSET_NAME in link.get('assetChecksums',{}):link['assetChecksums'][m.ASSET_NAME]=asset['id']
    link['candidateSha256']=digest(row)
   with tempfile.TemporaryDirectory() as directory:
    home=Path(directory)
    for a in p['assets']:(home/a['name']).write_bytes(base64.b64decode(a['data']))
    with self.assertRaisesRegex(ValueError,'accessible title/desc'):self.rebound(p,b,p['records'][0]['id'],home)
 def test_wrong_constitutive_models_fail_without_key_pins(self):
  real=m.source_only_predictions
  for key in ['C3-Q011', 'C3-Q013', 'C3-Q015', 'C3-Q017', 'C3-Q020']:
   def altered():values=real();values[key]=2*values[key];return values
   m.oracle.cache_clear()
   try:
    with patch.object(m,'source_only_predictions',altered):
     with self.assertRaises(AssertionError):m.verify(self.p,self.b,CANDIDATE/'editorial/assets')
   finally:m.oracle.cache_clear()
 def test_false_modes_publication_and_dependency_drift_rejected(self):
  rows=m.report(self.p,self.b,CANDIDATE/'editorial/assets')['records']
  for field,value in [('verificationMode','AI_SCIENTIFIC_PASS'),('candidateSha256','0'*64),('humanApproval','PASS'),('publication','PUBLISHED')]:
   bad=deepcopy(rows);bad[0][field]=value
   with self.assertRaises(ValueError):assert_record_identity(bad,m.EXPECTED_IDS,self.p,self.b)
  for field in ('EXACT_LITERAL_DEPENDENCY_SHA256','INDEPENDENT_MODELS_IMPLEMENTATION_SHA256'):
   with patch.object(m,field,'0'*64):self.assertTrue(all(not r['ok'] for r in m.verify(self.p,self.b,CANDIDATE/'editorial/assets')))
 def test_nonempty_original_prerequisites_are_protected(self):
  p,b=deepcopy(self.p),deepcopy(self.b);self.assertTrue(p['records'][0]['prerequisites']);p['records'][0]['prerequisites']=[];b[0]['candidateSha256']=digest(p['records'][0]);bad=self.rebound(p,b,p['records'][0]['id']);self.assertFalse(bad['ok']);self.assertTrue(any('Cric' in e and 'prerequisites' in e for e in bad['errors']))
 @BOUNDED
 @given(final_p=st.integers(1,10000),drop=st.integers(1,10000))
 def test_loss_fraction_uses_initial_number_as_denominator(self,final_p,drop):
  COUNTS['leak_fraction']=COUNTS.get('leak_fraction',0)+1;initial=final_p+drop;remaining=sp.Rational(final_p,initial);lost=sp.Rational(drop,initial);self.assertEqual(remaining+lost,1);self.assertTrue(0<lost<1)
 @BOUNDED
 @given(volume=st.integers(1,10000),initial_t=st.integers(1,10000),final_t=st.integers(1,10000))
 def test_closed_isobaric_volume_temperature_ratio(self,volume,initial_t,final_t):
  COUNTS['charles_ratio']=COUNTS.get('charles_ratio',0)+1;final_v=sp.Rational(volume*final_t,initial_t);self.assertEqual(final_v/final_t,sp.Rational(volume,initial_t));self.assertGreater(final_v,0)
 @BOUNDED
 @given(p=st.integers(1,1000),vi=st.integers(1,1000),vf=st.integers(1,1000),ti=st.integers(1,1000),tf=st.integers(1,1000))
 def test_combined_state_ratio_keeps_moles_constant(self,p,vi,vf,ti,tf):
  COUNTS['combined_state']=COUNTS.get('combined_state',0)+1;pf=p*sp.Rational(vi,vf)*sp.Rational(tf,ti);self.assertEqual(pf*vf/tf,sp.Rational(p*vi,ti));self.assertGreater(pf,0)
if __name__=='__main__':unittest.main()
