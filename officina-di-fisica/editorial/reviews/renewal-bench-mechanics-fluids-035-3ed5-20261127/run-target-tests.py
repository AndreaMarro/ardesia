from pathlib import Path
import os,sys,json,fcntl,subprocess,shutil,time,hashlib
B=Path(__file__).resolve().parent;APP=B.parents[2]
with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);free=shutil.disk_usage(B).free
 if free<2*1024**3:raise ValueError('Needs2GiB free')
 env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1','GIT_NO_LAZY_FETCH':'1'};start=time.time()
 with(B/'actual-target-tests.txt').open('xb')as stream:r=subprocess.run([sys.executable,'-B','-m','unittest','discover','-s','tests/corpus','-p','test_bench_mechanics_fluids_renewal_3ed5.py','-v'],cwd=APP,env=env,stdout=stream,stderr=subprocess.STDOUT,timeout=120)
 (B/'actual-target-terminal.json').write_text(json.dumps({'actualExitCode':r.returncode,'elapsedSeconds':time.time()-start,'freeBytesAtStart':free,'testSha256':hashlib.sha256((APP/'tests/corpus/test_bench_mechanics_fluids_renewal_3ed5.py').read_bytes()).hexdigest(),'rawSha256':hashlib.sha256((B/'actual-target-tests.txt').read_bytes()).hexdigest(),'activityCredit':0,'humanApproval':'NOT_RUN'},indent=2)+'\n')
 if r.returncode:raise SystemExit(r.returncode)
 print((B/'actual-target-tests.txt').read_text())
