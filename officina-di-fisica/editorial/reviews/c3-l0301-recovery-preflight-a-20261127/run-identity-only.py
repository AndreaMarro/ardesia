from pathlib import Path
import subprocess,sys,fcntl,json,time,shutil,hashlib,os
D=Path(__file__).resolve().parent;T=Path('/Users/andreamarro/Documents/Codex/2026-11-24/codex-cric-full-corpus-scientific-pedagogical');lock=T/'work/.cric-browser.lock';python=T/'work/cric-runtime-env-20261127/bin/python'
with lock.open('a')as mutex:
 fcntl.flock(mutex,fcntl.LOCK_EX);free=shutil.disk_usage(D).free
 if free<2*1024**3:raise SystemExit('RESOURCE_REFUSAL_BEFORE_IDENTITY_CHILD')
 command=[str(python),'-B',str(D/'verify-recovery-identities.py')];start=time.monotonic();r=subprocess.run(command,capture_output=True,timeout=60,env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1'})
 for name,raw in [('stdout',r.stdout),('stderr',r.stderr)]:(D/('identity-actual-'+name+'.txt')).write_bytes(raw)
 rec=dict(actualObservedExitCode=r.returncode,signal=-r.returncode if r.returncode<0 else None,elapsedSeconds=time.monotonic()-start,timeoutSeconds=60,timedOut=False,lockPath=str(lock),freeBytesAtLock=free,command=command,browser='NOT_RUN',stdoutSha256=hashlib.sha256(r.stdout).hexdigest(),stderrSha256=hashlib.sha256(r.stderr).hexdigest());(D/'identity-actual-terminal.json').write_text(json.dumps(rec,indent=2)+'\n');print(rec,flush=True);raise SystemExit(r.returncode)
