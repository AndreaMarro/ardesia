"""Independent phase, Planck, harmonic energy flux and radiative balance controls."""
import ast
from copy import deepcopy
from fractions import Fraction
import importlib,json,os
from pathlib import Path
import unittest
from unittest.mock import patch
from hypothesis import given,settings,strategies as st
import sympy as sp
from tools.corpus_engineering.pipeline import digest,sha,git_bytes
from tools.corpus_engineering.batches import assert_record_identity
APP=Path(__file__).resolve().parents[2]
CANDIDATE=Path(os.environ.get('CRIC_REVIEW_CANDIDATE_APP',str(APP)))
POS=st.builds(Fraction,st.integers(1,30),st.integers(1,12))
BOUNDED=settings(max_examples=40,derandomize=True,deadline=None)
COUNTS={}
NAMES=('wavelength_in_medium','photon_packet_frequency','photon_rate_power','em_wave_field_power','absorbed_radiant_power')
class RadiationIndependent(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  COUNTS.clear();cls.rows=[]
  for name in NAMES:
   m=importlib.import_module('tools.corpus_engineering.'+name+'_verifier');p=json.loads((CANDIDATE/'editorial/batches'/(m.BATCH+'.json')).read_bytes());b=json.loads((CANDIDATE/'editorial/batches'/(m.BATCH+'-bindings.json')).read_bytes());cls.rows.append((m,p,b))
 @classmethod
 def tearDownClass(cls):
  print('INDEPENDENT_CONFIGURATIONS '+json.dumps({'hypothesis':COUNTS,'finiteExactGuardAssertions':getattr(cls,'guard_count',0),'invalidCalibrationAssertions':30},sort_keys=True),flush=True)
 def test_fresh_saved_identity_modes_primary_and_exact_dependency(self):
  primary=APP/'editorial/reviews/u7-radiation-240-244-primary-source-only.md';modes={'EXACT_ORACLE':0,'AI_CONCEPTUAL':0}
  for m,p,b in self.rows:
   fresh=m.report(p,b,CANDIDATE/'editorial/assets');saved=json.loads((APP/'editorial/reviews'/(m.BATCH+'.json')).read_bytes());self.assertEqual(fresh,saved);dep=sha(Path(m.exact_numbers.__file__).read_bytes());self.assertEqual(dep,m.EXACT_LITERAL_DEPENDENCY_SHA256)
   for result in (fresh,saved):
    assert_record_identity(result['records'],m.EXPECTED_IDS,p,b);self.assertEqual(len(result['records']),16);self.assertTrue(all(x['ok'] for x in result['records']))
    self.assertEqual(result['verifierSha256'],sha(Path(m.__file__).read_bytes()));self.assertEqual(result['contractSha256'],sha(Path(m.__file__).with_name('review_contract.py').read_bytes()));self.assertEqual(result['primaryBeforeCandidateKeys']['sha256'],sha(primary.read_bytes()));self.assertEqual(result['packageSha256'],m.REVIEWED_PACKAGE_SHA256);self.assertEqual(result['bindingsSha256'],m.REVIEWED_BINDINGS_SHA256);self.assertEqual(result['humanApproval'],'NOT_RUN');self.assertEqual(result['publication'],'DRAFT')
    for r in result['records']:
     self.assertIn(r['verificationMode'],modes);self.assertEqual(r['reviewDependencySha256'],{'exact_arithmetic_literals.py':dep})
   for r in fresh['records']:modes[r['verificationMode']]+=1
  self.assertEqual(modes,{'EXACT_ORACLE':54,'AI_CONCEPTUAL':26})
 def test_actual_catalog_mapping_phase_fields_and_photons(self):
  raw=git_bytes(APP.parent,'5d1dc8dc7b601aef959d10d564c75462be74708d','officina-di-fisica/content/C5.json');self.assertEqual(sha(raw),'dac4490e6a900f5da191bf7a1f5b8463ddc57c8bbaa36cb7a4a375c70fa77422');catalog={x['id']:x for x in json.loads(raw)}
  self.assertEqual(catalog['C5-L06']['title'],'Un’onda di campi attraverso lo spazio');self.assertEqual(catalog['C5-L07']['title'],'Quanti di energia e frazione trasmessa');self.assertEqual(catalog['C5-L07']['prerequisites'],['C5-L06'])
  for (m,p,b),skill in zip(self.rows,('C5-L06','C5-L07','C5-L07','C5-L06','C5-L07')):
   self.assertEqual(m.LESSON_REFERENCE['sourceSha256'],sha(raw));self.assertEqual(m.LESSON_REFERENCE['primarySkill'],skill)
   for row in p['records']:
    self.assertEqual(row['skill'],skill);self.assertEqual(row['error']['target'],skill)
    for pre in row['prerequisites']:
     if pre.startswith('C5-'):self.assertIn(pre,catalog)
 def test_hostile_rebinding_retokenized_math_units_geometry_and_labels(self):
  for m,p,b in self.rows:
   before=(digest(p),digest(b),dict(m.REVIEWED_CANDIDATES),m.REVIEWED_PACKAGE_SHA256,m.REVIEWED_BINDINGS_SHA256);audit=m.mutation_audit(p,b,CANDIDATE/'editorial/assets');self.assertEqual(audit,json.loads((APP/'editorial/reviews'/(m.BATCH+'-independent-mutations.json')).read_bytes()));self.assertEqual(audit['caseCount'],29);self.assertTrue(audit['allRejected'])
   self.assertEqual(sum(x['case']=='wrong_key_rebound_and_all_edition_tokens_replaced' for x in audit['cases']),16)
   for name in ('decimal_lexeme_below_float_ulp_rebound_and_retokenized','numeric_JSON_binary_float_rebound_and_retokenized','wrong_SVG_quantity_label_all_hashes_bindings_and_tokens_replaced'):self.assertEqual(sum(x['case']==name for x in audit['cases']),1)
   self.assertEqual(before,(digest(p),digest(b),dict(m.REVIEWED_CANDIDATES),m.REVIEWED_PACKAGE_SHA256,m.REVIEWED_BINDINGS_SHA256))

 def test_identity_rejects_invalid_claims_and_dependency_drift(self):
     for m, p, b in self.rows:
         original = m.report(p, b, CANDIDATE / 'editorial/assets')['records']
         for field, value in [('verificationMode', 'AI_SCIENTIFIC_PASS'), ('candidateSha256', '0' * 64), ('sourceSha256', '0' * 64), ('humanApproval', 'PASS'), ('publication', 'PUBLISHED')]:
             bad = deepcopy(original)
             bad[0][field] = value
             with self.assertRaises(ValueError):
                 assert_record_identity(bad, m.EXPECTED_IDS, p, b)
         with patch.object(m, 'EXACT_LITERAL_DEPENDENCY_SHA256', '0' * 64):
             rows = m.verify(p, b, CANDIDATE / 'editorial/assets')
             self.assertTrue(all((not r['ok'] and 'Independent exact literal dependency edition mismatch' in r['errors'] for r in rows)))

 def test_literal_lexemes_do_not_roundtrip_through_binary_float(self):
     for m, _, _ in self.rows:
         self.assertNotEqual(m.parse_literal('2.0000000000000000001'), 2)
         self.assertEqual(m.parse_literal('0.25'), sp.Rational(1, 4))
         self.assertEqual(m.parse_literal('−4/5'), -sp.Rational(4, 5))
         self.assertEqual(m.parse_literal('(1+√3)'), 1 + sp.sqrt(3))
         for bad in ('nan', 'inf', '1/0', '__import__("os")', '2**100000', '1e400', '√10001', '0x10'):
             with self.assertRaises(ValueError):
                 m.parse_literal(bad)

 def test_all_eighty_source_hashes_and_no_authoring_imports(self):
     for m, p, b in self.rows:
         source = m.source_records()
         for z in b:
             self.assertEqual(digest(source[z['sourceId']]), z['sourceSha256'])
         imports = []
         for node in ast.walk(ast.parse(Path(m.__file__).read_text())):
             if isinstance(node, ast.Import):
                 imports.extend((x.name for x in node.names))
             if isinstance(node, ast.ImportFrom):
                 imports.append(node.module or '')
         self.assertFalse(any(('authoring' in x for x in imports)))

 def test_calibration_guards_are_explicit_and_reject_invalid_decoding(self):
     for m, _, _ in self.rows:
         for args in [(0, 2, 3, 6, 3, 5, 7), (1, 1, 3, 6, 3, 5, 7), (1, 2, 0, 6, 3, 5, 7), (1, 2, 3, 6, 5, 3, 7), (1, 2, 3, 0, 3, 5, 7), (1, 2, 3, 6, 3, 5, 0)]:
             with self.assertRaises(ValueError):
                 m.calibrate(*args, 'dimensionless')
         fn = next((n for n in ast.parse(Path(m.__file__).read_text()).body if isinstance(n, ast.FunctionDef) and n.name == 'calibrate'))
         self.assertFalse(any((isinstance(n, ast.Assert) for n in ast.walk(fn))))

 @BOUNDED
 @given(first=POS,gap=POS,gain=POS,offset=st.integers(-20,20))
 def test_calibration_algebraic_refs_positive_gain_and_SI(self,first,gap,gain,offset):
  COUNTS['calibration']=COUNTS.get('calibration',0)+1;first=sp.Rational(first)*sp.sqrt(2);second=first+sp.Rational(gap);third=second+sp.Rational(gap)
  for (m,_,_),unit in zip(self.rows,('nanometer','dimensionless','dimensionless','watt','watt')):
   actual=m.calibrate(first,second,gain*first,gain*third,gain*first+offset,gain*second+offset,gain*third+offset,unit)
   for x,y in zip(actual,(gain,offset,third,third)):self.assertEqual(sp.simplify(x-y),0)
 @BOUNDED
 @given(wavelength=POS,index_gap=POS,new_gap=POS,k1=POS)
 def test_stationary_interface_domain_inverses_and_scale_freedom(self,wavelength,index_gap,new_gap,k1):
  COUNTS['wavelength']=COUNTS.get('wavelength',0)+1;m=self.rows[0][0];index=1+index_gap;new_index=1+new_gap;out=m.result(wavelength,index)
  self.assertEqual(out,wavelength/index);self.assertTrue(0<out<=wavelength);self.assertEqual(m.inverse_first(out,index),wavelength);self.assertEqual(m.inverse_second(out,wavelength),index);self.assertEqual(m.scaled(wavelength,index,k1,new_index/index),k1*index/new_index)
  self.assertEqual(m.result(m.constrained_vacuum_wavelength(index),index),300)
 @BOUNDED
 @given(count=st.integers(1,30),new_count=st.integers(1,30),frequency=POS,k2=POS)
 def test_photon_energy_integer_counts_two_inverses_scaling_and_constraint(self,count,new_count,frequency,k2):
  COUNTS['packet']=COUNTS.get('packet',0)+1;m=self.rows[1][0];out=m.result(count,frequency)
  self.assertEqual(out,sp.Rational(33,5)*count*frequency);self.assertEqual(m.inverse_first(out,frequency),count);self.assertEqual(m.inverse_second(out,count),frequency);self.assertEqual(m.scaled(count,frequency,Fraction(new_count,count),k2),Fraction(new_count,count)*k2)
  u=sp.Rational(count,5);self.assertEqual(m.constrained_frequency(33*u*u),u);self.assertEqual(m.result(count,u),33*u*u)
 @BOUNDED
 @given(power=POS,frequency=POS,k1=POS,k2=POS)
 def test_photon_rate_continuous_positive_two_inverses_and_redundancy(self,power,frequency,k1,k2):
  COUNTS['rate']=COUNTS.get('rate',0)+1;m=self.rows[2][0];out=m.result(power,frequency)
  self.assertEqual(out,sp.Rational(50,33)*power/frequency);self.assertEqual(m.inverse_first(out,frequency),power);self.assertEqual(m.inverse_second(out,power),frequency);self.assertEqual(m.scaled(power,frequency,k1,k2),k1/k2)
  self.assertEqual(m.result(m.constrained_power(frequency),frequency),50)
 @BOUNDED
 @given(field=POS,area=POS,k1=POS,k2=POS)
 def test_peak_field_harmonic_average_area_inverses_and_cubic_constraint(self,field,area,k1,k2):
  COUNTS['field']=COUNTS.get('field',0)+1;m=self.rows[3][0];out=m.result(field,area)
  self.assertEqual(out,sp.Rational(field)**2*area/7500000);self.assertEqual(m.inverse_first(out,area),field);self.assertEqual(m.inverse_second(out,field),area);self.assertEqual(m.scaled(field,area,k1,k2),k1*k1*k2)
  linked=m.result(sp.Rational(3,2)*area,area);self.assertEqual(m.constrained_area(linked),area)
 @BOUNDED
 @given(incident=POS,num=POS,gap=POS,new_num=POS,new_gap=POS,k1=POS)
 def test_absorbed_complement_domain_inverse_scaling_and_both_branches(self,incident,num,gap,new_num,new_gap,k1):
  COUNTS['absorption']=COUNTS.get('absorption',0)+1;m=self.rows[4][0];tau=num/(num+gap);new_tau=new_num/(new_num+new_gap);out=m.result(incident,tau)
  self.assertTrue(0<out<incident);self.assertEqual(out,incident*(1-tau));self.assertEqual(m.inverse_first(out,tau),incident);self.assertEqual(m.inverse_second(out,incident),tau);self.assertEqual(m.scaled(incident,tau,k1,new_tau/tau),k1*(1-new_tau)/(1-tau))
  roots=m.constrained_transmittances(16*tau*(1-tau));self.assertTrue(any(sp.simplify(x-tau)==0 for x in roots));self.assertTrue(all(0<x<1 and sp.simplify(m.result(16*x,x)-16*tau*(1-tau))==0 for x in roots))
 def test_specific_physical_boundaries_discrete_vs_continuous(self):
  w,p,r,e,a=(x[0] for x in self.rows)
  invalid=[(w.result,(600,Fraction(1,2))),(w.inverse_second,(600,300)),(w.scaled,(600,2,1,Fraction(1,4))),(p.result,(Fraction(3,2),1)),(p.inverse_first,(1,1)),(p.scaled,(5,1,Fraction(3,10),1)),(p.constrained_frequency,(66,)),(a.result,(8,0)),(a.result,(8,1)),(a.inverse_second,(8,4)),(a.inverse_second,(4,4)),(a.scaled,(8,Fraction(1,2),1,2)),(a.constrained_transmittances,(5,))]
  for fn,args in invalid:
   with self.assertRaises(ValueError):fn(*args)
  self.assertEqual(w.result(600,1),600);self.assertEqual(p.scaled(5,1,Fraction(1,5),2),sp.Rational(2,5));self.assertEqual(r.result(1,3),sp.Rational(50,99));self.assertEqual(a.constrained_transmittances(3),(sp.Rational(1,4),sp.Rational(3,4)));self.assertEqual(a.constrained_transmittances(4),(sp.Rational(1,2),))
 def test_known_speed_spellings_and_scaled_physical_units_are_equivalent(self):
  w,p,r,e,a=(x[0] for x in self.rows)
  self.assertEqual(w.parse_option(4,'2 × 10⁸ m/s'),200000000);self.assertEqual(w.alternative_identity('2 × 10⁸ m/s'),w.alternative_identity('200000000 m/s'))
  self.assertEqual(w.alternative_identity('600 nm'),w.alternative_identity('3/5000000 m'))
  self.assertIsNone(p.alternative_identity('33/100000000000000000000 J'));self.assertEqual(p.alternative_identity('33q_E'),p.alternative_identity('33/(1000000000*1000000000*100) J'));self.assertEqual(p.alternative_identity('33q_E'),p.alternative_identity('0.00000000000000000033 J'));self.assertEqual(r.alternative_identity('50q_R'),r.alternative_identity('50000000 s⁻¹'));self.assertEqual(e.alternative_identity('100 cm²'),e.alternative_identity('1/100 m²'))
 def test_noncommuting_means_and_formal_noninteger_packet_mean(self):
  w,p,r,e,a=(x[0] for x in self.rows)
  self.assertEqual((w.result(600,2)+w.result(800,sp.Rational(3,2)))/2-w.result(700,sp.Rational(7,4)),sp.Rational(50,3))
  with self.assertRaises(ValueError):p.result(sp.Rational(15,2),sp.Rational(3,2))
  self.assertEqual((p.result(5,1)+p.result(10,2))/2,sp.Rational(165,2));self.assertEqual((r.result(33,1)+r.result(1,2))/2-r.result(17,sp.Rational(3,2)),sp.Rational(1625,198));self.assertEqual((e.result(150,100)+e.result(300,200))/2-e.result(225,150),sp.Rational(27,80));self.assertEqual((a.result(8,sp.Rational(1,2))+a.result(12,sp.Rational(1,4)))/2-a.result(10,sp.Rational(3,8)),sp.Rational(1,4))
 def test_prekey_model_AST_and_actual_native_terminal_receipts(self):
  path=APP/'editorial/reviews/u7-radiation-240-244-independent-models.py';self.assertEqual(sha(path.read_bytes()),'b23231ee65202142c7f6d46957df443d426c54ad7c9dac9b6de9fd21b1ea9a94');tree=ast.parse(path.read_text());models={ast.literal_eval(n.targets[0].slice):ast.literal_eval(n.value) for n in tree.body if isinstance(n,ast.Assign) and len(n.targets)==1 and isinstance(n.targets[0],ast.Subscript) and isinstance(n.targets[0].value,ast.Name) and n.targets[0].value.id=='MODELS'}
  for m,p,b in self.rows:
   self.assertEqual(m.INDEPENDENT_MODELS_IMPLEMENTATION_SHA256,sha(path.read_bytes()));actual={n.name:n for n in ast.parse(Path(m.__file__).read_text()).body if isinstance(n,ast.FunctionDef)}
   for fn in ast.parse(models[m.FAMILY]).body:
    if isinstance(fn,ast.FunctionDef):self.assertEqual(ast.dump(fn,include_attributes=False),ast.dump(actual[fn.name],include_attributes=False))
   receipt=json.loads((APP/'editorial/reviews/u7-radiation-240-244-svg-independent-evidence'/(m.FAMILY+'-terminal.json')).read_bytes());self.assertEqual(receipt['exitCode'],0);self.assertIsNone(receipt['signal']);self.assertTrue(receipt['fullImageReadByReviewer']);self.assertEqual(receipt['assetSha256'],sha((CANDIDATE/'editorial/assets'/m.ASSET_NAME).read_bytes()))
 def test_all_public_math_helpers_reject_nonfinite_nonreal_float_zero_negative(self):
  seeds=[((600,2),(300,2),(300,600),(600,2,2,1),('constrained_vacuum_wavelength',(2,))),((5,1),(33,1),(33,5),(5,1,2,2),('constrained_frequency',(33,))),((33,1),(50,1),(50,33),(33,1,2,2),('constrained_power',(1,))),((150,100),(sp.Rational(3,10),100),(sp.Rational(3,10),150),(150,100,2,2),('constrained_area',(sp.Rational(3,10),))),((8,sp.Rational(1,2)),(4,sp.Rational(1,2)),(4,8),(8,sp.Rational(1,2),1,1),('constrained_transmittances',(4,)))]
  forbidden=[sp.oo,-sp.oo,sp.zoo,sp.I,sp.nan,0.1,sp.Float('0.1'),sp.Add(sp.sqrt(2),sp.Float('0.1'),evaluate=False),1+sp.I,float('inf'),float('nan'),sp.Symbol('unknown',positive=True),True];count=0
  for (m,_,_),seed in zip(self.rows,seeds):
   cases=[(m.result,seed[0]),(m.inverse_first,seed[1]),(m.inverse_second,seed[2]),(m.scaled,seed[3]),(getattr(m,seed[4][0]),seed[4][1]),(m.equivalent_literal,(Fraction(1,2),)),(m.calibrate,(1,2,3,6,3,5,7,'dimensionless'))]
   for fn,args in cases:
    fn(*args) # guard assertions cannot pass merely because the baseline is outside domain
    for index in range(len(args)-1 if fn.__name__=='calibrate' else len(args)):
     for bad in forbidden:
      changed=list(args);changed[index]=bad
      with self.subTest(family=m.FAMILY,helper=fn.__name__,position=index,value=repr(bad)):
       with self.assertRaises(ValueError):fn(*changed)
      count+=1
     if fn.__name__ not in ('calibrate','equivalent_literal'):
      for bad in (0,-1):
       changed=list(args);changed[index]=bad
       with self.assertRaises(ValueError):fn(*changed)
       count+=1
  type(self).guard_count=count
 def test_wrong_constitutive_and_inverse_models_not_just_frozen_keys(self):
  badlaws=[lambda x,y:sp.sympify(x)*y,lambda n,f:sp.Rational(33,5)*f,lambda p,f:sp.Rational(50,33)*p*f,lambda e,a:sp.sympify(e)*e*a/3750000,lambda p,t:sp.sympify(p)*t]
  badinverse=[lambda x,n:sp.sympify(x)/n,lambda e,u:sp.sympify(e)*u,lambda r,u:sp.sympify(r)/u,lambda p,a:sp.sympify(p)*a,lambda p,t:sp.sympify(p)*(1-t)]
  for (m,p,b),law,inverse in zip(self.rows,badlaws,badinverse):
   for name,wrong in (('result',law),('inverse_first',inverse)):
    m.oracle.cache_clear()
    try:
     with patch.object(m,name,wrong):
      try:rows=m.verify(p,b,CANDIDATE/'editorial/assets')
      except AssertionError:pass
      else:self.assertTrue(any(not r['ok'] for r in rows))
    finally:m.oracle.cache_clear()
   self.assertTrue(all(x['ok'] for x in m.verify(p,b,CANDIDATE/'editorial/assets')))
if __name__=='__main__':unittest.main()
