from pathlib import Path
import subprocess,fcntl,shutil,os,json,sys,time,tempfile
F=Path(__file__).resolve().parent;BASE=F.parent;APP=BASE.parents[2];WORK=APP.parent.parent;sys.path.insert(0,str(APP));env={**os.environ,'GIT_NO_LAZY_FETCH':'1','PYTHONDONTWRITEBYTECODE':'1','ASTRA_EXTENSIONS':str(APP/'extensions')};package=F/'experiment-c3-heat-exchange-reading-20261127.json';observation=F/'actual-final-consumer.json';processes=[]
with(WORK/'.cric-browser.lock').open('a+')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);free=shutil.disk_usage(WORK).free;assert free>=2*1024**3
 from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint
 from tools.corpus_engineering.integration import exercise_package
 fp=runtime_fingerprint(APP);assert fp['sha256']=='53bd0c149919095e24abc8f490702494b3054367230aa941ff509ce52772d46a'
 for name,cmd in [('consumer',['node',str(BASE/'observe-consumer.mjs'),str(package),str(APP),str(observation)]),('independent-oracle',[sys.executable,'-B',str(F/'independent-oracle-final.py'),str(package),str(observation)])]:
  start=time.time();r=subprocess.run(cmd,cwd=APP,env=env,capture_output=True,text=True,timeout=60);(F/('actual-'+name+'-process.txt')).write_text(r.stdout+r.stderr);processes.append({'name':name,'exitCode':r.returncode,'seconds':time.time()-start});print(name,r.returncode,flush=True)
  if r.returncode:raise ValueError(r.stdout+r.stderr)
 integration=exercise_package(package);assert runtime_fingerprint(APP)==fp;(F/'actual-canonical-import.json').write_text(json.dumps(integration,indent=2)+'\n');(F/'actual-final-CPU-receipt.json').write_text(json.dumps({'processes':processes,'freeBefore':free,'runtimeBefore':fp,'runtimeAfter':runtime_fingerprint(APP),'canonicalImport':integration,'browserStarted':False,'productUI':'NOT_RUN','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'},indent=2)+'\n');print('IMPORT',integration['firstImport'],integration['repeatedImport'],integration['afterPublishedCount'],flush=True)
