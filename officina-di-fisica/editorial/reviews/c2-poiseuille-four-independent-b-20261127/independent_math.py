"""Physical Poiseuille ratios from frozen primary, with prior01/02model exposure disclosed."""
from fractions import Fraction as F
from decimal import Decimal
import sympy as sp
from frozen_exact_arithmetic_literals import exact_literal
SPECS={
 'SIM-C2-L008-01':('0.5','2','0.25',('2','0.5'),('16','0.0625'),'1'),
 'SIM-C2-L008-02':('1','4','1',('1','2'),('16','0.5'),'1'),
 'SIM-C2-L008-03':('0','8','0.5',('2.5','6'),('7.5','18'),'kPa'),
 'SIM-C2-L008-04':('-20','20','5',('-20','20'),('0.4096','2.0736'),'1')}
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
 if(require_grid or ident.endswith('02'))and((x-lo)/step).denominator!=1:raise ValueError('Discrete or control-grid input required')
 if ident.endswith('01'):return x**4
 if ident.endswith('02'):return {F(1):F(16),F(2):F(1,2),F(3):F(1,2),F(4):F(2)}[x]
 if ident.endswith('03'):return 3*x
 return(1+x/100)**4

def inverse(ident,y):
 y=exact(y)
 if ident not in SPECS:raise ValueError('Unknown activity')
 if ident.endswith('02'):
  choices={F(16):frozenset([F(1)]),F(1,2):frozenset([F(2),F(3)]),F(2):frozenset([F(4)])}
  if y not in choices:raise ValueError('No assigned single-parameter change')
  return choices[y]
 if ident.endswith('03'):x=y/3
 else:
  if y<=0:raise ValueError('Positive reference flow ratio required')
  root=sp.root(sp.Rational(y.numerator,y.denominator),4)
  x=root if ident.endswith('01')else 100*(root-1)
  if x.is_Rational:x=F(int(x.p),int(x.q))
 lo,hi,*_=SPECS[ident]
 if not exact(lo)<=x<=exact(hi):raise ValueError('Inverse outside input domain')
 return x

def verify_record(r):
 ident=r['id'];lo,hi,step,points,answers,unit=SPECS[ident]
 if type(r.get('baseVersion'))is not int or type(r.get('version'))is not int or r['baseVersion']!=1 or r['version']!=2:raise ValueError('Typed next edition required')
 if r['skill']!='C2-L008':raise ValueError('Poiseuille lesson mapping must remainC2-L008')
 if r['measure']['unit']!=unit:raise ValueError('Wrong output unit')
 if[exact(r['control'][k])for k in['min','max','step']]!=list(map(exact,[lo,hi,step])):raise ValueError('Control domain changed')
 if[exact(x)for x in r['assessmentSelection']['points']]!=list(map(exact,points)):raise ValueError('Manual points differ')
 if len(r['references'])!=2:raise ValueError('Two references required')
 for x,y in r['references']:
  if exact(y)!=value(ident,x,True):raise ValueError('Wrong independent reference')
 for x,y in zip(points,answers):
  if value(ident,x,True)!=exact(y):raise ValueError('Wrong manual answer')
  inv=inverse(ident,y)
  if ident.endswith('02'):
   if exact(x)not in inv:raise ValueError('Wrong categorical inverse set')
  elif inv!=exact(x):raise ValueError('Wrong inverse')
 return True
