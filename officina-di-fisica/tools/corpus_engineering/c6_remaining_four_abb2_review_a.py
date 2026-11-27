"""Current bounded four-C6 observation validation; no automatic course approval."""
from pathlib import Path
from fractions import Fraction as F
import hashlib,json,math,re
from . import c6_two_annotations_4e_review_a as physics
APP=Path(__file__).resolve().parents[2]
BASE=APP/'editorial/reviews/c6-remaining-four-abb2-independent-a-20261127'
RUNTIME='abb2bf2ac567438953766cf3550644b3d6ea501d75d610fb6291b2cffc5a428b'
CANDIDATE='63cc5fd89df00ce4a4885479b1306ca1a5833064'
IDS={'SIM-C6-'+s for s in ['L01-01','L03-01','L04-01','L06-01']}

def same(a,b):return len(a)==len(b)and all(math.isclose(u,float(v),rel_tol=1e-10,abs_tol=1e-10 if v==0 else 0)for u,v in zip(a,b))

def independent_scene(c):
 x=F(str(c['sourceReplayedX']));y=physics.exact(c['id'],x);es=c['elements'];key=c['id'][7:]
 if key=='L01-01':
  time=c['sourceReplayedClockTime']
  if type(time)not in(int,float)or not math.isfinite(time)or not 0<=time<=x:raise ValueError('Echo clock outside actual roundtrip')
  t=F(str(time));want=F(17,50)*min(t,x-t);m=re.search(r'Distanza dell’impulso dal microfono([0-9]+(?:,[0-9]+)?) m',c['readings'])
  if not m or F(m.group(1).replace(',','.'))!=want:raise ValueError('Wrong instantaneous echo distance')
  pulse=[e for e in es if e['kind']=='ball'and e.get('r')==.13]
  if len(pulse)!=1 or not same(pulse[0]['p'],[F(-213,100)+F(79,200)*min(t,x-t),F(101,100),F(17,50)]):raise ValueError('Pulse does not follow two-way path')
  arrows=[e for e in es if e['kind']=='arrow']
  if x==0:
   if arrows:raise ValueError('Degenerate zero path has no directed arrow')
  else:
   left=F(-213,100);wall=left+F(79,400)*x
   if len(arrows)!=2 or not same(arrows[0]['a'],[left,F(31,25),0])or not same(arrows[0]['b'],[wall,F(31,25),0])or not same(arrows[1]['a'],[wall,F(9,20),F(17,20)])or not same(arrows[1]['b'],[left,F(9,20),F(17,20)]):raise ValueError('Echo forward/return indicator geometry changed')
 elif key=='L03-01':
  rods=[e for e in es if e['kind']=='rod'and e.get('r')==.044]
  if len(rods)!=1 or not same(rods[0]['b'],[F(2,5),F(16,25)+F(151,100)*x/100,0]):raise ValueError('Temperature column inconsistent with useful energy')
 elif key=='L04-01':
  rods=[e for e in es if e['kind']=='rod'and same(e['a'][:1],[F(43,100)*x-F(4,5)])and same(e['b'][:1],[F(113,50)])]
  if len(rods)!=12 or any(e.get('alpha',1)!=float(y/120)for e in rods):raise ValueError('Outgoing bundle does not follow halving-layer transmission')
 elif key=='L06-01':
  p=F(9,10)*x;q=None if y==0 else F(9,10)/y;arrows=[e for e in es if e['kind']=='arrow'];object_=[e for e in arrows if same(e['a'],[-p,F(127,100),0])]
  if len(object_)!=1 or not same(object_[0]['b'],[-p,F(42,25),0]):raise ValueError('Lens object geometry inconsistent with p/f')
  images=[e for e in arrows if e is not object_[0]];visible=q is not None and abs(q)<F(66,25)and abs(F(41,100)*q/p)<F(23,20)
  if bool(images)!=visible or len(images)>1:raise ValueError('Finite image existence/viewport representation wrong')
  if visible and(not same(images[0]['a'],[q,F(127,100),0])or not same(images[0]['b'],[q,F(127,100)-F(41,100)*q/p,0])):raise ValueError('Real/virtual image sign or magnification wrong')
 else:raise ValueError('Four-ID actual scope required')
 return True

def validate_case(c,p):
 if c['id']not in IDS or c['sourceCommit']!=CANDIDATE or c['runtimeSha256']!=RUNTIME:raise ValueError('Current four-ID scope and runtime required')
 if c['requestSha256']!=p['requestSha256']or c['protocolSha256']!=hashlib.sha256((BASE/'canonical-protocol.mjs.txt').read_bytes()).hexdigest():raise ValueError('Actual protocol/request changed')
 if c['scientificApproval']is not False or c['activityCredit']!=0 or c['humanApproval']!='NOT_RUN'or c['technicalOk']is not True:raise ValueError('Acquisition approval forbidden')
 row=next(r for r in p['records']if r['id']==c['id'])
 if c['sourceSha256']!=row['sourceSha256']or c['candidateSha256']is not None:raise ValueError('Original edition changed')
 if'interaction'in c:
  physics.scalar_observation(c['id'],c['sourceReplayedX'],c['model']['y']);independent_scene(c)
  b=c['baselineReference']
  if c['model']!=b['model']or c['actualDOMControls']!=b['actualDOMControls']or c['sourceReplayedClockTime']!=b['clockTime']or b['isolation']!='DISTINCT_CONTEXT_AND_ORIGIN':raise ValueError('Exact isolated parity failed')
  if c['legendLayout']['visible']is not True or c['legendLayout']['scrollWidth']>c['legendLayout']['width']+1:raise ValueError('Legend inaccessible')
 return c

def actual():
 p=json.loads((BASE/'prepared.json').read_bytes());r=json.loads((BASE/'actual/report.json').read_bytes());t=json.loads((BASE/'actual-terminal.json').read_bytes())
 if type(t['actualObservedExitCode'])is not int or t['actualObservedExitCode']!=0 or t['signal']is not None:raise ValueError('Real complete terminal0 required')
 if r['runtimeFingerprint']!=p['runtimeFingerprint']or r['runtimeFingerprint']['sha256']!=RUNTIME or r['sourceCommit']!=CANDIDATE:raise ValueError('Runtime drift, no retag')
 if r['preparedSha256']!=hashlib.sha256((BASE/'prepared.json').read_bytes()).hexdigest()or p['requestSha256']!=hashlib.sha256((BASE/'metadata.json').read_bytes()).hexdigest():raise ValueError('Prepared bytes drift')
 if r['errors']or len(r['cases'])!=216 or len({c['caseKey']for c in r['cases']})!=216 or set(p['expectedCaseKeys'])!={c['caseKey']for c in r['cases']}:raise ValueError('Full bounded216 required')
 cases=[]
 for item in r['cases']:
  raw=(BASE/'actual'/item['file']).read_bytes()
  if hashlib.sha256(raw).hexdigest()!=item['sha256']:raise ValueError('Raw case digest drift')
  c=validate_case(json.loads(raw),p)
  if c['caseKey']!=item['caseKey']:raise ValueError('Actual case key drift')
  for png in c['screenshots']:
   if hashlib.sha256((BASE/'actual'/png['file']).read_bytes()).hexdigest()!=png['sha256']:raise ValueError('Actual screenshot digest drift')
  cases.append(c)
 return cases
