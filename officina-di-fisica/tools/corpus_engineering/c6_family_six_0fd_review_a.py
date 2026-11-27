"""Distinct six-original C6 bounded current-runtime evidence; no automatic credit."""
from pathlib import Path
import hashlib,json
from . import c6_two_annotations_4e_review_a as foundational
from . import c6_remaining_four_abb2_review_a as four
from . import c6_two_repairs_0818_review_a as repairs
APP=Path(__file__).resolve().parents[2]
BASE=APP/'editorial/reviews/c6-family-six-0fd-independent-a-20261127'
CANDIDATE='c3b03eb98cdafd706499ee64d6b3f5e356f27da8'
RUNTIME='0fdcc3b04c869d75811a4e07b7b8d1d87210869d6087e12e01ee70b6c370e1d4'
IDS={'SIM-C6-'+key for key in foundational.LIMITS}

def check_shape(c):
 return foundational.scene_contract(c)if c['id']in['SIM-C6-L02-01','SIM-C6-L05-01']else four.independent_scene(c)

def validate_case(c,p):
 if c['id']not in IDS or c['sourceCommit']!=CANDIDATE or c['runtimeSha256']!=RUNTIME:raise ValueError('Exact current six-ID family required')
 if c['requestSha256']!=p['requestSha256']or c['protocolSha256']!=hashlib.sha256((BASE/'canonical-protocol.mjs.txt').read_bytes()).hexdigest():raise ValueError('Current exact request/protocol required')
 if c['scientificApproval']is not False or type(c['activityCredit'])is not int or c['activityCredit']!=0 or c['humanApproval']!='NOT_RUN'or c['technicalOk']is not True:raise ValueError('No acquisition approval')
 row=next(r for r in p['records']if r['id']==c['id'])
 if c['sourceSha256']!=row['sourceSha256']or c['candidateSha256']is not None or c['variant']!='published':raise ValueError('Original version1 edition required')
 if'interaction'in c:
  if c['model']['x']!=c['sourceReplayedX']:raise ValueError('Input mismatch')
  foundational.scalar_observation(c['id'],c['sourceReplayedX'],c['model']['y']);check_shape(c)
  b=c['baselineReference']
  if b['isolation']!='DISTINCT_CONTEXT_AND_ORIGIN'or b['model']!=c['model']or b['actualDOMControls']!=c['actualDOMControls']or b['clockTime']!=c['sourceReplayedClockTime']:raise ValueError('Exact isolated parity failed')
  if not c['legendLayout']['visible']or c['legendLayout']['scrollWidth']>c['legendLayout']['width']+1:raise ValueError('Legend inaccessible')
 else:
  if len(c['phases'])!=4 or not all(isinstance(x,str)and x.strip()for x in c['phases']):raise ValueError('Four actual visible phase texts required')
  if row['record']['blocks']!=[] or c['reading']is not None:raise ValueError('Do not invent authored reading for empty original blocks')
  if len(c['questions'])!=2 or any(q['expectedAccepted']is not True or not q['status'].startswith('Corretto. ')or not q['actualPrompt']for q in c['questions']):raise ValueError('Two installed accepted answers required')
  if c['axe']:raise ValueError('Observed setup accessibility failure')
 return c

def actual():
 p=json.loads((BASE/'prepared.json').read_bytes());r=json.loads((BASE/'actual/report.json').read_bytes());t=json.loads((BASE/'actual-terminal.json').read_bytes())
 if type(t['actualObservedExitCode'])is not int or t['actualObservedExitCode']!=0 or t['signal']is not None:raise ValueError('Real completed terminal0 required')
 if r['runtimeFingerprint']!=p['runtimeFingerprint']or r['runtimeFingerprint']['sha256']!=RUNTIME or r['sourceCommit']!=CANDIDATE:raise ValueError('Current fingerprint drift; no retag')
 if r['preparedSha256']!=hashlib.sha256((BASE/'prepared.json').read_bytes()).hexdigest()or p['requestSha256']!=hashlib.sha256((BASE/'metadata.json').read_bytes()).hexdigest():raise ValueError('Frozen current request changed')
 if r['errors']or len(r['cases'])!=312 or len({c['caseKey']for c in r['cases']})!=312 or set(p['expectedCaseKeys'])!={c['caseKey']for c in r['cases']}:raise ValueError('Complete bounded312 required')
 source=(BASE/'original-source.json').read_bytes()
 if hashlib.sha256(source).hexdigest()!='6e6877e96bd91712fbcc15e530486c31a4c8087227e1292b9093876b465c292c':raise ValueError('Immutable original source changed')
 rows=json.loads(source)
 if len(p['records'])!=6 or {r['id']for r in p['records']}!=IDS:raise ValueError('All six originals required')
 for row in p['records']:
  src=next(s for s in rows if s['id']==row['id'])
  digest=hashlib.sha256(json.dumps(src,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()).hexdigest()
  if row['record']!=src or src['version']!=1 or digest!=row['sourceSha256']:raise ValueError('Whole original source/version/token mismatch')
 result=[]
 for item in r['cases']:
  raw=(BASE/'actual'/item['file']).read_bytes()
  if hashlib.sha256(raw).hexdigest()!=item['sha256']:raise ValueError('Raw case digest drift')
  c=validate_case(json.loads(raw),p)
  if c['caseKey']!=item['caseKey']:raise ValueError('Case key changed')
  for png in c['screenshots']:
   if hashlib.sha256((BASE/'actual'/png['file']).read_bytes()).hexdigest()!=png['sha256']:raise ValueError('Raster digest drift')
  result.append(c)
 return result

def exact_prior_observations():
 a=foundational.actual();b=four.actual();d=repairs.actual();selected=[]
 for rows,ids in [(a,{'SIM-C6-L02-01','SIM-C6-L05-01'}),(b,{'SIM-C6-L01-01','SIM-C6-L03-01'}),(d,{'SIM-C6-L04-01','SIM-C6-L06-01'})]:selected.extend(c for c in rows if'interaction'in c and c['id']in ids)
 return selected

def compare_unchanged(c,old):
 for name in ['id','variant','profile','sourceReplayedX','sourceReplayedClockTime','model','spec','canvas','sourceDerivedCamera','elements','labels','nativeGlyphs']:
  if c.get(name)!=old.get(name):raise ValueError('C6 physical observation changed beyond runtime identity: '+name)
 return True

def assert_visual_review(doc):
 p=json.loads((BASE/'prepared.json').read_bytes());cases=actual();selection=json.loads((BASE/'raw-png-reading-selection.json').read_bytes())
 if doc['sourceCommit']!=CANDIDATE or doc['runtimeSha256']!=RUNTIME or type(doc['activityCredit'])is not int or doc['activityCredit']!=0 or doc['humanApproval']!='NOT_RUN':raise ValueError('Current local-only document required')
 for name in ['actual/report.json','prepared.json','actual-terminal.json']:
  pin=doc['artifactPins'][name]
  if pin['path']!=str((BASE/name).relative_to(APP))or pin['sha256']!=hashlib.sha256((BASE/name).read_bytes()).hexdigest():raise ValueError('Canonical artifact pin changed')
 if len(doc['records'])!=6 or {r['id']for r in doc['records']}!=IDS:raise ValueError('Exactly six local rows required')
 for row in doc['records']:
  scoped=[c for c in cases if c['id']==row['id']];read=[s for s in selection if s['id']==row['id']]
  if row['visualReview']not in['PASS','FAIL']or not row['reason']or row['sourceCommit']!=CANDIDATE or row['runtimeSha256']!=RUNTIME or row['activityCredit']!=0 or row['humanApproval']!='NOT_RUN':raise ValueError('Explicit bounded local verdict required')
  if row['scope']['profiles']!=p['profiles']or row['scope']['setupCount']!=8 or row['scope']['acceptedAnswerEvents']!=16 or row['scope']['manualWholeRawPngCount']!=8:raise ValueError('Scope/profile/count changed')
  if set(row['scope']['fullObservedCaseKeys'])!={c['caseKey']for c in scoped}:raise ValueError('Observed ID scope incomplete')
  if len(read)!=8 or not all(s['wholeRawPngOpenedAndRead']for s in read)or len({(s['profile']['width'],s['profile']['view'],s['profile']['fallback'])for s in read})!=8:raise ValueError('Actual full PNG reading in every profile required')
  if row['readPngSha256']!=[s['sha256']for s in read]:raise ValueError('Read PNG list changed')
  for s in read:
   c=next(c for c in scoped if c['caseKey']==s['caseKey'])
   if not any(png['sha256']==s['sha256']for png in c['screenshots'])or hashlib.sha256((APP/s['file']).read_bytes()).hexdigest()!=s['sha256']:raise ValueError('Read actual PNG bytes changed')
 return True
