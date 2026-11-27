from pathlib import Path
import sys,json,unittest
from fractions import Fraction as F
from decimal import Decimal
import sympy as s
import pint
from hypothesis import given,settings,strategies as st
APP=Path(__file__).resolve().parents[3];sys.path.insert(0,str(APP))
from tools.corpus_engineering import c3_first_law_l06_primary_models_a as m
U=pint.UnitRegistry(non_int_type=F)
class Primary(unittest.TestCase):
 def test_twenty_manual_values(self):
  examples=[([-20,0,10,20,50],[-30,-10,0,10,40]),([-20,-2,0,2,30],[-240,-24,0,24,360]),([-20,-10,0,10,30],[-10,0,10,20,40]),([-1,F(-3,4),0,F(1,4),2],[-100,-75,0,25,200])]
  for identifier,(xs,ys)in zip(m.IDS,examples,strict=True):
   for x,y in zip(xs,ys,strict=True):self.assertEqual(m.law(identifier,x),y);self.assertEqual(m.inverse(identifier,y),x)
 def test_four_symbolic_balances(self):
  q,w,dt,dv=s.symbols('q w dt dv',real=True)
  self.assertEqual(s.simplify((q-10)+10-q),0);self.assertEqual(s.simplify(12*dt/12-dt),0)
  self.assertEqual(s.simplify((w+10)-w-10),0);self.assertEqual(s.simplify(100*dv/100-dv),0)
 def test_eight_exact_pint_conversions(self):
  for value,unit,target,want in [(1,'kilopascal*liter','joule',1),(100,'kilopascal*liter','joule',100),(-75,'kilopascal*liter','joule',-75),(12,'joule/kelvin','joule/kelvin',12),(F(1,4),'liter','meter**3',F(1,4000)),(100,'kilopascal','pascal',100000),(240,'joule','kilojoule',F(6,25)),(-24,'joule','kilojoule',F(-3,125))]:
   self.assertEqual((U.Quantity(value,unit)).to(target).magnitude,want)
 def test_invalid_before_arithmetic(self):
  bad=[True,False,.5,'1/2',float('inf'),float('-inf'),float('nan'),Decimal('NaN'),Decimal('Infinity'),s.I,s.oo,-s.oo,s.nan,s.Float(.5)]
  for identifier in m.IDS:
   for value in bad:
    with self.assertRaises(ValueError):m.law(identifier,value)
    with self.assertRaises(ValueError):m.inverse(identifier,value)
 def test_ranges_and_invalid_inverses(self):
  for identifier in m.IDS:
   for range_,fn in [(m.DOMAINS,m.law),(m.IMAGE,m.inverse)]:
    lo,hi=range_[identifier]
    for v in [F(lo)-F(1,100),F(hi)+F(1,100)]:
     with self.assertRaises(ValueError):fn(identifier,v)
 def test_wrong_model_counterexamples(self):
  self.assertEqual(m.law(m.IDS[0],10),0);self.assertNotEqual(10+10,0)
  self.assertEqual(m.law(m.IDS[1],0),0);self.assertNotEqual(12*F(27315,100),0)
  self.assertEqual(m.law(m.IDS[2],-10),0);self.assertNotEqual(10-(-10),0)
  self.assertEqual(m.law(m.IDS[3],F(-3,4)),-75);self.assertNotEqual(abs(-75),-75)
 def test_signed_heat_and_work(self):
  self.assertEqual(m.closed_system_balance(-20,10),-30);self.assertEqual(m.closed_system_balance(0,-10),10)
  self.assertEqual(m.volume_work(100,F(-3,4)),-75)
  for pressure in [0,-1]:
   with self.assertRaises(ValueError):m.volume_work(pressure,1)
 @settings(max_examples=200,derandomize=True,deadline=None)
 @given(st.sampled_from(m.IDS),st.integers(min_value=0,max_value=1000),st.integers(min_value=1,max_value=1000))
 def test_two_hundred_exact_roundtrips(self,identifier,num,den):
  lo,hi=m.DOMAINS[identifier];x=F(lo)+F(hi-lo)*F(num,1000);self.assertEqual(m.inverse(identifier,m.law(identifier,x)),x)
  lo,hi=m.IMAGE[identifier];y=F(lo)+F(hi-lo)*F(num,1000);self.assertEqual(m.law(identifier,m.inverse(identifier,y)),y)
run=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(Primary));raise SystemExit(not run.wasSuccessful())
