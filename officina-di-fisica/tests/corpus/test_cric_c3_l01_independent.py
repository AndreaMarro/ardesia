"""Independent Celsius/kelvin and thermodynamic-system review, before any authoring import."""
import ast,base64,json,os,tempfile,unittest
from copy import deepcopy
from pathlib import Path
from fractions import Fraction
from unittest.mock import patch
import xml.etree.ElementTree as ET
import sympy as sp
from hypothesis import given,settings,strategies as st
from tools.corpus_engineering import cric_c3_l01_verifier as m
from tools.corpus_engineering.pipeline import digest,sha,git_bytes
from tools.corpus_engineering.batches import assert_record_identity
APP=Path(__file__).resolve().parents[2];CANDIDATE=Path(os.environ.get('CRIC_REVIEW_CANDIDATE_APP',str(APP)));MODEL_REF='030d4658b17ea6f6fd43be03cb59b21e91030eb0';MODEL_PATH='officina-di-fisica/editorial/reviews/cric-c3-001-050-independent-models.py';BOUNDED=settings(max_examples=40,derandomize=True,deadline=None);COUNTS={}
class CricThermalStateIndependent(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.p=json.loads((CANDIDATE/'editorial/batches/cric-c3-l01.json').read_bytes());cls.b=json.loads((CANDIDATE/'editorial/batches/cric-c3-l01-bindings.json').read_bytes());COUNTS.clear()
 @classmethod
 def tearDownClass(cls):print('INDEPENDENT_CONFIGURATIONS '+json.dumps(COUNTS,sort_keys=True),flush=True)
 def rebound(self,p,b,key,home=None):
  home=home or CANDIDATE/'editorial/assets';tokens={r['id']:token for r,z,token,a,e in m.reviewed_rows(p,b,{},m.EXPECTED_IDS,home)}
  with patch.dict(m.REVIEWED_CANDIDATES,tokens),patch.multiple(m,REVIEWED_PACKAGE_SHA256=digest(p),REVIEWED_BINDINGS_SHA256=digest(b)):return next(r for r in m.verify(p,b,home) if r['id']==key)
 def test_actual_fresh_saved_identity_and_modes(self):
  fresh=m.report(self.p,self.b,CANDIDATE/'editorial/assets');saved=json.loads((APP/'editorial/reviews/cric-c3-l01.json').read_bytes());self.assertEqual(fresh,saved)
  for report in (fresh,saved):
   assert_record_identity(report['records'],m.EXPECTED_IDS,self.p,self.b);self.assertEqual(len(report['records']),10);self.assertTrue(all(r['ok'] for r in report['records']));self.assertEqual(report['verifierSha256'],sha(Path(m.__file__).read_bytes()));self.assertEqual(report['contractSha256'],sha(Path(m.__file__).with_name('review_contract.py').read_bytes()));self.assertEqual(report['humanApproval'],'NOT_RUN');self.assertEqual(report['publication'],'DRAFT')
  self.assertEqual({mode:sum(r['verificationMode']==mode for r in fresh['records']) for mode in ('EXACT_ORACLE','AI_CONCEPTUAL')},{'EXACT_ORACLE':3,'AI_CONCEPTUAL':7})
 def test_git_candidate_binding_and_catalog_identity(self):
  for suffix in ('.json','-bindings.json'):self.assertEqual((CANDIDATE/f'editorial/batches/cric-c3-l01{suffix}').read_bytes(),git_bytes(APP.parent,m.CANDIDATE_REF,f'officina-di-fisica/editorial/batches/cric-c3-l01{suffix}'))
  raw=git_bytes(APP.parent,m.SOURCE_REF,m.SOURCE_PATH);self.assertEqual(sha(raw),m.LESSON_REFERENCE['sourceSha256']);rows={r['id']:r for r in json.loads(raw)};self.assertEqual(rows['C3-L01']['title'],m.LESSON_REFERENCE['title']);self.assertEqual(rows['C3-L01']['prerequisites'],[])
  for row,link in zip(self.p['records'],self.b):
   original=rows[row['id']];self.assertEqual(digest(original),link['sourceSha256']);self.assertEqual((row['baseVersion'],row['version']),(original['version'],original['version']+1))
   for field in ('id','kind','course','order','skill','family','difficulty','prerequisites','exam'):self.assertEqual(row.get(field),original.get(field))
   self.assertEqual(link['provenance']['sourceOrigin'],'cric');self.assertEqual(link['provenance']['sourceVersion'],original['version'])
 def test_retokenized_wrong_keys_source_context_units_and_geometry(self):
  before=(digest(self.p),digest(self.b),dict(m.REVIEWED_CANDIDATES));audit=m.mutation_audit(self.p,self.b,CANDIDATE/'editorial/assets');self.assertEqual(audit,json.loads((APP/'editorial/reviews/cric-c3-l01-independent-mutations.json').read_bytes()));self.assertEqual(audit['caseCount'],29);self.assertEqual(sum(x['case']=='wrong_key_rebound_and_all_edition_tokens_replaced' for x in audit['cases']),10);self.assertTrue(all('rejectedBy' in x for x in audit['cases']));self.assertEqual(before,(digest(self.p),digest(self.b),dict(m.REVIEWED_CANDIDATES)))
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
 def test_offset_applies_to_absolute_readings_only(self):
  self.assertEqual(m.alternative_identity('326,85 °C',5),m.alternative_identity('600 K',5));self.assertEqual(m.alternative_identity('−17,85 °C',2),m.alternative_identity('−17,85 K',2));self.assertNotEqual(m.alternative_identity('0 °C',5),m.alternative_identity('0 K',5));self.assertNotEqual(m.alternative_identity('0 K',2),m.alternative_identity('0 K',5))
 def test_semantically_duplicate_absolute_temperatures_after_all_pins_renewed(self):
  p,b=deepcopy(self.p),deepcopy(self.b);row=p['records'][4];wrong=next(i for i,v in enumerate(row['answer']['options']) if v!=row['answer']['value']);row['answer']['options'][wrong]='600 K';b[4]['candidateSha256']=digest(row);bad=self.rebound(p,b,row['id']);self.assertFalse(bad['ok']);self.assertIn('Equivalent exact numeric choices require editorial review',bad['errors'])
 def test_semantically_duplicate_intervals_after_all_pins_renewed(self):
  p,b=deepcopy(self.p),deepcopy(self.b);row=p['records'][1];wrong=next(i for i,v in enumerate(row['answer']['options']) if v!=row['answer']['value']);row['answer']['options'][wrong]='−17,85 °C';b[1]['candidateSha256']=digest(row);bad=self.rebound(p,b,row['id']);self.assertFalse(bad['ok']);self.assertIn('Equivalent exact numeric choices require editorial review',bad['errors'])
 def test_native_actual_exit_and_independent_kelvin_and_interval_geometry(self):
  r=json.loads((APP/'editorial/reviews/cric-c3-l01-svg-independent-evidence/cric-c3-l01-terminal.json').read_bytes());self.assertEqual((r['exitCode'],r['signal']),(0,None));self.assertTrue(r['fullImageReadByReviewer'] and r['fullXmlReadByReviewer']);self.assertEqual(r['assetSha256'],sha((CANDIDATE/'editorial/assets'/m.ASSET_NAME).read_bytes()));self.assertTrue(m.asset_geometry(CANDIDATE/'editorial/assets'));self.assertEqual(Fraction(300,150),Fraction(600,300));self.assertEqual(Fraction(1168-1120,35-31),12);self.assertEqual(Fraction(1240-1168,31-25),12);self.assertEqual((330-180,480-330),(150,150))
 def test_viewport_change_fails_without_hash_pin(self):
  raw=(CANDIDATE/'editorial/assets'/m.ASSET_NAME).read_bytes();changed=raw.replace(b'viewBox="0 0 640 1480"',b'viewBox="0 0 640 1481"');self.assertNotEqual(raw,changed)
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
 def test_wrong_kelvin_offset_models_fail_before_acceptance(self):
  real=m.source_only_predictions
  for key,wrong in [('C3-Q002',sp.Rational(-357,20)+sp.Rational(27315,100)),('C3-Q005',sp.Rational(537,10)),('C3-Q008',25+sp.Rational(27315,100))]:
   def altered():values=real();values[key]=wrong;return values
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
 def test_empty_original_prerequisites_have_a_real_nonempty_attack(self):
  p,b=deepcopy(self.p),deepcopy(self.b);self.assertEqual(p['records'][0]['prerequisites'],[]);p['records'][0]['prerequisites']=['C3-L02'];b[0]['candidateSha256']=digest(p['records'][0]);bad=self.rebound(p,b,p['records'][0]['id']);self.assertFalse(bad['ok']);self.assertTrue(any('Cric' in e and 'prerequisites' in e for e in bad['errors']))
 @BOUNDED
 @given(t=st.integers(-200,1000),change=st.integers(-50,50))
 def test_offset_cancels_between_two_readings(self,t,change):
  COUNTS['offset_cancellation']=COUNTS.get('offset_cancellation',0)+1;k=sp.Rational(27315,100);self.assertEqual((t+change+k)-(t+k),change);self.assertGreater(t+k,0);self.assertGreater(t+change+k,0)
 @BOUNDED
 @given(t=st.integers(-200,1000),n=st.integers(1,100))
 def test_absolute_temperature_ratio_uses_kelvin_origin(self,t,n):
  COUNTS['absolute_ratio']=COUNTS.get('absolute_ratio',0)+1;k=sp.Rational(27315,100);initial=t+k;final=n*initial;reading=final-k;self.assertEqual((reading+k)/initial,n);self.assertEqual(reading,n*t+(n-1)*k)
 @BOUNDED
 @given(mass=st.integers(1,10000),volume=st.integers(1,10000),specific=st.integers(1,10000))
 def test_halving_extensive_quantities_preserves_intensives(self,mass,volume,specific):
  COUNTS['extensive_intensive']=COUNTS.get('extensive_intensive',0)+1;self.assertEqual(sp.Rational(mass,volume),sp.Rational(mass,2)/sp.Rational(volume,2));self.assertEqual(sp.Rational(mass*specific,2)/sp.Rational(mass,2),specific)
if __name__=='__main__':unittest.main()
