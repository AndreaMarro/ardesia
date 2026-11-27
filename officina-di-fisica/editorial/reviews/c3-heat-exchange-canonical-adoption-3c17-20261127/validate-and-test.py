from pathlib import Path
import subprocess,json,sys,os,time,fcntl,shutil
F=Path(__file__).resolve().parent;APP=F.parents[2];WORK=APP.parent.parent;sys.path.insert(0,str(APP));os.environ['ASTRA_EXTENSIONS']=str(APP/'extensions')
with(WORK/'.cric-browser.lock').open('a+')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);free=shutil.disk_usage(WORK).free;assert free>=2*1024**3
 from tools.corpus_engineering.batches import validate_activity_batch
 spec=json.loads((F/'unregistered-spec.json').read_bytes());source=json.loads((APP/'editorial/reviews/c3-heat-exchange-final-3c17-20261127/source-C3-5d.json').read_bytes());sources={r['id']:r for r in source if r['id']in spec['activityIds']};start=time.time();result=validate_activity_batch(spec,sources,APP);(F/'actual-validate-activity-batch.json').write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n');print('VALIDATED_EXISTING_COORDINATOR',len(result['records']),result['revision']['browserCases'],flush=True)
 run=subprocess.run([sys.executable,'-B',str(F/'test_canonical_bundle.py')],cwd=APP,env={**os.environ,'GIT_NO_LAZY_FETCH':'1','PYTHONDONTWRITEBYTECODE':'1'},capture_output=True,text=True,timeout=90);(F/'actual-canonical-tests.txt').write_text(run.stdout+run.stderr);(F/'actual-validation-tests-receipt.json').write_text(json.dumps({'exitCode':run.returncode,'seconds':time.time()-start,'freeBefore':free,'activityCredit':0,'registryChanged':False,'humanApproval':'NOT_RUN','publicationAction':'NONE'},indent=2)+'\n');print(run.stdout+run.stderr);sys.exit(run.returncode)
