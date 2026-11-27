from pathlib import Path
import fcntl,shutil,subprocess,os,time,json
D=Path(__file__).resolve().parent;TASK=D.parents[5];PY=TASK/'work/cric-runtime-env-20261127/bin/python'
with(TASK/'work/.cric-browser.lock').open('a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);free=shutil.disk_usage(TASK).free
 if free<2*1024**3:raise SystemExit('CPU resource refusal')
 t=time.monotonic();r=subprocess.run([str(PY),str(D/'review-cpu.py')],env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1'},capture_output=True,timeout=45)
 for name,blob in [('stdout',r.stdout),('stderr',r.stderr)]:(D/('review-'+name+'.txt')).write_bytes(blob)
 out=dict(actualObservedExitCode=r.returncode,elapsedSeconds=time.monotonic()-t,freeBytesAtAcquisition=free,browser='NOT_RUN',activityCredit=0,humanApproval='NOT_RUN');(D/'review-terminal.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out));print(r.stderr.decode()[-3000:]);raise SystemExit(r.returncode)
