"""Independent electric charge, point forces and Coulomb review, before any authoring import."""
import ast,base64,json,os,tempfile,unittest
from copy import deepcopy
from pathlib import Path
from fractions import Fraction
from unittest.mock import patch
import xml.etree.ElementTree as ET
import sympy as sp
from hypothesis import given,settings,strategies as st
import importlib
from tools.corpus_engineering.pipeline import digest,sha,git_bytes
from tools.corpus_engineering.batches import assert_record_identity
APP=Path(__file__).resolve().parents[2];CANDIDATE=Path(os.environ.get('CRIC_REVIEW_CANDIDATE_APP',str(APP)));BOUNDED=settings(max_examples=40,derandomize=True,deadline=None);COUNTS={}
MODULES=[importlib.import_module('tools.corpus_engineering.cric_c4_l%02d_verifier'%n)for n in (2,3,4,5)]
class FourCricElectricCohortsIndependent(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.inputs={m.BATCH:(json.loads((CANDIDATE/f'editorial/batches/{m.BATCH}.json').read_bytes()),json.loads((CANDIDATE/f'editorial/batches/{m.BATCH}-bindings.json').read_bytes()))for m in MODULES};COUNTS.clear()
 @classmethod
 def tearDownClass(cls):print('INDEPENDENT_CONFIGURATIONS '+json.dumps(COUNTS,sort_keys=True),flush=True)
 def rebound(self,m,p,b,key,home=None):
  home=home or CANDIDATE/'editorial/assets';tokens={r['id']:token for r,z,token,a,e in m.reviewed_rows(p,b,{},m.EXPECTED_IDS,home)}
  with patch.dict(m.REVIEWED_CANDIDATES,tokens),patch.multiple(m,REVIEWED_PACKAGE_SHA256=digest(p),REVIEWED_BINDINGS_SHA256=digest(b)):return next(r for r in m.verify(p,b,home)if r['id']==key)
 def test_forty_fresh_saved_identities_modes_and_frozen_dependencies(self):
  for m in MODULES:
   with self.subTest(batch=m.BATCH):
    p,b=self.inputs[m.BATCH];fresh=m.report(p,b,CANDIDATE/'editorial/assets');saved=json.loads((APP/f'editorial/reviews/{m.BATCH}.json').read_bytes());self.assertEqual(fresh,saved)
    for report in (fresh,saved):
     assert_record_identity(report['records'],m.EXPECTED_IDS,p,b);self.assertEqual(len(report['records']),10);self.assertTrue(all(r['ok']for r in report['records']));self.assertEqual(report['verifierSha256'],sha(Path(m.__file__).read_bytes()));self.assertEqual(report['contractSha256'],sha(Path(m.__file__).with_name('review_contract.py').read_bytes()));self.assertEqual(report['humanApproval'],'NOT_RUN');self.assertEqual(report['publication'],'DRAFT')
    wanted=sum(not isinstance(v,str)for v in m.oracle());self.assertEqual(sum(r['verificationMode']=='EXACT_ORACLE'for r in fresh['records']),wanted);self.assertEqual(sum(r['verificationMode']=='AI_CONCEPTUAL'for r in fresh['records']),10-wanted)
 def test_all_forty_git_source_candidate_and_catalog_contexts(self):
  for m in MODULES:
   p,b=self.inputs[m.BATCH]
   for suffix in('.json','-bindings.json'):self.assertEqual((CANDIDATE/f'editorial/batches/{m.BATCH}{suffix}').read_bytes(),git_bytes(APP.parent,m.CANDIDATE_REF,f'officina-di-fisica/editorial/batches/{m.BATCH}{suffix}'))
   raw=git_bytes(APP.parent,m.SOURCE_REF,m.SOURCE_PATH);self.assertEqual(sha(raw),m.LESSON_REFERENCE['sourceSha256']);source={r['id']:r for r in json.loads(raw)};lesson=source[m.LESSON_REFERENCE['primarySkill']];self.assertEqual(lesson['title'],m.LESSON_REFERENCE['title']);self.assertEqual(lesson['prerequisites'],m.LESSON_REFERENCE['actualLessonPrerequisites'])
   for row,link in zip(p['records'],b):
    original=source[row['id']];self.assertEqual(digest(original),link['sourceSha256']);self.assertEqual((row['baseVersion'],row['version']),(original['version'],original['version']+1))
    for field in('id','kind','course','order','skill','family','difficulty','prerequisites','exam'):self.assertEqual(row.get(field),original.get(field))
 def test_three_prompt_only_models_all_function_AST_and_git_recovery(self):
  done=set()
  for m in MODULES:
   raw=git_bytes(APP.parent,m.MODEL_REF,'officina-di-fisica/'+m.MODEL_PATH);self.assertEqual(raw,(APP/m.MODEL_PATH).read_bytes());self.assertEqual(sha(raw),m.INDEPENDENT_MODELS_IMPLEMENTATION_SHA256);actual={n.name:n for n in ast.parse(Path(m.__file__).read_text()).body if isinstance(n,ast.FunctionDef)}
   for n in ast.parse(raw).body:
    if isinstance(n,ast.FunctionDef):self.assertEqual(ast.dump(n,include_attributes=False),ast.dump(actual[n.name],include_attributes=False))
   part=m.MODEL_PATH.split('cric-c4-',1)[1].split('-partial-models',1)[0];home=APP/f'editorial/reviews/cric-c4-{part}-partial-git-evidence';inputs=json.loads((home/'git-inputs.json').read_bytes())['inputs'];entry=next(x for x in inputs if x['path']=='officina-di-fisica/'+m.MODEL_PATH);self.assertEqual((entry['commit'],entry['sha256']),(m.MODEL_REF,m.INDEPENDENT_MODELS_IMPLEMENTATION_SHA256));self.assertEqual((home/entry['snapshot']).read_bytes(),raw)
   self.assertEqual(sha((APP/f'editorial/reviews/primary-cric-c4-{part}-partial-before-candidates-20261126.md').read_bytes()),m.PRIMARY_SHA256)
 def test_all_forty_wrong_keys_rebound_retokenized_with_source_units_geometry(self):
  for m in MODULES:
   p,b=self.inputs[m.BATCH];before=(digest(p),digest(b),dict(m.REVIEWED_CANDIDATES));audit=m.mutation_audit(p,b,CANDIDATE/'editorial/assets');self.assertEqual(audit,json.loads((APP/f'editorial/reviews/{m.BATCH}-independent-mutations.json').read_bytes()));self.assertEqual(audit['caseCount'],29);self.assertEqual(sum(x['case']=='wrong_key_rebound_and_all_edition_tokens_replaced'for x in audit['cases']),10);self.assertEqual(before,(digest(p),digest(b),dict(m.REVIEWED_CANDIDATES)))
 def test_all_public_exact_helpers_reject_nonfinite_nonreal_float_and_bad_lexemes(self):
  for m in MODULES:
   self.assertEqual(m.parse_literal('-17,85'),sp.Rational(-357,20));self.assertNotEqual(m.parse_literal('300.000000000000000001'),sp.Integer(300))
   for bad in('nan','inf','1/0','__import__("os")','2**100000','1e400','√10001'):
    with self.assertRaises(ValueError):m.parse_literal(bad)
   for bad in(0.1,sp.Float('0.1'),True,sp.oo,-sp.oo,sp.I,sp.nan,None,[],{}):
    for fn in(m._finite_exact,m._rational_exact,m.equivalent_literal):
     with self.assertRaises(ValueError):fn(bad)
   for number in(0,True,1.0,sp.oo,[],{},m.OFFSET,m.OFFSET+11):
    with self.assertRaises(ValueError):m.parse_option(number,'1')
 def test_dimensioned_equivalent_choices_rejected_after_all_pins_renewed(self):
  variants=[(2,12,'300 N/C','300 V/m'),(3,21,'90 V','90000 mV'),(4,33,'6 nC','0,000000006 C'),(5,48,'0,020 Ω','0,000020 kΩ')]
  for cohort,number,correct,equiv in variants:
   m=MODULES[cohort-2];p,b=map(deepcopy,self.inputs[m.BATCH]);i=number-m.OFFSET-1;row=p['records'][i];self.assertEqual(m.alternative_identity(correct),m.alternative_identity(equiv))
   row['answer']={'type':'choice','value':correct,'options':[correct,equiv,'999'+m.OPTION_SUFFIX[number]]};b[i]['candidateSha256']=digest(row);bad=self.rebound(m,p,b,row['id']);self.assertFalse(bad['ok']);self.assertIn('Equivalent exact numeric choices require editorial review',bad['errors'])
 def test_wrong_source_models_fail_acceptance_even_when_answer_keys_remain_true(self):
  counts=[]
  for m in MODULES:
   real=m.partial_source_predictions;keys=[key for key in real()if key in m.EXPECTED_IDS]
   for key in keys:
    def altered():values=real();values[key]+=1;return values
    m.oracle.cache_clear()
    try:
     with patch.object(m,'partial_source_predictions',altered):
      with self.assertRaises(AssertionError):m.verify(*self.inputs[m.BATCH],CANDIDATE/'editorial/assets')
    finally:m.oracle.cache_clear()
   counts.append(len(keys))
  self.assertEqual(counts,[5,5,3,5])
 def test_all_reviewed_physical_domains_survive_hostile_rebinding(self):
  for m in MODULES:
   for key,fragments in m.REQUIRED_DOMAIN_FRAGMENTS.items():
    for fragment in fragments:
     p,b=map(deepcopy,self.inputs[m.BATCH]);i=next(i for i,r in enumerate(p['records'])if r['id']==key);self.assertIn(fragment,p['records'][i]['prompt']);p['records'][i]['prompt']=p['records'][i]['prompt'].replace(fragment,'[condizione rimossa]',1);b[i]['candidateSha256']=digest(p['records'][i]);bad=self.rebound(m,p,b,key);self.assertFalse(bad['ok']);self.assertTrue(any('physical domain'in e for e in bad['errors']))
 def test_four_actual_native_full_images_and_xml_are_pinned(self):
  for m in MODULES:
   home=APP/f'editorial/reviews/{m.BATCH}-svg-independent-evidence';r=json.loads((home/f'{m.BATCH}-terminal.json').read_bytes());self.assertEqual((r['exitCode'],r['signal']),(0,None));self.assertTrue(r['fullImageReadByReviewer']and r['fullXmlReadByReviewer']);self.assertEqual(r['assetSha256'],sha((CANDIDATE/'editorial/assets'/m.ASSET_NAME).read_bytes()));self.assertEqual(json.loads((home/f'{m.BATCH}-render.json').read_bytes())['textClipping'],[]);self.assertTrue(m.asset_geometry(CANDIDATE/'editorial/assets'))
 def test_independently_derived_scales_signed_bars_and_axis_values(self):
  self.assertEqual(Fraction(220-100,460-220),Fraction(1,2));self.assertEqual(Fraction(300-220,220-140),1);self.assertEqual(sp.sqrt(180**2+240**2),300);self.assertEqual(Fraction(180,300),Fraction(240,400))
  self.assertEqual(Fraction(320-140,500-320),1);self.assertEqual(Fraction(12,440-140),Fraction(4,100));self.assertEqual(180,500-320);self.assertEqual(320-140,180)
  self.assertEqual(Fraction(220-130,460-430),3);self.assertEqual(12/4,3)
  self.assertEqual(Fraction(144*210,216*70),2);self.assertEqual(Fraction(320*40,160*80),1);self.assertEqual(Fraction(460-100,220-100),3);self.assertEqual(Fraction(1420-1220,1420-1320),2)
 def test_all_accessible_titles_and_descs_after_asset_rebinding(self):
  for m in MODULES:
   for tag in('title','desc'):
    p,b=map(deepcopy,self.inputs[m.BATCH]);asset=next(a for a in p['assets']if a['name']==m.ASSET_NAME);raw=base64.b64decode(asset['data']);text=next(e.text for e in ET.fromstring(raw).iter()if e.tag.rsplit('}',1)[-1]==tag);self.assertEqual(raw.count(text.encode()),1);raw=raw.replace(text.encode(),(text+' Quantità falsa:999 N/C.').encode());old=asset['id'];asset.update(id=sha(raw),data=base64.b64encode(raw).decode())
    for row,link in zip(p['records'],b):
     for block in row['blocks']:
      if block.get('src')=='/asset/'+old:block['src']='/asset/'+asset['id']
     if m.ASSET_NAME in link.get('assetChecksums',{}):link['assetChecksums'][m.ASSET_NAME]=asset['id']
     link['candidateSha256']=digest(row)
    with tempfile.TemporaryDirectory()as directory:
     home=Path(directory)
     for a in p['assets']:(home/a['name']).write_bytes(base64.b64decode(a['data']))
     with self.assertRaisesRegex(ValueError,'accessible title/desc'):self.rebound(m,p,b,p['records'][0]['id'],home)
 def test_viewport_and_physical_label_positions_and_arrow_tips(self):
  for m in MODULES:
   raw=(CANDIDATE/'editorial/assets'/m.ASSET_NAME).read_bytes()
   for old,new in[(b'viewBox="0 0 640 1540"',b'viewBox="0 0 640 1541"'),(b'x="40" y="55"',b'x="1" y="55"'),(b'markerWidth="8"'if m.OFFSET==10 else b'markerWidth="7"',b'markerWidth="9"')]:
    self.assertGreater(raw.count(old),0);changed=raw.replace(old,new,1)
    with tempfile.TemporaryDirectory()as directory:
     home=Path(directory);(home/m.ASSET_NAME).write_bytes(changed)
     with self.assertRaisesRegex(ValueError,'physical scale'):m.asset_geometry(home)
 def test_modes_publication_and_dependencies_cannot_drift(self):
  for m in MODULES:
   p,b=self.inputs[m.BATCH];rows=m.report(p,b,CANDIDATE/'editorial/assets')['records']
   for field,value in[('verificationMode','AI_SCIENTIFIC_PASS'),('candidateSha256','0'*64),('humanApproval','PASS'),('publication','PUBLISHED')]:
    bad=deepcopy(rows);bad[0][field]=value
    with self.assertRaises(ValueError):assert_record_identity(bad,m.EXPECTED_IDS,p,b)
   for field in('EXACT_LITERAL_DEPENDENCY_SHA256','INDEPENDENT_MODELS_IMPLEMENTATION_SHA256'):
    with patch.object(m,field,'0'*64):self.assertTrue(all(not r['ok']for r in m.verify(p,b,CANDIDATE/'editorial/assets')))
 @BOUNDED
 @given(q=st.integers(1,100000),field=st.integers(1,100000))
 def test_positive_probe_field_and_inverse(self,q,field):
  COUNTS["positive_probe_field_and_inverse"] = COUNTS.get("positive_probe_field_and_inverse",0)+1;force=sp.Integer(q)*field;self.assertEqual(force/q,field);self.assertEqual(force/field,q)
 @BOUNDED
 @given(q=st.integers(1,1000),multiple=st.integers(1,100),d=st.integers(1,10000))
 def test_cancel_distance_positive_branch(self,q,multiple,d):
  COUNTS["cancel_distance_positive_branch"] = COUNTS.get("cancel_distance_positive_branch",0)+1;other=multiple*d;self.assertEqual(sp.Rational(q,d*d),sp.Rational(multiple*multiple*q,other*other));self.assertEqual(sp.Rational(d+other,1+multiple),d)
 @BOUNDED
 @given(a=st.integers(1,1000),t=st.integers(1,1000),vx=st.integers(1,1000))
 def test_transverse_motion_and_inversion(self,a,t,vx):
  COUNTS["transverse_motion_and_inversion"] = COUNTS.get("transverse_motion_and_inversion",0)+1;y=sp.Rational(1,2)*a*t*t;x=vx*t;self.assertEqual(x/vx,t);self.assertEqual(2*y/(t*t),a);self.assertEqual(a*t-a*t,0)
 @BOUNDED
 @given(initial=st.integers(-1000,1000),final=st.integers(-1000,1000),shift=st.integers(-1000,1000),q=st.integers(-1000,1000))
 def test_gauge_invariance_and_signed_work(self,initial,final,shift,q):
  COUNTS["gauge_invariance_and_signed_work"] = COUNTS.get("gauge_invariance_and_signed_work",0)+1;self.assertEqual((final+shift)-(initial+shift),final-initial);self.assertEqual(-q*(final-initial),q*(initial-final))
 @BOUNDED
 @given(field=st.integers(1,1000),distance=st.integers(1,1000))
 def test_potential_gradient_inverse(self,field,distance):
  COUNTS["potential_gradient_inverse"] = COUNTS.get("potential_gradient_inverse",0)+1;difference=sp.Integer(field)*distance;self.assertEqual(difference/distance,field);self.assertEqual(difference/field,distance)
 @BOUNDED
 @given(mass=st.integers(1,1000),speed=st.integers(1,1000))
 def test_kinetic_gain_physical_positive_branch(self,mass,speed):
  COUNTS["kinetic_gain_physical_positive_branch"] = COUNTS.get("kinetic_gain_physical_positive_branch",0)+1;energy=sp.Rational(mass,2)*speed**2;self.assertEqual(sp.sqrt(2*energy/mass),speed)
 @BOUNDED
 @given(part=st.integers(-10000,10000))
 def test_neutral_surface_signed_balance(self,part):
  COUNTS["neutral_surface_signed_balance"] = COUNTS.get("neutral_surface_signed_balance",0)+1;rest=-part;self.assertEqual(part+rest,0)
 @BOUNDED
 @given(field=st.integers(1,10000),eps=st.integers(1,1000))
 def test_dielectric_fixed_charge_inverse(self,field,eps):
  COUNTS["dielectric_fixed_charge_inverse"] = COUNTS.get("dielectric_fixed_charge_inverse",0)+1;after=sp.Rational(field,eps);self.assertEqual(after*eps,field);self.assertLessEqual(after,field)
 @BOUNDED
 @given(value=st.integers(-10000,10000),shift=st.integers(-10000,10000))
 def test_equipotential_shift_does_not_force_zero(self,value,shift):
  COUNTS["equipotential_shift_does_not_force_zero"] = COUNTS.get("equipotential_shift_does_not_force_zero",0)+1;a=sp.Integer(value)+shift;b=sp.Integer(value)+shift;self.assertEqual(b-a,0)
 @BOUNDED
 @given(i1=st.integers(1,1000),i2=st.integers(1,1000),t1=st.integers(1,1000),t2=st.integers(1,1000))
 def test_signed_piecewise_current_and_time_inverse(self,i1,i2,t1,t2):
  COUNTS["signed_piecewise_current_and_time_inverse"] = COUNTS.get("signed_piecewise_current_and_time_inverse",0)+1;charge=sp.Integer(i1)*t1+sp.Integer(i2)*t2;self.assertEqual((charge-i1*t1)/i2,t2)
 @BOUNDED
 @given(factor=st.integers(1,1000),length=st.integers(1,1000),area=st.integers(1,1000))
 def test_constant_volume_stretch_square(self,factor,length,area):
  COUNTS["constant_volume_stretch_square"] = COUNTS.get("constant_volume_stretch_square",0)+1;newarea=sp.Rational(area,factor);newlength=sp.Integer(length)*factor;self.assertEqual(newarea*newlength,area*length);self.assertEqual((newlength/newarea)/sp.Rational(length,area),factor**2)
 @BOUNDED
 @given(rho=st.integers(1,1000),length=st.integers(1,1000),width=st.integers(1,1000),height=st.integers(1,1000))
 def test_wire_resistance_area_inverse(self,rho,length,width,height):
  COUNTS["wire_resistance_area_inverse"] = COUNTS.get("wire_resistance_area_inverse",0)+1;area=sp.Integer(width)*height;resistance=sp.Rational(rho*length,area);self.assertEqual(rho*length/resistance,area)
if __name__=='__main__':unittest.main()
