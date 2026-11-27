"""Distinct C6 A13 review: exact source-first model and adversaries, no author imports."""
import ast, json, os, unittest
from copy import deepcopy
from fractions import Fraction
from pathlib import Path
from unittest.mock import patch
import sympy as sp
from hypothesis import given, settings, strategies as st
from tools.corpus_engineering import cric_c6_integrative_verifier as m
from tools.corpus_engineering.pipeline import digest, sha, git_bytes
from tools.corpus_engineering.batches import assert_record_identity
from tools.corpus_engineering.cric_c5_independent_adversaries import audit, rebound
APP=Path(__file__).resolve().parents[2]
CANDIDATE=Path(os.environ.get('CRIC_REVIEW_CANDIDATE_APP',str(APP)))
BOUNDED=settings(max_examples=40,derandomize=True,deadline=None)
COUNTS={}
LAWS=[('flight_time',[1,1]),('pressure_mass',[1,1,1]),('outgoing_flow',[3,1,1]),('fixed_voltage_power',[1,1,1]),('remaining_energy',[2,1]),('converted_cycle',[2,1,sp.Rational(1,2)]),('pressure_radius_ratio',[1]),('count_reduction',[1,1]),('signed_charge',[1,1,-1,1]),('hydrostatic_density',[1,1,1]),('received_energy',[1,sp.Rational(1,2),sp.Rational(1,2),1]),('heating_volume',[1,1,1,1])]
class IndependentIntegrativeReview(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.p=json.loads((CANDIDATE/f'editorial/batches/{m.BATCH}.json').read_bytes());cls.b=json.loads((CANDIDATE/f'editorial/batches/{m.BATCH}-bindings.json').read_bytes());COUNTS.clear()
 @classmethod
 def tearDownClass(cls):print('ACTUAL_C6_INTEGRATIVE_PROPERTY_CONFIGURATIONS '+json.dumps(COUNTS,sort_keys=True),flush=True)
 def test_thirteen_actual_fresh_saved_identities_and_distinct_modes(self):
  fresh=m.report(self.p,self.b,CANDIDATE/'editorial/assets');saved=json.loads((APP/f'editorial/reviews/{m.BATCH}.json').read_bytes());self.assertEqual(fresh,saved)
  for report in(fresh,saved):
   assert_record_identity(report['records'],m.EXPECTED_IDS,self.p,self.b);self.assertEqual(len(report['records']),13);self.assertTrue(all(r['ok']for r in report['records']));self.assertEqual(report['verifierSha256'],sha(Path(m.__file__).read_bytes()));self.assertEqual(report['contractSha256'],sha(Path(m.__file__).with_name('review_contract.py').read_bytes()));self.assertEqual(report['humanApproval'],'NOT_RUN');self.assertEqual(report['publication'],'DRAFT');self.assertEqual(sum(r['verificationMode']=='EXACT_ORACLE'for r in report['records']),12);self.assertEqual(sum(r['verificationMode']=='AI_CONCEPTUAL'for r in report['records']),1)
 def test_all_thirteen_hashes_individual_paths_context_and_six_lessons(self):
  originals=m.source_records();self.assertEqual(set(originals),m.EXPECTED_IDS);self.assertEqual(len(set(m.SOURCE_PATHS.values())),2)
  for path,hash_ in m.SOURCE_FILE_SHA256.items():self.assertEqual(sha(git_bytes(APP.parent,m.SOURCE_REF,path)),hash_)
  catalog={r['id']:r for r in json.loads(git_bytes(APP.parent,m.SOURCE_REF,'officina-di-fisica/content/C6.json'))if r.get('kind')=='lesson'}
  self.assertEqual({v['id']for v in m.LESSON_REFERENCES.values()},{f'C6-L0{i}'for i in range(1,7)})
  for row,binding in zip(self.p['records'],self.b):
   old=originals[row['id']];self.assertEqual(binding['sourceSha256'],digest(old));self.assertEqual(binding['provenance']['sourcePath'],m.SOURCE_PATHS[row['id']]);self.assertEqual((row['baseVersion'],row['version']),(old['version'],old['version']+1))
   for field in('id','kind','course','section','order','skill','family','difficulty','prerequisites','exam'):self.assertEqual(row.get(field),old.get(field))
   self.assertEqual(m.LESSON_REFERENCES[row['id']]['title'],catalog[row['skill']]['title'])
  for suffix in('.json','-bindings.json'):self.assertEqual((CANDIDATE/f'editorial/batches/{m.BATCH}{suffix}').read_bytes(),git_bytes(APP.parent,m.CANDIDATE_REF,'officina-di-fisica/editorial/batches/'+m.BATCH+suffix))
 def test_frozen_source_first_model_AST_and_git_recovery(self):
  raw=git_bytes(APP.parent,m.MODEL_REF,'officina-di-fisica/'+m.MODEL_PATH);self.assertEqual(raw,(APP/m.MODEL_PATH).read_bytes());self.assertEqual(sha(raw),m.INDEPENDENT_MODELS_IMPLEMENTATION_SHA256);self.assertEqual(sha((APP/m.PRIMARY_PATH).read_bytes()),m.PRIMARY_SHA256)
  actual={n.name:n for n in ast.parse(Path(m.__file__).read_text()).body if isinstance(n,ast.FunctionDef)}
  for node in ast.parse(raw).body:
   if isinstance(node,ast.FunctionDef):self.assertEqual(ast.dump(node,include_attributes=False),ast.dump(actual[node.name],include_attributes=False))
  home=APP/'editorial/reviews/cric-c6-integrative-partial-git-evidence';entry=json.loads((home/'git-inputs.json').read_bytes())['inputs'][0];self.assertEqual((entry['commit'],entry['path'],entry['sha256']),(m.MODEL_REF,'officina-di-fisica/'+m.MODEL_PATH,sha(raw)));self.assertEqual((home/entry['snapshot']).read_bytes(),raw)
 def test_rebound_keys_identity_units_and_accessible_asset_adversaries(self):
  before=digest(self.p),digest(self.b),dict(m.REVIEWED_CANDIDATES);fresh=audit(m,self.p,self.b,CANDIDATE/'editorial/assets');self.assertEqual(fresh,json.loads((APP/f'editorial/reviews/{m.BATCH}-independent-mutations.json').read_bytes()));self.assertEqual(fresh['caseCount'],33);self.assertTrue(fresh['allRejected']);self.assertEqual(before,(digest(self.p),digest(self.b),dict(m.REVIEWED_CANDIDATES)))
 def test_every_false_choice_even_after_renewing_all_test_only_pins(self):
  count=0
  for i,row in enumerate(self.p['records']):
   if row['answer']['type']!='choice':continue
   for wrong in row['answer']['options']:
    if wrong==row['answer']['value']:continue
    p,b=deepcopy(self.p),deepcopy(self.b);p['records'][i]['answer']['value']=wrong;b[i]['candidateSha256']=digest(p['records'][i]);result=rebound(m,p,b,CANDIDATE/'editorial/assets',row['id']);self.assertFalse(result['ok']);self.assertTrue(any('exact 'in e or 'conceptual key'in e for e in result['errors']));count+=1
  self.assertEqual(count,16)
 def test_each_original_section_survives_complete_test_only_rebinding(self):
  for i,row in enumerate(self.p['records']):
   p,b=deepcopy(self.p),deepcopy(self.b);p['records'][i]['section']='Invented aggregate section';b[i]['candidateSha256']=digest(p['records'][i]);result=rebound(m,p,b,CANDIDATE/'editorial/assets',row['id']);self.assertFalse(result['ok']);self.assertIn('Individual Cric identity/context mismatch: section',result['errors'])
 def test_exact_decoder_and_all_mathematical_input_finite_boundaries(self):
  self.assertEqual(m.parse_literal('0,15'),sp.Rational(3,20));self.assertNotEqual(m.parse_literal('0.150000000000000001'),sp.Rational(3,20))
  for bad in('nan','inf','1/0','__import__("os")','2**100000','1e400','√10001'):
   with self.assertRaises(ValueError):m.parse_literal(bad)
  invalid=(0.1,sp.Float('0.1'),True,sp.oo,-sp.oo,sp.I,sp.nan,None,[],{})
  for bad in invalid:
   for fn in(m._finite_exact,m._rational_exact,m.equivalent_literal):
    with self.assertRaises(ValueError):fn(bad)
  for n in(0,14,True,1.0,sp.oo,[],{}):
   with self.assertRaises(ValueError):m.parse_option(n,'1')
  count=0
  for name,args in LAWS:
   fn=getattr(m,name)
   for i in range(len(args)):
    for bad in invalid:
     changed=list(args);changed[i]=bad
     with self.assertRaises(ValueError):fn(*changed)
     count+=1
  self.assertEqual(count,340)
 def test_unphysical_domains_rejected_but_signed_currents_admitted(self):
  cases=[('flight_time',[1,0]),('pressure_mass',[1,-1,1]),('outgoing_flow',[1,2,0]),('outgoing_flow',[1,-1,0]),('remaining_energy',[1,2]),('converted_cycle',[1,2,1]),('converted_cycle',[2,1,2]),('count_reduction',[0,1]),('pressure_radius_ratio',[0]),('signed_charge',[1,0,-1,1]),('received_energy',[1,2,1,1]),('received_energy',[1,1,-1,1]),('hydrostatic_density',[1,1,0]),('heating_volume',[1,1,0,1])]
  for name,args in cases:
   with self.assertRaises(ValueError):getattr(m,name)(*args)
  self.assertEqual(m.signed_charge(-2,3,1,4),-2);self.assertEqual(m.remaining_energy(0,0),0);self.assertEqual(m.outgoing_flow(2,1,1),0)
 def test_all_twelve_typed_constitutive_faults_reject_correct_keys(self):
  for name,args in LAWS:
   fn=getattr(m,name)
   def wrong(*a,**kw):return fn(*a,**kw)+1
   m.oracle.cache_clear()
   try:
    with patch.object(m,name,wrong):
     with self.assertRaises(AssertionError):m.verify(self.p,self.b,CANDIDATE/'editorial/assets')
   finally:m.oracle.cache_clear()
 def test_all_twelve_source_numeric_faults_reject_correct_keys(self):
  fn=m.predictions;keys=[k for k,v in fn().items()if not isinstance(v,str)];self.assertEqual(len(keys),12)
  for key in keys:
   def wrong():v=fn();v[key]+=1;return v
   m.oracle.cache_clear()
   try:
    with patch.object(m,'predictions',wrong):
     with self.assertRaises(AssertionError):m.verify(self.p,self.b,CANDIDATE/'editorial/assets')
   finally:m.oracle.cache_clear()
 def test_independent_domain_guards_survive_edition_rebinding(self):
  count=0
  for key,parts in m.REQUIRED_DOMAIN_FRAGMENTS.items():
   for fragment in parts:
    p,b=deepcopy(self.p),deepcopy(self.b);i=m.INDEX[key];self.assertIn(fragment,p['records'][i]['prompt']);p['records'][i]['prompt']=p['records'][i]['prompt'].replace(fragment,'[condizione rimossa]',1);b[i]['candidateSha256']=digest(p['records'][i]);result=rebound(m,p,b,CANDIDATE/'editorial/assets',key);self.assertFalse(result['ok']);self.assertTrue(any('physical domain'in e for e in result['errors']));count+=1
  self.assertEqual(count,29)
 def test_real_full_native_and_independent_quantitative_geometry(self):
  home=APP/f'editorial/reviews/{m.BATCH}-svg-independent-evidence';receipt=json.loads((home/f'{m.BATCH}-terminal.json').read_bytes());self.assertEqual((receipt['exitCode'],receipt['signal']),(0,None));self.assertTrue(receipt['fullImageReadByReviewer']and receipt['fullXmlReadByReviewer']);self.assertEqual(receipt['assetSha256'],sha((CANDIDATE/'editorial/assets'/m.ASSET_NAME).read_bytes()));render=json.loads((home/f'{m.BATCH}-render.json').read_bytes());self.assertEqual(render['textClipping'],[]);self.assertEqual((render['box']['width'],render['box']['height']),(640,2120));self.assertTrue(m.asset_geometry(CANDIDATE/'editorial/assets'))
  self.assertEqual(500-140,360);self.assertEqual(135+216+54,405);self.assertEqual(Fraction(405,90),Fraction(54,12));self.assertEqual(Fraction(200,4),Fraction(250,5));self.assertEqual(Fraction(90,sp.Rational(3,10)),Fraction(30,sp.Rational(1,10)));self.assertEqual(Fraction(200*90-250*30,50*300),Fraction(7,10))
 def test_unit_aliases_cannot_create_second_true_choice(self):
  for n,first,second in[(2,'1/2 kg','500 g'),(9,'+7/10 C','700 mC'),(13,'4 mL/s','4 cm³/s')]:
   self.assertEqual(m.alternative_identity(first,n),m.alternative_identity(second,n));p,b=deepcopy(self.p),deepcopy(self.b);i=n-1;p['records'][i]['answer']={'type':'choice','value':first,'options':[first,second,'11'+m.OPTION_SUFFIX[n],'12'+m.OPTION_SUFFIX[n],'13'+m.OPTION_SUFFIX[n]]};b[i]['candidateSha256']=digest(p['records'][i]);result=rebound(m,p,b,CANDIDATE/'editorial/assets',p['records'][i]['id']);self.assertFalse(result['ok']);self.assertIn('Equivalent exact numeric choices require editorial review',result['errors'])
 def test_human_modes_dependencies_and_individual_source_path(self):
  rows=m.report(self.p,self.b,CANDIDATE/'editorial/assets')['records']
  for field,value in [('verificationMode','AI_SCIENTIFIC_PASS'),('candidateSha256','0'*64),('humanApproval','PASS'),('publication','PUBLISHED')]:
   changed=deepcopy(rows);changed[0][field]=value
   with self.assertRaises(ValueError):assert_record_identity(changed,m.EXPECTED_IDS,self.p,self.b)
  for name in('EXACT_LITERAL_DEPENDENCY_SHA256','INDEPENDENT_MODELS_IMPLEMENTATION_SHA256'):
   with patch.object(m,name,'0'*64):self.assertTrue(all(not r['ok']for r in m.verify(self.p,self.b,CANDIDATE/'editorial/assets')))
  p,b=deepcopy(self.p),deepcopy(self.b);i=12;b[i]['provenance']['sourcePath']=m.SOURCE_PATHS['C6-Q001'];b[i]['provenanceSha256']=digest(b[i]['provenance']);result=rebound(m,p,b,CANDIDATE/'editorial/assets','C6-AQ01');self.assertFalse(result['ok']);self.assertTrue(any('source provenance'in e for e in result['errors']))
 @BOUNDED
 @given(d=st.integers(1,1000),speed=st.integers(1,1000))
 def test_direct_transit_and_pressure_inverse(self,d,speed):
  COUNTS['transit_pressure']=COUNTS.get('transit_pressure',0)+1;self.assertEqual(m.flight_time(d,speed)*speed,d);mass=m.pressure_mass(d,speed,10);self.assertEqual(mass*10/speed,d)
 @BOUNDED
 @given(a=st.integers(1,1000),b=st.integers(0,1000),c=st.integers(0,1000))
 def test_storage_and_energy_conservation(self,a,b,c):
  COUNTS['storage_energy']=COUNTS.get('storage_energy',0)+1;self.assertEqual(m.outgoing_flow(a+b+c,b,c),a);self.assertEqual(m.remaining_energy(a+b,b),a);self.assertEqual(m.fixed_voltage_power(a,b+1,c+1)*(c+1),a*(b+1))
 @BOUNDED
 @given(hot=st.integers(1,1000),cold=st.integers(0,1000),p=st.integers(0,100))
 def test_cycle_fractions(self,hot,cold,p):
  COUNTS['cycle']=COUNTS.get('cycle',0)+1;self.assertEqual(m.converted_cycle(hot+cold,cold,sp.Rational(p,100)),hot*sp.Rational(p,100));self.assertLessEqual(m.converted_cycle(hot+cold,cold,sp.Rational(p,100)),hot)
 @BOUNDED
 @given(r=st.integers(1,100),fraction=st.integers(1,100))
 def test_poiseuille_and_inverse_square_separately(self,r,fraction):
  COUNTS['scalings']=COUNTS.get('scalings',0)+1;self.assertEqual(m.pressure_radius_ratio(r)*r**4,1);self.assertEqual(m.count_reduction(sp.Rational(fraction,100),r)*sp.Rational(fraction,100),r**2)
 @BOUNDED
 @given(i=st.integers(-1000,1000),j=st.integers(-1000,1000),t=st.integers(1,100))
 def test_signed_area_and_density_inverse(self,i,j,t):
  COUNTS['signed_density']=COUNTS.get('signed_density',0)+1;self.assertEqual(m.signed_charge(i,t,j,t),(i+j)*t);self.assertEqual(m.hydrostatic_density(t*10*(abs(i)+1),10,t),abs(i)+1)
 @BOUNDED
 @given(power=st.integers(1,1000),fraction=st.integers(0,100),time=st.integers(1,100))
 def test_received_and_heating_power_balance(self,power,fraction,time):
  COUNTS['radiation_heating']=COUNTS.get('radiation_heating',0)+1;self.assertEqual(m.received_energy(power,sp.Rational(1,2),sp.Rational(fraction,100),time),sp.Rational(power*fraction*time,200));volume=m.heating_volume(power,4000,sp.Rational(1,2),1000);self.assertEqual(volume*1000*4000*sp.Rational(1,2),power)
if __name__=='__main__':unittest.main()
