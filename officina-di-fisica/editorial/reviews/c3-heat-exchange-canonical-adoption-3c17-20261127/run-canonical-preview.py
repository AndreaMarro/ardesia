from pathlib import Path
import subprocess,fcntl,shutil,os,json,time,sys,hashlib
F=Path(__file__).resolve().parent;APP=F.parents[2];WORK=APP.parent.parent;PY=WORK/'cric-runtime-env-20261127/bin/python';BATCH='experiment-c3-heat-exchange-reading-20261127';sha=lambda b:hashlib.sha256(b).hexdigest();env={**os.environ,'PATH':str(PY.parent)+os.pathsep+os.environ['PATH'],'PYTHONDONTWRITEBYTECODE':'1','GIT_NO_LAZY_FETCH':'1','ASTRA_EXTENSIONS':str(APP/'extensions'),'ASTRA_RESULTS':str(F/'canonical-preview-9')}
with(WORK/'.cric-browser.lock').open('a+')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);free=shutil.disk_usage(WORK).free;assert free>=2*1024**3;assert not(F/'canonical-preview-9').exists();profile=json.loads(subprocess.check_output([str(PY),'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=APP,env=env,timeout=30));assert profile['sha256']=='3c174677e6b7fc585903dbb6a5bc6b9fa078b435375f9333a6a81897f1027dc2';registry=sha((APP/'editorial/batches/registry.json').read_bytes());start=time.time();print('LOCK_ACQUIRED_CANONICAL9',free,flush=True)
 with(F/'actual-preview-process.txt').open('wb')as log:
  child=subprocess.Popen(['node','tests/corpus/browser-drafts.mjs',BATCH],cwd=APP,env=env,stdout=log,stderr=subprocess.STDOUT)
  try:code=child.wait(timeout=180);timed=False
  except subprocess.TimeoutExpired:
   timed=True;child.terminate()
   try:child.wait(timeout=15)
   except subprocess.TimeoutExpired:child.kill();child.wait()
   code=child.returncode
 receipt={'exitCode':code,'timeoutTriggered':timed,'elapsedSeconds':time.time()-start,'childPid':child.pid,'freeBefore':free,'protocolSha256':sha((APP/'tests/corpus/browser-drafts.mjs').read_bytes()),'runtimeBefore':profile,'registryBeforeSha256':registry,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
 after=json.loads(subprocess.check_output([str(PY),'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=APP,env=env,timeout=30));receipt['runtimeAfter']=after;receipt['registryAfterSha256']=sha((APP/'editorial/batches/registry.json').read_bytes());(F/'actual-preview-terminal.json').write_text(json.dumps(receipt,indent=2)+'\n')
 assert after==profile and receipt['registryAfterSha256']==registry
 if code==0:
  raw=(F/'canonical-preview-9/report.json').read_bytes();report=json.loads(raw);assert len(report['records'])==9;(APP/'editorial/reviews'/(BATCH+'-browser.json')).write_bytes(raw)
 print(json.dumps({k:v for k,v in receipt.items()if k not in['runtimeBefore','runtimeAfter']}),flush=True);sys.exit(0 if code==0 else 1)
