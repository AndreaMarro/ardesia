from pathlib import Path
import fcntl,shutil,subprocess,os,json,time
F=Path('/private/tmp/cric-vector-apparatus-author-20261126/officina-di-fisica/editorial/reviews/c5-eleven-drafts-canary-7c7281-20261127')
with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);free=shutil.disk_usage(F).free
 if free<2*1024**3:raise ValueError('2GiB guard')
 results=[]
 for name,cmd in [('authority-tests',['/private/tmp/cric-recovery-venv/bin/python','-B',str(F/'test-prelaunch-authority.py')]),('evidence-analysis',['/usr/local/bin/python3'if Path('/usr/local/bin/python3').exists()else'python3',str(F/'analyse-canary-evidence.py')])]:
  start=time.time();run=subprocess.run(cmd,cwd=F,env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1','GIT_NO_LAZY_FETCH':'1'},capture_output=True,text=True,timeout=45);(F/('actual-'+name+'-process.txt')).write_text(run.stdout+run.stderr);results.append({'name':name,'actualExitCode':run.returncode,'elapsedSeconds':time.time()-start});print(name,run.returncode,run.stdout[:1600],run.stderr[:1600],flush=True)
  if run.returncode:break
 (F/'actual-evidence-cpu-receipt.json').write_text(json.dumps({'results':results,'freeBytesAtStart':free,'browserStarted':False,'activityCredit':0},indent=2)+'\n')
 if len(results)!=2 or any(r['actualExitCode']for r in results):raise SystemExit(1)
