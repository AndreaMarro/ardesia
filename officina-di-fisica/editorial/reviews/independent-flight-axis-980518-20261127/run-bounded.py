from pathlib import Path
import os,json,hashlib,fcntl,shutil,subprocess,signal,time
B=Path(__file__).resolve().parent;APP=Path('/private/tmp/cric-flight-axis-legend-20261127/officina-di-fisica');CORE=Path('/private/tmp/cric-experiment-contract-fix/officina-di-fisica');OUT=Path('/private/tmp/cric-flight-axis980-canary70');PY='/private/tmp/cric-recovery-venv/bin/python'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1','GIT_NO_LAZY_FETCH':'1','PYTHON':PY,'ASTRA_EXTENSIONS':str(APP/'extensions'),'ASTRA_SHOTS':str(OUT),'ASTRA_HOSTED':'0','ASTRA_HTTPS':'0'}
 def fp():
  return json.loads(subprocess.check_output([PY,'-B','-c','from pathlib import Path;import json;from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint;print(json.dumps(runtime_fingerprint(Path('+repr(str(APP))+'))))'],cwd=CORE,env=env))
 with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
  fcntl.flock(lock,fcntl.LOCK_EX)
  free=shutil.disk_usage(B).free
  if free<2*1024**3:raise ValueError('Need2GiB free;actual='+str(free))
  if OUT.exists():raise ValueError('Fresh candidate canary output required')
  before=fp()
  if before['sha256']!='980518b78d0767d90f16322539852e7e79360e20f05078ceb6e9b0425e805301':raise ValueError('Actually booted candidate differs')
  start=time.time();p=None;code=None;error=None
  try:
   with (B/'actual-process.txt').open('xb')as stream:
    p=subprocess.Popen(['node',str(B/'browser-canary.mjs')],cwd=CORE,env=env,stdout=stream,stderr=subprocess.STDOUT,start_new_session=True);code=p.wait(timeout=300)
   if code!=0:raise ValueError('Actual candidate browser exit:'+str(code))
  except BaseException as exc:
   error=type(exc).__name__+': '+str(exc)
   if p is not None and p.poll()is None:
    p.terminate()
    try:p.wait(timeout=20)
    except subprocess.TimeoutExpired:os.killpg(p.pid,signal.SIGKILL);p.wait(timeout=10)
    code=p.returncode
  after=fp()
  if after!=before:error=(error or'')+' Runtime drift; no in-flight evidence valid'
  dest=OUT/'terminal-receipt.json'if OUT.exists()else B/'prelaunch-error.json';dest.write_text(json.dumps({'actualExitCode':code,'error':error,'before':before,'after':after,'elapsedSeconds':time.time()-start,'freeBytesAtStart':free,'protocolSha256':sha(B/'browser-canary.mjs'),'supervisorSha256':sha(Path(__file__)),'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'},indent=2)+'\n')
 if error:raise ValueError(error)
 print(json.dumps({'actualExitCode':code,'out':str(OUT),'semanticReview':'PENDING','activityCredit':0}))
if __name__=='__main__':main()
