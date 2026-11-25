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
NAMES=('zero_field_distance_ratio','orthogonal_electric_fields','current_charge_time','ohmic_current','wire_resistance')
class CircuitsIndependent(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.rows=[]
  for name in NAMES:
   m=importlib.import_module('tools.corpus_engineering.'+name+'_verifier')
   p=json.loads((CANDIDATE/'editorial/batches'/(m.BATCH+'.json')).read_bytes());b=json.loads((CANDIDATE/'editorial/batches'/(m.BATCH+'-bindings.json')).read_bytes());cls.rows.append((m,p,b))
 def test_fresh_saved_identity_modes_and_exact_dependencies(self):
  primary=APP/'editorial/reviews/u6-circuits-200-204-primary-source-only.md'
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
 @given(first=POS,second=POS,a=POS,b=POS,length=POS)
 def test_zero_field_positive_root_inverses_positions_and_scaling(self,first,second,a,b,length):
  m=self.rows[0][0];ratio=m.result(first,second)
  self.assertEqual(ratio**2,first/second);self.assertEqual(m.inverse_first(ratio,second),sp.Rational(first));self.assertEqual(m.inverse_second(ratio,first),sp.Rational(second))
  self.assertEqual(m.scaled(first,second,a,b)**2,a/b)
  d1,d2=m.positions(first,second,length)
  self.assertEqual(sp.simplify(d1+d2),length);self.assertEqual(sp.simplify(d1/d2),ratio)
  self.assertEqual(sp.simplify(first/d1**2-second/d2**2),0)
  self.assertEqual(m.constrained_value(second),sp.Rational(1,2))
 @BOUNDED
 @given(first=POS,second=POS,a=POS,b=POS)
 def test_perpendicular_norm_inverses_scaling_and_normalization(self,first,second,a,b):
  m=self.rows[1][0];total=m.result(first,second)
  self.assertEqual(total**2,first**2+second**2);self.assertEqual(m.inverse_component(total,second),sp.Rational(first));self.assertEqual(m.inverse_component(total,first),sp.Rational(second))
  self.assertEqual(sp.simplify(m.scaled(first,second,a,b)**2),(a*a*first*first+b*b*second*second)/(first*first+second*second))
  u,v=first/total,second/total;self.assertEqual(sp.simplify(u*u+v*v),1)
  self.assertEqual(sp.simplify(m.scaled(first,second,a,b)**2-(a*a*u*u+b*b*v*v)),0)
  self.assertEqual(m.constrained(5),4)
 @BOUNDED
 @given(charge=POS,duration=POS,a=POS,b=POS)
 def test_mean_current_units_inverses_and_right_hand_orientation(self,charge,duration,a,b):
  m=self.rows[2][0];current=m.result(charge,duration)
  self.assertEqual(current,charge/duration);self.assertEqual(m.inverse_charge(current,duration),charge);self.assertEqual(m.inverse_duration(current,charge),duration)
  self.assertEqual(m.scaled(charge,duration,a,b),a/b)
  tx,ty=m.magnetic_tangent(a,b,current)
  self.assertEqual(a*tx+b*ty,0);self.assertGreater(a*ty-b*tx,0)
  # Tangent direction is not a claim of calibrated B magnitude.
 @BOUNDED
 @given(voltage=POS,resistance=POS,a=POS,b=POS)
 def test_ohmic_passive_drop_inverses_scaling_and_redundancy(self,voltage,resistance,a,b):
  m=self.rows[3][0];current=m.result(voltage,resistance)
  self.assertEqual(current,voltage/resistance);self.assertEqual(m.inverse_voltage(current,resistance),voltage);self.assertEqual(m.inverse_resistance(current,voltage),resistance)
  self.assertEqual(m.scaled(voltage,resistance,a,b),a/b);self.assertEqual(m.constrained_value(resistance),4)
  self.assertEqual(m.SI.Unit('volt/ohm').dimensionality,m.SI.Unit('ampere').dimensionality)
 @BOUNDED
 @given(length=POS,area=POS,a=POS,b=POS)
 def test_wire_SI_area_conversion_inverses_scaling_and_redundancy(self,length,area,a,b):
  m=self.rows[4][0];resistance=m.result(length,area)
  self.assertEqual(resistance,length/(50*area));self.assertEqual(m.inverse_length(resistance,area),length);self.assertEqual(m.inverse_area(resistance,length),area)
  self.assertEqual(m.scaled(length,area,a,b),a/b);self.assertEqual(m.constrained_value(area),1)
  self.assertEqual(m.SI.Quantity(1,'millimeter**2').to('meter**2').magnitude,Fraction(1,10**6))
 @BOUNDED
 @given(first=POS,gap=POS,gain=POS,offset=st.integers(-20,20))
 def test_display_gain_offset_and_units_independent_from_inverse(self,first,gap,gain,offset):
  second=first+gap;third=first+2*gap
  for (m,_,_),unit in zip(self.rows,('dimensionless','newton/coulomb','ampere','ampere','ohm')):
   self.assertEqual(m.calibrate(first,second,gain*first,gain*third,gain*first+offset,gain*second+offset,gain*third+offset,unit),(gain,offset,third,third))
 def test_domains_and_nonzero_inverse_residuals(self):
  for m,_,_ in self.rows:
   for args in ((0,1),(1,0),(-1,1),(1,-1)):
    with self.subTest(module=m.FAMILY,args=args):
     with self.assertRaises(ValueError):m.result(*args)
   with self.assertRaises(ValueError):m.scaled(1,1,0,1)
  z,v,c,o,w=(r[0] for r in self.rows)
  cases=[(z.inverse_first,(0,1)),(z.inverse_second,(0,1)),(z.positions,(1,1,0)),(z.constrained_value,(0,)),(v.inverse_component,(1,1)),(v.inverse_component,(1,2)),(v.inverse_component,(1,0)),(v.constrained,(0,)),(c.inverse_charge,(0,1)),(c.inverse_duration,(1,0)),(c.magnetic_tangent,(0,0,1)),(c.magnetic_tangent,(1,1,0)),(o.inverse_voltage,(0,1)),(o.inverse_resistance,(1,0)),(o.constrained_value,(0,)),(w.inverse_length,(0,1)),(w.inverse_area,(1,0)),(w.constrained_value,(0,))]
  for fn,args in cases:
   with self.subTest(function=fn.__name__,args=args):
    with self.assertRaises(ValueError):fn(*args)
 def test_means_final_distractors_and_instantaneous_exception(self):
  z,v,c,o,w=(r[0] for r in self.rows)
  self.assertEqual((z.result(1,4)+z.result(4,1))/2,sp.Rational(5,4));self.assertEqual(z.result(Fraction(5,2),Fraction(5,2)),1)
  self.assertEqual((v.result(3,4)+v.result(5,12))/2,9);self.assertEqual(v.result(4,8),4*sp.sqrt(5));self.assertNotEqual(9,4*sp.sqrt(5))
  self.assertEqual((c.result(6,2)+c.result(12,3))/2,Fraction(7,2));self.assertEqual(c.result(18,5),Fraction(18,5))
  # A two-segment current 2A then4A for1ms each gives average3A without I(t) constant.
  self.assertEqual(c.result(2+4,1+1),3);self.assertNotEqual(c.result(2,1),c.result(4,1))
  self.assertEqual((o.result(12,3)+o.result(15,5))/2,Fraction(7,2));self.assertEqual(o.result(Fraction(27,2),4),Fraction(27,8))
  self.assertEqual((w.result(100,2)+w.result(200,1))/2,Fraction(5,2));self.assertEqual(w.result(150,Fraction(3,2)),2)
  self.assertEqual(2*z.result(Fraction(49,4),9)+1,sp.Rational(10,3));self.assertEqual(2*sp.sqrt(sp.Integer(57)+64)+1,23)
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
if __name__=='__main__':unittest.main()
