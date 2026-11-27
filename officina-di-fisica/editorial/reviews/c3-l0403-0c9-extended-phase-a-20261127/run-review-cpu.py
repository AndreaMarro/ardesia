from pathlib import Path
import fcntl,json,os,shutil,subprocess,time
D=Path(__file__).resolve().parent;APP=D.parents[2];TASK=D.parents[5];RUNTIME=TASK/'work/cric-converged-next-20261127/officina-di-fisica'
with(TASK/'work/.cric-browser.lock').open('a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);free=shutil.disk_usage(TASK).free
 if free<2*1024**3:raise SystemExit('CPU resource refusal')
 start=time.monotonic();run=subprocess.run([str(TASK/'work/cric-runtime-env-20261127/bin/python'),str(D/'review-extended320.py')],cwd=APP,capture_output=True,timeout=30)
 for name,raw in [('stdout',run.stdout),('stderr',run.stderr)]:(D/('review-cpu-'+name+'.txt')).write_bytes(raw)
 terminal=dict(actualObservedExitCode=run.returncode,elapsedSeconds=time.monotonic()-start,freeBytesAtAcquisition=free,browser='NOT_RUN',activityCredit=0,humanApproval='NOT_RUN');(D/'review-cpu-terminal.json').write_text(json.dumps(terminal,indent=2)+'\n');print(json.dumps(terminal));raise SystemExit(run.returncode)
