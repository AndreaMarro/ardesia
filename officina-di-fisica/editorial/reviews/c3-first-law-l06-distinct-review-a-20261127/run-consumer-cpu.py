from pathlib import Path
import fcntl,shutil,subprocess,os,time,json
D=Path(__file__).resolve().parent;APP=D.parents[2];TASK=D.parents[5];RT=TASK/'work/cric-converged-runtime-20261127/officina-di-fisica'
with(TASK/'work/.cric-browser.lock').open('a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);free=shutil.disk_usage(TASK).free
 if free<2*1024**3:raise SystemExit('Resource refusal before CPU child')
 t=time.monotonic();r=subprocess.run(['node',str(D/'observe-consumer.mjs'),str(RT)],cwd=APP,env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1'},capture_output=True,timeout=30)
 for name,blob in [('stdout',r.stdout),('stderr',r.stderr)]:(D/('consumer-'+name+'.txt')).write_bytes(blob)
 result=dict(actualObservedExitCode=r.returncode,elapsedSeconds=time.monotonic()-t,freeBytesAtAcquisition=free,browser='NOT_RUN',activityCredit=0,humanApproval='NOT_RUN');(D/'consumer-terminal.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result));print(r.stderr.decode()[-1500:]);raise SystemExit(r.returncode)
