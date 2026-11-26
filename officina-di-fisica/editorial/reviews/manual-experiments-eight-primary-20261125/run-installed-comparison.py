"""One bounded installed-Node comparison; never a browser or candidate review."""
from pathlib import Path
import fcntl,shutil,subprocess
BASE=Path(__file__).resolve().parent
if __name__=='__main__':
 with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
  fcntl.flock(lock,fcntl.LOCK_EX)
  assert shutil.disk_usage(BASE).free>=2*1024**3
  p=subprocess.run(['node',str(BASE/'compare-installed.mjs')],capture_output=True)
  (BASE/'installed-comparison.txt').write_bytes(p.stdout+p.stderr)
  assert p.returncode==0,(p.stdout+p.stderr).decode(errors='replace')[-1800:]
  print(p.stdout.decode(),end='')
