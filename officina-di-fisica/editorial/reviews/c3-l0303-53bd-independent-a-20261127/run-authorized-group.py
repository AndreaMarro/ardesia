"""Persistent one-group supervisor. No browser without renewed Root authorization."""
from pathlib import Path
import argparse,fcntl,hashlib,json,os,shutil,signal,subprocess,sys,time
TASK=Path('/Users/andreamarro/Documents/Codex/2026-11-24/codex-cric-full-corpus-scientific-pedagogical');APP=TASK/'work/cric-author-a-resident-20261127/officina-di-fisica';D=Path(__file__).resolve().parent
ENV=TASK/'work/cric-runtime-env-20261127';LOCK=TASK/'work/.cric-browser.lock';COLLECTOR=APP/'editorial/reviews/c3-six-heat-phase-core6ae3-independent-a-20261127/canonical-collector-719.verbatim.mjs'
p=argparse.ArgumentParser();p.add_argument('--width',type=int,choices=(320,1280),required=True);p.add_argument('--execute-root-authorized',action='store_true');args=p.parse_args();G=D/str(args.width)
if not args.execute_root_authorized:raise SystemExit('NOT_RUN: renewed Root execution authorization required')
if (G/'actual').exists()or(G/'actual-terminal.json').exists():raise SystemExit('REFUSE_TO_OVERWRITE_PREVIOUS_ATTEMPT')
assert hashlib.sha256(COLLECTOR.read_bytes()).hexdigest()=='719beb3abc01cbf7607dc1d5d1710732cbc59c2aae91112fb6b680dbfbd22d15'
with LOCK.open('a')as mutex:
 fcntl.flock(mutex,fcntl.LOCK_EX);free=shutil.disk_usage(G).free
 if free<2*1024**3+100*1024**2:raise SystemExit('RESOURCE_REFUSAL_BEFORE_BROWSER: '+str(free))
 print('PERSISTENT_MUTEX_ACQUIRED; free bytes '+str(free),flush=True)
 cmd=['node',str(COLLECTOR),str(G/'request.json')];limit=180;t=time.monotonic();env={**os.environ,'PATH':str(ENV/'bin')+os.pathsep+os.environ['PATH'],'PYTHONDONTWRITEBYTECODE':'1'}
 proc=subprocess.Popen(cmd,cwd=APP,env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE,start_new_session=True);timed=False;interventions=[]
 try:out,err=proc.communicate(timeout=limit)
 except subprocess.TimeoutExpired:
  timed=True;assert os.getpgid(proc.pid)==proc.pid;interventions.append({'signal':'SIGTERM','ownedProcessGroup':proc.pid});os.killpg(proc.pid,signal.SIGTERM)
  try:out,err=proc.communicate(timeout=5)
  except subprocess.TimeoutExpired:
   interventions.append({'signal':'SIGKILL','ownedProcessGroup':proc.pid});os.killpg(proc.pid,signal.SIGKILL);out,err=proc.communicate(timeout=5)
 for name,raw in [('stdout',out),('stderr',err)]:(G/('actual-process-'+name+'.txt')).write_bytes(raw)
 receipt=dict(actualObservedExitCode=proc.returncode,signal=-proc.returncode if proc.returncode<0 else None,elapsedSeconds=time.monotonic()-t,timeoutSeconds=limit,timedOut=timed,assistedTermination=timed,intervention=interventions,command=cmd,lockPath=str(LOCK),freeBytesAtAcquisition=free,stdoutSha256=hashlib.sha256(out).hexdigest(),stderrSha256=hashlib.sha256(err).hexdigest(),activityCredit=0,humanApproval='NOT_RUN')
 (G/'actual-terminal.json').write_text(json.dumps(receipt,indent=2)+'\n');print(receipt,flush=True);raise SystemExit(124 if timed else proc.returncode)
