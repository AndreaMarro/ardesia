"""Run the unchanged canonical preview once in the private exact FE5D fixture."""
from pathlib import Path
import fcntl,hashlib,json,os,shutil,signal,subprocess,time
D=Path(__file__).resolve().parent;TASK=D.parents[5];APP=TASK/'work/cric-b-c2-fe5d-canonical-20261127/officina-di-fisica';PYTHON=TASK/'work/cric-runtime-env-20261127/bin/python';BATCH='experiment-c2-continuity-l00501-reading-fe5d-20261127';LOCK=TASK/'work/.cric-browser.lock';OUT=D/'private-preview';OUT.mkdir(exist_ok=True)
if(OUT/'actual-terminal.json').exists():raise SystemExit('Refuse overwrite of actual browser terminal')
with LOCK.open('a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);free=shutil.disk_usage(TASK).free
 if free<2*1024**3+100*1024**2:raise SystemExit('Disk refusal before browser child')
 env={**os.environ,'PATH':str(PYTHON.parent)+os.pathsep+os.environ['PATH'],'PYTHONDONTWRITEBYTECODE':'1','ASTRA_RESULTS':str(OUT/'actual'),'ASTRA_EXTENSIONS':str(APP/'extensions')};fp=json.loads(subprocess.check_output([str(PYTHON),'-m','tools.corpus_engineering.runtime_fingerprint'],cwd=APP,env=env));assert fp['sha256']=='fe5d26413e1aeb59987cc3fd6040adde3b01952b6e5e5c3951695b2e64d9166b';(OUT/'runtime-before.json').write_text(json.dumps(fp,sort_keys=True)+'\n')
 command=['node','tests/corpus/browser-drafts.mjs',BATCH];started=time.monotonic();interventions=[];timeout=False;print('FE5D canonical preview acquired lock; 3 widths, one Chrome',flush=True)
 with(OUT/'stdout.txt').open('wb')as out,(OUT/'stderr.txt').open('wb')as err:
  p=subprocess.Popen(command,cwd=APP,env=env,stdout=out,stderr=err,start_new_session=True)
  try:code=p.wait(timeout=180)
  except subprocess.TimeoutExpired:
   timeout=True;interventions.append('SIGTERM own group after180s');os.killpg(p.pid,signal.SIGTERM)
   try:code=p.wait(timeout=5)
   except subprocess.TimeoutExpired:interventions.append('SIGKILL own group');os.killpg(p.pid,signal.SIGKILL);code=p.wait()
 after=json.loads(subprocess.check_output([str(PYTHON),'-m','tools.corpus_engineering.runtime_fingerprint'],cwd=APP,env=env));assert after==fp
 t={'actualObservedExitCode':code,'signal':None if code>=0 else-code,'elapsedSeconds':time.monotonic()-started,'timeoutSeconds':180,'timedOut':timeout,'assistedTermination':bool(interventions),'intervention':interventions,'command':command,'lockPath':str(LOCK),'freeBytesAtAcquisition':free,'runtimeSha256':fp['sha256'],'stdoutSha256':hashlib.sha256((OUT/'stdout.txt').read_bytes()).hexdigest(),'stderrSha256':hashlib.sha256((OUT/'stderr.txt').read_bytes()).hexdigest(),'activityCredit':0,'humanApproval':'NOT_RUN'};(OUT/'actual-terminal.json').write_text(json.dumps(t,sort_keys=True,indent=2)+'\n');print(json.dumps(t),flush=True);raise SystemExit(code if code>=0 else 1)
