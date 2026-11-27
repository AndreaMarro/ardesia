from pathlib import Path
import subprocess,fcntl,shutil,os,json,sys,time,hashlib
F=Path(__file__).parent.resolve();REPO=F.parents[3];WORK=REPO.parent;APP=WORK/'cric-review-c2-c39-runtime-20261127/officina-di-fisica';PY=WORK/'cric-runtime-env-20261127/bin/python';env={**os.environ,'GIT_NO_LAZY_FETCH':'1','PYTHONDONTWRITEBYTECODE':'1','ASTRA_EXTENSIONS':str(APP/'extensions')};processes=[]
with(WORK/'.cric-browser.lock').open('a+')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);free=shutil.disk_usage(WORK).free;assert free>=2*1024**3
 fp=json.loads(subprocess.check_output([str(PY),'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=APP,env=env,timeout=30));assert fp['sha256']=='c39f7cdf31e4443059614bac79e7e27c6399c1cfc6fe3dcd1bfdb6b9c3db027e'
 for name,cmd in [('consumer',['node',str(F/'observe-installed-consumer.mjs'),str(APP)]),('independent-oracle',[str(PY),'-B',str(F/'independent-oracle.py')])]:
  start=time.time();r=subprocess.run(cmd,cwd=APP,env=env,capture_output=True,text=True,timeout=60);(F/('actual-'+name+'-process.txt')).write_text(r.stdout+r.stderr);processes.append({'name':name,'exitCode':r.returncode,'elapsedSeconds':time.time()-start});print(name,r.returncode,flush=True)
  if r.returncode:print(r.stdout+r.stderr);break
 (F/'actual-CPU-receipt.json').write_text(json.dumps({'processes':processes,'runtime':fp,'freeBefore':free,'modelFileSha256':hashlib.sha256((APP/'static/js/banchi/voci/modelli/C5.js').read_bytes()).hexdigest(),'browserStarted':False,'productUI':'NOT_RUN','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'},indent=2)+'\n');sys.exit(processes[-1]['exitCode'])
