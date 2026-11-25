"""Private local execution of the existing ETL and integration ports."""
import fcntl,hashlib,json,os,re,shutil,signal,subprocess,time,sys
from pathlib import Path
APP=Path.cwd();sys.path.insert(0,str(APP));OUT=APP/'var/local-only-2992';observations=[]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def memory_free():
 text=subprocess.check_output(['memory_pressure','-Q'],text=True)
 return int(re.search(r'free percentage:\s*(\d+)%',text)[1])
def execute(args,label):
 started=time.monotonic();log=OUT/(label+'.log');stop=None
 with log.open('w') as stream:
  child=subprocess.Popen(args,cwd=APP,env={**os.environ,'PATH':'/private/tmp/cric-recovery-venv/bin:'+os.environ['PATH'],'PYTHONPATH':'.','PYTHONDONTWRITEBYTECODE':'1'},stdout=stream,stderr=subprocess.STDOUT,start_new_session=True)
  while child.poll() is None:
   free=shutil.disk_usage('/private/tmp').free;memory=memory_free();observations.append({'stage':label,'seconds':round(time.monotonic()-started,1),'freeDiskBytes':free,'memoryFreePercent':memory})
   if free<2*1024**3 or memory<12 or time.monotonic()-started>1800:
    stop='RESOURCE_OR_DURATION_GUARD';os.killpg(child.pid,signal.SIGTERM)
    try:child.wait(timeout=30)
    except subprocess.TimeoutExpired:os.killpg(child.pid,signal.SIGKILL);child.wait()
    break
   time.sleep(5)
  code=child.wait()
 receipt={'label':label,'observedExitCode':code,'stop':stop,'seconds':round(time.monotonic()-started,3),'logSha256':sha(log)}
 (OUT/(label+'-receipt.json')).write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt),flush=True)
 if code or stop:raise RuntimeError('Canonical stage did not complete: '+label)

with open('/private/tmp/cric-bounded-local-work.lock','a') as lock:
 fcntl.flock(lock,fcntl.LOCK_EX)
 if shutil.disk_usage('/private/tmp').free<3*1024**3 or memory_free()<25:raise RuntimeError('Initial resource guard refused before any adoption or execution')
 from tools.corpus_engineering.pipeline import load_checkpoint
 source=OUT/'corpus'; target=APP/'editorial/corpus'
 q,a,m=load_checkpoint(source);assert (len(q),len(a),sum(r['state']=='REVISED_DRAFT' for r in q))==(4606,385,2992)
 reg=APP/'editorial/batches/registry.json';pin=sha(reg)
 assert pin==json.loads((OUT/'etl-complete.json').read_text())['registrySha256']
 before=OUT/'before-local-adoption';before.mkdir(exist_ok=True)
 for file in [target/'checkpoint.json',APP/'editorial/reviews/registry-coexistence.json']:
  saved=before/file.name
  if file.exists() and not saved.exists():shutil.copyfile(file,saved)
 pointer=json.loads((source/'checkpoint.json').read_text());generation=pointer['generation']
 shutil.copytree(source/generation,target/generation,dirs_exist_ok=True)
 temp=target/'checkpoint.json.local-pending';temp.write_bytes((source/'checkpoint.json').read_bytes());os.replace(temp,target/'checkpoint.json')
 (OUT/'local-adoption-pending.json').write_text(json.dumps({'scope':'Local candidate checkpoint only; coexistence/full suite/release still pending','checkpoint':pointer,'registrySha256':pin,'uploads':False,'humanApproval':'NOT_RUN','publicationAction':'NONE'},indent=2)+'\n')
 py='/private/tmp/cric-recovery-venv/bin/python'
 execute([py,'-m','tools.corpus_engineering.integration','--registry','--output',str(OUT/'registry-coexistence.json')],'coexistence')
 shutil.copyfile(OUT/'registry-coexistence.json',APP/'editorial/reviews/registry-coexistence.json')
 execute([py,'-m','unittest','discover','-s','tests/corpus','-v'],'full-tests')
 execute([py,'-m','tools.corpus_engineering.batches'],'batches')
 execute([py,'tools/package_release.py',str(OUT/'officina-release.zip'),'--verify'],'release-build')
 execute([py,'-m','tools.corpus_engineering.release_check',str(OUT/'officina-release.zip')],'release-check')
 assert sha(reg)==pin
 counts={'questions':len(q),'activities':len(a),'revisedQuestionDrafts':sum(r['state']=='REVISED_DRAFT' for r in q),'reviewedActivities':sum(r['state'] in ('REVIEWED_EXISTING_EDITION','REVISED_ACTIVITY_DRAFT') for r in a)}
 result={'scope':'Actual canonical local checks; no CI or remote integration claim','checkpoint':pointer,'registrySha256':pin,'counts':counts,'stages':{label:json.loads((OUT/(label+'-receipt.json')).read_text()) for label in ['coexistence','full-tests','batches','release-build','release-check']},'releaseSha256':sha(OUT/'officina-release.zip'),'resourceObservations':observations,'uploads':False,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
 (OUT/'local-validation-complete.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k!='resourceObservations'}),flush=True)
