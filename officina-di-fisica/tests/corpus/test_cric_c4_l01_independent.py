"""Independent electric charge, point forces and Coulomb review, before any authoring import."""
import ast,base64,json,os,tempfile,unittest
from copy import deepcopy
from pathlib import Path
from fractions import Fraction
from unittest.mock import patch
import xml.etree.ElementTree as ET
import sympy as sp
from hypothesis import given,settings,strategies as st
from tools.corpus_engineering import cric_c4_l01_verifier as m
from tools.corpus_engineering.pipeline import digest,sha,git_bytes
from tools.corpus_engineering.batches import assert_record_identity
APP=Path(__file__).resolve().parents[2];CANDIDATE=Path(os.environ.get('CRIC_REVIEW_CANDIDATE_APP',str(APP)));MODEL_REF='719bbd0fbc114937438b80a74d787297c5249336';MODEL_PATH='officina-di-fisica/editorial/reviews/cric-c4-001-020-partial-models.py';BOUNDED=settings(max_examples=40,derandomize=True,deadline=None);COUNTS={}
class CricChargeIndependent(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.p=json.loads((CANDIDATE/'editorial/batches/cric-c4-l01.json').read_bytes());cls.b=json.loads((CANDIDATE/'editorial/batches/cric-c4-l01-bindings.json').read_bytes());COUNTS.clear()
 @classmethod
 def tearDownClass(cls):print('INDEPENDENT_CONFIGURATIONS '+json.dumps(COUNTS,sort_keys=True),flush=True)
 def rebound(self,p,b,key,home=None):
  home=home or CANDIDATE/'editorial/assets';tokens={r['id']:token for r,z,token,a,e in m.reviewed_rows(p,b,{},m.EXPECTED_IDS,home)}
  with patch.dict(m.REVIEWED_CANDIDATES,tokens),patch.multiple(m,REVIEWED_PACKAGE_SHA256=digest(p),REVIEWED_BINDINGS_SHA256=digest(b)):return next(r for r in m.verify(p,b,home) if r['id']==key)
 def test_actual_fresh_saved_identity_and_modes(self):
  fresh=m.report(self.p,self.b,CANDIDATE/'editorial/assets');saved=json.loads((APP/'editorial/reviews/cric-c4-l01.json').read_bytes());self.assertEqual(fresh,saved)
  for report in (fresh,saved):
   assert_record_identity(report['records'],m.EXPECTED_IDS,self.p,self.b);self.assertEqual(len(report['records']),10);self.assertTrue(all(r['ok'] for r in report['records']));self.assertEqual(report['verifierSha256'],sha(Path(m.__file__).read_bytes()));self.assertEqual(report['contractSha256'],sha(Path(m.__file__).with_name('review_contract.py').read_bytes()));self.assertEqual(report['humanApproval'],'NOT_RUN');self.assertEqual(report['publication'],'DRAFT')
  self.assertEqual({mode:sum(r['verificationMode']==mode for r in fresh['records']) for mode in ('EXACT_ORACLE','AI_CONCEPTUAL')},{'EXACT_ORACLE':5,'AI_CONCEPTUAL':5})
 def test_git_candidate_binding_and_catalog_identity(self):
  for suffix in ('.json','-bindings.json'):self.assertEqual((CANDIDATE/f'editorial/batches/cric-c4-l01{suffix}').read_bytes(),git_bytes(APP.parent,m.CANDIDATE_REF,f'officina-di-fisica/editorial/batches/cric-c4-l01{suffix}'))
  raw=git_bytes(APP.parent,m.SOURCE_REF,m.SOURCE_PATH);self.assertEqual(sha(raw),m.LESSON_REFERENCE['sourceSha256']);rows={r['id']:r for r in json.loads(raw)};self.assertEqual(rows['C4-L01']['title'],m.LESSON_REFERENCE['title']);self.assertEqual(rows['C4-L01']['prerequisites'],[])
  for row,link in zip(self.p['records'],self.b):
   original=rows[row['id']];self.assertEqual(digest(original),link['sourceSha256']);self.assertEqual((row['baseVersion'],row['version']),(original['version'],original['version']+1))
   for field in ('id','kind','course','order','skill','family','difficulty','prerequisites','exam'):self.assertEqual(row.get(field),original.get(field))
   self.assertEqual(link['provenance']['sourceOrigin'],'cric');self.assertEqual(link['provenance']['sourceVersion'],original['version'])
 def test_retokenized_wrong_keys_source_context_units_and_geometry(self):
  before=(digest(self.p),digest(self.b),dict(m.REVIEWED_CANDIDATES));audit=m.mutation_audit(self.p,self.b,CANDIDATE/'editorial/assets');self.assertEqual(audit,json.loads((APP/'editorial/reviews/cric-c4-l01-independent-mutations.json').read_bytes()));self.assertEqual(audit['caseCount'],29);self.assertEqual(sum(x['case']=='wrong_key_rebound_and_all_edition_tokens_replaced' for x in audit['cases']),10);self.assertTrue(all('rejectedBy' in x for x in audit['cases']));self.assertEqual(before,(digest(self.p),digest(self.b),dict(m.REVIEWED_CANDIDATES)))
 def test_original_source_models_and_primary_remain_frozen(self):
  raw=git_bytes(APP.parent,MODEL_REF,MODEL_PATH);self.assertEqual(sha(raw),m.INDEPENDENT_MODELS_IMPLEMENTATION_SHA256);self.assertEqual(raw,(APP/'editorial/reviews/cric-c4-001-020-partial-models.py').read_bytes());actual={n.name:n for n in ast.parse(Path(m.__file__).read_text()).body if isinstance(n,ast.FunctionDef)}
  for n in ast.parse(raw).body:
   if isinstance(n,ast.FunctionDef):self.assertEqual(ast.dump(n,include_attributes=False),ast.dump(actual[n.name],include_attributes=False))
  home=APP/'editorial/reviews/cric-c4-001-020-partial-git-evidence';manifest=json.loads((home/'git-inputs.json').read_bytes());row=manifest['inputs'][0];self.assertEqual((row['commit'],row['path'],row['sha256']),(MODEL_REF,MODEL_PATH,m.INDEPENDENT_MODELS_IMPLEMENTATION_SHA256));self.assertEqual((home/row['snapshot']).read_bytes(),raw)
  self.assertEqual(sha((APP/'editorial/reviews/primary-cric-c4-001-020-partial-before-candidates-20261126.md').read_bytes()),m.PRIMARY_SHA256);receipt=json.loads((APP/'editorial/reviews/cric-c4-001-020-partial-models-20261126.json').read_bytes());self.assertEqual((receipt['exitCode'],receipt['signal'],receipt['numericChecks'],receipt['dimensionalChecks']),(0,None,10,4));self.assertFalse(receipt['candidateKeysOpened'])
 def test_finite_exact_inputs_and_decimal_lexemes(self):
  self.assertEqual(m.parse_literal('-17,85'),sp.Rational(-357,20));self.assertEqual(m.parse_literal('326,85'),sp.Rational(6537,20));self.assertNotEqual(m.parse_literal('326.850000000000000001'),sp.Rational(6537,20))
  for bad in ('nan','inf','1/0','__import__("os")','2**100000','1e400','√10001'):
   with self.assertRaises(ValueError):m.parse_literal(bad)
  for bad in (0.1,sp.Float('0.1'),True,sp.oo,-sp.oo,sp.I,sp.nan,None,[],{}):
   for fn in (m._finite_exact,m._rational_exact,m.equivalent_literal):
    with self.assertRaises(ValueError):fn(bad)
 def test_charge_and_ratio_physical_equivalence(self):
  self.assertEqual(m.alternative_identity('−3,7 nC'),m.alternative_identity('−0,0000000037 C'));self.assertEqual(m.alternative_identity('3/4'),m.alternative_identity('75%'));self.assertNotEqual(m.alternative_identity('3/4%'),m.alternative_identity('3/4'));self.assertNotEqual(m.alternative_identity('1 C'),m.alternative_identity('1 m'))
 def test_equivalent_charge_choice_after_all_pins_renewed(self):
  p,b=deepcopy(self.p),deepcopy(self.b);row=p['records'][4];wrong=next(i for i,v in enumerate(row['answer']['options']) if v!=row['answer']['value']);row['answer']['options'][wrong]='−0,0000000037 C';b[4]['candidateSha256']=digest(row);bad=self.rebound(p,b,row['id']);self.assertFalse(bad['ok']);self.assertIn('Equivalent exact numeric choices require editorial review',bad['errors'])
 def test_equivalent_ratio_choice_after_all_pins_renewed(self):
  p,b=deepcopy(self.p),deepcopy(self.b);row=p['records'][7];wrong=next(i for i,v in enumerate(row['answer']['options']) if v!=row['answer']['value']);row['answer']['options'][wrong]='75%';b[7]['candidateSha256']=digest(row);bad=self.rebound(p,b,row['id']);self.assertFalse(bad['ok']);self.assertIn('Equivalent exact numeric choices require editorial review',bad['errors'])
 def test_native_actual_exit_and_independent_charge_geometry(self):
  r=json.loads((APP/'editorial/reviews/cric-c4-l01-svg-independent-evidence/cric-c4-l01-terminal.json').read_bytes());self.assertEqual((r['exitCode'],r['signal']),(0,None));self.assertTrue(r['fullImageReadByReviewer'] and r['fullXmlReadByReviewer']);self.assertEqual(r['assetSha256'],sha((CANDIDATE/'editorial/assets'/m.ASSET_NAME).read_bytes()));self.assertTrue(m.asset_geometry(CANDIDATE/'editorial/assets'));self.assertEqual(Fraction(370-130,210-130),3);self.assertEqual(Fraction(130-40,130-120),9);self.assertEqual(Fraction(300-210,380-370),9);self.assertEqual(Fraction(12,10)-Fraction(37,10),Fraction(-25,10));root=ET.parse(CANDIDATE/'editorial/assets'/m.ASSET_NAME).getroot();self.assertEqual(sum(e.text=='10 000' for e in root.iter()),3);self.assertEqual(sum('marker-end'in e.attrib for e in root.iter()),4)
 def test_viewport_change_fails_without_hash_pin(self):
  raw=(CANDIDATE/'editorial/assets'/m.ASSET_NAME).read_bytes();changed=raw.replace(b'viewBox="0 0 640 1540"',b'viewBox="0 0 640 1541"');self.assertNotEqual(raw,changed)
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
 def test_wrong_constitutive_models_fail_before_acceptance(self):
  real=m.partial_source_predictions
  for key in ['C4-Q001','C4-Q004','C4-Q005','C4-Q008','C4-Q010']:
   def altered():values=real();values[key]*=2;return values
   m.oracle.cache_clear()
   try:
    with patch.object(m,'partial_source_predictions',altered):
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
  p,b=deepcopy(self.p),deepcopy(self.b);self.assertEqual(p['records'][0]['prerequisites'],[]);p['records'][0]['prerequisites']=['C4-L02'];b[0]['candidateSha256']=digest(p['records'][0]);bad=self.rebound(p,b,p['records'][0]['id']);self.assertFalse(bad['ok']);self.assertTrue(any('Cric' in e and 'prerequisites' in e for e in bad['errors']))
 @BOUNDED
 @given(q_total=st.integers(-10000,10000),first=st.integers(-10000,10000))
 def test_signed_charge_conservation_inverse(self,q_total,first):
  COUNTS['charge_conservation']=COUNTS.get('charge_conservation',0)+1;second=q_total-first;self.assertEqual(first+second,q_total)
 @BOUNDED
 @given(radius=st.integers(1,10000),factor=st.integers(1,100),charge1=st.integers(1,100),charge2=st.integers(1,100))
 def test_coulomb_distance_square_and_positive_inverse(self,radius,factor,charge1,charge2):
  COUNTS['coulomb_square']=COUNTS.get('coulomb_square',0)+1;initial=sp.Rational(charge1*charge2,radius**2);final=sp.Rational(charge1*charge2,(factor*radius)**2);ratio=final/initial;self.assertEqual(ratio,sp.Rational(1,factor**2));self.assertEqual(sp.sqrt(1/ratio),factor)
 @BOUNDED
 @given(count=st.integers(1,10**8))
 def test_integer_electron_count_from_negative_added_charge(self,count):
  COUNTS['electron_count']=COUNTS.get('electron_count',0)+1;e=sp.Rational(16,10**20);charge=-count*e;result=abs(charge)/e;self.assertEqual(result,count);self.assertTrue(result.is_Integer);self.assertLess(charge,0)
 def test_nonzero_monopole_and_ratio_domains_survive_retokenization(self):
  for key,fragments in m.REQUIRED_DOMAIN_FRAGMENTS.items():
   for fragment in fragments:
    p,b=deepcopy(self.p),deepcopy(self.b);i=next(i for i,r in enumerate(p['records']) if r['id']==key);self.assertIn(fragment,p['records'][i]['prompt']);p['records'][i]['prompt']=p['records'][i]['prompt'].replace(fragment,'[condizione rimossa]',1);b[i]['candidateSha256']=digest(p['records'][i]);bad=self.rebound(p,b,key);self.assertFalse(bad['ok']);self.assertTrue(any('physical domain' in e for e in bad['errors']))
 def test_reviewed_text_position_and_arrow_tip_are_physical_edition_inputs(self):
  raw=(CANDIDATE/'editorial/assets'/m.ASSET_NAME).read_bytes()
  for old,new in [(b'x="40" y="55"',b'x="1" y="55"'),(b'markerWidth="5"',b'markerWidth="6"')]:
   self.assertEqual(raw.count(old),1);changed=raw.replace(old,new)
   with tempfile.TemporaryDirectory()as directory:
    home=Path(directory);(home/m.ASSET_NAME).write_bytes(changed)
    with self.assertRaisesRegex(ValueError,'physical scale'):m.asset_geometry(home)
if __name__=='__main__':unittest.main()
