"""Read back the persisted canonical report and compare a newly executed report."""
from pathlib import Path
import fcntl,json,os,shutil,subprocess,time
D=Path(__file__).resolve().parent;TASK=D.parents[5];APP=TASK/'work/cric-b-c2-fe5d-canonical-20261127/officina-di-fisica';PYTHON=TASK/'work/cric-runtime-env-20261127/bin/python';LOCK=TASK/'work/.cric-browser.lock'
code=r'''
from pathlib import Path
import json
from tools.corpus_engineering import experiments_c2_continuity_l00501_fe5d_verifier as v
from tools.corpus_engineering.pipeline import digest,sha
from tools.corpus_engineering.batches import assert_activity_identity
D=v.PROOF;APP=v.APP;B=v.BATCH;pkg=json.loads((APP/'editorial/batches'/(B+'.json')).read_bytes());bindings=json.loads((APP/'editorial/batches'/(B+'-bindings.json')).read_bytes());sources={r['id']:r for r in json.loads((D/'original-source.verbatim.json').read_bytes())};raw=(D/'canonical-science-report.json').read_bytes();saved=json.loads(raw);fresh=v.report(sources,pkg,bindings);assert fresh==saved;assert_activity_identity(fresh['records'],{v.KEY},sources,{v.KEY:pkg['records'][0]},{v.KEY:bindings[0]});print(json.dumps({'persistedReportSha256':sha(raw),'freshReportDigest':digest(fresh),'savedReportDigest':digest(saved),'freshSavedIdentity':'PASS_FROM_REPARSED_SAVED_BYTES','verifierSha256':sha(Path(v.__file__).read_bytes()),'runtimeSha256':v.RUNTIME,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'},sort_keys=True))
'''
with LOCK.open('a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);free=shutil.disk_usage(TASK).free
 if free<2*1024**3:raise SystemExit('Resource refusal before fresh/saved child')
 env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1','PATH':str(PYTHON.parent)+os.pathsep+os.environ['PATH'],'ASTRA_EXTENSIONS':str(APP/'extensions')};t=time.monotonic();p=subprocess.run([str(PYTHON),'-c',code],cwd=APP,env=env,capture_output=True,timeout=45);(D/'fresh-saved-stdout.txt').write_bytes(p.stdout);(D/'fresh-saved-stderr.txt').write_bytes(p.stderr);receipt={'actualObservedExitCode':p.returncode,'signal':None if p.returncode>=0 else-p.returncode,'elapsedSeconds':time.monotonic()-t,'freeBytesAtAcquisition':free,'activityCredit':0,'humanApproval':'NOT_RUN'}
 if p.returncode==0:receipt['identity']=json.loads(p.stdout)
 (D/'fresh-saved-identity.json').write_text(json.dumps(receipt,sort_keys=True,indent=2)+'\n');print(json.dumps(receipt));print(p.stderr.decode());raise SystemExit(p.returncode)
