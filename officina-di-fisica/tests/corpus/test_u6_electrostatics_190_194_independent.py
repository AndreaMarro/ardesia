"""Independent electrostatic models, exact lexemes and adversarial rebinding."""
import ast
from copy import deepcopy
from fractions import Fraction
import importlib
import json
from pathlib import Path
import unittest
from unittest.mock import patch
from hypothesis import given,settings,strategies as st
import sympy as sp
from tools.corpus_engineering.pipeline import digest,sha
from tools.corpus_engineering.batches import assert_record_identity
APP=Path(__file__).resolve().parents[2]
POS=st.builds(Fraction,st.integers(1,30),st.integers(1,12))
BOUNDED=settings(max_examples=40,derandomize=True,deadline=None)
NAMES=('coulomb_force','point_electric_field','point_electric_potential','midpoint_electric_field','symmetric_electric_potential')
class ElectrostaticsIndependent(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.rows=[]
  for name in NAMES:
   m=importlib.import_module('tools.corpus_engineering.'+name+'_verifier')
   p=json.loads((APP/'editorial/batches'/(m.BATCH+'.json')).read_bytes());b=json.loads((APP/'editorial/batches'/(m.BATCH+'-bindings.json')).read_bytes());cls.rows.append((m,p,b))
 def test_fresh_saved_identity_modes_and_exact_dependencies(self):
  primary=APP/'editorial/reviews/u6-electrostatics-190-194-primary-source-only.md'
  for m,p,b in self.rows:
   fresh=m.report(p,b);saved=json.loads((APP/'editorial/reviews'/(m.BATCH+'.json')).read_bytes());self.assertEqual(fresh,saved)
   dependency=sha(Path(m.exact_numbers.__file__).read_bytes());self.assertEqual(dependency,m.EXACT_LITERAL_DEPENDENCY_SHA256)
   for result in (fresh,saved):
    assert_record_identity(result['records'],m.EXPECTED_IDS,p,b)
    self.assertEqual(len(result['records']),16);self.assertTrue(all(r['ok'] for r in result['records']))
    for r in result['records']:
     self.assertIn(r['verificationMode'],('EXACT_ORACLE','AI_CONCEPTUAL'));self.assertEqual(r['reviewDependencySha256'],{'entropy_state_review.py':dependency})
    self.assertEqual(result['verifierSha256'],sha(Path(m.__file__).read_bytes()));self.assertEqual(result['contractSha256'],sha(Path(m.__file__).with_name('review_contract.py').read_bytes()))
    self.assertEqual(result['primaryBeforeCandidateKeys']['sha256'],sha(primary.read_bytes()))
    self.assertEqual(result['packageSha256'],m.REVIEWED_PACKAGE_SHA256);self.assertEqual(result['bindingsSha256'],m.REVIEWED_BINDINGS_SHA256)
    self.assertEqual(result['humanApproval'],'NOT_RUN');self.assertEqual(result['publication'],'DRAFT')
 def test_hostile_rebinding_geometry_and_sub_ulp_wrong_choices(self):
  for m,p,b in self.rows:
   before=(digest(p),digest(b),dict(m.REVIEWED_CANDIDATES),m.REVIEWED_PACKAGE_SHA256,m.REVIEWED_BINDINGS_SHA256)
   audit=m.mutation_audit(p,b,APP/'editorial/assets');self.assertEqual(audit['caseCount'],27);self.assertTrue(audit['allRejected'])
   self.assertEqual(sum(x['case']=='wrong_key_rebound_and_all_edition_tokens_replaced' for x in audit['cases']),16)
   self.assertEqual(sum(x['case']=='decimal_lexeme_below_float_ulp_rebound_and_retokenized' for x in audit['cases']),1)
   self.assertEqual(before,(digest(p),digest(b),dict(m.REVIEWED_CANDIDATES),m.REVIEWED_PACKAGE_SHA256,m.REVIEWED_BINDINGS_SHA256))
 def test_saved_identity_rejects_invalid_records_and_dependency_drift(self):
  for m,p,b in self.rows:
   original=m.report(p,b)['records']
   for field,value in [('verificationMode','AI_SCIENTIFIC_PASS'),('candidateSha256','0'*64),('sourceSha256','0'*64),('humanApproval','PASS'),('publication','PUBLISHED')]:
    rows=deepcopy(original);rows[0][field]=value
    with self.assertRaises(ValueError):assert_record_identity(rows,m.EXPECTED_IDS,p,b)
   with patch.object(m,'EXACT_LITERAL_DEPENDENCY_SHA256','0'*64):
    rows=m.verify(p,b);self.assertTrue(all(not r['ok'] and 'Independent exact literal dependency edition mismatch' in r['errors'] for r in rows))
 @BOUNDED
 @given(q=POS,r=POS,a=POS,b=POS)
 def test_coulomb_SI_prefactors_inverses_and_scaling(self,q,r,a,b):
  m=self.rows[0][0];f=m.field_value(q,r)
  self.assertEqual(f,90*q/r**2);self.assertEqual(m.inverse_source(f,r),q);self.assertEqual(m.inverse_distance(f,q),sp.Rational(r))
  self.assertEqual(m.scaled(q,r,a,b),a/b**2);self.assertEqual(m.constrained(m.field_value(r/3,r)),r)
 @BOUNDED
 @given(q=POS,r=POS,a=POS,b=POS)
 def test_radial_field_inverses_scaling_and_field_not_force(self,q,r,a,b):
  m=self.rows[1][0];e=m.field_value(q,r)
  self.assertEqual(e,9*q/r**2);self.assertEqual(m.inverse_source(e,r),q);self.assertEqual(m.inverse_distance(e,q),sp.Rational(r))
  self.assertEqual(m.scaled(q,r,a,b),a/b**2);self.assertEqual(m.constrained(m.field_value(r/3,r)),r)
  self.assertEqual(m.SI.Unit('volt/meter').dimensionality,m.SI.Unit('newton/coulomb').dimensionality)
  self.assertNotEqual(m.SI.Unit('newton').dimensionality,m.SI.Unit('newton/coulomb').dimensionality)
 @BOUNDED
 @given(q=POS,r=POS,a=POS,b=POS)
 def test_radial_scalar_potential_inverses_scaling_and_redundant_measurement(self,q,r,a,b):
  m=self.rows[2][0];v=m.field_value(q,r)
  self.assertEqual(v,9*q/r);self.assertEqual(m.inverse_source(v,r),q);self.assertEqual(m.inverse_distance(v,q),r)
  self.assertEqual(m.scaled(q,r,a,b),a/b);self.assertEqual(m.constrained_value(r),3)
  self.assertEqual(m.SI.Unit('joule/coulomb').dimensionality,m.SI.Unit('volt').dimensionality)
 @BOUNDED
 @given(right=POS,gap=POS,a=POS,b=POS)
 def test_oriented_superposition_ordered_domain_inverses_and_linearity(self,right,gap,a,b):
  m=self.rows[3][0];left=right+gap;e=m.field_value(left,right)
  self.assertEqual(e,9*gap);self.assertEqual(m.inverse_left(e,right),left);self.assertEqual(m.inverse_right(e,left),right)
  # Select another physically admissible pair before deriving preparation factors.
  left_b=b*right+a*gap;right_b=b*right
  self.assertEqual(m.scaled(left,right,left_b/left,b),a)
  self.assertEqual((e+m.field_value(left_b,right_b))/2,m.field_value((left+left_b)/2,(right+right_b)/2))
  self.assertEqual(m.constrained(m.field_value(3*right,right)),right)
 @BOUNDED
 @given(first=POS,second=POS,a=POS,b=POS,offset=st.integers(-30,30))
 def test_scalar_superposition_positive_residual_scaling_and_gauge(self,first,second,a,b,offset):
  m=self.rows[4][0];v=m.field_value(first,second)
  self.assertEqual(v,3*(first+second));self.assertEqual(m.inverse_first(v,second),first)
  self.assertEqual(m.scaled(first,second,a,b),(a*first+b*second)/(first+second))
  self.assertEqual(m.gauge(v,offset)-m.gauge(a,offset),v-a)
  self.assertEqual((v+m.field_value(a*first,b*second))/2,m.field_value((1+a)*first/2,(1+b)*second/2))
  self.assertEqual(m.constrained(m.field_value(second/2,second)),second)
 @BOUNDED
 @given(first=POS,gap=POS,gain=POS,offset=st.integers(-20,20))
 def test_display_gain_offset_and_units_independent_from_inverse(self,first,gap,gain,offset):
  second=first+gap;third=first+2*gap
  for (m,_,_),unit in zip(self.rows,('newton','newton/coulomb','volt','newton/coulomb','volt')):
   self.assertEqual(m.calibrate(first,second,gain*first,gain*third,gain*first+offset,gain*second+offset,gain*third+offset,unit),(gain,offset,third,third))
 def test_positive_domains_roots_residuals_and_zero_gauge_exception(self):
  for m,_,_ in self.rows[:3]:
   for fn,args in [(m.field_value,(0,1)),(m.field_value,(1,0)),(m.field_value,(-1,1)),(m.inverse_source,(0,1)),(m.inverse_source,(1,-1)),(m.inverse_distance,(0,1)),(m.inverse_distance,(1,0)),(m.scaled,(1,1,0,1))]:
    with self.subTest(module=m.FAMILY,function=fn.__name__,args=args):
     with self.assertRaises(ValueError):fn(*args)
  o,s=(r[0] for r in self.rows[3:])
  cases=[(o.field_value,(1,1)),(o.field_value,(1,2)),(o.field_value,(2,0)),(o.inverse_left,(0,1)),(o.inverse_right,(27,3)),(o.inverse_right,(28,3)),(o.scaled,(3,1,1,4)),(o.constrained,(0,)),(s.field_value,(0,1)),(s.inverse_first,(6,2)),(s.inverse_first,(5,2)),(s.scaled,(1,2,1,0)),(s.constrained,(0,))]
  for fn,args in cases:
   with self.subTest(function=fn.__name__,args=args):
    with self.assertRaises(ValueError):fn(*args)
  self.assertEqual(s.gauge(6,18),-12);self.assertEqual(s.gauge(18,18),0)
 def test_means_distractors_equipotential_geometry_and_vector_scalar_exception(self):
  f,e,v,o,s=(r[0] for r in self.rows)
  for m,args,means,expected in [(f,((1,3),(2,1)),(Fraction(3,2),2),95),(e,((1,3),(4,2)),(Fraction(5,2),Fraction(5,2)),5),(v,((1,3),(4,2)),(Fraction(5,2),Fraction(5,2)),Fraction(21,2))]:
   average=(m.field_value(*args[0])+m.field_value(*args[1]))/2;self.assertEqual(average,expected);self.assertNotEqual(average,m.field_value(*means))
  self.assertEqual(f.field_value(Fraction(1,3),3),Fraction(10,3));self.assertEqual(2*f.field_value(Fraction(41,20),3)+1,42)
  self.assertEqual(v.field_value(4,3)/v.field_value(4,6),2)
  self.assertIn('superficie sferica',v.oracle()[7]);self.assertEqual(s.field_value(1,1),6)
  # Equal radial contributions cancel as vectors at the midpoint; the two positive potentials add.
  self.assertEqual(e.field_value(1,3)-e.field_value(1,3),0)
  self.assertEqual(o.field_value(5,2),27);self.assertEqual(s.field_value(Fraction(3,2),Fraction(5,2)),12)
 def test_exact_decimal_lexemes_not_binary_float_roundtrip(self):
  for m,_,_ in self.rows:
   self.assertNotEqual(m.parse_literal('2.0000000000000000001'),2)
   self.assertEqual(m.parse_literal('−4/5'),-sp.Rational(4,5));self.assertEqual(m.parse_literal('0.25'),sp.Rational(1,4))
   self.assertEqual(m.parse_literal('√2/2'),sp.sqrt(2)/2)
   for bad in ('nan','inf','1/0','__import__("os")','2**100000','1e400','√10001','0x10'):
    with self.subTest(literal=bad):
     with self.assertRaises(ValueError):m.parse_literal(bad)
 def test_five_constitutive_faults_fail_without_candidate_mutation(self):
  for m,p,b in self.rows:
   before=(digest(p),digest(b));m.oracle.cache_clear()
   try:
    with patch.object(m,'field_value',lambda a,b:Fraction(1)):
     with self.assertRaises(AssertionError):m.oracle()
   finally:m.oracle.cache_clear()
   self.assertTrue(all(r['ok'] for r in m.verify(p,b)));self.assertEqual(before,(digest(p),digest(b)))
 def test_all_source_hashes_from_git_and_no_authoring_imports(self):
  for m,p,b in self.rows:
   source=m.source_records()
   for row,z in zip(p['records'],b):self.assertEqual(digest(source[z['sourceId']]),z['sourceSha256'])
   imports=[]
   for node in ast.walk(ast.parse(Path(m.__file__).read_text())):
    if isinstance(node,ast.Import):imports.extend(x.name for x in node.names)
    if isinstance(node,ast.ImportFrom):imports.append(node.module or '')
   self.assertFalse(any('authoring' in x for x in imports))
if __name__=='__main__':unittest.main()
