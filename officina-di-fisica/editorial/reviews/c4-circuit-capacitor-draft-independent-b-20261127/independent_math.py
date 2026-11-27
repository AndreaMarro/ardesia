"""Rebuilt after reboot from primary8acd; no lost result is reused as evidence."""
from fractions import Fraction as F
from decimal import Decimal
from frozen_exact_arithmetic_literals import exact_literal
SPECS={
 'SIM-C4-L06-01':('2','12','1',('4','12'),('2','3'),'Ω'),
 'SIM-C4-L06-02':('0','4','0.25',('1','3'),('3','27'),'W'),
 'SIM-C4-L07-01':('1','8','0.5',('2','4'),('44.27','22.135'),'pF'),
 'SIM-C4-L07-02':('1','7','1',('2','5'),('4','10'),'nC'),
 'SIM-C4-L07-03':('0','8','0.5',('2','5'),('4','25'),'µJ'),
 'SIM-C4-L08-01':('1','8','1',('2','6'),('1','1.5'),'µF'),
 'SIM-C4-L08-02':('0','12','1',('3','9'),('1','3'),'V')}
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
 if ident.endswith('L06-01'):return 4*x/(4+x)
 if ident.endswith('L06-02'):return 3*x*x
 if ident.endswith('L07-01'):return F(4427,50)/x
 if ident.endswith('L07-02'):return 2*x
 if ident.endswith('L07-03'):return x*x
 if ident.endswith('L08-01'):return 2*x/(2+x)
 return x/3

def verify_record(r):
 ident=r['id'];lo,hi,step,points,answers,unit=SPECS[ident]
 if type(r.get('baseVersion'))is not int or type(r.get('version'))is not int or r['baseVersion']!=1 or r['version']!=2:raise ValueError('Typed next edition required')
 if r['measure']['unit']!=unit:raise ValueError('Wrong output unit')
 if [exact(r['control'][k])for k in ['min','max','step']]!=list(map(exact,[lo,hi,step])):raise ValueError('Control domain changed')
 if [exact(x)for x in r['assessmentSelection']['points']]!=list(map(exact,points)):raise ValueError('Different manual points')
 if len(r['references'])!=2:raise ValueError('Two task references required')
 for (x,y),point,answer in zip(r['references'],points,answers):
  if exact(x)!=exact(point)or exact(y)!=value(ident,point,True)or value(ident,point,True)!=exact(answer):raise ValueError('Reference differs from independent exact arithmetic')
 return True
