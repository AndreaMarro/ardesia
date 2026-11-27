from pathlib import Path
import subprocess,fcntl,shutil,os,json,sys,time,hashlib
F=Path(__file__).parent.resolve();REPO=F.parents[3];WORK=REPO.parent;APP=WORK/'cric-converged-runtime-20261127/officina-di-fisica';PY=WORK/'cric-runtime-env-20261127/bin/python';env={**os.environ,'GIT_NO_LAZY_FETCH':'1','PYTHONDONTWRITEBYTECODE':'1','ASTRA_EXTENSIONS':str(APP/'extensions')};processes=[]
with(WORK/'.cric-browser.lock').open('a+')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);free=shutil.disk_usage(WORK).free;assert free>=2*1024**3
 fp=json.loads(subprocess.check_output([str(PY),'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=APP,env=env,timeout=30));assert fp['sha256']=='53bd0c149919095e24abc8f490702494b3054367230aa941ff509ce52772d46a'
 for name,cmd in [('consumer',['node',str(F/'observe-installed-consumer.mjs'),str(APP)]),('independent-oracle',[str(PY),'-B',str(F/'independent-oracle.py')])]:
  start=time.time();r=subprocess.run(cmd,cwd=APP,env=env,capture_output=True,text=True,timeout=60);(F/('actual-'+name+'-process.txt')).write_text(r.stdout+r.stderr);processes.append({'name':name,'exitCode':r.returncode,'elapsedSeconds':time.time()-start});print(name,r.returncode,flush=True)
  if r.returncode:raise ValueError(r.stdout+r.stderr)
 # Existing canonical importer and store, ephemeral database only.
 boot='''import os,json,hashlib
from pathlib import Path
from server import store
from tools.corpus_engineering.draft_import import import_drafts
store.initialize()
with store.connect()as db:
 before=store.encode(store.published(db));old={(r['id'],r['v']):r['payload']for r in db.execute('SELECT id,v,payload FROM versions')};count=len(store.published(db));assert count==991
 package=json.loads(Path(os.environ['PEER_PACKAGE']).read_bytes());a=import_drafts(db,{'id':'owner','role':'autore'},package);b=import_drafts(db,{'id':'owner','role':'autore'},package)
 assert a['saved']==5 and b['saved']==0 and b['unchanged']==5
 assert store.encode(store.published(db))==before
 assert all(db.execute('SELECT payload FROM versions WHERE id=? AND v=?',key).fetchone()[0]==value for key,value in old.items())
 print(json.dumps({'firstImport':a,'repeatImport':b,'publishedCount':count,'publishedBytesSha256':hashlib.sha256(before.encode()).hexdigest(),'oldVersionsPreserved':len(old),'allOldPayloadBytesPreserved':True}))'''
 import tempfile
 with tempfile.TemporaryDirectory(prefix='cric-five-c5-import-',dir=WORK)as temp:
  start=time.time();r=subprocess.run([str(PY),'-B','-c',boot],cwd=APP,env={**env,'ASTRA_DATA':temp,'ASTRA_HOSTED':'0','PEER_PACKAGE':str(F/'experiment-c5-field-spectrum-photon-reading-20261127.json')},capture_output=True,text=True,timeout=60);(F/'actual-canonical-import-process.txt').write_text(r.stdout+r.stderr);processes.append({'name':'canonical-import','exitCode':r.returncode,'elapsedSeconds':time.time()-start});print('canonical-import',r.returncode,flush=True)
  if r.returncode:raise ValueError(r.stdout+r.stderr)
  integration=json.loads(r.stdout);(F/'actual-canonical-import.json').write_text(json.dumps(integration,indent=2)+'\n')
 after=json.loads(subprocess.check_output([str(PY),'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=APP,env=env,timeout=30));assert after==fp
 (F/'actual-current-CPU-receipt.json').write_text(json.dumps({'processes':processes,'sourceCommit':'1b72b71a68a6023ab1c9fa189733947b03029914','runtimeBefore':fp,'runtimeAfter':after,'freeBefore':free,'modelFileSha256':hashlib.sha256((APP/'static/js/banchi/voci/modelli/C5.js').read_bytes()).hexdigest(),'browserStarted':False,'productUI':'NOT_RUN','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'},indent=2)+'\n')
