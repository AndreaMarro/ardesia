from pathlib import Path
import subprocess,fcntl,shutil,json,time,hashlib
B=Path(__file__).resolve().parent
with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);free=shutil.disk_usage(B).free
 if free<2*1024**3:raise ValueError('Need2GiB free')
 start=time.time();r=subprocess.run(['/usr/bin/env','python3',str(B/'make-contact-sheets.py')],cwd=B,timeout=90)
 (B/'actual-contact-generation.json').write_text(json.dumps({'actualExitCode':r.returncode,'elapsedSeconds':time.time()-start,'freeBytesAtStart':free,'scriptSha256':hashlib.sha256((B/'make-contact-sheets.py').read_bytes()).hexdigest(),'scope':'Derived whole-element inspection sheets, no additional browser or replacementraw.'},indent=2)+'\n')
 if r.returncode:raise SystemExit(r.returncode)
 print('Actual contactgeneration0')
