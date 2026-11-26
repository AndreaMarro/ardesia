"""One bounded real consumer run under the shared local-work mutex."""
from pathlib import Path
import fcntl,shutil,subprocess,os,json,hashlib,signal
BASE=Path(__file__).resolve().parent
APP=Path('/private/tmp/cric-method-css-748-independent-app')
OUT=Path('/private/tmp/cric-method-css-748-independent-actual-20')
PYTHON='/private/tmp/cric-recovery-venv/bin/python'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 blueprint=json.loads((BASE/'independent-input-blueprint.json').read_bytes());env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1','PYTHON':PYTHON,'PATH':str(Path(PYTHON).parent)+':'+os.environ['PATH'],'ASTRA_EXTENSIONS':str(APP/'extensions')}
 def fingerprint():return json.loads(subprocess.check_output([PYTHON,'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=APP,env=env))
 process=None;code=None;error=None;before=None;after=None
 with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
  fcntl.flock(lock,fcntl.LOCK_EX)
  if shutil.disk_usage(BASE).free<2*1024**3:raise ValueError('Free disk below2GiB')
  if OUT.exists():raise ValueError('Fresh output directory required')
  try:
   before=fingerprint();assert before['sha256']==blueprint['runtimeSha256'];assert sha(APP/'content/metodo.json')==blueprint['sourceFileSha256']
   with (BASE/'actual-peer-process.log').open('xb')as log:
    process=subprocess.Popen(['node',str(BASE/'browser-worksheets-peer.mjs'),str(APP),str(OUT)],cwd=APP,env=env,stdout=log,stderr=subprocess.STDOUT,start_new_session=True);code=process.wait(timeout=600)
   if code!=0:raise ValueError('Actual browser terminal exit:'+str(code))
   after=fingerprint();assert before==after;report=json.loads((OUT/'report.json').read_bytes());assert report['runtimeFingerprint']==before and len(report['records'])==20 and all(r['technicalOk']for r in report['records'])
  except BaseException as e:
   error=type(e).__name__+': '+str(e)
   if process is not None and process.poll()is None:
    process.terminate()
    try:process.wait(timeout=20)
    except subprocess.TimeoutExpired:os.killpg(process.pid,signal.SIGKILL);process.wait(timeout=10)
    code=process.returncode
  receipt={'observedExitCode':code,'error':error,'before':before,'after':after,'sourceRuntimeCommit':blueprint['runtimeSourceCommit'],'blueprintSha256':sha(BASE/'independent-input-blueprint.json'),'protocolSha256':sha(BASE/'browser-worksheets-peer.mjs'),'supervisorSha256':sha(Path(__file__)),'status':'ACTUAL_UI_COMPLETE_REQUIRES_INDIVIDUAL_REVIEW'if error is None else'FAIL','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
  target=OUT/'terminal-receipt.json'if OUT.exists()else BASE/'prelaunch-error-receipt.json';target.write_text(json.dumps(receipt,indent=2)+'\n')
 if error:raise ValueError(error)
 print(json.dumps({'observedExitCode':code,'cases':20,'activityCredit':0}))
if __name__=='__main__':main()
