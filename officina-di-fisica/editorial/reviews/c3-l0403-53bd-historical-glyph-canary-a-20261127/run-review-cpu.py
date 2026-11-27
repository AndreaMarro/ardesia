from pathlib import Path
import fcntl,json,os,shutil,subprocess,time
D=Path(__file__).resolve().parent;TASK=D.parents[5];PYTHON=TASK/'work/cric-runtime-env-20261127/bin/python'
with(TASK/'work/.cric-browser.lock').open('a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);free=shutil.disk_usage(TASK).free
 if free<2*1024**3:raise SystemExit('CPU guard refusal')
 start=time.monotonic();run=subprocess.run([str(PYTHON),str(D/'review-canary.py')],env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1'},capture_output=True,timeout=45)
 for n,b in [('stdout',run.stdout),('stderr',run.stderr)]:(D/('review-'+n+'.txt')).write_bytes(b)
 t=dict(actualObservedExitCode=run.returncode,elapsedSeconds=time.monotonic()-start,freeBytesAtAcquisition=free,productFindingCredit=0,activityCredit=0,humanApproval='NOT_RUN');(D/'review-terminal.json').write_text(json.dumps(t,indent=2)+'\n');print(json.dumps(t));print(run.stderr.decode()[-2500:]);raise SystemExit(run.returncode)
