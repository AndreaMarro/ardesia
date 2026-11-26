"""Bounded existing-consumer cohort; immutable negative outputs never reused."""
from pathlib import Path
import fcntl,shutil,subprocess,os,json,hashlib,signal,sys,time
BASE=Path(__file__).resolve().parent
APP=Path('/private/tmp/cric-method-css-748-independent-app')
PYTHON='/private/tmp/cric-recovery-venv/bin/python'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 cohort=sys.argv[1];assert cohort in['catalogs','C1','C2','C3','C4','C5','C6']
 out=Path(sys.argv[2]).resolve();assert not out.exists(),'Fresh output required'
 env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1','GIT_NO_LAZY_FETCH':'1','PYTHON':PYTHON,'PATH':str(Path(PYTHON).parent)+':'+os.environ['PATH'],'ASTRA_EXTENSIONS':str(APP/'extensions')}
 def fp():return json.loads(subprocess.check_output([PYTHON,'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=APP,env=env))
 process=None;code=None;error=None;before=None;after=None
 with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
  fcntl.flock(lock,fcntl.LOCK_EX)
  if shutil.disk_usage(BASE).free<2*1024**3:raise ValueError('Need2GiB free')
  start=time.time()
  try:
   before=fp();assert before['sha256']==json.loads((BASE/'reader-blueprint.json').read_bytes())['runtimeSha256']
   log=BASE/(out.name+'-process.txt');assert not log.exists()
   with log.open('xb')as stream:
    process=subprocess.Popen(['node',str(BASE/'browser-readers.mjs'),str(out),cohort],cwd=APP,env=env,stdout=stream,stderr=subprocess.STDOUT,start_new_session=True);code=process.wait(timeout=600)
   if code!=0:raise ValueError('Actual browser exit:'+str(code))
   after=fp();assert after==before
  except BaseException as exc:
   error=type(exc).__name__+': '+str(exc)
   if process is not None and process.poll()is None:
    process.terminate()
    try:process.wait(timeout=20)
    except subprocess.TimeoutExpired:os.killpg(process.pid,signal.SIGKILL);process.wait(timeout=10)
    code=process.returncode
   if before is not None:after=fp()
  receipt={'observedExitCode':code,'error':error,'cohort':cohort,'elapsedSeconds':time.time()-start,'before':before,'after':after,'blueprintSha256':sha(BASE/'reader-blueprint.json'),'protocolSha256':sha(BASE/'browser-readers.mjs'),'supervisorSha256':sha(Path(__file__)),'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
  dest=out/'terminal-receipt.json'if out.exists()else BASE/(out.name+'-prelaunch-error.json');dest.write_text(json.dumps(receipt,indent=2)+'\n')
 if error:raise ValueError(error)
 print(json.dumps({'cohort':cohort,'observedExitCode':code,'activityCredit':0}))
if __name__=='__main__':main()
