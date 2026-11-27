"""Fresh five-original C2 evidence on 1efc: immutable physical models, new runtime/UI.

A local scoped verdict never grants activity credit or human approval.
"""
from pathlib import Path
from fractions import Fraction
import hashlib,json,math
from . import c2_41_static_cb9_verifier_a as frozen
from . import c2_density_pressure_five_1efc_review_a as preflight
APP=Path(__file__).resolve().parents[2]
BASE=APP/'editorial/reviews/c2-density-pressure-five-1efc-independent-a-20261127'
CANDIDATE='3abd7dce2c2d837c903c9e17ac1d7fd0aa08dcca'
RUNTIME='1efcd26bbb078453b75be5fbd1502b95cf07c0ffabb4112a4e4cf78170ff46aa'
IDS=preflight.IDS
VERSIONS={key:1 for key in IDS}
LIMITS=preflight.LIMITS
UNITS=dict(zip(IDS,['cm³','Pa','g','kPa','kPa']))
def sha(b):return hashlib.sha256(b).hexdigest()
def exact_value(key,x):return preflight.exact_value(key,x)
def observed(key,x,y):return preflight.observed(key,x,y)
def shape(c):return preflight.source_geometry(c['id'],c['sourceReplayedX'],c['elements'])

def validate_case(c,p):
 if c['id']not in IDS or c['sourceCommit']!=CANDIDATE or c['runtimeSha256']!=RUNTIME:raise ValueError('Exact five-ID runtime required')
 if c['requestSha256']!=p['requestSha256']or c['protocolSha256']!=sha((BASE/'future-canonical-collector.mjs').read_bytes()):raise ValueError('Current request/protocol required')
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
 if r['preparedSha256']!=sha((BASE/'prepared.json').read_bytes())or p['requestSha256']!=sha((BASE/'browser-metadata.json').read_bytes()):raise ValueError('Frozen request changed')
 if r['errors']or len(r['cases'])!=224 or len({c['caseKey']for c in r['cases']})!=224 or set(p['expectedCaseKeys'])!={c['caseKey']for c in r['cases']}:raise ValueError('Complete bounded224 required')
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
