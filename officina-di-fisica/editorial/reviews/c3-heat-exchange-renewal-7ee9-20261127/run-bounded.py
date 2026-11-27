"""One canonical existing collector, persistent shared lock, exact authority preflight."""
from pathlib import Path
import sys,subprocess,os,json,hashlib,fcntl,shutil,time
repo=Path(__file__).resolve().parents[4];work=repo.parent;folder=Path(__file__).parent;name=sys.argv[1];assert name in ['conduction-32','convection-radiation-80','convection-clock-72'];d=folder/name;info=json.loads((d/'info.json').read_bytes());app=Path(info['candidateApp']);sha=lambda b:hashlib.sha256(b).hexdigest();canon=lambda r:json.dumps(r,sort_keys=True,separators=(',',':'),ensure_ascii=False,allow_nan=False).encode()
with (work/'.cric-browser.lock').open('a+') as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);start=time.time();receipt={'slice':name,'startedUnix':start,'lock':str(work/'.cric-browser.lock'),'lockAcquired':True,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
 try:
  free=shutil.disk_usage(work).free;receipt['freeBefore']=free;assert free>=2*1024**3
  plan=json.loads(Path(info['prepared']).read_bytes());request=Path(plan['requestFile']);assert sha(request.read_bytes())==plan['requestSha256'];assert set(Path(p).name for p in plan['inputFiles'])=={'experiment-c3-heat-exchange-reading-20261127.json','experiment-c3-heat-exchange-reading-20261127-bindings.json'};assert {str(p)for p in(folder/'inputs').iterdir()}==set(plan['inputFiles'])
  for p,h in plan['inputFiles'].items():assert not Path(p).is_symlink()and sha(Path(p).read_bytes())==h
  package=json.loads(Path(plan['packageFiles'][0]).read_bytes());bindings=json.loads((folder/'inputs/experiment-c3-heat-exchange-reading-20261127-bindings.json').read_bytes());assert package['records']==plan['draftRecords'];source=json.loads((app/'content/esperienze-C3.json').read_bytes());sources={r['id']:r for r in source}
  for row,b in zip(package['records'],bindings):assert row['id']==b['id']and sha(canon(row))==b['candidateSha256']and sha(canon(sources[row['id']]))==b['sourceSha256']
  for r in plan['records']:
   authority=next(row for row in package['records']if row['id']==r['id'])if r['variant']=='draft'else sources[r['id']];assert canon(r['record'])==canon(authority)
  collector=folder/'collector-719.mjs';assert sha(collector.read_bytes())=='719beb3abc01cbf7607dc1d5d1710732cbc59c2aae91112fb6b680dbfbd22d15';assert not Path(info['output']).exists(),'Output must be fresh'
  env={**os.environ,'PATH':str(work/'cric-runtime-env-20261127/bin')+os.pathsep+os.environ['PATH'],'PYTHONDONTWRITEBYTECODE':'1','GIT_NO_LAZY_FETCH':'1','ASTRA_EXTENSIONS':str(app/'extensions')};fp=json.loads(subprocess.check_output([str(work/'cric-runtime-env-20261127/bin/python'),'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=app,env=env,timeout=30));assert fp==plan['runtimeFingerprint'];receipt['fingerprintBefore']=fp['sha256'];receipt['preflightAuthorityComplete']=True;print('LOCK_ACQUIRED PREFLIGHT_OK',name,free,flush=True)
  with (d/'actual-process.log').open('wb')as log:
   child=subprocess.Popen(['node',str(collector),str(d/'info.json')],cwd=repo/'officina-di-fisica',env=env,stdout=log,stderr=subprocess.STDOUT);receipt['childPid']=child.pid
   try:receipt['exitCode']=child.wait(timeout=360);receipt['timeoutTriggered']=False
   except subprocess.TimeoutExpired:
    receipt['timeoutTriggered']=True;child.terminate()
    try:child.wait(timeout=20)
    except subprocess.TimeoutExpired:child.kill();child.wait()
    receipt['exitCode']=child.returncode
  receipt['freeAfter']=shutil.disk_usage(work).free;receipt['elapsedSeconds']=time.time()-start
 except BaseException as error:
  receipt['preflightOrProcessError']=repr(error);receipt.setdefault('exitCode',1)
 finally:
  receipt['terminalObserved']=True;receipt['endedUnix']=time.time();(d/'actual-terminal.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt),flush=True)
 sys.exit(0 if receipt.get('exitCode')==0 else 1)
