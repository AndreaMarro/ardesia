"""New bounded press-direction repair proof. Old 980 finding stays immutable."""
from pathlib import Path
import json,hashlib,math
from . import c2_hydraulics_five_980_review_a as negative
APP=Path(__file__).resolve().parents[2]
BASE=APP/'editorial/reviews/c2-press-direction-77c-independent-a-20261127'
CANDIDATE='099fe6614bdaf14702da8a472eea1bb743fd1599'
RUNTIME='77c13a37088c8b19e7e56558a85ff8ad644acf8488abb9b5d0a5214991c696d4'
ID='SIM-C2-L003-02'
def sha(b):return hashlib.sha256(b).hexdigest()
def shape(c):
 e=c['elements'];x=c['sourceReplayedX'];old=json.loads((negative.BASE/'current-node.json').read_bytes());row=next(r for r in old['records']if r['id']==ID);prior=next(r['elements']for r in row['cases']if r['x']==x)
 want=[v for v in prior if v['kind']!='arrow']if x==0 else prior
 if e!=want:raise ValueError('Only zero directional indicators may differ')
 if x!=0:negative.shape(c)
 if x==0 and any(v['kind']=='arrow'for v in e):raise ValueError('No direction of zero displacement')
 text=c['legend']
 if not all(s in text for s in ['solo i versi','corsa zero','un quarto']):raise ValueError('Actual legend must delimit indicator semantics')
 if ('vista Laterale'in text)!=(c['profile']['view']=='top'):raise ValueError('Only actual native Top needs available Side guidance')
 return True

def validate_case(c,p):
 if c['id']!=ID or c['sourceCommit']!=CANDIDATE or c['runtimeSha256']!=RUNTIME:raise ValueError('New exact press candidate required')
 if c['requestSha256']!=p['requestSha256']or c['protocolSha256']!=sha((BASE/'canonical-protocol.mjs.txt').read_bytes()):raise ValueError('Current protocol/request required')
 if c['scientificApproval']is not False or type(c['activityCredit'])is not int or c['activityCredit']!=0 or c['humanApproval']!='NOT_RUN'or c['technicalOk']is not True:raise ValueError('No automatic credit')
 if c['sourceSha256']!=p['records'][0]['sourceSha256']or c['candidateSha256']is not None or c['variant']!='published':raise ValueError('Original edition required')
 if'interaction'in c:
  negative.observed(ID,c['sourceReplayedX'],c['model']['y']);shape(c);b=c['baselineReference']
  if c['model']['x']!=c['sourceReplayedX']or b['isolation']!='DISTINCT_CONTEXT_AND_ORIGIN'or b['model']!=c['model']or b['actualDOMControls']!=c['actualDOMControls']or b['clockTime']is not None:raise ValueError('Actual controls and exact isolated parity required')
  if not c['legendLayout']['visible']or c['legendLayout']['scrollWidth']>c['legendLayout']['width']+1:raise ValueError('Legend must remain accessible')
 else:
  if len(c['phases'])!=4 or not all(s.strip()for s in c['phases'])or c['reading']is not None or c['axe']:raise ValueError('Four phases, absent reading and accessible setup required')
  if len(c['questions'])!=2 or any(q['expectedAccepted']is not True or not q['status'].startswith('Corretto. ')for q in c['questions']):raise ValueError('Two actual correct installed answers required')
 return c

def actual():
 p=json.loads((BASE/'prepared.json').read_bytes());r=json.loads((BASE/'actual/report.json').read_bytes());t=json.loads((BASE/'actual-terminal.json').read_bytes())
 if type(t['actualObservedExitCode'])is not int or t['actualObservedExitCode']!=0 or t['signal']is not None or t.get('timedOut')is not False or t.get('assistedTermination')is not False:raise ValueError('Actual new terminal0 required')
 if r['runtimeFingerprint']!=p['runtimeFingerprint']or r['runtimeFingerprint']['sha256']!=RUNTIME or r['sourceCommit']!=CANDIDATE:raise ValueError('New runtime identity required')
 if r['preparedSha256']!=sha((BASE/'prepared.json').read_bytes())or p['requestSha256']!=sha((BASE/'metadata.json').read_bytes()):raise ValueError('Frozen request changed')
 if r['errors']or len(r['cases'])!=40 or len({c['caseKey']for c in r['cases']})!=40 or set(p['expectedCaseKeys'])!={c['caseKey']for c in r['cases']}:raise ValueError('Exactly40 bounded cases required')
 if (BASE/'original-source.json').read_bytes()!=(negative.BASE/'original-source.json').read_bytes():raise ValueError('Original source changed')
 if len(p['records'])!=1 or p['records'][0]['record']['version']!=1 or p['records'][0]['id']!=ID:raise ValueError('Single original edition required')
 original=next(r for r in json.loads((BASE/'original-source.json').read_bytes())if r['id']==ID);prior=next(r for r in json.loads((negative.BASE/'prepared.json').read_bytes())['records']if r['id']==ID)
 if p['records'][0]['record']!=original or p['records'][0]['sourceSha256']!=prior['sourceSha256']:raise ValueError('Complete immutable original record/token required')
 result=[]
 for item in r['cases']:
  raw=(BASE/'actual'/item['file']).read_bytes()
  if sha(raw)!=item['sha256']:raise ValueError('Raw case changed')
  c=validate_case(json.loads(raw),p)
  for png in c['screenshots']:
   if sha((BASE/'actual'/png['file']).read_bytes())!=png['sha256']:raise ValueError('Raster changed')
  result.append(c)
 return result
