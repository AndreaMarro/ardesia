"""Independent thermal transport laws and hostile rebinding; no authoring imports."""
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
POS=st.builds(Fraction,st.integers(1,40),st.integers(1,12))
BOUNDED=settings(max_examples=40,derandomize=True,deadline=None)
NAMES=('plane_conduction','composite_wall_series','parallel_thermal_panels','interface_temperature','convective_loss')
class ThermalTransferIndependent(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.rows=[]
  for name in NAMES:
   m=importlib.import_module('tools.corpus_engineering.'+name+'_verifier')
   p=json.loads((APP/'editorial/batches'/(m.BATCH+'.json')).read_bytes());b=json.loads((APP/'editorial/batches'/(m.BATCH+'-bindings.json')).read_bytes())
   cls.rows.append((m,p,b))
 def test_fresh_saved_identity_and_modes(self):
  primary=APP/'editorial/reviews/u5-transfer-178-182-primary-source-only.md'
  for m,p,b in self.rows:
   fresh=m.report(p,b);saved=json.loads((APP/'editorial/reviews'/(m.BATCH+'.json')).read_bytes());self.assertEqual(fresh,saved)
   for result in (fresh,saved):
    assert_record_identity(result['records'],m.EXPECTED_IDS,p,b)
    self.assertEqual(len(result['records']),16);self.assertTrue(all(r['ok'] for r in result['records']))
    self.assertTrue(all(r['verificationMode'] in ('EXACT_ORACLE','AI_CONCEPTUAL') for r in result['records']))
    self.assertEqual(result['verifierSha256'],sha(Path(m.__file__).read_bytes()))
    self.assertEqual(result['contractSha256'],sha(Path(m.__file__).with_name('review_contract.py').read_bytes()))
    self.assertEqual(result['primaryBeforeCandidateKeys']['sha256'],sha(primary.read_bytes()))
    self.assertEqual(result['packageSha256'],m.REVIEWED_PACKAGE_SHA256);self.assertEqual(result['bindingsSha256'],m.REVIEWED_BINDINGS_SHA256)
    self.assertEqual(result['humanApproval'],'NOT_RUN');self.assertEqual(result['publication'],'DRAFT')
 def test_hostile_rebindings_and_physical_scale(self):
  for m,p,b in self.rows:
   before=(digest(p),digest(b),dict(m.REVIEWED_CANDIDATES),m.REVIEWED_PACKAGE_SHA256,m.REVIEWED_BINDINGS_SHA256)
   audit=m.mutation_audit(p,b,APP/'editorial/assets');self.assertEqual(audit['caseCount'],26);self.assertTrue(audit['allRejected'])
   self.assertEqual(sum(x['case']=='wrong_key_rebound_and_all_edition_tokens_replaced' for x in audit['cases']),16)
   self.assertEqual(before,(digest(p),digest(b),dict(m.REVIEWED_CANDIDATES),m.REVIEWED_PACKAGE_SHA256,m.REVIEWED_BINDINGS_SHA256))
 def test_identity_boundary_rejects_corrupt_saved_records(self):
  for m,p,b in self.rows:
   original=m.report(p,b)['records']
   for field,value in [('verificationMode','AI_SCIENTIFIC_PASS'),('candidateSha256','0'*64),('sourceSha256','0'*64),('humanApproval','PASS'),('publication','PUBLISHED')]:
    records=deepcopy(original);records[0][field]=value
    with self.assertRaises(ValueError):assert_record_identity(records,m.EXPECTED_IDS,p,b)
 @BOUNDED
 @given(k=POS,d=POS,a=POS,b=POS)
 def test_fourier_dimensions_inverses_scaling_and_constraint(self,k,d,a,b):
  m=self.rows[0][0];p=m.power(k,d)
  self.assertEqual(p,k*d);self.assertEqual(m.inverse_k(p,d),k);self.assertEqual(m.inverse_delta(p,k),d)
  self.assertEqual(m.scaled(k,d,a,b),a*b);self.assertEqual(m.constrained(p,k/d),sp.Rational(d))
  self.assertEqual(m.SI.Quantity(Fraction(1,100),'meter**2')/m.SI.Quantity(Fraction(1,100),'meter'),m.SI.Quantity(1,'meter'))
 @BOUNDED
 @given(l1=POS,l2=POS,a=POS,b=POS)
 def test_series_common_flux_both_inverses_and_resistance_weighting(self,l1,l2,a,b):
  m=self.rows[1][0];p=m.power(l1,l2)
  self.assertEqual(p*(l1+l2/2),60);self.assertEqual(m.inverse_l1(p,l2),l1);self.assertEqual(m.inverse_l2(p,l1),l2)
  self.assertEqual(m.scaled(l1,l2,a,b),(l1+l2/2)/(a*l1+b*l2/2))
  self.assertEqual(m.scaled(l1,l2,a,a),1/a)
  self.assertEqual(m.constrained(m.power(l2/2,l2)),l2)
 @BOUNDED
 @given(first=POS,gap=POS,gain=POS,offset=st.integers(-20,20))
 def test_display_calibration_exact_gain_offset_and_units(self,first,gap,gain,offset):
  second=first+gap;third=first+2*gap
  for m,_,_ in self.rows:
   unit='dimensionless' if m.FAMILY=='interface-temperature' else 'watt'
   self.assertEqual(m.calibrate(first,second,gain*first,gain*third,gain*first+offset,gain*second+offset,gain*third+offset,unit),(gain,offset,third,third))
 def test_physical_domains_and_positive_residual(self):
  f,s=(r[0] for r in self.rows[:2])
  cases=[(f.power,(0,1)),(f.power,(1,-1)),(f.inverse_k,(0,1)),(f.inverse_delta,(1,0)),(f.scaled,(1,1,-1,1)),(f.constrained,(1,0)),(s.power,(0,1)),(s.power,(1,-1)),(s.inverse_l1,(30,4)),(s.inverse_l1,(60,4)),(s.inverse_l2,(30,2)),(s.inverse_l2,(60,2)),(s.scaled,(1,1,0,1)),(s.constrained,(0,))]
  for fn,args in cases:
   with self.subTest(function=fn.__name__,args=args):
    with self.assertRaises(ValueError):fn(*args)
 def test_means_counterproofs_and_separate_conceptual_reading(self):
  f,s=(r[0] for r in self.rows[:2])
  self.assertEqual((f.power(2,10)+f.power(4,20))/2,50);self.assertEqual(f.power(3,15),45)
  self.assertEqual((s.power(1,2)+s.power(2,4))/2,Fraction(45,2));self.assertEqual(s.power(Fraction(3,2),3),20)
  self.assertEqual(2*f.power(Fraction(81,20),10)+1,82)
  self.assertEqual(2*s.power(Fraction(79,41),2)+1,42)
  self.assertEqual(f.oracle()[2],'Trasferimento microscopico nel materiale senza moto macroscopico della parete')
  self.assertEqual(s.oracle()[2],'P = ΔT / (R₁ + R₂)')
 @BOUNDED
 @given(a1=POS,a2=POS,a=POS,b=POS)
 def test_parallel_power_sum_positive_inverses_linearity_and_scale(self,a1,a2,a,b):
  m=self.rows[2][0];p=m.power(a1,a2)
  self.assertEqual(p,10*a1+20*a2)
  self.assertEqual(m.inverse_a1(p,a2),a1);self.assertEqual(m.inverse_a2(p,a1),a2)
  self.assertEqual(m.scaled(a1,a2,a,b),(a*a1+2*b*a2)/(a1+2*a2))
  self.assertEqual(m.scaled(a1,a2,a,a),a)
  self.assertEqual((m.power(a1,a2)+m.power(a*a1,b*a2))/2,m.power((1+a)*a1/2,(1+b)*a2/2))
  self.assertEqual(m.constrained(m.power(a1,a1)),a1)
 def test_parallel_domain_and_offset_counterproof(self):
  m=self.rows[2][0]
  for fn,args in [(m.power,(0,1)),(m.power,(1,0)),(m.inverse_a1,(20,1)),(m.inverse_a1,(10,1)),(m.inverse_a2,(10,1)),(m.inverse_a2,(5,1)),(m.scaled,(1,1,1,-1)),(m.constrained,(0,))]:
   with self.subTest(function=fn.__name__,args=args):
    with self.assertRaises(ValueError):fn(*args)
  self.assertEqual(2*m.power(Fraction(41,20),1)+1,82)
  self.assertEqual(m.oracle()[2],'P = ΔT (G₁ + G₂)')
 @BOUNDED
 @given(hot=POS,cold=POS,a=POS,b=POS)
 def test_interface_shared_power_inverses_scale_and_Celsius_reference(self,hot,cold,a,b):
  m=self.rows[3][0];theta=m.reading(hot,cold)
  self.assertTrue(0<theta<100)
  self.assertEqual(theta/cold,(100-theta)/hot)
  self.assertEqual(m.inverse_hot(theta,cold),hot);self.assertEqual(m.inverse_cold(theta,hot),cold)
  self.assertEqual(m.scaled(hot,cold,a,b),b*(hot+cold)/(a*hot+b*cold))
  self.assertEqual(m.scaled(hot,cold,a,a),1);self.assertEqual(m.common_resistance_reading(hot),50)
  absolute=m.SI.Quantity(theta,'degC').to('kelvin').magnitude
  self.assertEqual(Fraction(absolute),theta+Fraction(5463,20))
 @BOUNDED
 @given(h=POS,delta=POS,a=POS,delta_b=POS)
 def test_convection_air_reference_inverses_scaled_readings_and_constraint(self,h,delta,a,delta_b):
  m=self.rows[4][0];theta=20+delta;p=m.power(h,theta)
  self.assertEqual(p,h*delta);self.assertEqual(m.inverse_h(p,theta),h);self.assertEqual(m.inverse_theta(p,h),theta)
  b=(20+delta_b)/theta
  self.assertEqual(m.scaled(h,theta,a,b),a*delta_b/delta)
  self.assertEqual(m.constrained(p,h/theta),sp.Rational(theta))
 def test_interface_convection_domains_and_specific_counterproofs(self):
  i,c=(r[0] for r in self.rows[3:])
  cases=[(i.reading,(0,1)),(i.reading,(1,-1)),(i.inverse_hot,(0,1)),(i.inverse_hot,(100,1)),(i.inverse_hot,(101,1)),(i.inverse_hot,(50,0)),(i.inverse_cold,(0,1)),(i.inverse_cold,(100,1)),(i.inverse_cold,(50,-1)),(i.scaled,(1,1,-1,1)),(i.common_resistance_reading,(0,)),(c.power,(0,30)),(c.power,(5,20)),(c.power,(5,10)),(c.inverse_h,(0,30)),(c.inverse_h,(50,20)),(c.inverse_theta,(0,5)),(c.inverse_theta,(50,0)),(c.scaled,(5,30,1,Fraction(1,2))),(c.constrained,(0,1)),(c.constrained,(50,-1))]
  for fn,args in cases:
   with self.subTest(function=fn.__name__,args=args):
    with self.assertRaises(ValueError):fn(*args)
  self.assertEqual((i.reading(1,1)+i.reading(2,3))/2,55);self.assertEqual(i.reading(Fraction(3,2),2),Fraction(400,7))
  self.assertEqual(2*i.reading(Fraction(149,51),1)+1,52)
  self.assertEqual((c.power(5,30)+c.power(10,40))/2,125);self.assertEqual(c.power(Fraction(15,2),35),Fraction(225,2))
  self.assertEqual(2*c.power(Fraction(201,20),30)+1,202)
  self.assertEqual(c.constrained(50,Fraction(1,6)),30)
  self.assertEqual(i.oracle()[15],'Infinite: ogni R_h=R_c>0')
  wrong=(c.SI.Quantity(1,'kelvin')/(c.SI.Quantity(1,'watt/meter**2/kelvin')*c.SI.Quantity(1,'meter**2'))).to('kelvin**2/watt')
  self.assertEqual(wrong.magnitude,1)
 def test_five_independent_constitutive_faults_rejected_without_candidate_changes(self):
  defects=[('power',lambda k,d:Fraction(k)/Fraction(d)),('power',lambda l1,l2:60/(Fraction(l1)-Fraction(l2)/3)),('power',lambda a1,a2:10*Fraction(a1)*2*Fraction(a2)),('reading',lambda h,c:100*Fraction(h)/(Fraction(h)+Fraction(c))),('power',lambda h,t:Fraction(h)*Fraction(t))]
  for (m,p,b),(name,wrong) in zip(self.rows,defects):
   before=(digest(p),digest(b));m.oracle.cache_clear()
   try:
    with patch.object(m,name,wrong):
     with self.assertRaises(AssertionError):m.oracle()
   finally:m.oracle.cache_clear()
   self.assertTrue(all(r['ok'] for r in m.verify(p,b)))
   self.assertEqual(before,(digest(p),digest(b)))
 def test_source_hashes_against_actual_git_and_no_author_imports(self):
  for m,p,b in self.rows:
   source=m.source_records()
   for row,z in zip(p['records'],b):self.assertEqual(digest(source[z['sourceId']]),z['sourceSha256'])
   imports=[]
   for node in ast.walk(ast.parse(Path(m.__file__).read_text())):
    if isinstance(node,ast.Import):imports.extend(x.name for x in node.names)
    if isinstance(node,ast.ImportFrom):imports.append(node.module or '')
   self.assertFalse(any('authoring' in x for x in imports))
   self.assertEqual(m.parse_literal('−4/5'),-sp.Rational(4,5))
   for val in ('nan','inf','1/0','1+1','1/2/3','__import__("os")','2**100000'):
    with self.assertRaises(ValueError):m.parse_literal(val)
if __name__=='__main__':unittest.main()
