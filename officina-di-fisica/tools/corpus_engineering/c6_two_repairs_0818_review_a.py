"""Distinct actual bounded recheck of two confirmed C6 label failures."""
from pathlib import Path
import json,hashlib
from . import c6_remaining_four_abb2_review_a as prior
APP=Path(__file__).resolve().parents[2]
BASE=APP/'editorial/reviews/c6-two-repairs-0818-independent-a-20261127'
CANDIDATE='ad00ccac9e1d0839c45bd1880cb344b9334f2ae1'
RUNTIME='0818bc9e4051c7533a27688f784c46fa283928209f37b80870086fa4b20dc440'
LABELS={'SIM-C6-L04-01':'Rivelatore','SIM-C6-L06-01':'Oggetto'}

def validate_case(c,p):
 if c['id']not in LABELS or c['sourceCommit']!=CANDIDATE or c['runtimeSha256']!=RUNTIME:raise ValueError('Exact current two-ID identity required')
 if c['requestSha256']!=p['requestSha256']or c['protocolSha256']!=hashlib.sha256((BASE/'canonical-protocol.mjs.txt').read_bytes()).hexdigest():raise ValueError('Current request/protocol required')
 if c['scientificApproval']is not False or c['activityCredit']!=0 or c['humanApproval']!='NOT_RUN'or c['technicalOk']is not True:raise ValueError('No acquisition approval')
 row=next(r for r in p['records']if r['id']==c['id'])
 if c['sourceSha256']!=row['sourceSha256']or c['candidateSha256']is not None:raise ValueError('Original source edition required')
 if'interaction'in c:
  if c['model']['x']!=c['sourceReplayedX']:raise ValueError('Observed input mismatch')
  prior.physics.scalar_observation(c['id'],c['sourceReplayedX'],c['model']['y']);prior.independent_scene(c)
  if any(e['kind']=='label'and e['text']==LABELS[c['id']]for e in c['elements']):raise ValueError('Opaque label reintroduced')
  if LABELS[c['id']].lower()not in c['legend'].lower():raise ValueError('Physical name lost from accessible legend')
  if c['legendLayout']['visible']is not True or c['legendLayout']['scrollWidth']>c['legendLayout']['width']+1:raise ValueError('Legend inaccessible')
  b=c['baselineReference']
  if b['isolation']!='DISTINCT_CONTEXT_AND_ORIGIN'or b['model']!=c['model']or b['actualDOMControls']!=c['actualDOMControls']or b['clockTime']!=c['sourceReplayedClockTime']:raise ValueError('Exact isolated numerical parity failed')
 return c

def actual():
 p=json.loads((BASE/'prepared.json').read_bytes());r=json.loads((BASE/'actual/report.json').read_bytes());t=json.loads((BASE/'actual-terminal.json').read_bytes())
 if type(t['actualObservedExitCode'])is not int or t['actualObservedExitCode']!=0 or t['signal']is not None:raise ValueError('Actual completed terminal0 required')
 if r['runtimeFingerprint']!=p['runtimeFingerprint']or r['runtimeFingerprint']['sha256']!=RUNTIME or r['sourceCommit']!=CANDIDATE:raise ValueError('Runtime changed; no retag')
 if r['preparedSha256']!=hashlib.sha256((BASE/'prepared.json').read_bytes()).hexdigest()or p['requestSha256']!=hashlib.sha256((BASE/'metadata.json').read_bytes()).hexdigest():raise ValueError('Exact prepared/current request changed')
 if r['errors']or len(r['cases'])!=88 or len({c['caseKey']for c in r['cases']})!=88 or set(p['expectedCaseKeys'])!={c['caseKey']for c in r['cases']}:raise ValueError('Complete bounded88 required')
 result=[]
 for item in r['cases']:
  raw=(BASE/'actual'/item['file']).read_bytes()
  if hashlib.sha256(raw).hexdigest()!=item['sha256']:raise ValueError('Raw case changed')
  c=validate_case(json.loads(raw),p)
  if c['caseKey']!=item['caseKey']:raise ValueError('Case key changed')
  for png in c['screenshots']:
   if hashlib.sha256((BASE/'actual'/png['file']).read_bytes()).hexdigest()!=png['sha256']:raise ValueError('Raster changed')
  result.append(c)
 return result

def compare_physical(c,old):
 if c['id']!=old['id']or c['profile']!=old['profile']or c['sourceReplayedX']!=old['sourceReplayedX']:raise ValueError('Observations not matching')
 for name in ['model','spec','canvas','sourceDerivedCamera']:
  if c.get(name)!=old.get(name):raise ValueError('Physical/camera field changed: '+name)
 label=LABELS[c['id']];kept=[i for i,e in enumerate(old['elements'])if not(e['kind']=='label'and e['text']==label)]
 if c['elements']!=[old['elements'][i]for i in kept]:raise ValueError('Unexpected primitive difference')
 expected=[]
 for g in old.get('nativeGlyphs',[]):
  g=dict(g);g['elementIndex']=kept.index(g['elementIndex']);g['tipInsideOpaqueLabel']=[x for x in g['tipInsideOpaqueLabel']if x['text']!=label];expected.append(g)
 if c.get('nativeGlyphs',[])!=expected:raise ValueError('Actual Float32 mesh changed beyond derived removed-label state')
 if c.get('labels',[])!=[x for x in old.get('labels',[])if x['text']!=label]:raise ValueError('Other retained label moved or changed')
 return True
