"""Explicit immutable Git recovery. Matching local bytes reused; no lazy-fetch verifier."""
from pathlib import Path
import os,json,subprocess,hashlib,re
REPO=Path(__file__).resolve().parents[4];WORK=REPO.parent;FOLDER=Path(__file__).resolve().parent
ROOTAPP=WORK/'cric-resume-276/officina-di-fisica';APP=WORK/'cric-review-c2-c39-runtime-20261127/officina-di-fisica';REF='cbf7792f872caf575d58acd28cc7ace1ada14169';env={**os.environ,'GIT_NO_LAZY_FETCH':'1'}
sha=lambda b:hashlib.sha256(b).hexdigest()
old=json.loads((REPO/'officina-di-fisica/editorial/reviews/c2-bernoulli-c39-CPU-replay-20261127/actual-process-receipt.json').read_text());target=old['runtimeBefore'];assert target['sha256']=='c39f7cdf31e4443059614bac79e7e27c6399c1cfc6fe3dcd1bfdb6b9c3db027e'
APP.mkdir(parents=True,exist_ok=False)
paths=list(target['files']);extras=['tools/corpus_engineering/runtime_fingerprint.py','tools/corpus_engineering/pipeline.py','requirements.txt'];paths+=extras
entries=subprocess.check_output(['git','ls-tree','-r','-z',REF,'--','officina-di-fisica/server','officina-di-fisica/static','officina-di-fisica/content','officina-di-fisica/contracts','officina-di-fisica/migrations','officina-di-fisica/policies','officina-di-fisica/extensions','officina-di-fisica/package.json','officina-di-fisica/package-lock.json','officina-di-fisica/requirements.txt','officina-di-fisica/tools/corpus_engineering'],cwd=REPO,env=env)
tree={}
for part in entries.split(b'\0'):
 if not part:continue
 meta,name=part.split(b'\t',1);mode,kind,oid=meta.decode().split();assert kind=='blob';tree[name.decode().removeprefix('officina-di-fisica/')]=oid
missing=[];rows=[]
for path in paths:
 if path.startswith('node_modules/'):continue
 assert path in tree
 candidates=[ROOTAPP/path]
 if path=='static/js/banchi/voci/modelli/C2.js':candidates+=[REPO/'officina-di-fisica/editorial/reviews/c2-bernoulli-c39-CPU-replay-20261127/model-C2-cbf7792f.js.txt']
 found=None
 for candidate in candidates:
  if not candidate.is_file():continue
  data=candidate.read_bytes();oid=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
  if oid==tree[path] and(path not in target['files']or sha(data)==target['files'][path]):found=(data,str(candidate));break
 if found:
  data,source=found;p=APP/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data);rows.append({'path':path,'sha256':sha(data),'gitBlob':tree[path],'source':'MATCHED_LOCAL_BYTES','localReadOnlySource':source})
 else:missing.append(path)
# Explicitly fetch only missing immutable blob objects, bounded32. Never rely on hidden lazy access.
oids=sorted({tree[p]for p in missing});fetches=[]
for start in range(0,len(oids),32):
 group=oids[start:start+32];assert all(re.fullmatch('[0-9a-f]{40}',x)for x in group)
 p=subprocess.run(['git','-c','gc.auto=0','fetch','--no-tags','--no-write-fetch-head','--stdin','origin'],input='\n'.join(group)+'\n',cwd=REPO,env=env,text=True,capture_output=True,timeout=120);fetches.append({'blobIds':group,'exitCode':p.returncode,'stderr':p.stderr})
 if p.returncode:raise ValueError(p.stderr)
if missing:
 request=b'\n'.join(tree[path].encode()for path in missing)+b'\n';raw=subprocess.check_output(['git','cat-file','--batch'],input=request,cwd=REPO,env=env);offset=0
 for path in missing:
  end=raw.index(b'\n',offset);head=raw[offset:end].split();assert head[1]==b'blob';size=int(head[2]);data=raw[end+1:end+1+size];offset=end+2+size
  assert hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()==tree[path]
  if path in target['files']:assert sha(data)==target['files'][path]
  p=APP/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data);rows.append({'path':path,'sha256':sha(data),'gitBlob':tree[path],'source':'EXPLICIT_FETCH_IMMUTABLE_BLOB'})
node=APP/'node_modules';node.symlink_to(ROOTAPP/'node_modules',target_is_directory=True)
for path,pin in target['files'].items():assert sha((APP/path).read_bytes())==pin,path
assert sha((APP/'tools/corpus_engineering/runtime_fingerprint.py').read_bytes())==target['protocolSha256']
PY=WORK/'cric-runtime-env-20261127/bin/python'
fp=json.loads(subprocess.check_output([str(PY),'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=APP,env={**env,'PYTHONDONTWRITEBYTECODE':'1','ASTRA_EXTENSIONS':str(APP/'extensions')}));assert fp==target
(FOLDER/'actual-reconstructed-runtime-fingerprint.json').write_text(json.dumps(fp,indent=2)+'\n')
receipt={'role':'IMMUTABLE_RUNTIME_RECOVERY_NOT_NEW_UI','sourceCommit':REF,'candidateApp':str(APP),'runtimeSha256':fp['sha256'],'matchedLocalFiles':sum(r['source']=='MATCHED_LOCAL_BYTES'for r in rows),'explicitFetchedFiles':len(missing),'explicitFetches':fetches,'files':rows,'nodeDependencySource':str(ROOTAPP/'node_modules'),'full421FingerprintEqualToFrozenC39':True,'oldEpochEvidenceNotRetagged':True,'browserStarted':False,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
(FOLDER/'actual-runtime-reconstruction.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps({k:v for k,v in receipt.items()if k not in['files','explicitFetches']}),flush=True)
