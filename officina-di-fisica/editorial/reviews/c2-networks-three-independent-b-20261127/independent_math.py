"""Network laws derived from primary before DRAFT blocks; no consumer imports."""
from fractions import Fraction as F
from decimal import Decimal
from frozen_exact_arithmetic_literals import exact_literal
SPECS={
 'SIM-C2-L009-01':('1','8','1',('2','6'),('1','1.5'),'kPa·s/mL'),
 'SIM-C2-L009-02':('1','8','1',('3','6'),('4','2'),'mL/s'),
 'SIM-C2-L009-03':('1','8','1',('2','6'),('5','7.5'),'kPa')}
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
 if not lo<=x<=hi:raise ValueError('Outside control domain')
 if require_grid and ((x-lo)/step).denominator!=1:raise ValueError('Off control grid')
 if ident.endswith('01'):return 2*x/(2+x)
 if ident.endswith('02'):return 12/x
 return 10*x/(2+x)
def inverse(ident,y):
 if ident not in SPECS:raise ValueError('Unknown activity')
 y=exact(y)
 if ident.endswith('01'):
  if not 0<y<2:raise ValueError('Positive equivalent below two')
  x=2*y/(2-y)
 elif ident.endswith('02'):
  if y<=0:raise ValueError('Positive flow required')
  x=12/y
 else:
  if not 0<y<10:raise ValueError('Node pressure strictly between endpoints')
  x=2*y/(10-y)
 lo,hi,*_=SPECS[ident]
 if not exact(lo)<=x<=exact(hi):raise ValueError('Inverse outside input domain')
 return x
def verify_record(r):
 ident=r['id'];lo,hi,step,pts,answers,unit=SPECS[ident]
 if type(r.get('baseVersion'))is not int or type(r.get('version'))is not int or r['baseVersion']!=1 or r['version']!=2:raise ValueError('Typed next edition required')
 if r['skill']!='C2-L009':raise ValueError('Wrong theoretical lesson')
 if r['measure']['unit']!=unit:raise ValueError('Wrong physical output unit')
 if [exact(r['control'][k])for k in ['min','max','step']]!=list(map(exact,[lo,hi,step])):raise ValueError('Control domain changed')
 if [exact(v)for v in r['assessmentSelection']['points']]!=list(map(exact,pts)):raise ValueError('Manual task points differ')
 if len(r['references'])!=2:raise ValueError('Two references required')
 for x,y in r['references']:
  if exact(y)!=value(ident,x,True):raise ValueError('Wrong independent reference')
 for x,y in zip(pts,answers):
  if value(ident,x,True)!=exact(y)or inverse(ident,y)!=exact(x):raise ValueError('Manual forward/inverse mismatch')
 return True
