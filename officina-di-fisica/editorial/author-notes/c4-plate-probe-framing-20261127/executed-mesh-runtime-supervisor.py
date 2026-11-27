from pathlib import Path
import fcntl,shutil,json,subprocess,os,time,hashlib
APP=Path('/private/tmp/cric-vector-apparatus-author-20261126/officina-di-fisica');B=APP/'editorial/author-notes/c4-plate-probe-framing-20261127';PY='/private/tmp/cric-recovery-venv/bin/python';env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1','GIT_NO_LAZY_FETCH':'1','ASTRA_EXTENSIONS':str(APP/'extensions')}
with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);free=shutil.disk_usage(APP).free
 if free<2*1024**3:raise ValueError('Need2GiB free')
 before=json.loads(subprocess.check_output([PY,'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=APP,env=env));start=time.time()
 with(B/'actual-mesh-observation.txt').open('xb')as stream:r=subprocess.run(['node',str(B/'mesh-projection-observation.mjs')],cwd=APP,env=env,stdout=stream,stderr=subprocess.STDOUT,timeout=120)
 after=json.loads(subprocess.check_output([PY,'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=APP,env=env))
 if before!=after:raise ValueError('Runtime drift duringCPU')
 (B/'actual-mesh-runtime-receipt.json').write_text(json.dumps({'actualExitCode':r.returncode,'elapsedSeconds':time.time()-start,'freeBytesAtStart':free,'runtimeBefore':before,'runtimeAfter':after,'protocolSha256':hashlib.sha256((B/'mesh-projection-observation.mjs').read_bytes()).hexdigest(),'role':'AUTHOR_PROJECTUAL_ONLY','browserStarted':False,'activityCredit':0,'humanApproval':'NOT_RUN'},indent=2)+'\n')
 print(json.dumps({'actualExitCode':r.returncode,'runtimeSha256':before['sha256']}),flush=True)
 if r.returncode:raise SystemExit(r.returncode)
