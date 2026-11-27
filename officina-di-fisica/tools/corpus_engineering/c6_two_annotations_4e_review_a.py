"""Independent bounded C6 annotation review; original physics, no blanket closure."""
from pathlib import Path
from fractions import Fraction
import json,hashlib,math,re
APP=Path(__file__).resolve().parents[2]
BASE=APP/'editorial/reviews/c6-two-annotations-4e-independent-a-20261127'
CANDIDATE='03f9634d7d6a8dcfe9161990c4d5dbc62e3773f5'
RUNTIME='4e753b9dbfa1f0062cdcc10d7a6f6f9ec83c4bd69bda9e4f276c3757e8dbba3b'
LIMITS={'L01-01':(0,20),'L02-01':(0,40),'L03-01':(0,100),'L04-01':(0,5),'L05-01':(0,4),'L06-01':(Fraction(1,2),3)}

def exact(key,x):
 if key.startswith('SIM-C6-'):key=key[7:]
 if key not in LIMITS:raise ValueError('One explicit original C6 ID required')
 if type(x)not in(int,float,Fraction)or (type(x)is float and not math.isfinite(x)):raise ValueError('Finite real before conversion required')
 x=Fraction(str(x));lo,hi=LIMITS[key]
 if not lo<=x<=hi or (key=='L04-01'and x.denominator!=1):raise ValueError('Original physical domain required')
 return {'L01-01':lambda:Fraction(17,100)*x,'L02-01':lambda:x/8,'L03-01':lambda:x/50,'L04-01':lambda:Fraction(120,2**int(x)),'L05-01':lambda:2*x if x<=2 else 6-x,'L06-01':lambda:1-1/x}[key]()

def scalar_observation(key,x,y):
 if type(y)not in(int,float)or not math.isfinite(y):raise ValueError('Finite observed scalar required')
 want=exact(key,x)
 # Same original C6 observation comparator (source snapshot is transported):
 # relative1e-10; absolute1e-10 only at an exact zero. No widened tolerance.
 if not math.isclose(y,float(want),rel_tol=1e-10,abs_tol=1e-10 if want==0 else 0):raise ValueError('Independent exact C6 equation rejects observation')
 return want

def scene_contract(c):
 x=Fraction(str(c['sourceReplayedX']));arrows=[e for e in c['elements']if e['kind']=='arrow']
 def equal(a,b):return all(math.isclose(u,float(v),rel_tol=1e-10,abs_tol=1e-10 if v==0 else 0)for u,v in zip(a,b))
 if c['id']=='SIM-C6-L02-01':
  if x==0:
   if arrows:raise ValueError('Zero flow has no directed arrows')
  else:
   if len(arrows)!=2:raise ValueError('Both section velocities required')
   for arrow,tail in zip(arrows,[Fraction(-217,100),Fraction(11,25)]):
    if not equal(arrow['a'],[tail,Fraction(21,20),0])or not equal(arrow['b'],[tail+x/40,Fraction(21,20),0]):raise ValueError('Wrong section vector scale/direction')
  time=c['sourceReplayedClockTime']
  if type(time)not in(int,float)or not math.isfinite(time)or not 0<=time<=4:raise ValueError('Physical collection clock required')
  m=re.search(r'Massa già raccolta([0-9]+(?:,[0-9]+)?) g',c['readings'])
  if not m or Fraction(m.group(1).replace(',','.'))!=x*Fraction(str(time))/4:raise ValueError('Collected mass does not follow clock')
 elif c['id']=='SIM-C6-L05-01':
  if x==2:
   if arrows:raise ValueError('No unique velocity at ideal instant turn')
  else:
   tail=Fraction(-119,50)+Fraction(119,100)*exact(c['id'],x);delta=Fraction(13,20)if x<2 else Fraction(-13,40)
   if len(arrows)!=1 or not equal(arrows[0]['a'],[tail,Fraction(19,20),0])or not equal(arrows[0]['b'],[tail+delta,Fraction(19,20),0]):raise ValueError('Cart velocity direction/scale wrong')
  m=re.search(r'Cammino complessivo([0-9]+(?:,[0-9]+)?) m',c['readings'])
  if not m or Fraction(m.group(1).replace(',','.'))!=(2*x if x<=2 else x+2):raise ValueError('Path confused with displacement')
 else:raise ValueError('Explicit two-ID scene scope required')
 return True

def validate_case(c,p):
 if c['sourceCommit']!=CANDIDATE or c['runtimeSha256']!=RUNTIME:raise ValueError('Current candidate identity required')
 if c['requestSha256']!=p['requestSha256']or c['protocolSha256']!=hashlib.sha256((BASE/'canonical-protocol.mjs.txt').read_bytes()).hexdigest():raise ValueError('Exact executed request/protocol required')
 if c['scientificApproval']is not False or c['activityCredit']!=0 or c['humanApproval']!='NOT_RUN'or c['technicalOk']is not True:raise ValueError('No acquisition approval')
 row=next(r for r in p['records']if r['id']==c['id']and r['variant']==c['variant'])
 if c['sourceSha256']!=row['sourceSha256']or c['candidateSha256']is not None:raise ValueError('Original edition required')
 if 'interaction'in c:
  scalar_observation(c['id'],c['sourceReplayedX'],c['model']['y']);scene_contract(c)
  if c['model'].get('x')!=c['sourceReplayedX']:raise ValueError('Actual input mismatch')
  b=c['baselineReference']
  if b['isolation']!='DISTINCT_CONTEXT_AND_ORIGIN'or b['model']!=c['model']or b['actualDOMControls']!=c['actualDOMControls']or b['clockTime']!=c['sourceReplayedClockTime']:raise ValueError('Exact isolated parity failed')
  removed=['Entrata','Uscita']if c['id']=='SIM-C6-L02-01'else['Carrello']
  if any(l['text']in removed for l in c.get('labels',[]))or any(e['kind']=='label'and e['text']in removed for e in c['elements']):raise ValueError('Opaque labels reintroduced')
  for name in removed:
   if name.lower()not in c['legend'].lower():raise ValueError('Physical name missing from accessible legend')
  if c['legendLayout']['visible']is not True or c['legendLayout']['scrollWidth']>c['legendLayout']['width']+1:raise ValueError('Legend inaccessible or clipped')
 return c

def actual():
 p=json.loads((BASE/'prepared.json').read_bytes());r=json.loads((BASE/'actual/report.json').read_bytes());t=json.loads((BASE/'actual-terminal.json').read_bytes())
 if type(t['actualObservedExitCode'])is not int or t['actualObservedExitCode']!=0 or t['signal']is not None:raise ValueError('Actual completed terminal0 required')
 if r['runtimeFingerprint']!=p['runtimeFingerprint']or r['runtimeFingerprint']['sha256']!=RUNTIME or r['sourceCommit']!=CANDIDATE:raise ValueError('Runtime drift; no retag')
 if r['preparedSha256']!=hashlib.sha256((BASE/'prepared.json').read_bytes()).hexdigest()or p['requestSha256']!=hashlib.sha256((BASE/'metadata.json').read_bytes()).hexdigest():raise ValueError('Request drift')
 if r['errors']or len(r['cases'])!=104 or len({c['caseKey']for c in r['cases']})!=104 or set(p['expectedCaseKeys'])!={c['caseKey']for c in r['cases']}:raise ValueError('Whole bounded104 required')
 sources=json.loads((BASE/'original-source.json').read_bytes())
 if hashlib.sha256((BASE/'original-source.json').read_bytes()).hexdigest()!='6e6877e96bd91712fbcc15e530486c31a4c8087227e1292b9093876b465c292c':raise ValueError('Immutable original source required')
 for row in p['records']:
  if row['record']!=next(s for s in sources if s['id']==row['id']):raise ValueError('Whole original record changed')
 cases=[]
 for item in r['cases']:
  raw=(BASE/'actual'/item['file']).read_bytes()
  if hashlib.sha256(raw).hexdigest()!=item['sha256']:raise ValueError('Raw case changed')
  c=validate_case(json.loads(raw),p)
  if c['caseKey']!=item['caseKey']:raise ValueError('Raw case key changed')
  for png in c['screenshots']:
   if hashlib.sha256((BASE/'actual'/png['file']).read_bytes()).hexdigest()!=png['sha256']:raise ValueError('Raster changed')
  cases.append(c)
 return cases
