from pathlib import Path
import json,os,subprocess,fcntl,shutil,hashlib,signal,time
B=Path(__file__).resolve().parent;APP=Path('/private/tmp/cric-wave-zero-readout-20261127/officina-di-fisica');OUT=Path('/private/tmp/cric-bench036-3ed5-actual-148');PY='/private/tmp/cric-recovery-venv/bin/python'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1','GIT_NO_LAZY_FETCH':'1','PYTHON':PY,'PATH':str(Path(PY).parent)+':'+os.environ['PATH'],'ASTRA_EXTENSIONS':str(APP/'extensions'),'ASTRA_SHOTS':str(OUT),'ASTRA_HOSTED':'0','ASTRA_HTTPS':'0'};pin=json.loads((B/'source-runtime-pins.json').read_bytes());process=None;code=None;error=None;before=None;after=None
 def fp():return json.loads(subprocess.check_output([PY,'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=APP,env=env))
 with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
  fcntl.flock(lock,fcntl.LOCK_EX);assert shutil.disk_usage(B).free>=2*1024**3;assert not OUT.exists();start=time.time()
  try:
   before=fp();assert before['sha256']==pin['runtimeSha256']
   with (B/'actual-process.txt').open('xb')as stream:
    process=subprocess.Popen(['node',str(B/'browser-bench-fields-optics-3ed5.mjs')],cwd=APP,env=env,stdout=stream,stderr=subprocess.STDOUT,start_new_session=True);code=process.wait(timeout=1200)
   if code!=0:raise ValueError('Actual browser exit:'+str(code))
   after=fp();assert before==after
  except BaseException as exc:
   error=type(exc).__name__+': '+str(exc)
   if process is not None and process.poll()is None:
    process.terminate()
    try:process.wait(timeout=20)
    except subprocess.TimeoutExpired:os.killpg(process.pid,signal.SIGKILL);process.wait(timeout=10)
    code=process.returncode
   if before is not None:after=fp()
  receipt={'actualExitCode':code,'error':error,'before':before,'after':after,'elapsedSeconds':time.time()-start,'protocolSha256':sha(B/'browser-bench-fields-optics-3ed5.mjs'),'supervisorSha256':sha(Path(__file__)),'pinFileSha256':sha(B/'source-runtime-pins.json'),'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'};dest=OUT/'terminal-receipt.json'if OUT.exists()else B/'prelaunch-error.json';dest.write_text(json.dumps(receipt,indent=2)+'\n')
 if error:raise ValueError(error)
 print(json.dumps({'actualExitCode':code,'activityCredit':0,'out':str(OUT)}))
if __name__=='__main__':main()
