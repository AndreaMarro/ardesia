from pathlib import Path
import hashlib,json,os,subprocess,urllib.request
repo=Path(__file__).resolve().parents[4];work=repo.parent;folder=Path(__file__).parent;app=work/'cric-review-c2-c39-runtime-20261127/officina-di-fisica';root=work/'cric-resume-276/officina-di-fisica';ref='cbf7792f872caf575d58acd28cc7ace1ada14169';env={**os.environ,'GIT_NO_LAZY_FETCH':'1','PYTHONDONTWRITEBYTECODE':'1','ASTRA_EXTENSIONS':str(app/'extensions')};sha=lambda b:hashlib.sha256(b).hexdigest();target=json.loads((repo/'officina-di-fisica/editorial/reviews/c2-bernoulli-c39-CPU-replay-20261127/actual-process-receipt.json').read_text())['runtimeBefore'];rows=[]
for p,h in target['files'].items():
 if p.startswith('node_modules/'):continue
 f=app/p
 if f.is_file():assert sha(f.read_bytes())==h,p;continue
 oid=subprocess.check_output(['git','rev-parse',ref+':officina-di-fisica/'+p],cwd=repo,env=env,text=True).strip()
 url='https://raw.githubusercontent.com/AndreaMarro/ardesia/'+ref+'/officina-di-fisica/'+p
 data=subprocess.check_output(["curl","--fail","--silent","--show-error","--max-time","60",url]);assert sha(data)==h,p
 assert hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()==oid
 f.parent.mkdir(parents=True,exist_ok=True);f.write_bytes(data);rows.append({'path':p,'gitBlob':oid,'sha256':h,'sourceUrl':url,'source':'IMMUTABLE_RAW_GITHUB_PINNED_SHA1_SHA256'})
node=app/'node_modules'
if not node.exists():node.symlink_to(root/'node_modules',target_is_directory=True)
for p,h in target['files'].items():assert sha((app/p).read_bytes())==h,p
py=work/'cric-runtime-env-20261127/bin/python';run=subprocess.run([str(py),'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=app,env=env,capture_output=True,text=True,timeout=30);assert run.returncode==0,run.stderr
fp=json.loads(run.stdout);assert fp==target
(folder/'actual-reconstructed-runtime-fingerprint.json').write_text(json.dumps(fp,indent=2)+'\n');(folder/'actual-runtime-reconstruction.json').write_text(json.dumps({'sourceCommit':ref,'fingerprintEqual':True,'sha256':fp['sha256'],'filesCount':len(target['files']),'resumedPartialRecovery':True,'priorPartialExistingVerifiedFiles':414,'missingRuntimeFilesExplicitlyFetched':rows,'nodeModulesSource':str(root/'node_modules'),'activityCredit':0,'browserStarted':False},indent=2)+'\n');print('VERIFIED',fp['sha256'],len(target['files']))
