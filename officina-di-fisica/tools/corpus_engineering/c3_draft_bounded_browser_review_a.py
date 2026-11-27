"""A distinct per-ID bounded C3 browser review. No activity or publication authority."""
from pathlib import Path
import hashlib,json
from decimal import Decimal
from . import c3_six_heat_phase_core6ae3_review_a as cpu
APP=Path(__file__).resolve().parents[2]
PROTOCOL='719beb3abc01cbf7607dc1d5d1710732cbc59c2aae91112fb6b680dbfbd22d15'
def sha(raw):return hashlib.sha256(raw).hexdigest()
def actual(folder,identifier):
 folder=Path(folder)
 if sha((APP/'tools/corpus_engineering/c3_six_heat_phase_primary_models_a.py').read_bytes())!=cpu.PRIMARY_MODULE_SHA256:raise ValueError('Frozen source-first model dependency changed')
 p=json.loads((folder/'prepared.json').read_bytes());r=json.loads((folder/'actual/report.json').read_bytes());t=json.loads((folder/'actual-terminal.json').read_bytes())
 if type(t['actualObservedExitCode'])is not int or t['actualObservedExitCode']!=0 or t['signal']is not None or t['timedOut']is not False or t['assistedTermination']is not False or t['intervention']!=[]:raise ValueError('Actual undisturbed terminal0 required')
 if p['sourceCommit']!=cpu.SOURCE or p['runtimeFingerprint']['sha256']!=cpu.RUNTIME or r['sourceCommit']!=cpu.SOURCE or r['runtimeFingerprint']!=p['runtimeFingerprint']or r['protocolSha256']!=PROTOCOL:raise ValueError('Exact immutable runtime and collector required')
 if r['preparedSha256']!=sha((folder/'prepared.json').read_bytes())or r['requestSha256']!=p['requestSha256']or p['requestSha256']!=sha((folder/'metadata.json').read_bytes()):raise ValueError('Prepared and request byte identity drift')
 if len(p['records'])!=1 or p['records'][0]['id']!=identifier:raise ValueError('Exactly the assigned ID required')
 row=p['records'][0]
 if sha(cpu.canonical(row['record']))!=cpu.REVIEWED_PINS[identifier]or row['candidateSha256']!=cpu.REVIEWED_PINS[identifier]or row['record']['version']!=2 or row['record']['baseVersion']!=1:raise ValueError('Independently read draft bytes changed')
 if r['errors']or len(r['cases'])!=len(p['expectedCaseKeys'])or len({x['caseKey']for x in r['cases']})!=len(r['cases'])or {x['caseKey']for x in r['cases']}!=set(p['expectedCaseKeys']):raise ValueError('Complete unique planned cases required')
 if r['guestIsolation']!='ORIGINAL_OR_DENIED_AND_DRAFT_ASSETS_403':raise ValueError('Actual owner/guest isolation required')
 imported=r['canonicalImport'];owner=r['fullOwnerRecordIdentity']['records']
 if imported['publishedCount']!=991 or len(imported['imports'])!=1 or imported['imports'][0]['first']['saved']!=6 or imported['imports'][0]['second']['saved']!=0 or imported['imports'][0]['second']['unchanged']!=6:raise ValueError('Actual canonical6→0/6 import required')
 if len(owner)!=6 or {x['id']for x in owner}!=set(cpu.primary.IDS)or any(type(x['version'])is not int or x['version']!=2 or len(x['responseBytesSha256'])!=64 for x in owner):raise ValueError('All actual normalized owner records required')
 out=[];i=cpu.primary.IDS.index(identifier)
 for entry in r['cases']:
  raw=(folder/'actual'/entry['file']).read_bytes()
  if sha(raw)!=entry['sha256']:raise ValueError('Raw case drift')
  c=json.loads(raw)
  if c['caseKey']!=entry['caseKey']or c['id']!=identifier or c['variant']!='draft'or c['sourceCommit']!=cpu.SOURCE or c['runtimeSha256']!=cpu.RUNTIME or c['protocolSha256']!=PROTOCOL or c['candidateSha256']!=row['candidateSha256']or c['sourceSha256']!=row['sourceSha256']or c['technicalOk']is not True:raise ValueError('Actual acquisition/source/draft identity required')
  if c['scientificApproval']is not False or type(c['activityCredit'])is not int or c['activityCredit']!=0 or c['humanApproval']!='NOT_RUN':raise ValueError('Technical evidence cannot grant approval')
  if not c['screenshots']:raise ValueError('Actual raster required')
  for image in c['screenshots']:
   if sha((folder/'actual'/image['file']).read_bytes())!=image['sha256']:raise ValueError('Raw raster drift')
  if 'interaction'in c:
   x=cpu.finite_observation(c['sourceReplayedX']);cpu.roundoff_only(c['model']['x'],x);want=cpu.primary.law(identifier,Decimal(str(x)));cpu.roundoff_only(c['model']['y'],want)
   if not c['legendLayout']['visible']or c['legendLayout']['scrollWidth']>c['legendLayout']['width']+1:raise ValueError('Actual accessible readable legend required')
   if identifier=='SIM-C3-L03-01':
    rods=[e for e in c['elements']if e['kind']=='rod'and e.get('r')==.044]
    if len(rods)!=1 or rods[0]['a']!=[.4,.46,0]:raise ValueError('Distinct thermometer stem required')
    for got,expected in zip(rods[0]['b'],[.4,.64+1.51*x/12,0],strict=True):cpu.roundoff_only(got,expected)
  else:
   if len(c['phases'])!=4 or c['axe']or len(c['questions'])!=2:raise ValueError('Actual phases/accessibility/two tasks required')
   for j,q in enumerate(c['questions']):
    answer=cpu.primary.exact(Decimal(q['input']))
    if answer!=cpu.ENTRIES[i][j]or q['expectedAccepted']is not True or not q['status'].startswith('Corretto. '):raise ValueError('Both independent manual entries must actually be accepted')
   if len(c['reading']['formulas'])!=sum(b['type']=='formula'for b in row['record']['blocks'])or any(f['typeset']<=0 or f['scroll']>f['width']+1 or f['typeset']>f['width']+1 for f in c['reading']['formulas']):raise ValueError('All actual authored formulas must fit')
  out.append(c)
 return out

def report(folder,identifier):
 folder=Path(folder);groups=[actual(folder/str(w),identifier)for w in (320,1280)];visual=json.loads((folder/'visual-review-per-id.json').read_bytes());rows=visual['records']
 if len(rows)!=1 or rows[0]['id']!=identifier or rows[0]['visualReview']!='PASS'or visual['activityCredit']!=0 or visual['humanApproval']!='NOT_RUN':raise ValueError('Distinct per-ID local visual reading required')
 read=rows[0]['readFiles'];keys={c['caseKey']for g in groups for c in g}
 if {x['caseKey']for x in read}!=keys or len(read)!=len(keys):raise ValueError('All fresh raster cases must be read')
 for entry in read:
  if sha((APP/entry['path']).read_bytes())!=entry['sha256']:raise ValueError('Read raster identity drift')
 for width in (320,1280):
  for view in ('orbit','side','top','fixed_projection'):
   if not any(x['width']==width and x['view']==view for x in read):raise ValueError('All eight profiles require actual read raster')
 return dict(schemaVersion='1.0.0',id=identifier,candidateCommit=cpu.CANDIDATE,sourceCommit=cpu.SOURCE,runtimeSha256=cpu.RUNTIME,browserCases=len(keys),setupCases=8,acceptedAnswers=16,profiles=8,scientificReview='POSITIVE_WITHIN_FROZEN_ASSUMPTIONS_AND_ACTUAL_TWO_TASKS',visualReview='PASS',limits=rows[0]['scope']['limits'],activityCredit=0,humanApproval='NOT_RUN')
