from pathlib import Path
import subprocess,time,json,hashlib,sys,os,shutil,signal
A=Path('/private/tmp/cric-author-a-resident/officina-di-fisica');D=A/'editorial/reviews/c2-pascal-increment-height-fixed-7c7281-independent-a-20261127';R=Path('/private/tmp/cric-resident-integrator/officina-di-fisica');producer=R/'tools/corpus_engineering/experiment_visibility_ui.mjs';assert hashlib.sha256(producer.read_bytes()).hexdigest()=='719beb3abc01cbf7607dc1d5d1710732cbc59c2aae91112fb6b680dbfbd22d15'
for name,cmd,limit in [('actual',['node',str(producer),str(D/'request.json')],180)]:
 if shutil.disk_usage(D).free<2*1024**3+100*1024**2:raise SystemExit('BLOCKED_BEFORE_'+name+'_CHILD_NOT_RUN')
 t=time.time();proc=subprocess.Popen(cmd,cwd=A,stdout=subprocess.PIPE,stderr=subprocess.PIPE,start_new_session=True,env={**os.environ,'PATH':'/private/tmp/cric-recovery-venv/bin:'+os.environ['PATH'],'PYTHONDONTWRITEBYTECODE':'1'});timed=False;intervention=[]
 try:stdout,stderr=proc.communicate(timeout=limit)
 except subprocess.TimeoutExpired:
  timed=True;assert os.getpgid(proc.pid)==proc.pid;intervention.append(dict(signal='SIGTERM',ownedProcessGroup=proc.pid,epochSeconds=time.time()));os.killpg(proc.pid,signal.SIGTERM)
  try:stdout,stderr=proc.communicate(timeout=5)
  except subprocess.TimeoutExpired:
   intervention.append(dict(signal='SIGKILL',ownedProcessGroup=proc.pid,epochSeconds=time.time()));os.killpg(proc.pid,signal.SIGKILL);stdout,stderr=proc.communicate(timeout=5)
 for k,b in [('stdout',stdout),('stderr',stderr)]:(D/(name+'-process.'+k+'.txt')).write_bytes(b)
 rec=dict(actualObservedExitCode=proc.returncode,signal=None if proc.returncode>=0 else-proc.returncode,elapsedSeconds=time.time()-t,command=cmd,timeoutSeconds=limit,timedOut=timed,assistedTermination=timed,intervention=intervention,supervisorResultExitCode=124 if timed else proc.returncode,stdoutSha256=hashlib.sha256(stdout).hexdigest(),stderrSha256=hashlib.sha256(stderr).hexdigest(),scientificAcceptanceGranted=False);(D/(name+'-terminal.json')).write_text(json.dumps(rec,indent=2)+'\n');print(name,stdout.decode()[-1000:],stderr.decode()[-1200:],rec,flush=True)
 if timed:sys.exit(124)
 if proc.returncode:sys.exit(proc.returncode)
