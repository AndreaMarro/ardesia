from pathlib import Path
import fcntl,shutil,subprocess,os,json,time,sys
F=Path(__file__).resolve().parent;APP=F.parents[2];sys.path.insert(0,str(APP))
with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);free=shutil.disk_usage(F).free
 if free<2*1024**3:raise ValueError('2GiB guard')
 from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint
 from tools.corpus_engineering.integration import exercise_package
 fp=runtime_fingerprint(APP);assert fp['sha256']=='7c7281e363c1d723ec005f4d04b2f54b88bc7b660c18b6adb548053816dcbad6'
 for p in ['static/js/banchi/voci/esperimento.js','static/js/banchi/voci/modelli/C2.js','static/js/banchi/voci/apparati/fluidi.js']:
  assert(APP/p).read_bytes()==subprocess.check_output(['git','show','b9994b9116e87478905191d85cca8037d17ae4bd:officina-di-fisica/'+p],cwd=APP,env={**os.environ,'GIT_NO_LAZY_FETCH':'1'})
 env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1','GIT_NO_LAZY_FETCH':'1'};receipts=[]
 for name,cmd,expected in [('consumer',['node',str(F/'observe-consumer.mjs')],0),('independent-oracle',[sys.executable,'-B',str(F/'independent-oracle.py')],0),('representation-negative',['node','--test',str(F/'representation-negative.test.mjs')],1)]:
  start=time.time();r=subprocess.run(cmd,cwd=APP,env=env,capture_output=True,text=True,timeout=45);(F/('actual-'+name+'-process.txt')).write_text(r.stdout+r.stderr);receipts.append({'stage':name,'expectedExit':expected,'actualExit':r.returncode,'elapsedSeconds':time.time()-start});print(name,r.returncode,r.stdout[:500],r.stderr[:500],flush=True)
  if r.returncode!=expected:raise ValueError('Unexpected process result')
 integration=exercise_package(F/'experiment-c2-bernoulli-reading-20261127.json')
 assert runtime_fingerprint(APP)==fp
 (F/'actual-process-receipt.json').write_text(json.dumps({'processes':receipts,'runtimeFingerprint':fp,'freeBytesAtStart':free,'canonicalImport':integration,'browserStarted':False,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'},indent=2)+'\n')
 print(json.dumps({'import':integration['firstImport'],'repeat':integration['repeatedImport'],'published':integration['afterPublishedCount'],'credit':0}),flush=True)
