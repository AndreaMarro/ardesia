"""Integrity of the bounded distinct canary; never grants activity admission."""
from pathlib import Path
import hashlib,json
BASE=Path(__file__).resolve().parent
INDEX='338f01ee02b479f50f784bab97523aa1e448fab9bfec5f7b77aa97575deda454'
RUNTIME='abb2bf2ac567438953766cf3550644b3d6ea501d75d610fb6291b2cffc5a428b'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def load(p):return json.loads(p.read_bytes())
def check(base=BASE):
 base=Path(base)
 if sha(base/'actual-proof-index.json')!=INDEX:raise ValueError('Frozen independent commitment changed')
 for name,pin in load(base/'actual-proof-index.json')['files'].items():
  p=base/name
  if p.is_symlink()or not p.is_file()or sha(p)!=pin:raise ValueError('Missing or changed actual proof: '+name)
 r=load(base/'actual-ui-22/report.json');t=load(base/'actual-ui-22/terminal-receipt.json');j=load(base/'independent-judgment.json');plan=load(base/'actual-ui-22/executed-plan.json')
 if t['actualExitCode']!=0 or t['error']is not None or t['before']!=t['after']or t['before']['sha256']!=RUNTIME or r['runtimeBefore']!=t['before']or r['runtimeAfter']!=t['after']or r['errors']or r.get('failure')or not r['matrixComplete']:raise ValueError('Actually observed epoch/terminal failed')
 if r['sourceCommit']!='0184b146513e024d99ce8391fb0a5f4892f79e7e'or len(r['records'])!=22 or len(plan)!=22 or len({x['key']for x in r['records']})!=22 or{x['key']for x in r['records']}!={x['key']for x in plan}:raise ValueError('Case completeness differs')
 if r['protocolSha256']!=sha(base/'browser-canary.mjs')or t['protocolSha256']!=r['protocolSha256']or t['supervisorSha256']!=sha(base/'run-bounded.py')or r['planSha256']!=sha(base/'actual-ui-22/executed-plan.json'):raise ValueError('Actually executed protocol differs')
 for row in r['records']:
  if not row['technicalOk']or not row['legendOpened']or row['openedLegendAxe']or row['observed']['axe']or row['observed']['documentWidth']>row['width']+1 or row['actualSelectedView']!=row['view']or('time'in row and float(row['actualTime'])!=row['time']):raise ValueError('Actual UI controls or accessibility differ')
  if sha(base/'actual-ui-22'/row['png'])!=row['pngSha256']:raise ValueError('Actual image changed')
 for row in[x for x in r['records']if x['id']=='LAB3D-01']:
  if 'verso monte'not in row['legend']or 'in primo piano'not in row['legend']:raise ValueError('Required actual native legend absent')
 geo=load(base/'flight-positive-actual-geometry.json')
 if len(geo['results'])!=2 or any(x['visible']for x in geo['zeroVisibility']):raise ValueError('Source zero hiding differs')
 for row in geo['results']:
  if 'culmine'in row['actualLabels']:raise ValueError('Old covering cart remains')
  primary=next(x for x in row['vectors']if x['kind']=='full-v');detail=next(x for x in row['vectors']if x['kind']=='detail-v-times16')
  if not primary['visible']or not detail['visible']or detail['lengthFactor']!=16*primary['lengthFactor']:raise ValueError('Nonzero/detail scale differs')
  if any(v['outsideViewport']or v['vertexCount']!=327 or not v['tip']['inside']for v in[primary,detail]):raise ValueError('Whole constructed vector outside actual viewport')
 if j['decision']!='PASS_DISTINCT_TARGETED_CANARY_ONLY'or j['ok']is not True or j['activityCredit']!=0 or j['humanApproval']!='NOT_RUN'or j['publicationAction']!='NONE':raise ValueError('Targeted scope cannot grant global credit')
 return {'ok':True,'scope':'TARGETED_CANARY_ONLY','actualCases':22,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
if __name__=='__main__':print(json.dumps(check()))
