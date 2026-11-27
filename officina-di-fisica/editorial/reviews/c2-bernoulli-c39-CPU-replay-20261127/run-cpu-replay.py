from pathlib import Path
import fcntl,shutil,subprocess,json,os,time,tempfile,hashlib,sys
F=Path(__file__).resolve().parent;APP=F.parents[2];NEW=Path('/private/tmp/cric-continuity-arrow-author-20261127/officina-di-fisica');REF='cbf7792f872caf575d58acd28cc7ace1ada14169';PY='/private/tmp/cric-recovery-venv/bin/python';env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1','GIT_NO_LAZY_FETCH':'1','ASTRA_EXTENSIONS':str(NEW/'extensions')};sha=lambda b:hashlib.sha256(b).hexdigest()
with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);free=shutil.disk_usage(F).free
 if free<2*1024**3:raise ValueError('2GiB guard')
 assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=NEW,text=True).strip()==REF
 before=json.loads(subprocess.check_output([PY,'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=NEW,env=env));assert before['sha256']=='c39f7cdf31e4443059614bac79e7e27c6399c1cfc6fe3dcd1bfdb6b9c3db027e'
 model=(NEW/'static/js/banchi/voci/modelli/C2.js').read_bytes();original_test=(APP/'editorial/reviews/c2-bernoulli-independent-20261127/representation-negative.test.mjs').read_bytes();assert model==subprocess.check_output(['git','show',REF+':officina-di-fisica/static/js/banchi/voci/modelli/C2.js'],cwd=NEW,env=env)
 (F/'model-C2-cbf7792f.js.txt').write_bytes(model);(F/'unchanged-regression-test.mjs.txt').write_bytes(original_test)
 receipts=[]
 with tempfile.TemporaryDirectory(prefix='cric-c2-fixed-model-regression-')as tmp:
  base=Path(tmp)/'app';test=base/'editorial/reviews/frozen/representation-negative.test.mjs';test.parent.mkdir(parents=True);test.write_bytes(original_test)
  mod=base/'static/js/banchi/voci/modelli/C2.js';mod.parent.mkdir(parents=True);mod.write_bytes(model)
  package=subprocess.check_output(['git','show',REF+':officina-di-fisica/package.json'],cwd=NEW,env=env);(base/'package.json').write_bytes(package)
  assert sha(test.read_bytes())==sha(original_test) and sha(mod.read_bytes())==sha(model)
  for name,cmd in [('same-two-regressions-current',['node','--test',str(test)]),('old-new-scalar-and-draft-comparison',['node',str(F/'compare-runtimes.mjs')])]:
   start=time.time();r=subprocess.run(cmd,cwd=APP,env=env,capture_output=True,text=True,timeout=45);(F/('actual-'+name+'-process.txt')).write_text(r.stdout+r.stderr);receipts.append({'stage':name,'actualExitCode':r.returncode,'elapsedSeconds':time.time()-start});print(name,r.returncode,r.stdout[:900],r.stderr[:900],flush=True)
   if r.returncode:break
  assert sha(test.read_bytes())==sha(original_test) and sha(mod.read_bytes())==sha(model)
 after=json.loads(subprocess.check_output([PY,'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=NEW,env=env));assert before==after
 (F/'actual-process-receipt.json').write_text(json.dumps({'processes':receipts,'runtimeBefore':before,'runtimeAfter':after,'testBodyBytesUnchanged':True,'testSha256':sha(original_test),'modelSha256':sha(model),'namespace':'FreshminimalCPUcontextwithauthenticnewGitmodule,originalrelativetestimportpreserved,nobaselinecoderewrite','freeBytesAtStart':free,'browserStarted':False,'UI':'NOT_RUN','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'},indent=2)+'\n')
 if len(receipts)!=2 or any(r['actualExitCode']for r in receipts):raise SystemExit(1)
