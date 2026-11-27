"""Independent C5 models from prompt-only primary370619; no authoring imports."""
from fractions import Fraction as F
from decimal import Decimal
from frozen_exact_arithmetic_literals import exact_literal
SPECS={
 'SIM-C5-L08-01':('6','8','1',('7','8'),('13','14'),'1'),
 'SIM-C5-L08-03':('1','3','1',('1','2'),('-2','1'),'1'),
 'SIM-C5-L09-01':('0','75','5',('20','50'),('40','100'),'°'),
 'SIM-C5-L10-01':('5','20','1',('5','20'),('20','5'),'m⁻¹'),
 'SIM-C5-L10-02':('5','25','1',('5','20'),('-10','5'),'diottrie')}
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
 if (require_grid or ident in['SIM-C5-L08-01','SIM-C5-L08-03'])and((x-lo)/step).denominator!=1:raise ValueError('Discrete or control-grid input required')
 if ident.endswith('L08-01'):return 6+x
 if ident.endswith('L08-03'):return {F(1):F(-2),F(2):F(1),F(3):F(0)}[x]
 if ident.endswith('L09-01'):return 2*x
 if ident.endswith('L10-01'):return 100/x
 return 10-100/x

def inverse(ident,y):
 y=exact(y)
 if ident not in SPECS:raise ValueError('Unknown activity')
 if ident.endswith('L08-01'):x=y-6
 elif ident.endswith('L08-03'):
  allowed={F(-2):F(1),F(1):F(2),F(0):F(3)}
  if y not in allowed:raise ValueError('No assigned single transition')
  x=allowed[y]
 elif ident.endswith('L09-01'):x=y/2
 elif ident.endswith('L10-01'):
  if y<=0:raise ValueError('Positive convergent-lens power required')
  x=100/y
 else:
  if y==10:raise ValueError('No finite object distance')
  x=100/(10-y)
 value(ident,x)
 return x

def verify_record(r):
 ident=r['id'];lo,hi,step,points,answers,unit=SPECS[ident]
 if type(r.get('baseVersion'))is not int or type(r.get('version'))is not int or r['baseVersion']!=1 or r['version']!=2:raise ValueError('Typed next edition required')
 if r['measure']['unit']!=unit:raise ValueError('Wrong output unit')
 if [exact(r['control'][k])for k in ['min','max','step']]!=list(map(exact,[lo,hi,step])):raise ValueError('Control domain changed')
 if [exact(x)for x in r['assessmentSelection']['points']]!=list(map(exact,points)):raise ValueError('Different manual points')
 if len(r['references'])!=2:raise ValueError('Two independent references required')
 for x,y in r['references']:
  if exact(y)!=value(ident,x,True):raise ValueError('Wrong reference')
 for x,y in zip(points,answers):
  if value(ident,x,True)!=exact(y)or inverse(ident,y)!=exact(x):raise ValueError('Wrong independent task/inverse')
 return True
