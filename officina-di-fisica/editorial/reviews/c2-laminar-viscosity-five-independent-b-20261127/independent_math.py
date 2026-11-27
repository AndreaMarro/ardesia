"""Independent conditional fluid laws from frozen source-only primary35bf8a."""
from fractions import Fraction as F
from decimal import Decimal
import sympy as sp
from frozen_exact_arithmetic_literals import exact_literal
SPECS={
 'SIM-C2-L007-01':('0','0.6','0.05',('0.15','0.40'),('1500','4000'),'1'),
 'SIM-C2-L007-02':('0','4','0.25',('1','2'),('6','6'),'cm/s'),
 'SIM-C2-L007-03':('0.1','2','0.1',('0.5','1.5'),('2','6'),'Pa'),
 'SIM-C2-L007-04':('1','8','1',('2','5'),('20','8'),'s⁻¹'),
 'SIM-C2-L007-05':('0','1','0.05',('0.5','1'),('9','0'),'cm/s')}
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
 if require_grid and((x-lo)/step).denominator!=1:raise ValueError('Off control grid')
 if ident.endswith('01'):return 10000*x
 if ident.endswith('02'):return F(6)
 if ident.endswith('03'):return 4*x
 if ident.endswith('04'):return 40/x
 return 12*(1-x*x)

def inverse(ident,y):
 y=exact(y)
 if ident not in SPECS:raise ValueError('Unknown activity')
 if ident.endswith('01'):x=y/10000
 elif ident.endswith('02'):raise ValueError('Stationary reading does not identify an observation time')
 elif ident.endswith('03'):x=y/4
 elif ident.endswith('04'):
  if y<=0:raise ValueError('Positive gradient required')
  x=40/y
 else:
  if not 0<=y<=12:raise ValueError('Outside velocity profile')
  z=F(1)-y/12;root=sp.sqrt(sp.Rational(z.numerator,z.denominator))
  return F(int(root.p),int(root.q))if root.is_Rational else root
 value(ident,x)
 return x

def verify_record(r):
 ident=r['id'];lo,hi,step,points,answers,unit=SPECS[ident]
 if type(r.get('baseVersion'))is not int or type(r.get('version'))is not int or r['baseVersion']!=1 or r['version']!=2:raise ValueError('Typed next edition required')
 if r['skill']!='C2-L007':raise ValueError('Theoretical lesson mapping must remainC2-L007')
 if r['measure']['unit']!=unit:raise ValueError('Wrong output unit')
 if[exact(r['control'][k])for k in['min','max','step']]!=list(map(exact,[lo,hi,step])):raise ValueError('Control domain changed')
 if[exact(x)for x in r['assessmentSelection']['points']]!=list(map(exact,points)):raise ValueError('Manual points differ')
 if len(r['references'])!=2:raise ValueError('Two references required')
 for x,y in r['references']:
  if exact(y)!=value(ident,x,True):raise ValueError('Wrong independent reference')
 for x,y in zip(points,answers):
  if value(ident,x,True)!=exact(y):raise ValueError('Wrong manual answer')
  if not ident.endswith('02')and inverse(ident,y)!=exact(x):raise ValueError('Wrong inverse')
 return True
