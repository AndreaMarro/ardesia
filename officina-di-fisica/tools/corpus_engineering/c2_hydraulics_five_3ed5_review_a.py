"""Fresh five-original C2 evidence on 3ed5: immutable physical models, new runtime/UI.

A local scoped verdict never grants activity credit or human approval.
"""
from pathlib import Path
from fractions import Fraction
import hashlib,json,math
from . import c2_41_static_cb9_verifier_a as frozen
from . import c2_hydraulics_five_980_review_a as prior
from . import c2_press_direction_77c_review_a as press
APP=Path(__file__).resolve().parents[2]
BASE=APP/'editorial/reviews/c2-hydraulics-five-3ed5-independent-a-20261127'
CANDIDATE='375faa7a90f5f643840aabb8cc3076f9a2d5f5de'
RUNTIME='3ed5bc77d8320230b62e1c3e6ca3bdd00f240cc64ec236b10fe55a306ca79251'
IDS=('SIM-C2-L003-02','SIM-C2-L003-03','SIM-C2-L004-01','SIM-C2-L004-02','SIM-C2-L004-03')
VERSIONS=dict(zip(IDS,[1,1,1,1,2]))
LIMITS=dict(zip(IDS,[(0,8),(0,12),(0,4),(600,1200),(200,1000)]))
UNITS=dict(zip(IDS,['cm','kPa','N','N','%']))
def sha(b):return hashlib.sha256(b).hexdigest()
def exact_value(key,x):
 if key not in IDS:raise ValueError('Unreviewed activity')
 v=frozen.exact_number(x);lo,hi=LIMITS[key]
 if not lo<=v<=hi:raise ValueError('Outside declared model domain')
 return frozen.model_for(key).exact_value(key,v)
def observed(key,x,y):
 if type(x)not in(int,float)or not math.isfinite(x)or type(y)not in(int,float)or not math.isfinite(y):raise ValueError('Finite actual numeric observation required')
 want=exact_value(key,Fraction(str(x)))
 if not math.isclose(y,float(want),rel_tol=1e-12,abs_tol=1e-12):raise ValueError('Scalar differs from exact physics')
 return want
def shape(c):
 return press.shape(c)if c['id']==IDS[0]else prior.shape(c)

def validate_case(c,p):
 if c['id']not in IDS or c['sourceCommit']!=CANDIDATE or c['runtimeSha256']!=RUNTIME:raise ValueError('Exact five-ID runtime required')
 if c['requestSha256']!=p['requestSha256']or c['protocolSha256']!=sha((BASE/'canonical-protocol.mjs.txt').read_bytes()):raise ValueError('Current request/protocol required')
 if c['scientificApproval']is not False or type(c['activityCredit'])is not int or c['activityCredit']!=0 or c['humanApproval']!='NOT_RUN'or c['technicalOk']is not True:raise ValueError('Acquisition grants no approval')
 row=next(r for r in p['records']if r['id']==c['id'])
 if c['sourceSha256']!=row['sourceSha256']or c['candidateSha256']is not None or c['variant']!='published':raise ValueError('Exact original edition required')
 if 'interaction'in c:
  if c['model']['x']!=c['sourceReplayedX']:raise ValueError('Input mismatch')
  observed(c['id'],c['sourceReplayedX'],c['model']['y']);shape(c)
  b=c['baselineReference']
  if b['isolation']!='DISTINCT_CONTEXT_AND_ORIGIN'or b['model']!=c['model']or b['actualDOMControls']!=c['actualDOMControls']or b['clockTime']is not None or c['sourceReplayedClockTime']is not None:raise ValueError('Exact isolated parity/absence of clock required')
  if not c['legendLayout']['visible']or c['legendLayout']['scrollWidth']>c['legendLayout']['width']+1:raise ValueError('Legend unavailable')
 else:
  if len(c['phases'])!=4 or not all(isinstance(s,str)and s.strip()for s in c['phases']):raise ValueError('Four actual phase texts required')
  if row['record']['blocks']!=[]or c['reading']is not None:raise ValueError('Do not invent authored reading')
  if len(c['questions'])!=2 or any(q['expectedAccepted']is not True or not q['status'].startswith('Corretto. ')or not q['actualPrompt']for q in c['questions']):raise ValueError('Two actual accepted responses required')
  if c['axe']:raise ValueError('Actual accessibility issue')
 return c

def require_undisturbed_terminal(t):
 if type(t['actualObservedExitCode'])is not int or t['actualObservedExitCode']!=0 or t['signal']is not None or t.get('timedOut')is not False or t.get('assistedTermination')is not False:raise ValueError('Actual undisturbed terminal0 required')
 return True

def actual():
 p=json.loads((BASE/'prepared.json').read_bytes());r=json.loads((BASE/'actual/report.json').read_bytes());t=json.loads((BASE/'actual-terminal.json').read_bytes())
 require_undisturbed_terminal(t)
 if r['runtimeFingerprint']!=p['runtimeFingerprint']or r['runtimeFingerprint']['sha256']!=RUNTIME or r['sourceCommit']!=CANDIDATE:raise ValueError('Runtime drift')
 if r['preparedSha256']!=sha((BASE/'prepared.json').read_bytes())or p['requestSha256']!=sha((BASE/'metadata.json').read_bytes()):raise ValueError('Frozen request changed')
 if r['errors']or len(r['cases'])!=240 or len({c['caseKey']for c in r['cases']})!=240 or set(p['expectedCaseKeys'])!={c['caseKey']for c in r['cases']}:raise ValueError('Complete bounded240 required')
 raw=(BASE/'original-source.json').read_bytes()
 if sha(raw)!='33a38d74b953889eccce3281c4413060aa6af14f6a7c022d5049b927137656c1':raise ValueError('Immutable source changed')
 originals={r['id']:r for r in json.loads(raw)}
 if len(p['records'])!=5 or {r['id']for r in p['records']}!=set(IDS):raise ValueError('Five originals required')
 for row in p['records']:
  if row['record']!=originals[row['id']]or row['record']['version']!=VERSIONS[row['id']]:raise ValueError('Original source/version changed')
 result=[]
 for item in r['cases']:
  raw=(BASE/'actual'/item['file']).read_bytes()
  if sha(raw)!=item['sha256']:raise ValueError('Actual raw hash differs')
  c=validate_case(json.loads(raw),p)
  if c['caseKey']!=item['caseKey']:raise ValueError('Case identity differs')
  for png in c['screenshots']:
   if sha((BASE/'actual'/png['file']).read_bytes())!=png['sha256']:raise ValueError('Actual raster hash differs')
  result.append(c)
 return result

def assert_visual_review(doc):
 p=json.loads((BASE/'prepared.json').read_bytes());cases=actual();selection=json.loads((BASE/'raw-png-reading-selection.json').read_bytes())
 if doc['sourceCommit']!=CANDIDATE or doc['runtimeSha256']!=RUNTIME or type(doc['activityCredit'])is not int or doc['activityCredit']!=0 or doc['humanApproval']!='NOT_RUN':raise ValueError('Current local-only verdict required')
 for name in ['actual/report.json','prepared.json','actual-terminal.json']:
  pin=doc['artifactPins'][name]
  if pin['path']!=str((BASE/name).relative_to(APP))or pin['sha256']!=sha((BASE/name).read_bytes()):raise ValueError('Exact artifact pin required')
 if len(doc['records'])!=5 or {r['id']for r in doc['records']}!=set(IDS):raise ValueError('Exactly five individual verdicts required')
 for row in doc['records']:
  scoped=[c for c in cases if c['id']==row['id']];read=[s for s in selection if s['id']==row['id']]
  if row['sourceCommit']!=CANDIDATE or row['runtimeSha256']!=RUNTIME or row['sourceVersion']!=VERSIONS[row['id']]or row['visualReview']not in['PASS','FAIL']or not row['reason']or row['activityCredit']!=0 or row['humanApproval']!='NOT_RUN':raise ValueError('Scoped current identity/verdict required')
  if row['scope']['profiles']!=p['profiles']or row['scope']['setupCount']!=8 or row['scope']['acceptedAnswerEvents']!=16 or row['scope']['manualWholeRawPngCount']!=8:raise ValueError('Observed scope changed')
  if set(row['scope']['fullObservedCaseKeys'])!={c['caseKey']for c in scoped}:raise ValueError('Per-ID coverage differs')
  if len(read)!=8 or not all(s['wholeRawPngOpenedAndRead']for s in read)or len({(s['profile']['width'],s['profile']['view'],s['profile']['fallback'])for s in read})!=8:raise ValueError('Whole raw PNG reading in each profile required')
  if row['readPngSha256']!=[s['sha256']for s in read]:raise ValueError('Read raster list differs')
  for s in read:
   c=next(c for c in scoped if c['caseKey']==s['caseKey'])
   if not any(png['sha256']==s['sha256']for png in c['screenshots'])or sha((APP/s['file']).read_bytes())!=s['sha256']:raise ValueError('Actual raster identity differs')
 return True
