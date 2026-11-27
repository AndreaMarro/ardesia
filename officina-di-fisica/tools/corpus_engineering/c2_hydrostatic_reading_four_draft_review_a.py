"""Independent exact/domain/text review of four Root-owned drafts; no UI approval."""
from pathlib import Path
from fractions import Fraction
import json,math
import sympy as sp
import pint
from .pipeline import digest
APP=Path(__file__).resolve().parents[2]
BASE=APP/'editorial/reviews/c2-stevino-manometry-pascal-drafts-independent-a-20261127'
PINS={'SIM-C2-L002-02': '18a22ca154a2ebaf2b19856064b7953ed310d6906a86709264397d41af39dac9', 'SIM-C2-L002-03': '6415a41c72f383097e2f95aef2321971008cbb156bcfd5ac774e0de397b5b5fd', 'SIM-C2-L002-04': 'b7e17d592b1daa6131e5a10915378a2cb6def963baf9002d5885b2cc348bf7a5', 'SIM-C2-L003-01': 'f387b8257f084c6f65b046f2aa2d0a0726e78795cd9f41c0f1aedde332bfa925'}
IDS=tuple(PINS)
DOMAIN=dict(zip(IDS,[(0,3),(68,Fraction(544,5)),(-2,2),(0,10)]))
def exact(x):
 if type(x) not in (int,Fraction) and not isinstance(x,sp.Expr):raise ValueError('Exact real finite input before casts')
 s=sp.sympify(x)
 if s.is_number is not True or s.is_real is not True or s.is_finite is not True:raise ValueError('Exact real finite input')
 return s
def law(key,x):
 if key not in DOMAIN:raise ValueError('Outside reviewed four')
 x=exact(x);lo,hi=map(exact,DOMAIN[key])
 if not lo<=x<=hi:raise ValueError('Outside physical model domain')
 return {IDS[0]:lambda:10*(3-x),IDS[1]:lambda:sp.Rational(25,34)*x,IDS[2]:lambda:10*x,IDS[3]:lambda:2*x}[key]()
def inverse(key,y):
 y=exact(y)
 if key==IDS[0]:x=3-y/10
 elif key==IDS[1]:x=sp.Rational(34,25)*y
 elif key==IDS[2]:x=y/10
 elif key==IDS[3]:x=y/2
 else:raise ValueError('Outside scope')
 if sp.simplify(law(key,x)-y)!=0:raise ValueError('Inverse mismatch')
 return x
def compare_observation(key,x,y):
 if type(x)not in(int,float)or type(y)not in(int,float)or not math.isfinite(x)or not math.isfinite(y):raise ValueError('Finite raw actual observation')
 # Exact decimal lexemes of this independent JSON source observation, not float round-trips of model algebra.
 expected=law(key,Fraction(str(x)))
 if not math.isclose(float(expected),y,rel_tol=1e-12,abs_tol=1e-12):raise ValueError('Observed value differs from independent law')
 return expected
def validate(package,bindings,sources):
 if package.get('schema')!='astra/1'or package.get('assets')!=[]:raise ValueError('Existing astra/1 contract and no new assets required')
 records=package['records']
 if len(records)!=4 or [r['id']for r in records]!=list(IDS)or len(bindings)!=4:raise ValueError('Exact four unique editions')
 stable=['kind','course','skill','section','order','title','topic','anchor','apparatus','control','measure','references']
 for r,b in zip(records,bindings,strict=True):
  key=r['id'];s=sources[key]
  if b['sourceRef']!='5d1dc8dc7b601aef959d10d564c75462be74708d'or b['sourceId']!=key or b['id']!=key or b['sourceSha256']!=digest(s)or b['candidateSha256']!=digest(r)or digest(r)!=PINS[key]or b['assetChecksums']!={}:raise ValueError('Distinct read-edition identity drift')
  if type(r['version'])is not int or r['version']!=s['version']+1 or r['baseVersion']!=s['version']:raise ValueError('Individual original version must advance once')
  if any(r.get(k)!=s.get(k)for k in stable):raise ValueError('Stable original field altered')
  want=['C2-L001']if key!=IDS[3]else['C2-L002']
  if r['prerequisites']!=want:raise ValueError('Actual lesson dependency changed')
 return records
def report():
 p=json.loads((BASE/'experiment-c2-hydrostatic-reading-20261127.json').read_bytes());b=json.loads((BASE/'experiment-c2-hydrostatic-reading-20261127-bindings.json').read_bytes());sources={r['id']:r for r in json.loads((APP/'editorial/reviews/c2-density-pressure-five-1efc-independent-a-20261127/original-source.json').read_bytes())};records=validate(p,b,sources);node=json.loads((BASE/'actual-installed-node.json').read_bytes());out=[]
 if node['browser']!='NOT_RUN'or len(node['records'])!=4:raise ValueError('Read-only installed evidence required')
 U=pint.UnitRegistry(non_int_type=sp.Rational);Q=U.Quantity
 dimensions=[(Q(1000,'kg/m**3')*Q(10,'m/s**2')*Q(1,'m')).to('kPa'),(Q(13600,'kg/m**3')*Q(10,'m/s**2')*Q(sp.Rational(1,100),'m')).to('kPa'),(Q(1000,'kg/m**3')*Q(10,'m/s**2')*Q(sp.Rational(1,10),'m')).to('kPa'),(Q(1000,'Pa')*Q(sp.Rational(20,10000),'m**2')).to('N')]
 for r,n,dim in zip(records,node['records'],dimensions,strict=True):
  key=r['id'];points=r['assessmentSelection']['points']
  if n['id']!=key or len(n['assessment'])!=2:raise ValueError('Exactly two installed tasks per ID')
  tasks=[]
  for point,t in zip(points,n['assessment'],strict=True):
   want=law(key,Fraction(str(point)));actual=Fraction(str(t['value']))
   if sp.simplify(want-actual)!=0 or inverse(key,want)!=exact(Fraction(str(point))):raise ValueError('Actual selected task or inverse wrong')
   if t['unit']!=r['measure']['unit']:raise ValueError('Installed answer unit differs')
   tasks.append(dict(inputLexeme=str(point),independentExact=str(want),actual=t,unit=t['unit'],manualFeasible=True))
  for c in n['cases']:compare_observation(key,c['x'],c['y'])
  out.append(dict(id=key,sourceVersion=r['baseVersion'],draftVersion=r['version'],candidateSha256=digest(r),sourceSha256=digest(sources[key]),tasks=tasks,physicalDimensionCheck=str(dim),actualControlStates=len(n['cases']),manualAndTextReview='PASS_DISTINCT_AI_WITH_MODELS_REUSED_DISCLOSED',sourceVersionPreserved=True,prerequisiteReview='PASS_ACTUAL_C2_LESSONS_READ',UI='NOT_RUN',visualReview='PENDING_ACTUAL_DRAFT_BROWSER',activityCredit=0,humanApproval='NOT_RUN'))
 return dict(schemaVersion='1.0.0',reviewer='A_distinct_from_Root_author',draftCount=4,actualTaskCount=8,records=out,UI='NOT_RUN',activityCredit=0,humanApproval='NOT_RUN')
