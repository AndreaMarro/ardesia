"""Surface-force, geometry, capillarity and Laplace from frozen independent primary."""
from fractions import Fraction as F
from decimal import Decimal
import sympy as sp
from frozen_exact_arithmetic_literals import exact_literal
SPECS={
 'SIM-C2-L010-01':('0.5','5','0.5',('1.5','4'),('1.5','4'),'mN'),
 'SIM-C2-L010-02':('0.5','4','0.5',('0.5','3'),('6','1'),'mm⁻¹'),
 'SIM-C2-L010-03':('0','180','5',('60','120'),('5','-5'),'mm'),
 'SIM-C2-L010-04':('0','2','0.25',('0','1.5'),('0','150'),'Pa'),
 'SIM-C2-L010-05':('1','8','1',('2','8'),('100','25'),'Pa')}
def exact(x):
 if type(x)is bool or type(x)is float:raise ValueError('Exact literal required; no binary float or bool')
 if type(x)is F:return x
 if type(x)is Decimal:
  if not x.is_finite()or abs(x.adjusted())>64:raise ValueError('Finite bounded decimal required')
  raw=format(x,'f')
 elif type(x)is int:raw=str(x)
 elif type(x)is str:raw=x
 else:raise ValueError('Unsupported scalar type')
 try:y=exact_literal(raw)
 except (ValueError,SyntaxError,TypeError,OverflowError)as e:raise ValueError('Unsupported exact literal')from e
 if y.is_Rational is not True:raise ValueError('Rational scalar required')
 a,b=y.as_numer_denom();return F(int(a),int(b))




def scalar(x):
 if isinstance(x,sp.Expr):
  if x.has(sp.Float)or x.is_number is not True or x.is_real is not True or x.is_finite is not True or x.free_symbols or sp.count_ops(x)>100:raise ValueError('Finite exact real number required')
  return x
 return exact(x)
def value(ident,x,require_grid=False):
 if ident not in SPECS:raise ValueError('Unknown activity')
 x=exact(x);lo,hi,step,*_=SPECS[ident];lo,hi,step=map(exact,(lo,hi,step))
 if not lo<=x<=hi:raise ValueError('Outside control domain')
 if require_grid and ((x-lo)/step).denominator!=1:raise ValueError('Off control grid')
 if ident.endswith('01'):return x
 if ident.endswith('02'):return 3/x
 if ident.endswith('03'):return sp.simplify(10*sp.cos(sp.pi*sp.Rational(x.numerator,x.denominator)/180))
 if ident.endswith('04'):return 100*x
 return 200/x
def inverse(ident,y):
 if ident not in SPECS:raise ValueError('Unknown activity')
 y=scalar(y)
 if ident.endswith('01'):x=y
 elif ident.endswith('02'):
  if y<=0:raise ValueError('Positive area/volume required')
  x=3/y
 elif ident.endswith('03'):
  if not -10<=y<=10:raise ValueError('Capillary head outside assigned coefficient')
  x=sp.simplify(180*sp.acos(sp.Rational(y.numerator,y.denominator)/10 if isinstance(y,F)else y/10)/sp.pi)
 elif ident.endswith('04'):x=y/100
 else:
  if y<=0:raise ValueError('Positive excess pressure required')
  x=200/y
 lo,hi,*_=SPECS[ident]
 if not exact(lo)<=x<=exact(hi):raise ValueError('Inverse outside input domain')
 return x
def verify_record(r):
 ident=r['id'];lo,hi,step,pts,answers,unit=SPECS[ident]
 if type(r.get('baseVersion'))is not int or type(r.get('version'))is not int or r['baseVersion']!=1 or r['version']!=2:raise ValueError('Typed next edition required')
 if r['skill']!='C2-L010':raise ValueError('Wrong theoretical lesson')
 if r['measure']['unit']!=unit:raise ValueError('Wrong physical output unit')
 if [exact(r['control'][k])for k in ['min','max','step']]!=list(map(exact,[lo,hi,step])):raise ValueError('Control domain changed')
 if [exact(v)for v in r['assessmentSelection']['points']]!=list(map(exact,pts)):raise ValueError('Manual task points differ')
 if len(r['references'])!=2:raise ValueError('Two references required')
 for x,y in r['references']:
  if scalar(y)!=value(ident,x,True):raise ValueError('Wrong independent reference')
 for x,y in zip(pts,answers):
  if value(ident,x,True)!=exact(y)or inverse(ident,y)!=exact(x):raise ValueError('Manual forward/inverse mismatch')
 return True
