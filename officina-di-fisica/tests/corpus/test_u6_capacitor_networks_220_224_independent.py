"""Independent node charge, capacitor energy, exact domains and hostile rebinding."""
import ast
from copy import deepcopy
from fractions import Fraction
import importlib,json,os
from pathlib import Path
import unittest
from unittest.mock import patch
from hypothesis import given,settings,strategies as st
import sympy as sp
from tools.corpus_engineering.pipeline import digest,sha
from tools.corpus_engineering.batches import assert_record_identity
APP=Path(__file__).resolve().parents[2]
CANDIDATE=Path(os.environ.get('CRIC_REVIEW_CANDIDATE_APP',str(APP)))
POS=st.builds(Fraction,st.integers(1,30),st.integers(1,12))
BOUNDED=settings(max_examples=40,derandomize=True,deadline=None)
HYPOTHESIS_COUNTS={}
NAMES=('parallel_capacitors','series_capacitors','series_capacitor_voltage','capacitor_charge_sharing','capacitor_sharing_energy_loss')
class CapacitorNetworksIndependent(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  HYPOTHESIS_COUNTS.clear()
  cls.rows=[]
  for name in NAMES:
   m=importlib.import_module('tools.corpus_engineering.'+name+'_verifier')
   p=json.loads((CANDIDATE/'editorial/batches'/(m.BATCH+'.json')).read_bytes());b=json.loads((CANDIDATE/'editorial/batches'/(m.BATCH+'-bindings.json')).read_bytes());cls.rows.append((m,p,b))
 @classmethod
 def tearDownClass(cls):
  print('INDEPENDENT_CONFIGURATIONS '+json.dumps({'hypothesis':HYPOTHESIS_COUNTS,'finiteExactGuardAssertions':getattr(cls,'finite_guard_assertions',0),'invalidCalibrationAssertions':30},sort_keys=True),flush=True)
 def test_fresh_saved_identity_modes_primary_and_exact_dependency(self):
  primary=APP/'editorial/reviews/u6-capacitor-networks-220-224-primary-source-only.md'
  for m,p,b in self.rows:
   fresh=m.report(p,b,CANDIDATE/'editorial/assets');saved=json.loads((APP/'editorial/reviews'/(m.BATCH+'.json')).read_bytes());self.assertEqual(fresh,saved)
   dependency=sha(Path(m.exact_numbers.__file__).read_bytes());self.assertEqual(dependency,m.EXACT_LITERAL_DEPENDENCY_SHA256)
   for result in (fresh,saved):
    assert_record_identity(result['records'],m.EXPECTED_IDS,p,b);self.assertEqual(len(result['records']),16);self.assertTrue(all(r['ok'] for r in result['records']))
    for r in result['records']:
     self.assertIn(r['verificationMode'],('EXACT_ORACLE','AI_CONCEPTUAL'));self.assertEqual(r['reviewDependencySha256'],{'exact_arithmetic_literals.py':dependency})
    self.assertEqual(result['verifierSha256'],sha(Path(m.__file__).read_bytes()));self.assertEqual(result['contractSha256'],sha(Path(m.__file__).with_name('review_contract.py').read_bytes()))
    self.assertEqual(result['primaryBeforeCandidateKeys']['sha256'],sha(primary.read_bytes()));self.assertEqual(result['primaryBeforeCandidateKeys']['path'],str(primary.relative_to(APP)))
    self.assertEqual(result['packageSha256'],m.REVIEWED_PACKAGE_SHA256);self.assertEqual(result['bindingsSha256'],m.REVIEWED_BINDINGS_SHA256)
    self.assertEqual(result['humanApproval'],'NOT_RUN');self.assertEqual(result['publication'],'DRAFT')
 def test_actual_catalog_network_lesson_and_single_capacitor_prerequisite(self):
  from tools.corpus_engineering.pipeline import git_bytes
  raw=git_bytes(APP.parent,'5d1dc8dc7b601aef959d10d564c75462be74708d','officina-di-fisica/content/C4.json')
  self.assertEqual(sha(raw),'19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c')
  catalog=json.loads(raw);lesson=next(x for x in catalog if x['id']=='C4-L08');foundation=next(x for x in catalog if x['id']=='C4-L07')
  self.assertEqual(lesson['title'],'Mettere insieme i condensatori');self.assertEqual(lesson['prerequisites'],['C4-L07']);self.assertEqual(foundation['title'],'Immagazzinare carica ed energia')
  self.assertIn('6.5 Conservazione di carica nei collegamenti',lesson['coverage'])
  for m,p,b in self.rows:
   self.assertEqual(m.LESSON_REFERENCE['sourceSha256'],sha(raw));self.assertEqual(m.LESSON_REFERENCE['primarySkill'],lesson['id'])
   for row in p['records']:
    self.assertEqual(row['skill'],lesson['id']);self.assertEqual(row['error']['target'],lesson['id']);self.assertIn('C4-L07',row['prerequisites']);self.assertIn('C4-L08',row['prerequisites'])
   for report in (m.report(p,b,CANDIDATE/'editorial/assets'),json.loads((APP/'editorial/reviews'/(m.BATCH+'.json')).read_bytes())):
    self.assertEqual(report['lessonReference'],m.LESSON_REFERENCE)
 def test_retokenized_old_lesson_mapping_is_rejected_for_all_eighty(self):
  from tools.corpus_engineering.review_contract import reviewed_rows
  checked=0
  for m,p,b in self.rows:
   bad=deepcopy(p);bindings=deepcopy(b);by_id={x['id']:x for x in bindings}
   for row in bad['records']:
    row['skill']='C4-L07';row['error']['target']='C4-L07';row['prerequisites'].remove('C4-L08');by_id[row['id']]['candidateSha256']=digest(row)
   tokens={r['id']:token for r,z,token,assets,errors in reviewed_rows(bad,bindings,{},m.EXPECTED_IDS,CANDIDATE/'editorial/assets')}
   with patch.dict(m.REVIEWED_CANDIDATES,tokens),patch.object(m,'REVIEWED_PACKAGE_SHA256',digest(bad)),patch.object(m,'REVIEWED_BINDINGS_SHA256',digest(bindings)):
    rejected=m.verify(bad,bindings,CANDIDATE/'editorial/assets')
   for row in rejected:
    self.assertFalse(row['ok']);self.assertEqual(row['errors'],['Independent reviewed course or actual lesson mapping mismatch']);checked+=1
  self.assertEqual(checked,80)
 def test_hostile_rebinding_retokenized_wrong_math_units_and_geometry(self):
  for m,p,b in self.rows:
   before=(digest(p),digest(b),dict(m.REVIEWED_CANDIDATES),m.REVIEWED_PACKAGE_SHA256,m.REVIEWED_BINDINGS_SHA256)
   audit=m.mutation_audit(p,b,CANDIDATE/'editorial/assets');self.assertEqual(audit['caseCount'],27);self.assertTrue(audit['allRejected'])
   self.assertEqual(sum(x['case']=='wrong_key_rebound_and_all_edition_tokens_replaced' for x in audit['cases']),16)
   self.assertEqual(sum(x['case']=='decimal_lexeme_below_float_ulp_rebound_and_retokenized' for x in audit['cases']),1)
   self.assertEqual(before,(digest(p),digest(b),dict(m.REVIEWED_CANDIDATES),m.REVIEWED_PACKAGE_SHA256,m.REVIEWED_BINDINGS_SHA256))
 def test_identity_rejects_invalid_claims_and_dependency_drift(self):
  for m,p,b in self.rows:
   original=m.report(p,b,CANDIDATE/'editorial/assets')['records']
   for field,value in [('verificationMode','AI_SCIENTIFIC_PASS'),('candidateSha256','0'*64),('sourceSha256','0'*64),('humanApproval','PASS'),('publication','PUBLISHED')]:
    bad=deepcopy(original);bad[0][field]=value
    with self.assertRaises(ValueError):assert_record_identity(bad,m.EXPECTED_IDS,p,b)
   with patch.object(m,'EXACT_LITERAL_DEPENDENCY_SHA256','0'*64):
    rows=m.verify(p,b,CANDIDATE/'editorial/assets');self.assertTrue(all(not r['ok'] and 'Independent exact literal dependency edition mismatch' in r['errors'] for r in rows))
 @BOUNDED
 @given(first=POS,gap=POS,gain=POS,offset=st.integers(-20,20))
 def test_display_gain_offset_positive_domains_and_dimensions(self,first,gap,gain,offset):
  HYPOTHESIS_COUNTS['test_display_gain_offset_positive_domains_and_dimensions']=HYPOTHESIS_COUNTS.get('test_display_gain_offset_positive_domains_and_dimensions',0)+1
  second=first+gap;third=first+2*gap
  for (m,_,_),unit in zip(self.rows,('microfarad','microfarad','volt','volt','microjoule')):
   self.assertEqual(m.calibrate(first,second,gain*first,gain*third,gain*first+offset,gain*second+offset,gain*third+offset,unit),(gain,offset,third,third))
 def test_literal_lexemes_do_not_roundtrip_through_binary_float(self):
  for m,_,_ in self.rows:
   self.assertNotEqual(m.parse_literal('2.0000000000000000001'),2);self.assertEqual(m.parse_literal('0.25'),sp.Rational(1,4));self.assertEqual(m.parse_literal('−4/5'),-sp.Rational(4,5));self.assertEqual(m.parse_literal('(1+√3)'),1+sp.sqrt(3))
   for bad in ('nan','inf','1/0','__import__("os")','2**100000','1e400','√10001','0x10'):
    with self.assertRaises(ValueError):m.parse_literal(bad)
 def test_five_constitutive_faults_and_five_inverse_faults_rejected(self):
  wrong_laws=[lambda a,b:sp.sympify(a)*b/(a+b),lambda a,b:sp.sympify(a)+b,lambda a,b:12*sp.sympify(a)/(a+b),lambda a,b:sp.sympify(a),lambda a,b:(sp.sympify(a)-b)**2/2]
  wrong_inverses=[lambda total,known:sp.sympify(total)+known,lambda total,known:sp.sympify(total)*known/(known+total),lambda voltage,second:sp.sympify(second)*voltage/(12-voltage),lambda final,added:sp.sympify(final)*2/(2+added),lambda loss,second:sp.sympify(second)-2*sp.sqrt(loss)]
  for (m,p,b),bad_law,bad_inverse in zip(self.rows,wrong_laws,wrong_inverses):
   before=(digest(p),digest(b));m.oracle.cache_clear()
   try:
    with patch.object(m,'result',bad_law):
     with self.assertRaises(AssertionError):m.oracle()
   finally:m.oracle.cache_clear()
   inverse='inverse_component' if m.FAMILY in ('parallel-capacitors','series-capacitors') else 'inverse_first';m.oracle.cache_clear()
   try:
    with patch.object(m,inverse,bad_inverse):
     try:rows=m.verify(p,b,CANDIDATE/'editorial/assets')
     except AssertionError:pass
     else:self.assertTrue(any(not r['ok'] and 'Independent primary physical exact result mismatch' in r['errors'] for r in rows))
   finally:m.oracle.cache_clear()
   self.assertTrue(all(r['ok'] for r in m.verify(p,b,CANDIDATE/'editorial/assets')));self.assertEqual(before,(digest(p),digest(b)))
 def test_all_eighty_source_hashes_and_no_authoring_imports(self):
  for m,p,b in self.rows:
   source=m.source_records()
   for z in b:self.assertEqual(digest(source[z['sourceId']]),z['sourceSha256'])
   imports=[]
   for node in ast.walk(ast.parse(Path(m.__file__).read_text())):
    if isinstance(node,ast.Import):imports.extend(x.name for x in node.names)
    if isinstance(node,ast.ImportFrom):imports.append(node.module or '')
   self.assertFalse(any('authoring' in x for x in imports))
 def test_calibration_guards_are_explicit_and_reject_invalid_decoding(self):
  for m,_,_ in self.rows:
   for args in [(0,2,3,6,3,5,7),(1,1,3,6,3,5,7),(1,2,0,6,3,5,7),(1,2,3,6,5,3,7),(1,2,3,0,3,5,7),(1,2,3,6,3,5,0)]:
    with self.assertRaises(ValueError):m.calibrate(*args,'dimensionless')
   fn=next(n for n in ast.parse(Path(m.__file__).read_text()).body if isinstance(n,ast.FunctionDef) and n.name=='calibrate');self.assertFalse(any(isinstance(n,ast.Assert) for n in ast.walk(fn)))
 @BOUNDED
 @given(first=POS,second=POS,k1=POS,k2=POS)
 def test_parallel_node_sum_inverse_scaling_and_linear_means(self,first,second,k1,k2):
  HYPOTHESIS_COUNTS['test_parallel_node_sum_inverse_scaling_and_linear_means']=HYPOTHESIS_COUNTS.get('test_parallel_node_sum_inverse_scaling_and_linear_means',0)+1
  m=self.rows[0][0];total=m.result(first,second);self.assertEqual(total,first+second);self.assertTrue(total>first and total>second)
  self.assertEqual(m.inverse_component(total,second),first);self.assertEqual(m.scaled(first,second,k1,k2),(k1*first+k2*second)/(first+second));self.assertEqual(m.scaled(first,second,k1,k1),k1)
  self.assertEqual(m.constrained_second(total),sp.Rational(3,5)*total)
  self.assertEqual((m.result(first,second)+m.result(k1,k2))/2,m.result((first+k1)/2,(second+k2)/2))
 @BOUNDED
 @given(first=POS,second=POS,k1=POS,k2=POS)
 def test_series_neutral_node_inverse_scaling_and_topology_ratio(self,first,second,k1,k2):
  HYPOTHESIS_COUNTS['test_series_neutral_node_inverse_scaling_and_topology_ratio']=HYPOTHESIS_COUNTS.get('test_series_neutral_node_inverse_scaling_and_topology_ratio',0)+1
  m=self.rows[1][0];total=m.result(first,second);self.assertTrue(0<total<min(first,second));self.assertEqual(total,first*second/(first+second))
  self.assertEqual(m.inverse_component(total,second),first);self.assertEqual(m.scaled(first,second,k1,k2),k1*k2*(first+second)/(k1*first+k2*second));self.assertEqual(m.scaled(first,second,k1,k1),k1)
  self.assertTrue(m.topology_ratio(first,second)>=4);self.assertEqual(m.topology_ratio(first,first),4);self.assertEqual(m.constrained_second(total),2*total)
 @BOUNDED
 @given(first=POS,second=POS,k1=POS,k2=POS)
 def test_series_voltage_orientation_two_inverses_and_scale_freedom(self,first,second,k1,k2):
  HYPOTHESIS_COUNTS['test_series_voltage_orientation_two_inverses_and_scale_freedom']=HYPOTHESIS_COUNTS.get('test_series_voltage_orientation_two_inverses_and_scale_freedom',0)+1
  m=self.rows[2][0];u=m.result(first,second);other=m.result(second,first);self.assertTrue(0<u<12);self.assertEqual(u+other,12);self.assertEqual(first*u,second*other)
  self.assertEqual(m.inverse_first(u,second),first);self.assertEqual(m.inverse_second(u,first),second);self.assertEqual(m.scaled(first,second,k1,k2),k2*(first+second)/(k1*first+k2*second));self.assertEqual(m.scaled(first,second,k1,k1),1);self.assertEqual(m.constrained_value(first),6)
 @BOUNDED
 @given(initial=POS,added=POS,k1=POS,k2=POS)
 def test_charge_sharing_conserved_node_fixed_initial_capacitance(self,initial,added,k1,k2):
  HYPOTHESIS_COUNTS['test_charge_sharing_conserved_node_fixed_initial_capacitance']=HYPOTHESIS_COUNTS.get('test_charge_sharing_conserved_node_fixed_initial_capacitance',0)+1
  m=self.rows[3][0];final=m.result(initial,added);self.assertTrue(0<final<initial);self.assertEqual(2*initial,(2+added)*final)
  self.assertEqual(m.inverse_first(final,added),initial);self.assertEqual(m.inverse_second(final,initial),added);self.assertEqual(m.scaled(initial,added,k1,k2),k1*(2+added)/(2+k2*added))
  constrained=m.result(3*added,added);self.assertTrue(0<constrained<6);self.assertEqual(m.constrained_second(constrained),added)
 @BOUNDED
 @given(lower=POS,gap=POS,new_lower=POS,new_gap=POS)
 def test_loss_energy_balance_positive_branches_and_ordered_scaling(self,lower,gap,new_lower,new_gap):
  HYPOTHESIS_COUNTS['test_loss_energy_balance_positive_branches_and_ordered_scaling']=HYPOTHESIS_COUNTS.get('test_loss_energy_balance_positive_branches_and_ordered_scaling',0)+1
  m=self.rows[4][0];higher=lower+gap;loss=m.result(higher,lower);self.assertEqual(loss,gap*gap/4)
  self.assertEqual(m.inverse_first(loss,lower),sp.Rational(higher));self.assertEqual(m.inverse_second(loss,higher),sp.Rational(lower))
  new_higher=new_lower+new_gap;self.assertEqual(m.scaled(higher,lower,new_higher/higher,new_lower/lower),(new_gap/gap)**2)
  final=(higher+lower)/2;initial_energy=(higher*higher+lower*lower)/2;final_energy=final*final;self.assertEqual(initial_energy-final_energy,loss)
  self.assertEqual(m.constrained_second(m.result(2*lower,lower)),sp.Rational(lower))
 def test_zero_final_voltage_opposite_polarities_and_strict_inverse_boundaries(self):
  p,s,v,c,e=(r[0] for r in self.rows)
  self.assertEqual(p.opposite_voltage(1,6,2,3),0);self.assertEqual(p.opposite_voltage(1,1,2,3),-sp.Rational(5,3))
  cases=[(p.inverse_component,(1,1)),(p.inverse_component,(1,2)),(s.inverse_component,(1,1)),(s.inverse_component,(2,1)),(v.inverse_first,(0,1)),(v.inverse_first,(12,1)),(v.inverse_second,(13,1)),(c.inverse_second,(1,1)),(c.inverse_second,(2,1)),(c.constrained_second,(0,)),(c.constrained_second,(6,)),(e.result,(1,1)),(e.result,(1,2)),(e.inverse_first,(0,1)),(e.inverse_second,(1,2)),(e.inverse_second,(2,2)),(e.scaled,(4,2,1,2)),(e.scaled,(4,2,1,3))]
  for fn,args in cases:
   with self.assertRaises(ValueError):fn(*args)
  self.assertEqual(e.inverse_first(2,1),1+2*sp.sqrt(2));self.assertEqual(sp.simplify(e.result(e.inverse_first(2,1),1)-2),0)
 def test_noncommuting_means_and_conditional_voltage_coincidence(self):
  p,s,v,c,e=(r[0] for r in self.rows)
  self.assertEqual((p.result(2,3)+p.result(3,5))/2,sp.Rational(13,2));self.assertEqual(p.result(sp.Rational(5,2),4),sp.Rational(13,2))
  self.assertEqual((s.result(2,2)+s.result(3,6))/2,sp.Rational(3,2));self.assertEqual(s.result(sp.Rational(5,2),4),sp.Rational(20,13))
  self.assertEqual((v.result(2,2)+v.result(3,1))/2,sp.Rational(9,2));self.assertEqual(v.result(sp.Rational(5,2),sp.Rational(3,2)),sp.Rational(9,2));self.assertEqual((v.result(1,1)+v.result(1,3))/2,sp.Rational(15,2));self.assertEqual(v.result(1,2),8)
  self.assertEqual((c.result(6,2)+c.result(12,4))/2,sp.Rational(7,2));self.assertEqual(c.result(9,3),sp.Rational(18,5));self.assertEqual((e.result(4,2)+e.result(8,4))/2,sp.Rational(5,2));self.assertEqual(e.result(6,3),sp.Rational(9,4))
 def test_every_public_math_helper_rejects_nonfinite_nonreal_and_binary_float(self):
  p,s,v,c,e=(r[0] for r in self.rows)
  cases=[]
  for m in (p,s):cases.extend([(m.result,(2,3)),(m.inverse_component,(1,3)),(m.scaled,(2,3,1,2)),(m.constrained_second,(1,))])
  cases.extend([(p.opposite_voltage,(1,6,2,3)),(s.topology_ratio,(2,3))])
  for m in (v,c):cases.extend([(m.result,(2,3)),(m.inverse_first,(1,3)),(m.inverse_second,(1,3)),(m.scaled,(2,3,1,2))])
  cases.extend([(v.constrained_value,(1,)),(c.constrained_second,(3,)),(e.result,(4,2)),(e.inverse_first,(1,2)),(e.inverse_second,(1,4)),(e.scaled,(4,2,1,1)),(e.constrained_second,(1,))])
  for m,_,_ in self.rows:cases.extend([(m.equivalent_literal,(Fraction(1,2),)),(m.calibrate,(1,2,3,6,3,5,7,'dimensionless'))])
  forbidden=[sp.oo,-sp.oo,sp.zoo,sp.I,sp.nan,0.1,sp.Float('0.1'),sp.Add(sp.sqrt(2),sp.Float('0.1'),evaluate=False),1+sp.I,float('inf'),float('nan'),sp.Symbol('unknown',positive=True),True]
  count=0
  for fn,args in cases:
   for index in range(len(args)-1 if fn.__name__=='calibrate' else len(args)):
    for bad in forbidden:
     changed=list(args);changed[index]=bad
     with self.subTest(module=fn.__module__,function=fn.__name__,index=index,input=repr(bad)):
      with self.assertRaises(ValueError):fn(*changed)
     count+=1
  type(self).finite_guard_assertions=count
 def test_primary_and_model_implementation_identity_without_false_blind_code_claim(self):
  path=APP/'editorial/reviews/u6-capacitor-networks-220-224-independent-models.py';source=path.read_text();self.assertEqual(sha(path.read_bytes()),'85dad5e28940ee486e847302a0d2a0d5fc88925e17115e897e3b5fb43184e35a')
  self.assertIn('Written after textual rereading220–222',source);self.assertFalse(any(isinstance(n,(ast.Import,ast.ImportFrom)) for n in ast.walk(ast.parse(source))))
  for m,_,_ in self.rows:self.assertEqual(m.INDEPENDENT_MODELS_IMPLEMENTATION_SHA256,sha(path.read_bytes()))
if __name__=='__main__':unittest.main()
