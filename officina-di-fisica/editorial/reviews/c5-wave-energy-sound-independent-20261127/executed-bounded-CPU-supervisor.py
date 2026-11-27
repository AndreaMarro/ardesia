from pathlib import Path
import fcntl,shutil,subprocess,os,json,time,hashlib
app=Path('/private/tmp/cric-vector-apparatus-author-20261126/officina-di-fisica');f=app/'editorial/reviews/c5-wave-energy-sound-independent-20261127';env={**os.environ,'GIT_NO_LAZY_FETCH':'1','PYTHONDONTWRITEBYTECODE':'1'}
with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);free=shutil.disk_usage(app).free
 if free<2*1024**3:raise ValueError('2GiB guard')
 # Verify actual consumer bytes, not label the worktree solely from a claimed reference.
 paths=['static/js/banchi/voci/esperimento.js','static/js/banchi/voci/modelli/C5.js','static/js/banchi/voci/orologi.js','static/js/banchi/voci/apparati/onde.js','static/js/banchi/banco.js']
 for p in paths:assert (app/p).read_bytes()==subprocess.check_output(['git','show','b9994b9116e87478905191d85cca8037d17ae4bd:officina-di-fisica/'+p],cwd=app,env=env)
 receipts=[]
 for name,cmd in [('consumer',['node',str(f/'observe-installed-consumer.mjs')]),('oracle',['/private/tmp/cric-recovery-venv/bin/python','-B',str(f/'independent-oracle.py')])]:
  start=time.time();r=subprocess.run(cmd,cwd=app,env=env,capture_output=True,text=True,timeout=45);(f/('actual-'+name+'-process.txt')).write_text(r.stdout+r.stderr);receipts.append({'stage':name,'actualExitCode':r.returncode,'elapsedSeconds':time.time()-start})
  print(name,r.returncode,r.stdout[:2000],r.stderr[:2000],flush=True)
  if r.returncode:break
 (f/'actual-CPU-process-receipt.json').write_text(json.dumps({'processes':receipts,'freeBytesAtStart':free,'actualConsumerFilesVerifiedAgainstGit':paths,'browserStarted':False,'activityCredit':0},indent=2)+'\n')
 if len(receipts)!=2 or any(r['actualExitCode']for r in receipts):raise SystemExit(1)
