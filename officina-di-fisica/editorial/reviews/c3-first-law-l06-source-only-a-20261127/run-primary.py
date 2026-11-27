from pathlib import Path
import fcntl,json,os,shutil,subprocess,time,hashlib
D=Path(__file__).resolve().parent;TASK=D.parents[5];PYTHON=TASK/'work/cric-runtime-env-20261127/bin/python'
with(TASK/'work/.cric-browser.lock').open('a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);free=shutil.disk_usage(TASK).free
 if free<2*1024**3:raise SystemExit('CPU resource refusal')
 started=time.monotonic();r=subprocess.run([str(PYTHON),str(D/'test-primary.py')],env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1'},capture_output=True,timeout=60)
 for name,blob in [('stdout',r.stdout),('stderr',r.stderr)]:(D/('actual-'+name+'.txt')).write_bytes(blob)
 out=dict(actualObservedExitCode=r.returncode,elapsedSeconds=time.monotonic()-started,freeBytesAtAcquisition=free,sourceOnly=True,candidateOpened=False,manualExamples=20,symbolicIdentities=4,pintConversions=8,hypothesisExamples=200,browser='NOT_RUN',activityCredit=0,humanApproval='NOT_RUN')
 (D/'actual-terminal.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out));print(r.stderr.decode()[-2500:]);raise SystemExit(r.returncode)
