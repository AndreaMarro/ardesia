"""Independent laws from frozen prompt-only primary c039d5; no author-module imports."""
from fractions import Fraction as F
from decimal import Decimal
import sympy as sp
from frozen_exact_arithmetic_literals import exact_literal
SPECS={
 'SIM-C4-L09-01':('-6','6','0.5',('5','-2'),('20','-8'),'µT',1),
 'SIM-C4-L09-03':('0.5','4','0.25',('3','1'),('4','12'),'cm',2),
 'SIM-C4-L10-01':('0','180','5',('120','60'),('-3','3'),'mWb',1),
 'SIM-C4-L10-02':('-4','4','0.5',('3','-2'),('-1.5','1'),'V',1),
 'SIM-C4-L10-03':('0.25','4','0.25',('2','0.5'),('-1','-4'),'V',1),
 'SIM-C4-L10-04':('-6','6','1',('6','-4'),('-3','2'),'A',1)}
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

def value(ident,x,require_grid=False):
 if ident not in SPECS:raise ValueError('Unknown activity')
 x=exact(x);lo,hi,step,*_=SPECS[ident];lo,hi,step=map(exact,(lo,hi,step))
 if not lo<=x<=hi:raise ValueError('Outside declared domain')
 if require_grid and ((x-lo)/step).denominator!=1:raise ValueError('Off control grid')
 if ident.endswith('L09-01'):return 4*x
 if ident.endswith('L09-03'):return 12/x
 if ident.endswith('L10-01'):return sp.simplify(6*sp.cos(sp.pi*sp.Rational(x.numerator,x.denominator)/180))
 if ident.endswith('L10-03'):return -2/x
 return -x/2

def inverse(ident,y):
 y=exact(y)
 if ident not in SPECS:raise ValueError('Unknown activity')
 if ident.endswith('L09-01'):x=y/4
 elif ident.endswith('L09-03'):
  if y<=0:raise ValueError('Positive radius required')
  x=12/y
 elif ident.endswith('L10-03'):
  if y>=0:raise ValueError('Negative average emf required')
  x=-2/y
 elif ident.endswith('L10-01'):
  # Exact manual inverse on the declared named-angle tasks; no approximate acos.
  angles={F(-6):F(180),F(-3):F(120),F(0):F(90),F(3):F(60),F(6):F(0)}
  if y not in angles:raise ValueError('Named exact-angle inverse required')
  x=angles[y]
 else:x=-2*y
 value(ident,x)
 return x

def verify_record(r):
 ident=r['id'];lo,hi,step,points,answers,unit,base=SPECS[ident]
 if type(r.get('baseVersion'))is not int or type(r.get('version'))is not int or r['baseVersion']!=base or r['version']!=base+1:raise ValueError('Typed individual next edition required')
 if r['measure']['unit']!=unit:raise ValueError('Wrong output unit')
 if [exact(r['control'][k])for k in ['min','max','step']]!=list(map(exact,[lo,hi,step])):raise ValueError('Control domain changed')
 if [exact(x)for x in r['assessmentSelection']['points']]!=list(map(exact,points)):raise ValueError('Different manual points')
 if len(r['references'])!=2:raise ValueError('Two independent reference checks required')
 for x,y in r['references']:
  if exact(y)!=value(ident,x,True):raise ValueError('Reference differs from independent exact law')
 for x,y in zip(points,answers):
  if value(ident,x,True)!=exact(y) or inverse(ident,y)!=exact(x):raise ValueError('Manual task or inverse differs')
 return True
