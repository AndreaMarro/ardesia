"""Independent C5 A50 oracle, recovered source-first model and hostile input tests."""
import ast,base64,importlib,json,os,tempfile,unittest
from copy import deepcopy
from fractions import Fraction
from pathlib import Path
from unittest.mock import patch
import sympy as sp
from hypothesis import given,settings,strategies as st
from tools.corpus_engineering.pipeline import digest,sha,git_bytes
from tools.corpus_engineering.batches import assert_record_identity
from tools.corpus_engineering import cric_c5_wave_physics as physics
from tools.corpus_engineering.cric_c5_independent_adversaries import audit,rebound
APP=Path(__file__).resolve().parents[2]
CANDIDATE=Path(os.environ.get('CRIC_REVIEW_CANDIDATE_APP',str(APP)))
MODULES=[importlib.import_module('tools.corpus_engineering.cric_c5_l%02d_verifier'%n)for n in range(1,6)]
BOUNDED=settings(max_examples=40,derandomize=True,deadline=None)
COUNTS={}
class IndependentC5Review(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.inputs={m.BATCH:(json.loads((CANDIDATE/f'editorial/batches/{m.BATCH}.json').read_bytes()),json.loads((CANDIDATE/f'editorial/batches/{m.BATCH}-bindings.json').read_bytes()))for m in MODULES};COUNTS.clear()
 @classmethod
 def tearDownClass(cls):print('ACTUAL_C5_PROPERTY_CONFIGURATIONS '+json.dumps(COUNTS,sort_keys=True),flush=True)
 def test_fifty_fresh_saved_identity_modes_and_current_dependencies(self):
  exact=0
  for m in MODULES:
   p,b=self.inputs[m.BATCH];fresh=m.report(p,b,CANDIDATE/'editorial/assets');saved=json.loads((APP/f'editorial/reviews/{m.BATCH}.json').read_bytes());self.assertEqual(fresh,saved)
   for report in(fresh,saved):
    assert_record_identity(report['records'],m.EXPECTED_IDS,p,b);self.assertEqual(len(report['records']),10);self.assertTrue(all(x['ok']for x in report['records']));self.assertEqual(report['verifierSha256'],sha(Path(m.__file__).read_bytes()));self.assertEqual(report['contractSha256'],sha(Path(m.__file__).with_name('review_contract.py').read_bytes()));self.assertEqual(report['publication'],'DRAFT');self.assertEqual(report['humanApproval'],'NOT_RUN')
   expected=sum(not isinstance(v,str)for v in m.oracle());exact+=expected;self.assertEqual(sum(r['verificationMode']=='EXACT_ORACLE'for r in fresh['records']),expected);self.assertEqual(sum(r['verificationMode']=='AI_CONCEPTUAL'for r in fresh['records']),10-expected)
   self.assertEqual(sha(Path(physics.__file__).read_bytes()),m.WAVE_PHYSICS_SHA256)
  self.assertEqual(exact,27)
 def test_all_original_hashes_context_base_versions_and_actual_lessons(self):
  for m in MODULES:
   p,b=self.inputs[m.BATCH];raw=git_bytes(APP.parent,m.SOURCE_REF,m.SOURCE_PATH);self.assertEqual(sha(raw),m.LESSON_REFERENCE['sourceSha256']);originals={q['id']:q for q in json.loads(raw)};lesson=originals[m.LESSON_REFERENCE['primarySkill']];self.assertEqual(lesson['title'],m.LESSON_REFERENCE['title']);self.assertEqual(lesson['prerequisites'],m.LESSON_REFERENCE['actualLessonPrerequisites'])
   for suffix in('.json','-bindings.json'):self.assertEqual((CANDIDATE/f'editorial/batches/{m.BATCH}{suffix}').read_bytes(),git_bytes(APP.parent,m.CANDIDATE_REF,'officina-di-fisica/editorial/batches/'+m.BATCH+suffix))
   for row,link in zip(p['records'],b):
    old=originals[row['id']];self.assertEqual(link['sourceSha256'],digest(old));self.assertEqual((row['baseVersion'],row['version']),(old['version'],old['version']+1))
    for field in('id','kind','course','order','skill','family','difficulty','prerequisites','exam'):self.assertEqual(row.get(field),old.get(field))
 def test_frozen_prompt_only_model_all_function_AST_and_git_recovery(self):
  for m in MODULES:
   raw=git_bytes(APP.parent,m.MODEL_REF,'officina-di-fisica/'+m.MODEL_PATH);self.assertEqual(raw,(APP/m.MODEL_PATH).read_bytes());self.assertEqual(sha(raw),m.INDEPENDENT_MODELS_IMPLEMENTATION_SHA256);self.assertEqual(sha((APP/m.PRIMARY_PATH).read_bytes()),m.PRIMARY_SHA256)
   actual={n.name:n for n in ast.parse(Path(m.__file__).read_text()).body if isinstance(n,ast.FunctionDef)}
   for node in ast.parse(raw).body:
    if isinstance(node,ast.FunctionDef):self.assertEqual(ast.dump(node,include_attributes=False),ast.dump(actual[node.name],include_attributes=False))
   home=APP/'editorial/reviews/cric-c5-001-050-independent-evidence';entry=json.loads((home/'git-inputs.json').read_bytes())['inputs'][0];self.assertEqual((entry['commit'],entry['path'],entry['sha256']),(m.MODEL_REF,'officina-di-fisica/'+m.MODEL_PATH,sha(raw)));self.assertEqual((home/entry['snapshot']).read_bytes(),raw)
 def test_all_wrong_keys_and_other_rebound_packet_mutations(self):
  total=0
  for m in MODULES:
   p,b=self.inputs[m.BATCH];before=digest(p),digest(b),dict(m.REVIEWED_CANDIDATES);fresh=audit(m,p,b,CANDIDATE/'editorial/assets');self.assertEqual(fresh,json.loads((APP/f'editorial/reviews/{m.BATCH}-independent-mutations.json').read_bytes()));self.assertEqual(fresh['caseCount'],30);self.assertTrue(fresh['allRejected']);self.assertEqual(before,(digest(p),digest(b),dict(m.REVIEWED_CANDIDATES)));total+=fresh['caseCount']
  self.assertEqual(total,150)
 def test_exact_lexemes_and_every_public_mathematical_input_boundary(self):
  for m in MODULES:
   self.assertEqual(m.parse_literal('0,15'),sp.Rational(3,20));self.assertNotEqual(m.parse_literal('0.150000000000000001'),sp.Rational(3,20))
   for bad in('nan','inf','1/0','__import__("os")','2**100000','1e400','√10001'):
    with self.assertRaises(ValueError):m.parse_literal(bad)
   for bad in(0.1,sp.Float('0.1'),True,sp.oo,-sp.oo,sp.I,sp.nan,None,[],{}):
    for fn in(m._finite_exact,m._rational_exact,m.equivalent_literal):
     with self.assertRaises(ValueError):fn(bad)
   for n in(0,True,1.0,sp.oo,[],{},m.OFFSET,m.OFFSET+11):
    with self.assertRaises(ValueError):m.parse_option(n,'1')
  functions=[(physics.exact,[1]),(physics.positive,[1]),(physics.wave_speed,[1,1]),(physics.wavelength,[1,1]),(physics.wavenumber,[1]),(physics.spatial_phase,[1,1]),(physics.harmonic_period_ratio,[1,1]),(physics.spherical_ratio,[1,1]),(physics.projected_power,[1,1,sp.Rational(1,2)]),(physics.duty_power,[1,1,2]),(physics.echo_speed,[1,1]),(physics.level_gain,[1])]
  count=0
  for fn,args in functions:
   for i in range(len(args)):
    for bad in(0.1,sp.Float('0.1'),True,sp.oo,-sp.oo,sp.I,sp.nan,None,[],{}):
     changed=list(args);changed[i]=bad
     with self.assertRaises(ValueError):fn(*changed)
     count+=1
  self.assertEqual(count,220)
  for fn,args in[(physics.wavelength,[1,0]),(physics.echo_speed,[1,0]),(physics.level_gain,[0]),(physics.harmonic_period_ratio,[1,0]),(physics.projected_power,[1,1,2]),(physics.projected_power,[1,1,-1]),(physics.duty_power,[1,3,2])]:
   with self.assertRaises(ValueError):fn(*args)
 def test_constitutive_faults_fail_even_with_correct_frozen_keys(self):
  m=MODULES[0]
  for name in('harmonic_period_ratio','spatial_phase','wavenumber','spherical_ratio','duty_power','projected_power','level_gain','echo_speed','wavelength'):
   fn=getattr(physics,name)
   def wrong(*a,**kw):return fn(*a,**kw)+1
   m.oracle.cache_clear()
   try:
    with patch.object(physics,name,wrong):
     with self.assertRaises(AssertionError):m.verify(*self.inputs[m.BATCH],CANDIDATE/'editorial/assets')
   finally:m.oracle.cache_clear()
 def test_source_model_faults_all_26_separately_detected(self):
  m=MODULES[0];fn=m.source_only_predictions;keys=list(fn())
  for key in keys:
   def altered():values=fn();values[key]+=1;return values
   m.oracle.cache_clear()
   try:
    with patch.object(m,'source_only_predictions',altered):
     with self.assertRaises(AssertionError):m.verify(*self.inputs[m.BATCH],CANDIDATE/'editorial/assets')
   finally:m.oracle.cache_clear()
  self.assertEqual(len(keys),26)
 def test_domain_backslides_rejected_after_all_edition_guards_renewed(self):
  count=0
  for m in MODULES:
   for key,parts in m.REQUIRED_DOMAIN_FRAGMENTS.items():
    for fragment in parts:
     p,b=map(deepcopy,self.inputs[m.BATCH]);i=next(i for i,r in enumerate(p['records'])if r['id']==key);self.assertIn(fragment,p['records'][i]['prompt']);p['records'][i]['prompt']=p['records'][i]['prompt'].replace(fragment,'[condizione rimossa]',1);b[i]['candidateSha256']=digest(p['records'][i]);bad=rebound(m,p,b,CANDIDATE/'editorial/assets',key);self.assertFalse(bad['ok']);self.assertTrue(any('physical domain'in e for e in bad['errors']));count+=1
  self.assertGreaterEqual(count,30)
 def test_five_authentic_full_images_accessibility_and_quantitative_geometry(self):
  for m in MODULES:
   home=APP/f'editorial/reviews/{m.BATCH}-svg-independent-evidence';receipt=json.loads((home/f'{m.BATCH}-terminal.json').read_bytes());self.assertEqual((receipt['exitCode'],receipt['signal']),(0,None));self.assertTrue(receipt['fullImageReadByReviewer']and receipt['fullXmlReadByReviewer']);self.assertEqual(receipt['assetSha256'],sha((CANDIDATE/'editorial/assets'/m.ASSET_NAME).read_bytes()));render=json.loads((home/f'{m.BATCH}-render.json').read_bytes());self.assertEqual(render['textClipping'],[]);self.assertEqual(render['box']['width'],640);self.assertTrue(m.asset_geometry(CANDIDATE/'editorial/assets'))
  self.assertEqual(Fraction(320-180,7),Fraction(460-320,7));self.assertEqual(Fraction(160,120),Fraction(8,6));self.assertEqual(Fraction(120,90),Fraction(6,Fraction(9,2)))
  self.assertEqual(330-150,510-330);self.assertEqual(Fraction(360,36),10);self.assertEqual(Fraction(360,240),Fraction(3,2));self.assertEqual(Fraction(120,80),Fraction(12,8));self.assertEqual(200-120,80);self.assertEqual(Fraction(320,80),4)
  self.assertEqual(Fraction(280,12),Fraction(140,6));self.assertEqual(Fraction(320,160),2);self.assertEqual(Fraction(150,300),Fraction(1,2));self.assertEqual(Fraction(476-180,148),2)
 def test_equivalent_dimensioned_choices_cannot_create_second_true_option(self):
  variants=[(1,2,'0,15 s','150 ms'),(2,19,'+0,60 m','60 cm'),(4,37,'0,80 W','800 mW'),(5,41,'0,10 μW/m²','0,0000001 W/m²')]
  for cohort,n,correct,equiv in variants:
   m=MODULES[cohort-1];p,b=map(deepcopy,self.inputs[m.BATCH]);i=n-m.OFFSET-1;self.assertEqual(m.alternative_identity(correct,n),m.alternative_identity(equiv,n));p['records'][i]['answer']={'type':'choice','value':correct,'options':[correct,equiv,'100'+m.OPTION_SUFFIX[n],'200'+m.OPTION_SUFFIX[n],'300'+m.OPTION_SUFFIX[n]]};b[i]['candidateSha256']=digest(p['records'][i]);bad=rebound(m,p,b,CANDIDATE/'editorial/assets',p['records'][i]['id']);self.assertFalse(bad['ok']);self.assertIn('Equivalent exact numeric choices require editorial review',bad['errors'])
 def test_independent_modes_human_gate_and_dependency_guards(self):
  for m in MODULES:
   p,b=self.inputs[m.BATCH];rows=m.report(p,b,CANDIDATE/'editorial/assets')['records']
   for field,value in [('verificationMode','AI_SCIENTIFIC_PASS'),('candidateSha256','0'*64),('humanApproval','PASS'),('publication','PUBLISHED')]:
    changed=deepcopy(rows);changed[0][field]=value
    with self.assertRaises(ValueError):assert_record_identity(changed,m.EXPECTED_IDS,p,b)
   for name in('EXACT_LITERAL_DEPENDENCY_SHA256','WAVE_PHYSICS_SHA256','INDEPENDENT_MODELS_IMPLEMENTATION_SHA256'):
    with patch.object(m,name,'0'*64):self.assertTrue(all(not r['ok']for r in m.verify(p,b,CANDIDATE/'editorial/assets')))
 @BOUNDED
 @given(f=st.integers(1,1000),length=st.integers(1,1000))
 def test_wave_speed_and_inverse(self,f,length):
  COUNTS['speed_inverse']=COUNTS.get('speed_inverse',0)+1;speed=physics.wave_speed(f,length);self.assertEqual(physics.wavelength(speed,f),length);self.assertEqual(speed/length,f)
 @BOUNDED
 @given(part=st.integers(-1000,1000),length=st.integers(1,1000))
 def test_phase_and_wavenumber(self,part,length):
  COUNTS['phase']=COUNTS.get('phase',0)+1;self.assertEqual(sp.simplify(physics.wavenumber(length)*length),2*sp.pi);self.assertEqual(physics.spatial_phase(part,length),abs(part)*2*sp.pi/length)
 @BOUNDED
 @given(p=st.integers(1,1000),radius=st.integers(1,1000))
 def test_spherical_power_and_inverse(self,p,radius):
  COUNTS['spherical']=COUNTS.get('spherical',0)+1;ratio=physics.spherical_ratio(p,radius);self.assertEqual(ratio*radius**2,p)
 @BOUNDED
 @given(power=st.integers(1,1000),active=st.integers(1,1000),rest=st.integers(0,1000))
 def test_duty_energy_balance(self,power,active,rest):
  COUNTS['duty']=COUNTS.get('duty',0)+1;total=active+rest;average=physics.duty_power(power,active,total);self.assertEqual(average*total,power*active);self.assertLessEqual(average,power)
 @BOUNDED
 @given(i=st.integers(1,1000),area=st.integers(1,1000),part=st.integers(0,1000))
 def test_projected_power_limits(self,i,area,part):
  COUNTS['projection']=COUNTS.get('projection',0)+1;cosine=sp.Rational(part,1000);power=physics.projected_power(i,area,cosine);self.assertEqual(power/(i*area),cosine);self.assertGreaterEqual(power,0);self.assertLessEqual(power,i*area)
 @BOUNDED
 @given(distance=st.integers(1,1000),time=st.integers(1,1000),exponent=st.integers(-12,12))
 def test_echo_inverse_and_exact_log_powers(self,distance,time,exponent):
  COUNTS['echo_log']=COUNTS.get('echo_log',0)+1;speed=physics.echo_speed(distance,time);self.assertEqual(speed*time/2,distance);self.assertEqual(physics.level_gain(sp.Integer(10)**exponent),10*exponent)
if __name__=='__main__':unittest.main()
