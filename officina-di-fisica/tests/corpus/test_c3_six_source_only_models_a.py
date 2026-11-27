import json,sys,unittest
from decimal import Decimal
from pathlib import Path
import sympy as s
import pint
from hypothesis import given,settings,strategies as st
APP=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(APP/'tools/corpus_engineering'))
import c3_six_heat_phase_primary_models_a as m
class SourceModels(unittest.TestCase):
 def test_all_142_grid_values_and_inverse(self):
  count=0
  for identifier,xs in m.grids():
   ys=[m.law(identifier,x) for x in xs]
   self.assertTrue(all(y.is_finite and y.is_real for y in ys))
   self.assertTrue(all(a<=b for a,b in zip(ys,ys[1:])))
   for x,y in zip(xs,ys):
    inv=m.inverse(identifier,y)
    if isinstance(inv,tuple): self.assertTrue(inv[0]<=x<=inv[1])
    else: self.assertEqual(s.simplify(inv-x),0)
   count+=len(xs)
  self.assertEqual(count,142)
 def test_12_frozen_original_references(self):
  source=APP/'editorial/reviews/c3-six-heat-phase-source-primary-a-20261127/source-prompt-data-only.json'
  rows=json.loads(source.read_text(),parse_float=Decimal)
  self.assertEqual(len(rows),6)
  for row in rows:
   for x,y in row['references']: self.assertEqual(s.simplify(m.law(row['id'],x)-m.exact(y)),0)
 def test_symbolic_balances(self):
  x,T,c=s.symbols('x T c',positive=True)
  tf=(80*x+4000)/(x+200)
  self.assertEqual(s.simplify(x*c*(80-tf)-200*c*(tf-20)),0)
  shift=s.Rational(27315,100)
  self.assertEqual(s.simplify((x*(80+shift)+200*(20+shift))/(x+200)-tf-shift),0)
  self.assertEqual(s.simplify(s.diff(tf,x)-12000/(x+200)**2),0)
  n,R,dt,cv=s.symbols('n R dt cv',positive=True)
  self.assertEqual(s.expand(n*(cv+R)*dt-n*cv*dt-n*R*dt),0)
  self.assertEqual(100*2*10/1000,2)
  self.assertEqual(100*340/1000,34)
  self.assertEqual(m.law(m.IDS[5],2),0)
  self.assertEqual(m.law(m.IDS[5],36),100)
  self.assertEqual(s.Rational(50,17)*(36-2),100)
 def test_pint_dimensions(self):
  u=pint.UnitRegistry(non_int_type=Decimal)
  q=u.Quantity
  checks=[(q(50,'joule/kelvin')*q(2,'kelvin'),'joule',100),
   (q(Decimal('8.314'),'joule/mol/kelvin')*q(1,'mol')*q(2,'kelvin'),'joule',s.Rational(4157,250)),
   (q(Decimal('8.35'),'kilojoule')/q(334,'joule/gram'),'gram',25),
   (q(Decimal('2.26'),'kilojoule/gram')*q(-2,'gram'),'kilojoule',-s.Rational(113,25)),
   (q(100,'gram')*q(2,'joule/gram/kelvin')*q(10,'kelvin'),'kilojoule',2),
   (q(100,'gram')*q(340,'joule/gram'),'kilojoule',34)]
  for value,unit,expected in checks:
   self.assertEqual(s.simplify(m.exact(value.to(unit).magnitude)-expected),0)
 def test_reject_nonexact_nonfinite_complex_and_invalid_domains(self):
  invalid=(True,False,0.1,'1',s.I,s.oo,-s.oo,s.nan,Decimal('NaN'),Decimal('Infinity'))
  for identifier,(lo,hi,step) in zip(m.IDS,m.DOMAINS):
   for x in invalid:
    with self.assertRaises(ValueError): m.law(identifier,x)
    with self.assertRaises(ValueError): m.inverse(identifier,x)
   for x in (s.sympify(lo)-step,s.sympify(hi)+step):
    with self.assertRaises(ValueError): m.law(identifier,x)
 def test_countermodels_are_distinguished(self):
  self.assertNotEqual(m.law(m.IDS[1],10),s.Rational(5,2)*s.Rational(4157,500)*10)
  self.assertNotEqual(m.law(m.IDS[2],100),50)
  self.assertNotEqual(m.law(m.IDS[3],s.Rational(167,10)),s.Rational(16700,340))
  self.assertNotEqual(m.law(m.IDS[4],-2),s.Rational(113,25))
  self.assertNotEqual(m.law(m.IDS[5],19),s.Rational(950,17))
  self.assertEqual(m.inverse(m.IDS[5],0),(0,2))
  self.assertEqual(m.inverse(m.IDS[5],100),(36,54))
 @settings(max_examples=240,deadline=None,derandomize=True)
 @given(st.integers(min_value=0,max_value=5),st.integers(min_value=0,max_value=10000))
 def test_hypothesis_exact_grid_inverse(self,i,k):
  identifier=m.IDS[i];lo,hi,step=m.DOMAINS[i]
  x=s.sympify(lo)+step*(k%(int((hi-lo)/step)+1))
  y=m.law(identifier,x);inv=m.inverse(identifier,y)
  if isinstance(inv,tuple): self.assertTrue(inv[0]<=x<=inv[1])
  else: self.assertEqual(s.simplify(inv-x),0)
if __name__=='__main__': unittest.main(verbosity=2)
