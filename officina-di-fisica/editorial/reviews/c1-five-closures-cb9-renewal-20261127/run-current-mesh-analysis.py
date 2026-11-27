from pathlib import Path
import json,hashlib,subprocess,fcntl,shutil,os,zipfile
B=Path(__file__).resolve().parent;APP=Path('/private/tmp/cric-method-css-748-independent-app');PY='/private/tmp/cric-recovery-venv/bin/python';FP='cb9fc66d96ecced2addff3df4dfbeb0b5834e73a13719a78ea964bc28a5ada49'
env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1','GIT_NO_LAZY_FETCH':'1','ASTRA_EXTENSIONS':str(APP/'extensions')}
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def fp():return json.loads(subprocess.check_output([PY,'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=APP,env=env))
def run(args,name):
 r=subprocess.run(args,cwd=APP,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=600);(B/name).write_bytes(r.stdout);assert r.returncode==0,(name,r.returncode,r.stdout.decode()[-2000:]);return r.stdout
with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);assert shutil.disk_usage(B).free>=2*1024**3;before=fp();assert before['sha256']==FP
 run([PY,'-B',str(B/'analyze-five.py'),str(B/'actual-ui-576'),str(B/'actual-ui-576/geometry-observations.json')],'geometry-analysis.txt')
 run([PY,'-B',str(B/'certify-convex-glyphs.py'),str(B/'actual-ui-576'),str(B/'complete-convex-certificates.json')],'convex-analysis.txt')
 raw=B/'actual-float32-meshes.jsonl';receipt=json.loads(run(['node',str(B/'reconstruct-production-meshes.mjs'),str(APP),str(B/'actual-ui-576'),str(raw)],'reconstruction-process.txt'));(B/'reconstruction-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
 repeat=Path('/private/tmp/cric-cb9-five-float32-repeat.jsonl');assert not repeat.exists();repeated=json.loads(run(['node',str(B/'reconstruct-production-meshes.mjs'),str(APP),str(B/'actual-ui-576'),str(repeat)],'reconstruction-repeat-process.txt'));assert sha(raw)==sha(repeat)==receipt['nativeMeshJsonlSha256'];after=fp();assert after==before
 guard={'before':before,'after':after,'actualExitCode':0,'repeatReceipt':repeated,'outputIdentical':True,'activityCredit':0};(B/'guarded-reconstruction-repeat.json').write_text(json.dumps(guard,indent=2)+'\n')
 run([PY,'-B',str(B/'check-actual-mesh-supports.py'),str(B),str(B),str(B/'actual-mesh-supports.json')],'actual-supports-analysis.txt')
 with zipfile.ZipFile(B/'actual-float32-meshes.zip','w',compression=zipfile.ZIP_DEFLATED)as z:z.write(raw,raw.name)
 (B/'actual-float32-meshes-archive.json').write_text(json.dumps({'archiveSha256':sha(B/'actual-float32-meshes.zip'),'rawFile':raw.name,'rawSha256':sha(raw),'identicalRepeatRawSha256':sha(repeat),'activityCredit':0},indent=2)+'\n')
 assert fp()==before
 print('Actual576 state geometry and repeated Float32 reconstruction completed on',FP,flush=True)
