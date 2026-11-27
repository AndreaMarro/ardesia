"""Source-first exact models for C3 L06: no candidate data or consumer import."""
from decimal import Decimal
from fractions import Fraction
import sympy as s
IDS=tuple('SIM-C3-L06-0'+str(i)for i in range(1,5))
DOMAINS={IDS[0]:(-20,50),IDS[1]:(-20,30),IDS[2]:(-20,30),IDS[3]:(-1,2)}
IMAGE={IDS[0]:(-30,40),IDS[1]:(-240,360),IDS[2]:(-10,40),IDS[3]:(-100,200)}
def exact(x):
 if type(x)is bool:raise ValueError('Boolean is not a physical number')
 if type(x)is int:return s.Integer(x)
 if isinstance(x,Fraction):return s.Rational(x.numerator,x.denominator)
 if isinstance(x,Decimal):
  if not x.is_finite():raise ValueError('Finite decimal required')
  return s.Rational(str(x))
 if isinstance(x,s.Basic)and x.is_number and x.is_real is True and x.is_finite is True and not x.has(s.Float):return x
 raise ValueError('Exact finite real required before arithmetic; float/string not allowed')
def bounded(identifier,x,ranges):
 if identifier not in IDS:raise ValueError('Unknown owned ID')
 v=exact(x);lo,hi=ranges[identifier]
 if not(lo<=v<=hi):raise ValueError('Outside the assigned physical control/image domain')
 return v
def law(identifier,x):
 v=bounded(identifier,x,DOMAINS)
 return {IDS[0]:lambda:v-10,IDS[1]:lambda:12*v,IDS[2]:lambda:v+10,IDS[3]:lambda:100*v}[identifier]()
def inverse(identifier,y):
 v=bounded(identifier,y,IMAGE)
 return {IDS[0]:lambda:v+10,IDS[1]:lambda:v/12,IDS[2]:lambda:v-10,IDS[3]:lambda:v/100}[identifier]()
def closed_system_balance(q,w):return exact(q)-exact(w)
def volume_work(p_kpa,delta_v_l):
 p=exact(p_kpa);dv=exact(delta_v_l)
 if p<=0:raise ValueError('Positive constant external/quasistatic pressure required')
 return p*dv
