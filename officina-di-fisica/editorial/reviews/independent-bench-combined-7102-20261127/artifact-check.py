"""Integrity of an explicitly negative targeted peer receipt; not an activity admission gate."""
from pathlib import Path
import json,hashlib
BASE=Path(__file__).resolve().parent
INDEX='b67c32cbd023dd9bf0abdcfb5ea2457715a3bd18c2cbe81507977906ff2f80f4'
RUNTIME='7102f71ee21f1c0908adf9b2830f0d6859e4a8271f74b8e020821203a25d4263'
def load(p):return json.loads(p.read_bytes())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def check(base=BASE):
 base=Path(base)
 if sha(base/'actual-proof-index.json')!=INDEX:raise ValueError('Frozen peer commitment changed')
 index=load(base/'actual-proof-index.json')
 for name,pin in index['files'].items():
  p=base/name
  if not p.is_file()or p.is_symlink()or sha(p)!=pin:raise ValueError('Frozen actual peer bytes missing/changed: '+name)
 report=load(base/'actual-ui-22/report.json');terminal=load(base/'actual-ui-22/terminal-receipt.json');judgment=load(base/'independent-judgment.json');plan=load(base/'actual-ui-22/executed-plan.json');source=load(base/'source-review-receipt.json')
 if terminal['actualExitCode']!=0 or terminal['error']is not None or terminal['before']!=terminal['after']or terminal['before']['sha256']!=RUNTIME or report['runtimeBefore']!=terminal['before']or report['runtimeAfter']!=terminal['after']:raise ValueError('Actually observed candidate epoch/terminal differs')
 if report['sourceCommit']!='6a8dc478ca9fac73da82c77935aca369c6753297'or not report['matrixComplete']or report['errors']or report.get('failure')or len(report['records'])!=22 or len(plan)!=22 or{r['key']for r in report['records']}!={r['key']for r in plan}:raise ValueError('Targeted actual case completeness differs')
 if report['protocolSha256']!=sha(base/'browser-canary.mjs')or terminal['protocolSha256']!=report['protocolSha256']or terminal['supervisorSha256']!=sha(base/'run-bounded.py')or report['planSha256']!=sha(base/'actual-ui-22/executed-plan.json'):raise ValueError('Actually executed protocol changed')
 for row in report['records']:
  if not row['technicalOk']or row['actualSelectedView']!=row['view']or row['observed']['axe']or row['observed']['documentWidth']>row['width']+1 or('time'in row and float(row['actualTime'])!=row['time']):raise ValueError('Actual controls/layout case differs')
  if sha(base/'actual-ui-22'/row['png'])!=row['pngSha256']:raise ValueError('Actual PNG changed')
 if source['actualProductionDeltaFiles']!=12 or len(source['immutableGitModelAndAssessmentSha256'])!=13:raise ValueError('Disclosed source delta scope differs')
 for name,pin in source['snapshotAndActuallyBootedCandidateFiles'].items():
  if sha(base/'candidate-source-snapshot'/name)!=pin:raise ValueError('Actually read immutable source changed')
 geo=load(base/'near-peak-velocity-actual-geometry.json')
 if geo['time']!=.5 or geo['sourceSample']['vy']<=0 or len(geo['vectors'])!=2 or any(not v['visibleFlagFromSource']or not v['allCpuVerticesBehindSphereInSide']or not(0<v['nominalLength']<.02)or v['maximumRadius']>=.11 for v in geo['vectors']):raise ValueError('Actual nonzero velocity occlusion witness changed')
 if judgment['decision']!='NOT_ACCEPTED_RESIDUAL_CONSUMER_FINDINGS'or judgment['ok']is not False or set(judgment['unresolvedIds'])!={'LAB3D-01','LAB3D-02','LAB3D-07'}or judgment['activityCredit']!=0 or judgment['humanApproval']!='NOT_RUN'or judgment['publicationAction']!='NONE':raise ValueError('Negative peer cannot become approval or credit')
 return {'ok':False,'technicalOk':True,'actualCases':22,'unresolvedIds':judgment['unresolvedIds'],'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
if __name__=='__main__':print(json.dumps(check()))
