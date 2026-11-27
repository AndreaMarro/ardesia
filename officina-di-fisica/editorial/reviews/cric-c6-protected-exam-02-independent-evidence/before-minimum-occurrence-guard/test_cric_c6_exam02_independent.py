"""Independent C6 protected exam02 source model, identity and physical adversaries."""
import ast,json,os,unittest
from copy import deepcopy
from fractions import Fraction
from pathlib import Path
from unittest.mock import patch
import sympy as sp
from hypothesis import given,settings,strategies as st
from tools.corpus_engineering import cric_c6_protected_exam_02_verifier as m
from tools.corpus_engineering.pipeline import digest,sha,git_bytes
from tools.corpus_engineering.batches import assert_record_identity
from tools.corpus_engineering.cric_c6_exam02_independent_adversaries import audit,rebound
APP=Path(__file__).resolve().parents[2];CANDIDATE=Path(os.environ.get('CRIC_REVIEW_CANDIDATE_APP',str(APP)))
BOUNDED=settings(max_examples=40,derandomize=True,deadline=None);COUNTS={}
LAWS=[('density_pair',[1,1,1,1]),('equal_resistance_diameter_ratio',[1]),('final_pressure',[1,1,1,1]),('fall_distance',[1,1,1]),('hydraulic_increment',[1,1,1]),('lift_ratios',[1,1]),('focal_from_equal_magnitude',[1]),('last_cycle_heat',[1,1,1]),('intercepted_ratio',[1,1]),('branch_mean_speed',[3,1,1,1]),('resistive_duration',[1,1,1]),('recoil_velocity',[1,1,1]),('return_entropy',[1,1,1,1])]
class IndependentExam02Review(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.p=json.loads((CANDIDATE/f'editorial/batches/{m.BATCH}.json').read_bytes());cls.b=json.loads((CANDIDATE/f'editorial/batches/{m.BATCH}-bindings.json').read_bytes());COUNTS.clear()
 @classmethod
 def tearDownClass(cls):print('ACTUAL_C6_EXAM02_PROPERTY_CONFIGURATIONS '+json.dumps(COUNTS,sort_keys=True),flush=True)
 def test_all31_fresh_saved_identity_distinct_modes_and_protected_context(self):
  fresh=m.report(self.p,self.b,CANDIDATE/'editorial/assets');saved=json.loads((APP/f'editorial/reviews/{m.BATCH}.json').read_bytes());self.assertEqual(fresh,saved)
  for report in(fresh,saved):
   assert_record_identity(report['records'],m.EXPECTED_IDS,self.p,self.b);self.assertEqual(len(report['records']),31);self.assertTrue(all(r['ok']for r in report['records']));self.assertEqual(sum(r['verificationMode']=='EXACT_ORACLE'for r in report['records']),13);self.assertEqual(sum(r['verificationMode']=='AI_CONCEPTUAL'for r in report['records']),18);self.assertEqual(report['verifierSha256'],sha(Path(m.__file__).read_bytes()));self.assertEqual(report['humanApproval'],'NOT_RUN');self.assertEqual(report['publication'],'DRAFT');self.assertIn('default-deny',report['protectedExam'])
 def test_31_original_hashes_all_context_27_actual_lessons_and_final_bytes(self):
  old=m.source_records();self.assertEqual(len(old),31)
  catalog={}
  for path,want in m.LESSON_SOURCE_SHA256.items():
   raw=git_bytes(APP.parent,m.SOURCE_REF,path);self.assertEqual(sha(raw),want);catalog.update({r['id']:r for r in json.loads(raw)if r.get('kind')=='lesson'})
  self.assertEqual(len({r['id']for r in m.LESSON_REFERENCES.values()}),27)
  for row,link in zip(self.p['records'],self.b):
   source=old[row['id']];self.assertEqual(link['sourceSha256'],digest(source));self.assertEqual((row['baseVersion'],row['version']),(source['version'],source['version']+1));self.assertEqual(row['exam'],2)
   for field in('id','kind','course','section','order','skill','prerequisites','family','difficulty','exam'):self.assertEqual(row.get(field),source.get(field))
   lesson=m.LESSON_REFERENCES[row['id']];self.assertEqual(lesson['sha256'],digest(catalog[row['skill']]));self.assertEqual(lesson['title'],catalog[row['skill']]['title'])
  for suffix in('.json','-bindings.json'):self.assertEqual((CANDIDATE/f'editorial/batches/{m.BATCH}{suffix}').read_bytes(),git_bytes(APP.parent,m.CANDIDATE_REF,'officina-di-fisica/editorial/batches/'+m.BATCH+suffix))
 def test_source_only_model_functions_all_AST_unchanged_and_git_recovery(self):
  raw=git_bytes(APP.parent,m.MODEL_REF,'officina-di-fisica/'+m.MODEL_PATH);self.assertEqual(raw,(APP/m.MODEL_PATH).read_bytes());self.assertEqual(sha(raw),m.INDEPENDENT_MODELS_IMPLEMENTATION_SHA256);self.assertEqual(sha((APP/m.PRIMARY_PATH).read_bytes()),m.PRIMARY_SHA256)
  actual={n.name:n for n in ast.parse(Path(m.__file__).read_text()).body if isinstance(n,ast.FunctionDef)}
  for node in ast.parse(raw).body:
   if isinstance(node,ast.FunctionDef):self.assertEqual(ast.dump(node,include_attributes=False),ast.dump(actual[node.name],include_attributes=False))
  home=APP/'editorial/reviews/cric-c6-protected-exam-02-partial-git-evidence';entry=json.loads((home/'git-inputs.json').read_bytes())['inputs'][0];self.assertEqual(entry['commit'],m.MODEL_REF);self.assertEqual(entry['sha256'],sha(raw));self.assertEqual((home/entry['snapshot']).read_bytes(),raw)
 def test_packet_keys_provenance_and_rebound_accessible_asset_mutations(self):
  before=digest(self.p),digest(self.b),dict(m.REVIEWED_CANDIDATES);fresh=audit(m,self.p,self.b,CANDIDATE/'editorial/assets');self.assertEqual(fresh,json.loads((APP/f'editorial/reviews/{m.BATCH}-independent-mutations.json').read_bytes()));self.assertTrue(fresh['allRejected']);self.assertGreaterEqual(fresh['caseCount'],49);self.assertEqual(before,(digest(self.p),digest(self.b),dict(m.REVIEWED_CANDIDATES)))
 def test_every124_false_alternatives_with_all_test_only_pins_renewed(self):
  count=0
  for i,row in enumerate(self.p['records']):
   for wrong in row['answer']['options']:
    if wrong==row['answer']['value']:continue
    p,b=deepcopy(self.p),deepcopy(self.b);p['records'][i]['answer']['value']=wrong;b[i]['candidateSha256']=digest(p['records'][i]);bad=rebound(m,p,b,CANDIDATE/'editorial/assets',row['id']);self.assertFalse(bad['ok']);self.assertTrue(any('exact 'in e or 'conceptual key'in e for e in bad['errors']));count+=1
  self.assertEqual(count,124)
 def test_exact_lexemes_and_every370_physical_input_boundary(self):
  self.assertEqual(m.parse_literal('0,15'),sp.Rational(3,20));self.assertNotEqual(m.parse_literal('0.150000000000000001'),sp.Rational(3,20))
  for text in('nan','inf','1/0','__import__("os")','2**100000','1e400','√10001'):
   with self.assertRaises(ValueError):m.parse_literal(text)
  invalid=(0.1,sp.Float('0.1'),True,sp.oo,-sp.oo,sp.I,sp.nan,None,[],{})
  for bad in invalid:
   for fn in(m._finite_exact,m._rational_exact,m.equivalent_literal):
    with self.assertRaises(ValueError):fn(bad)
  for number in(43,75,True,44.0,sp.oo,[],{}):
   with self.assertRaises(ValueError):m.parse_option(number,'1')
  count=0
  for name,args in LAWS:
   for i in range(len(args)):
    for bad in invalid:
     values=list(args);values[i]=bad
     with self.assertRaises(ValueError):getattr(m,name)(*values)
     count+=1
  self.assertEqual(count,370)
 def test_physical_domains_signed_work_and_heat_and_zero_storage_residual(self):
  for name,args in [('density_pair',[0,1,1,1]),('equal_resistance_diameter_ratio',[0]),('final_pressure',[1,1,0,1]),('fall_distance',[-1,1,1]),('hydraulic_increment',[1,0,1]),('lift_ratios',[1,0]),('focal_from_equal_magnitude',[0]),('intercepted_ratio',[1,0]),('branch_mean_speed',[1,2,0,1]),('resistive_duration',[1,0,1]),('recoil_velocity',[1,-1,0]),('return_entropy',[1,0,1,1])]:
   with self.assertRaises(ValueError):getattr(m,name)(*args)
  self.assertEqual(m.last_cycle_heat(-12,40,-15),-37);self.assertEqual(m.recoil_velocity(1,-2,1),2);self.assertEqual(m.return_entropy(-10,10,5,10),sp.Rational(1,2));self.assertEqual(m.branch_mean_speed(2,1,1,1),0)
 def test_all13_constitutive_faults_reject_the_correct_frozen_keys(self):
  for name,args in LAWS:
   fn=getattr(m,name)
   def wrong(*a,**kw):
    value=fn(*a,**kw)
    return sp.Tuple(value[0]+1,*value[1:])if isinstance(value,sp.Tuple)else value+1
   m.oracle.cache_clear()
   try:
    with patch.object(m,name,wrong):
     with self.assertRaises(AssertionError):m.verify(self.p,self.b,CANDIDATE/'editorial/assets')
   finally:m.oracle.cache_clear()
 def test_all13_source_numeric_or_pair_faults_reject_correct_keys(self):
  fn=m.predictions;keys=[k for k,v in fn().items()if not isinstance(v,str)];self.assertEqual(len(keys),13)
  for key in keys:
   def wrong():
    values=fn();value=values[key];values[key]=(value[0]+1,*value[1:])if isinstance(value,tuple)else value+1;return values
   m.oracle.cache_clear()
   try:
    with patch.object(m,'predictions',wrong):
     with self.assertRaises(AssertionError):m.verify(self.p,self.b,CANDIDATE/'editorial/assets')
   finally:m.oracle.cache_clear()
 def test_autonomous_domains_and_each_section_exam_after_full_rebinding(self):
  count=0
  for key,parts in m.REQUIRED_DOMAIN_FRAGMENTS.items():
   for fragment in parts:
    p,b=deepcopy(self.p),deepcopy(self.b);i=m.INDEX[key];p['records'][i]['prompt']=p['records'][i]['prompt'].replace(fragment,'[condizione rimossa]');b[i]['candidateSha256']=digest(p['records'][i]);bad=rebound(m,p,b,CANDIDATE/'editorial/assets',key);self.assertFalse(bad['ok']);self.assertTrue(any('physical domain'in e for e in bad['errors']));count+=1
  self.assertGreaterEqual(count,55)
  for i,row in enumerate(self.p['records']):
   for field,value in [('section','Renamed aggregate'),('exam',None)]:
    p,b=deepcopy(self.p),deepcopy(self.b);p['records'][i][field]=value;b[i]['candidateSha256']=digest(p['records'][i]);bad=rebound(m,p,b,CANDIDATE/'editorial/assets',row['id']);self.assertFalse(bad['ok']);self.assertIn('Individual Cric identity/context mismatch: '+field,bad['errors'])
 def test_authentic_full_image_and_independent_scale_ray_orientation_geometry(self):
  home=APP/f'editorial/reviews/{m.BATCH}-svg-independent-evidence';receipt=json.loads((home/f'{m.BATCH}-terminal.json').read_bytes());self.assertEqual((receipt['exitCode'],receipt['signal']),(0,None));self.assertTrue(receipt['fullImageReadByReviewer']and receipt['fullXmlReadByReviewer']);self.assertEqual(receipt['assetSha256'],sha((CANDIDATE/'editorial/assets'/m.ASSET_NAME).read_bytes()));render=json.loads((home/f'{m.BATCH}-render.json').read_bytes());self.assertEqual(render['textClipping'],[]);self.assertEqual((render['box']['width'],render['box']['height']),(640,2200));self.assertTrue(m.asset_geometry(CANDIDATE/'editorial/assets'))
  self.assertEqual(Fraction(400,16),25);self.assertEqual(Fraction(100,4),Fraction(200,8));self.assertEqual(320-160,480-320);self.assertEqual(320-240,400-320);self.assertEqual(Fraction(890-810,480-160),Fraction(850-810,320-160));self.assertEqual(810+Fraction((400-320)*(890-810),480-320),850)
  # Signed area after mapping the SVG y direction back to upward pressure is positive (counterclockwise).
  points=[(160,-1480),(500,-1480),(160,-1240)];area=sum(points[i][0]*points[(i+1)%3][1]-points[(i+1)%3][0]*points[i][1]for i in range(3));self.assertGreater(area,0)
 def test_dimensioned_aliases_and_paired_ratios_no_second_true_option(self):
  for number,first,second in[(45,'2','4/2'),(46,'90 kPa','90000 Pa'),(51,'1 e 4','2/2 e 8/2'),(59,'6 cm/s','0,06 m/s')]:
   self.assertEqual(m.alternative_identity(first,number),m.alternative_identity(second,number));p,b=deepcopy(self.p),deepcopy(self.b);i=number-44;p['records'][i]['answer']['options'][next(k for k,v in enumerate(p['records'][i]['answer']['options'])if v!=first)]=second;b[i]['candidateSha256']=digest(p['records'][i]);bad=rebound(m,p,b,CANDIDATE/'editorial/assets',p['records'][i]['id']);self.assertFalse(bad['ok']);self.assertIn('Equivalent exact numeric choices require editorial review',bad['errors'])
 def test_human_modes_exact_dependencies_and_format_guards(self):
  rows=m.report(self.p,self.b,CANDIDATE/'editorial/assets')['records']
  for field,value in [('verificationMode','AI_SCIENTIFIC_PASS'),('candidateSha256','0'*64),('humanApproval','PASS'),('publication','PUBLISHED')]:
   changed=deepcopy(rows);changed[0][field]=value
   with self.assertRaises(ValueError):assert_record_identity(changed,m.EXPECTED_IDS,self.p,self.b)
  for name in('EXACT_LITERAL_DEPENDENCY_SHA256','INDEPENDENT_MODELS_IMPLEMENTATION_SHA256'):
   with patch.object(m,name,'0'*64):self.assertTrue(all(not r['ok']for r in m.verify(self.p,self.b,CANDIDATE/'editorial/assets')))
 @BOUNDED
 @given(a=st.integers(1,1000),b=st.integers(1,1000),scale=st.integers(1,100))
 def test_density_equality_and_wire_area_square(self,a,b,scale):
  COUNTS['density_wire']=COUNTS.get('density_wire',0)+1;self.assertEqual(m.density_pair(a,b,a*scale,b*scale),sp.Tuple(sp.Rational(a,b),sp.Rational(a,b)));self.assertEqual(m.equal_resistance_diameter_ratio(scale**2),scale)
 @BOUNDED
 @given(p=st.integers(1,1000),v=st.integers(1,1000),t=st.integers(1,100))
 def test_gas_state_and_fall_distance(self,p,v,t):
  COUNTS['gas_fall']=COUNTS.get('gas_fall',0)+1;self.assertEqual(m.final_pressure(p,v,2*v,1),sp.Rational(p,2));self.assertEqual(m.fall_distance(v,10,t),v*t+5*t*t)
 @BOUNDED
 @given(force=st.integers(1,1000),area=st.integers(1,1000),factor=st.integers(1,100))
 def test_hydraulic_pressure_and_lift_inverse_duration(self,force,area,factor):
  COUNTS['hydraulic_lift']=COUNTS.get('hydraulic_lift',0)+1;self.assertEqual(m.hydraulic_increment(force,area,area*factor),force*factor);self.assertEqual(m.lift_ratios(area*factor,area),sp.Tuple(1,factor))
 @BOUNDED
 @given(focal=st.integers(1,1000),work=st.integers(-1000,1000),heat=st.integers(-1000,1000))
 def test_lens_equal_heights_and_signed_cycle_balance(self,focal,work,heat):
  COUNTS['lens_cycle']=COUNTS.get('lens_cycle',0)+1;self.assertEqual(m.focal_from_equal_magnitude(4*focal),focal);self.assertEqual(1/sp.Rational(2*focal)+1/sp.Rational(2*focal),1/sp.Rational(focal));self.assertEqual(m.last_cycle_heat(work,heat,-2*heat)+heat-2*heat,work)
 @BOUNDED
 @given(flow=st.integers(1,1000),area=st.integers(1,1000),factor=st.integers(1,100))
 def test_continuity_and_geometric_interception(self,flow,area,factor):
  COUNTS['flow_geometry']=COUNTS.get('flow_geometry',0)+1;self.assertEqual(m.branch_mean_speed(flow+3,1,2,area)*area,flow);self.assertEqual(m.intercepted_ratio(factor*factor,factor),1)
 @BOUNDED
 @given(energy=st.integers(1,1000),v=st.integers(1,100),mass=st.integers(1,100))
 def test_resistive_duration_momentum_and_state_entropy(self,energy,v,mass):
  COUNTS['energy_momentum_entropy']=COUNTS.get('energy_momentum_entropy',0)+1;self.assertEqual(m.resistive_duration(energy,v,mass)*sp.Rational(v*v,mass),energy);self.assertEqual(m.recoil_velocity(mass,v,2*mass),-sp.Rational(v,2));self.assertEqual(m.return_entropy(energy,energy,2*v,v),-3)
if __name__=='__main__':unittest.main()
