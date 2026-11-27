"""Exact manual laws from frozen primary5c1b, independent of candidate answer fields."""
from fractions import Fraction as F
from decimal import Decimal
import re
SPECS={
 'SIM-C4-L04-01':('0','10','1',('2','8'),('0','0'),'kV/m'),
 'SIM-C4-L04-02':('0','12','1',('3','9'),('1','3'),'kV/m'),
 'SIM-C4-L05-01':('0.5','5','0.5',('1','4'),('2','8'),'C'),
 'SIM-C4-L05-02':('2','12','1',('3','6'),('4','2'),'A'),
 'SIM-C4-L05-03':('-8','8','1',('-4','8'),('-1','2'),'A'),
 'SIM-C4-L05-04':('0.5','4','0.5',('1','2'),('2','1'),'A'),
 'SIM-C4-L05-05':('0.1','1','0.1',('0.2','0.8'),('0.4','1.6'),'Ω')}
def exact(x):
 if type(x)is bool or type(x)is float:raise ValueError('Exact real scalar required; no bool or binary float')
 if type(x)is F:return x
 if type(x)is int:
  if x.bit_length()>256:raise ValueError('Integer too large')
  return F(x)
 if type(x)is Decimal:
  if not x.is_finite()or abs(x.adjusted())>64 or len(x.as_tuple().digits)>128:raise ValueError('Finite bounded decimal required')
  return F(x)
 if type(x)is not str or len(x)>128 or not re.fullmatch(r'[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d{1,2})?|[+-]?\d+/[1-9]\d*',x):raise ValueError('Unsupported exact literal')
 try:
  y=F(x)
 except (ValueError,ZeroDivisionError)as e:raise ValueError('Invalid exact literal')from e
 if y.numerator.bit_length()>512 or y.denominator.bit_length()>512:raise ValueError('Scalar budget exceeded')
 return y
def value(ident,x,require_grid=False):
 if ident not in SPECS:raise ValueError('Unknown activity')
 x=exact(x);lo,hi,step,*_=SPECS[ident];lo,hi,step=map(exact,(lo,hi,step))
 if not lo<=x<=hi:raise ValueError('Outside declared domain')
 if require_grid and ((x-lo)/step).denominator!=1:raise ValueError('Not a legal control point')
 if ident.endswith('L04-01'):return F(0)
 if ident.endswith('L04-02'):return x/3
 if ident.endswith('L05-01'):return 2*x
 if ident.endswith('L05-02'):return 12/x
 if ident.endswith('L05-03'):return x/4
 if ident.endswith('L05-04'):return 2/x
 return 2*x

def verify_record(r):
 ident=r['id'];lo,hi,step,points,answers,unit=SPECS[ident]
 if type(r.get('baseVersion'))is not int or type(r.get('version'))is not int or r['baseVersion']!=1 or r['version']!=2:raise ValueError('Next typed edition required')
 if r['measure']['unit']!=unit:raise ValueError('Wrong result unit')
 if [exact(r['control'][k])for k in ['min','max','step']]!=list(map(exact,[lo,hi,step])):raise ValueError('Control changed')
 if [exact(x)for x in r['assessmentSelection']['points']]!=list(map(exact,points)):raise ValueError('Served points differ from frozen primary')
 if len(r['references'])!=2:raise ValueError('Two references required')
 for (x,y),point,answer in zip(r['references'],points,answers):
  if exact(x)!=exact(point)or exact(y)!=value(ident,point,True)or value(ident,point,True)!=exact(answer):raise ValueError('Independent reference calculation differs')
 return True
