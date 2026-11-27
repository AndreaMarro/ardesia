from pathlib import Path
import os,json,subprocess,time,fcntl,shutil,sys,hashlib
B=Path(__file__).resolve().parent;APP=B.parents[2]
with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);free=shutil.disk_usage(B).free
 if free<2*1024**3:raise ValueError('Need2GiB free')
 start=time.time();env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1','GIT_NO_LAZY_FETCH':'1'}
 with(B/'actual-tests.txt').open('xb')as output:r=subprocess.run([sys.executable,'-B','-m','unittest','discover','-s','tests/corpus','-p','test_stevino_label_1efc_focused.py','-v'],cwd=APP,env=env,stdout=output,stderr=subprocess.STDOUT,timeout=60)
 (B/'actual-test-terminal.json').write_text(json.dumps({'actualExitCode':r.returncode,'elapsedSeconds':time.time()-start,'freeBytesAtStart':free,'testSha256':hashlib.sha256((APP/'tests/corpus/test_stevino_label_1efc_focused.py').read_bytes()).hexdigest(),'rawSha256':hashlib.sha256((B/'actual-tests.txt').read_bytes()).hexdigest(),'activityCredit':0,'humanApproval':'NOT_RUN'},indent=2)+'\n')
 print((B/'actual-tests.txt').read_text())
 if r.returncode:raise SystemExit(r.returncode)
