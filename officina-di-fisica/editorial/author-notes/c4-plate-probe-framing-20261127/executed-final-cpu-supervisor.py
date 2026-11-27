from pathlib import Path
import os,subprocess,fcntl,shutil,json,time,tempfile,hashlib
APP=Path('/private/tmp/cric-vector-apparatus-author-20261126/officina-di-fisica');B=APP/'editorial/author-notes/c4-plate-probe-framing-20261127';REF='b9994b9116e87478905191d85cca8037d17ae4bd';env={**os.environ,'GIT_NO_LAZY_FETCH':'1','PYTHONDONTWRITEBYTECODE':'1'};sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();results=[]
with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);free=shutil.disk_usage(APP).free
 if free<2*1024**3:raise ValueError('Need2GiB free')
 with tempfile.TemporaryDirectory(prefix='cric-c4-framing-cpu-base-')as temporary:
  baseline=Path(temporary)/'officina-di-fisica';baseline.mkdir();inputs=[]
  paths=subprocess.check_output(['git','ls-tree','-r','--name-only',REF,'--','officina-di-fisica/static/js','officina-di-fisica/static/vendor/three-r180','officina-di-fisica/package.json',*[f'officina-di-fisica/content/esperienze-C{i}.json'for i in range(1,7)]],cwd=APP.parent,env=env,text=True).splitlines()
  total=0
  for name in paths:
   body=subprocess.check_output(['git','show',REF+':'+name],cwd=APP.parent,env=env);total+=len(body)
   if total>16*1024**2:raise ValueError('Bounded baseline exceeds16MiB')
   p=baseline/Path(name).relative_to('officina-di-fisica');p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(body);inputs.append({'path':name,'sha256':hashlib.sha256(body).hexdigest(),'bytes':len(body)})
  # Final stronger test uses both static and unit-scaled Float32 renderer constructions.
  for name in['tests/plate-probe-camera.test.js','tests/helpers/plate-probe-projection.mjs']:
   p=baseline/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes((APP/name).read_bytes())
  (B/'immutable-baseline-source-inputs.json').write_text(json.dumps({'commit':REF,'files':inputs,'totalBytes':total,'scope':'CPU-only immutable source namespace, not a complete app or browser. No rewriting of baseline JS; original relative imports preserved.'},indent=2)+'\n')
  commands=[('red-final-stronger',['node','--test','tests/plate-probe-camera.test.js'],baseline,1),('source-invariance',['node',str(B/'source-invariance.mjs')],APP,0),('target-final',['node','--test','tests/plate-probe-camera.test.js'],APP,0),('node-general-final',['npm','test'],APP,0),('contracts-final',['npm','run','test:contracts'],APP,0)]
  for name,command,cwd,expected in commands:
   start=time.time()
   with(B/('actual-'+name+'.txt')).open('xb')as stream:r=subprocess.run(command,cwd=cwd,env={**env,'CRIC_C4_BASELINE':str(baseline)},stdout=stream,stderr=subprocess.STDOUT,timeout=300)
   row={'name':name,'command':command,'expectedExitCode':expected,'actualExitCode':r.returncode,'elapsedSeconds':time.time()-start,'rawSha256':sha(B/('actual-'+name+'.txt'))};results.append(row);print(json.dumps(row),flush=True)
   if r.returncode!=expected:break
  for entry in inputs:
   p=baseline/Path(entry['path']).relative_to('officina-di-fisica')
   if sha(p)!=entry['sha256']:raise ValueError('Immutable baseline changed')
 (B/'actual-final-cpu-receipt.json').write_text(json.dumps({'results':results,'freeBytesAtStart':free,'testSha256':sha(APP/'tests/plate-probe-camera.test.js'),'meshHelperSha256':sha(APP/'tests/helpers/plate-probe-projection.mjs'),'productionSha256':sha(APP/'static/js/banchi/voci/esperimento.js'),'baseCommit':REF,'immutableSourceBeforeAfterVerified':True,'role':'AUTHOR_DEVELOPMENT_ONLY','browserStarted':False,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'},indent=2)+'\n')
 if len(results)!=5 or any(r['actualExitCode']!=r['expectedExitCode']for r in results):raise SystemExit(1)
