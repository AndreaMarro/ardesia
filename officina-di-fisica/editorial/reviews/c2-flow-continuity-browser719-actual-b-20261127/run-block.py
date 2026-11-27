"""One authorized bounded block, immutable prepared input, unchanged canonical collector."""
from pathlib import Path
import json,hashlib,importlib.util,subprocess,sys,os,time,shutil
D=Path(__file__).resolve().parent;R=D.parent;P=R/'visibility-protocol719-b-preflight-20261127';J=lambda p:json.loads(Path(p).read_bytes());H=lambda b:hashlib.sha256(b).hexdigest()
def mod(n,p):
 s=importlib.util.spec_from_file_location(n,p);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
key=sys.argv[1];assert key in [i+'-'+w for i in ['01','02','03','04','05']for w in ['320','1280']]
base=R/'c2-draft-browser719-preflight-b-20261127'/'blocks'/key;guard=mod('prelaunch719',P/'check_execution.py');checked=guard.check(base/'collector-input.json');info=J(base/'collector-input.json');plan=J(info['prepared']);dest=D/key;assert not dest.exists(),'Never overwrite previous attempt';dest.mkdir();out=dest/'actual';info.update({'output':str(out),'executionAuthorized':True});(dest/'collector-input.json').write_text(json.dumps(info,indent=2)+'\n');(dest/'prelaunch.json').write_text(json.dumps(checked,indent=2)+'\n')
app=Path(info['candidateApp']);env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1','PATH':'/private/tmp/cric-recovery-venv/bin'+os.pathsep+os.environ['PATH']};start=time.monotonic();free=shutil.disk_usage('/private/tmp').free
if free<2*1024**3:raise SystemExit('REFUSED below2GiB immediately before child')
with(dest/'collector.stdout.txt').open('w')as f:r=subprocess.run(['node',info['collectorPath'],str(dest/'collector-input.json')],cwd=app,env=env,stdout=f,stderr=subprocess.STDOUT)
receipt={'observedExitCode':r.returncode if r.returncode>=0 else None,'signal':-r.returncode if r.returncode<0 else None,'elapsedSeconds':time.monotonic()-start,'collectorSha256':info['collectorSha256'],'preparedSha256':info['preparedSha256'],'runtimeSha256':plan['runtimeFingerprint']['sha256'],'sourceCommit':plan['sourceCommit'],'plannedCases':len(plan['expectedCaseKeys']),'freeBytesBeforeChild':free,'reportSha256':H((out/'report.json').read_bytes())if(out/'report.json').exists()else None,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'};(dest/'terminal.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt),flush=True)
if r.returncode:raise SystemExit(r.returncode)
v=mod('canonical719',P/'experiment_visibility_request.py');report=v.verify_report(out,plan,info['collectorSha256']);mapping=v.planned_interactions(plan);setup=0;states=0
for e in report['cases']:
 c=J(out/e['file']);row,state=mapping[e['caseKey']];v.verify_planned_interaction(c,row,state)
 if state is None:
  assert len(c['questions'])==2 and all(q['status'].startswith('Corretto. ')for q in c['questions']);setup+=1
 else:states+=1
assert guard.check(base/'collector-input.json')==checked
(dest/'validation.json').write_text(json.dumps({'canonicalReportValidation':'PASS','allPlannedInteractions':'PASS','cases':len(report['cases']),'setups':setup,'states':states,'acceptedManualQuestionSubmissions':setup*2,'guestIsolation':report.get('guestIsolation'),'fullOwnerRecordIdentity':report.get('fullOwnerRecordIdentity'),'independentRasterReading':'PENDING','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'},indent=2)+'\n')
