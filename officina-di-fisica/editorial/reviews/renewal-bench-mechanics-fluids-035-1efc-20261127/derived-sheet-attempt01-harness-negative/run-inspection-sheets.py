from pathlib import Path
import fcntl,shutil,subprocess,json,time,os
B=Path(__file__).resolve().parent;APP=B.parents[2]
with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);free=shutil.disk_usage(B).free
 if free<2*1024**3:raise ValueError('Need2GiB free')
 start=time.time();rows=[]
 for script in ['make-review-contact-sheets.py','make-supplementary-contact-sheets.py']:
  p=subprocess.run(['/usr/bin/env','python3',str(B/script)],cwd=APP,timeout=90);rows.append({'script':script,'exitCode':p.returncode})
  if p.returncode:raise ValueError(rows)
 (B/'actual-contact-generation.json').write_text(json.dumps({'actualProcesses':rows,'elapsedSeconds':time.time()-start,'freeBytesAtStart':free,'scope':'Derived cropped inspection sheets, not replacement raw evidence or new browser.'},indent=2)+'\n')
 print(rows)
