from pathlib import Path
import os,json,subprocess,fcntl,shutil,time,signal,hashlib,sys
B=Path(__file__).resolve().parent;APP=Path('/private/tmp/cric-stevino-probe-label-20261127/officina-di-fisica');PY='/private/tmp/cric-recovery-venv/bin/python';pin=json.loads((B/'source-runtime-pins.json').read_bytes());env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1','GIT_NO_LAZY_FETCH':'1','PYTHON':PY,'ASTRA_EXTENSIONS':str(APP/'extensions'),'ASTRA_HOSTED':'0','ASTRA_HTTPS':'0'}
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def profile():return json.loads(subprocess.check_output([PY,'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=APP,env=env))
with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);free=shutil.disk_usage(B).free;start=time.time();code=None;proc=None;error=None;before=None;after=None
 try:
  if free<2*1024**3:raise ValueError('Prelaunch needs2GiB; actualBytes='+str(free))
  if(B/'actual-ui-16').exists():raise ValueError('Fresh output required')
  before=profile()
  if before['sha256']!=pin['runtimeSha256']:raise ValueError('Immutable actual runtime mismatch')
  for name,expected in pin['runtimeFiles'].items():
   if sha(APP/name)!=expected:raise ValueError('Pinned actualsource mismatch:'+name)
  subprocess.run(['node','--check',str(B/'browser-focused.mjs')],cwd=APP,env=env,check=True,timeout=20)
  with(B/'actual-process.txt').open('xb')as stream:proc=subprocess.Popen(['node',str(B/'browser-focused.mjs')],cwd=APP,env=env,stdout=stream,stderr=subprocess.STDOUT,start_new_session=True);code=proc.wait(timeout=180)
  if code!=0:raise ValueError('Actual browser exit:'+str(code))
  after=profile()
  if before!=after:raise ValueError('Runtime drift')
 except BaseException as exc:
  error=type(exc).__name__+': '+str(exc)
  if proc is not None and proc.poll()is None:
   proc.terminate()
   try:proc.wait(timeout=20)
   except subprocess.TimeoutExpired:os.killpg(proc.pid,signal.SIGKILL);proc.wait(timeout=10)
   code=proc.returncode
  if before is not None:after=profile()
 receipt={'actualExitCode':code,'error':error,'elapsedSeconds':time.time()-start,'freeBytesAtAcquisition':free,'before':before,'after':after,'protocolSha256':sha(B/'browser-focused.mjs'),'supervisorSha256':sha(Path(__file__)),'sourcePinFileSha256':sha(B/'source-runtime-pins.json'),'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'};(B/'terminal-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
 if error:raise ValueError(error)
 print(json.dumps({'actualExitCode':code,'elapsedSeconds':receipt['elapsedSeconds'],'cases':16,'independentImageReading':'PENDING'}),flush=True)
