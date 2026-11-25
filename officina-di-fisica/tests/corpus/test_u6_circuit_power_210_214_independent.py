"""Independent circuit laws, exact lexemes and adversarial rebinding."""
import ast
from copy import deepcopy
from fractions import Fraction
import importlib
import json
import os
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
NAMES=('identical_parallel_resistors','voltage_divider','current_divider','joule_power','joule_energy_voltage_time')
class CircuitPowerIndependent(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.rows=[]
  for name in NAMES:
   m=importlib.import_module('tools.corpus_engineering.'+name+'_verifier')
   p=json.loads((CANDIDATE/'editorial/batches'/(m.BATCH+'.json')).read_bytes());b=json.loads((CANDIDATE/'editorial/batches'/(m.BATCH+'-bindings.json')).read_bytes());cls.rows.append((m,p,b))
 def test_fresh_saved_identity_modes_and_exact_dependencies(self):
  primary=APP/'editorial/reviews/u6-circuit-power-210-214-primary-source-only.md'
  for m,p,b in self.rows:
   fresh=m.report(p,b,CANDIDATE/'editorial/assets');saved=json.loads((APP/'editorial/reviews'/(m.BATCH+'.json')).read_bytes());self.assertEqual(fresh,saved)
   dependency=sha(Path(m.exact_numbers.__file__).read_bytes());self.assertEqual(dependency,m.EXACT_LITERAL_DEPENDENCY_SHA256)
   for result in (fresh,saved):
    assert_record_identity(result['records'],m.EXPECTED_IDS,p,b)
    self.assertEqual(len(result['records']),16);self.assertTrue(all(r['ok'] for r in result['records']))
    for r in result['records']:
     self.assertIn(r['verificationMode'],('EXACT_ORACLE','AI_CONCEPTUAL'));self.assertEqual(r['reviewDependencySha256'],{'exact_arithmetic_literals.py':dependency})
    self.assertEqual(result['verifierSha256'],sha(Path(m.__file__).read_bytes()));self.assertEqual(result['contractSha256'],sha(Path(m.__file__).with_name('review_contract.py').read_bytes()))
    self.assertEqual(result['primaryBeforeCandidateKeys']['sha256'],sha(primary.read_bytes()))
    self.assertEqual(result['packageSha256'],m.REVIEWED_PACKAGE_SHA256);self.assertEqual(result['bindingsSha256'],m.REVIEWED_BINDINGS_SHA256)
    self.assertEqual(result['humanApproval'],'NOT_RUN');self.assertEqual(result['publication'],'DRAFT')
 def test_hostile_rebinding_geometry_and_sub_ulp_wrong_choices(self):
  for m,p,b in self.rows:
   before=(digest(p),digest(b),dict(m.REVIEWED_CANDIDATES),m.REVIEWED_PACKAGE_SHA256,m.REVIEWED_BINDINGS_SHA256)
   audit=m.mutation_audit(p,b,CANDIDATE/'editorial/assets');self.assertEqual(audit['caseCount'],27);self.assertTrue(audit['allRejected'])
   self.assertEqual(sum(x['case']=='wrong_key_rebound_and_all_edition_tokens_replaced' for x in audit['cases']),16)
   self.assertEqual(sum(x['case']=='decimal_lexeme_below_float_ulp_rebound_and_retokenized' for x in audit['cases']),1)
   self.assertEqual(before,(digest(p),digest(b),dict(m.REVIEWED_CANDIDATES),m.REVIEWED_PACKAGE_SHA256,m.REVIEWED_BINDINGS_SHA256))
 def test_saved_identity_rejects_invalid_records_and_dependency_drift(self):
  for m,p,b in self.rows:
   original=m.report(p,b,CANDIDATE/'editorial/assets')['records']
   for field,value in [('verificationMode','AI_SCIENTIFIC_PASS'),('candidateSha256','0'*64),('sourceSha256','0'*64),('humanApproval','PASS'),('publication','PUBLISHED')]:
    rows=deepcopy(original);rows[0][field]=value
    with self.assertRaises(ValueError):assert_record_identity(rows,m.EXPECTED_IDS,p,b)
   with patch.object(m,'EXACT_LITERAL_DEPENDENCY_SHA256','0'*64):
    rows=m.verify(p,b,CANDIDATE/'editorial/assets');self.assertTrue(all(not r['ok'] and 'Independent exact literal dependency edition mismatch' in r['errors'] for r in rows))
 @BOUNDED
 @given(first=POS,gap=POS,gain=POS,offset=st.integers(-20,20))
 def test_display_gain_offset_and_units_independent_from_inverse(self,first,gap,gain,offset):
  second=first+gap;third=first+2*gap
  for (m,_,_),unit in zip(self.rows,('ohm','volt','milliampere','watt','joule')):
   self.assertEqual(m.calibrate(first,second,gain*first,gain*third,gain*first+offset,gain*second+offset,gain*third+offset,unit),(gain,offset,third,third))
 def test_exact_decimal_lexemes_not_binary_float_roundtrip(self):
  for m,_,_ in self.rows:
   self.assertNotEqual(m.parse_literal('2.0000000000000000001'),2)
   self.assertEqual(m.parse_literal('−4/5'),-sp.Rational(4,5));self.assertEqual(m.parse_literal('0.25'),sp.Rational(1,4));self.assertEqual(m.parse_literal('√2/2'),sp.sqrt(2)/2)
   for bad in ('nan','inf','1/0','__import__("os")','2**100000','1e400','√10001','0x10'):
    with self.subTest(literal=bad):
     with self.assertRaises(ValueError):m.parse_literal(bad)
 def test_five_constitutive_faults_fail_without_candidate_mutation(self):
  for m,p,b in self.rows:
   before=(digest(p),digest(b));m.oracle.cache_clear()
   try:
    with patch.object(m,'result',lambda a,b:Fraction(1)):
     with self.assertRaises(AssertionError):m.oracle()
   finally:m.oracle.cache_clear()
   self.assertTrue(all(r['ok'] for r in m.verify(p,b,CANDIDATE/'editorial/assets')));self.assertEqual(before,(digest(p),digest(b)))
 def test_all_source_hashes_from_git_and_no_authoring_imports(self):
  for m,p,b in self.rows:
   source=m.source_records()
   for z in b:self.assertEqual(digest(source[z['sourceId']]),z['sourceSha256'])
   imports=[]
   for node in ast.walk(ast.parse(Path(m.__file__).read_text())):
    if isinstance(node,ast.Import):imports.extend(x.name for x in node.names)
    if isinstance(node,ast.ImportFrom):imports.append(node.module or '')
   self.assertFalse(any('authoring' in x for x in imports))
 def test_calibration_explicit_domain_guards_not_assertions(self):
  for m,_,_ in self.rows:
   for args in [(0,2,3,6,3,5,7),(1,1,3,6,3,5,7),(1,2,0,6,3,5,7),(1,2,3,6,5,3,7),(1,2,3,0,3,5,7),(1,2,3,6,3,5,0)]:
    with self.subTest(module=m.FAMILY,args=args):
     with self.assertRaises(ValueError):m.calibrate(*args,'dimensionless')
   tree=ast.parse(Path(m.__file__).read_text());fn=next(n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='calibrate')
   self.assertFalse(any(isinstance(n,ast.Assert) for n in ast.walk(fn)))
 @BOUNDED
 @given(branch=POS,a=POS,count=st.integers(1,20),final_count=st.integers(1,20))
 def test_identical_parallel_integer_counts_inverse_and_scaling(self,branch,a,count,final_count):
  m=self.rows[0][0];r=m.result(branch,count)
  self.assertEqual(r,branch/count);self.assertEqual(m.inverse_branch(r,count),branch);self.assertEqual(m.inverse_count(r,branch),count)
  self.assertEqual(m.scaled(branch,count,a,Fraction(final_count,count)),a*count/final_count)
  self.assertEqual(m.constrained_value(count),4)
 @BOUNDED
 @given(first=POS,second=POS,a=POS,b=POS)
 def test_unloaded_voltage_division_inverses_and_common_scale(self,first,second,a,b):
  m=self.rows[1][0];u=m.result(first,second)
  self.assertTrue(0<u<12);self.assertEqual(u,12*second/(first+second))
  self.assertEqual(m.inverse_upper(u,second),first);self.assertEqual(m.inverse_lower(u,first),second)
  self.assertEqual(m.scaled(first,second,a,b),b*(first+second)/(a*first+b*second));self.assertEqual(m.scaled(first,second,a,a),1)
  self.assertEqual(m.constrained_value(first),6)
 @BOUNDED
 @given(first=POS,second=POS,a=POS,b=POS)
 def test_imposed_current_division_voltage_adapts_and_inverses(self,first,second,a,b):
  m=self.rows[2][0];i=m.result(first,second);other=m.result(second,first)
  self.assertTrue(0<i<12);self.assertEqual(i+other,12);self.assertEqual(i*first,other*second)
  self.assertEqual(m.inverse_first(i,second),first);self.assertEqual(m.inverse_second(i,first),second)
  self.assertEqual(m.scaled(first,second,a,b),b*(first+second)/(a*first+b*second));self.assertEqual(m.scaled(first,second,a,a),1)
  self.assertEqual(m.constrained_value(first),6)
  self.assertNotEqual(i*first,m.result(first,2*second)*first)
 @BOUNDED
 @given(current=POS,resistance=POS,a=POS,b=POS)
 def test_passive_Joule_power_inverse_scaling_and_cubic_constraint(self,current,resistance,a,b):
  m=self.rows[3][0];p=m.result(current,resistance)
  self.assertEqual(p,current*current*resistance);self.assertEqual(m.inverse_current(p,resistance),sp.Rational(current));self.assertEqual(m.inverse_resistance(p,current),resistance)
  self.assertEqual(m.scaled(current,resistance,a,b),a*a*b)
  self.assertEqual(m.constrained_resistance(m.result(Fraction(2,3)*resistance,resistance)),sp.Rational(resistance))
  self.assertEqual(m.parallel_load_current_ratio(18,6,12),3)
 @BOUNDED
 @given(voltage=POS,duration=POS,a=POS,b=POS)
 def test_Joule_energy_inverse_scaling_and_prepared_duration_constraint(self,voltage,duration,a,b):
  m=self.rows[4][0];e=m.result(voltage,duration)
  self.assertEqual(e,voltage*voltage*duration/2);self.assertEqual(m.inverse_voltage(e,duration),sp.Rational(voltage));self.assertEqual(m.inverse_duration(e,voltage),duration)
  self.assertEqual(m.scaled(voltage,duration,a,b),a*a*b)
  self.assertEqual(m.constrained_duration(m.result(Fraction(2,3)*duration,duration)),sp.Rational(duration))
  # A different protocol V(tau)=alpha*tau has one third the energy of a constant prepared alpha*T.
  alpha,tau,total=sp.symbols('alpha tau T',positive=True)
  self.assertEqual(sp.integrate(alpha**2*tau**2/2,(tau,0,total)),alpha**2*total**3/6)
 def test_strict_physical_domains_integer_admissibility_and_boundaries(self):
  for m,_,_ in self.rows:
   for args in ((0,1),(1,0),(-1,1),(1,-1)):
    with self.subTest(module=m.FAMILY,args=args):
     with self.assertRaises(ValueError):m.result(*args)
   with self.assertRaises(ValueError):m.scaled(1,1,0,1)
  n,v,c,p,e=(row[0] for row in self.rows)
  cases=[(n.result,(1,Fraction(3,2))),(n.inverse_count,(2,3)),(n.inverse_branch,(1,0)),(n.scaled,(1,3,1,Fraction(1,2))),(n.constrained_value,(Fraction(1,2),)),(v.inverse_upper,(0,1)),(v.inverse_upper,(12,1)),(v.inverse_lower,(13,1)),(v.inverse_lower,(1,0)),(c.inverse_first,(0,1)),(c.inverse_first,(12,1)),(c.inverse_second,(13,1)),(c.inverse_second,(1,0)),(p.inverse_current,(0,1)),(p.inverse_resistance,(1,0)),(p.parallel_load_current_ratio,(1,1,0)),(p.constrained_resistance,(0,)),(e.inverse_voltage,(0,1)),(e.inverse_duration,(1,0)),(e.constrained_duration,(0,))]
  for fn,args in cases:
   with self.subTest(function=fn.__name__,args=args):
    with self.assertRaises(ValueError):fn(*args)
  self.assertEqual(n.result(12,1),12);self.assertEqual(p.inverse_current(2,1),sp.sqrt(2));self.assertEqual(e.inverse_voltage(1,1),sp.sqrt(2))
 def test_means_noncommutation_and_conditional_divider_coincidence(self):
  n,v,c,p,e=(row[0] for row in self.rows)
  self.assertEqual((n.result(12,3)+n.result(15,5))/2,Fraction(7,2));self.assertEqual(n.result(Fraction(27,2),4),Fraction(27,8))
  for m in (v,c):
   self.assertEqual((m.result(2,2)+m.result(3,1))/2,Fraction(9,2));self.assertEqual(m.result(Fraction(5,2),Fraction(3,2)),Fraction(9,2))
   self.assertEqual((m.result(1,1)+m.result(1,3))/2,Fraction(15,2));self.assertEqual(m.result(1,2),8)
  self.assertEqual((p.result(2,3)+p.result(1,4))/2,8);self.assertEqual(p.result(Fraction(3,2),Fraction(7,2)),Fraction(63,8))
  self.assertEqual((e.result(2,3)+e.result(4,2))/2,11);self.assertEqual(e.result(3,Fraction(5,2)),Fraction(45,4))
 def test_public_math_helpers_reject_nonfinite_nonreal_binary_float(self):
  n,v,c,p,e=(row[0] for row in self.rows)
  cases=[(n.result,(12,3)),(n.inverse_branch,(4,3)),(n.inverse_count,(4,12)),(n.scaled,(12,3,2,1)),(n.constrained_value,(3,)),(v.result,(2,2)),(v.inverse_upper,(6,2)),(v.inverse_lower,(6,2)),(v.scaled,(2,2,1,2)),(v.constrained_value,(2,)),(c.result,(2,2)),(c.inverse_first,(6,2)),(c.inverse_second,(6,2)),(c.scaled,(2,2,1,2)),(c.constrained_value,(2,)),(p.result,(2,3)),(p.inverse_current,(12,3)),(p.inverse_resistance,(12,2)),(p.scaled,(2,3,1,2)),(p.parallel_load_current_ratio,(18,6,12)),(p.constrained_resistance,(12,)),(e.result,(2,3)),(e.inverse_voltage,(6,3)),(e.inverse_duration,(6,2)),(e.scaled,(2,3,1,2)),(e.constrained_duration,(6,))]
  for m,_,_ in self.rows:cases.extend([(m.equivalent_literal,(Fraction(1,2),)),(m.calibrate,(1,2,3,6,3,5,7,'dimensionless'))])
  forbidden=[sp.oo,-sp.oo,sp.zoo,sp.I,sp.nan,0.1,sp.Float('0.1'),sp.Add(sp.sqrt(2),sp.Float('0.1'),evaluate=False),1+sp.I,float('inf'),float('nan'),sp.Symbol('unknown',positive=True),True]
  for fn,args in cases:
   for position in range(len(args)-1 if fn.__name__=='calibrate' else len(args)):
    for bad in forbidden:
     mutated=list(args);mutated[position]=bad
     with self.subTest(module=fn.__module__,function=fn.__name__,position=position,input=repr(bad)):
      with self.assertRaises(ValueError):fn(*mutated)
 def test_frozen_source_only_models_and_primary_precede_candidates(self):
  path=APP/'editorial/reviews/u6-circuit-power-210-214-source-only-models.py'
  self.assertEqual(sha(path.read_bytes()),'97ffd177a7f5ebfc5cd8acca1862f89db6ccbba5f543c47ea7b3b3da39d3f67f')
  source=ast.parse(path.read_text());self.assertFalse(any(isinstance(n,(ast.Import,ast.ImportFrom)) for n in ast.walk(source)))
  for m,_,_ in self.rows:self.assertEqual(m.SOURCE_ONLY_MODELS_SHA256,sha(path.read_bytes()))
if __name__=='__main__':unittest.main()
