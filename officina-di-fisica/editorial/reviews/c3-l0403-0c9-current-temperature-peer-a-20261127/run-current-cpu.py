from pathlib import Path
import argparse,fcntl,json,shutil,subprocess,os,time
D=Path(__file__).resolve().parent;TASK=D.parents[5];p=argparse.ArgumentParser();p.add_argument('--width',type=int,choices=(320,1280),required=True);a=p.parse_args();G=D/str(a.width)
with(TASK/'work/.cric-browser.lock').open('a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);free=shutil.disk_usage(TASK).free
 if free<2*1024**3:raise SystemExit('CPU guard refusal')
 start=time.monotonic();r=subprocess.run([str(TASK/'work/cric-runtime-env-20261127/bin/python'),str(D/'review-current.py'),str(a.width)],env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1'},capture_output=True,timeout=45)
 for n,b in [('stdout',r.stdout),('stderr',r.stderr)]:(G/('cpu-'+n+'.txt')).write_bytes(b)
 out=dict(actualObservedExitCode=r.returncode,elapsedSeconds=time.monotonic()-start,freeBytesAtAcquisition=free,activityCredit=0,humanApproval='NOT_RUN');(G/'cpu-terminal.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out));print(r.stderr.decode()[-2200:]);raise SystemExit(r.returncode)
