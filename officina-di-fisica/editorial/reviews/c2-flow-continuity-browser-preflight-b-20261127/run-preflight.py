from pathlib import Path
import subprocess,json,time,hashlib
D=Path(__file__).resolve().parent;start=time.monotonic()
p=subprocess.run(['/private/tmp/cric-recovery-venv/bin/python','-B',str(D/'preflight.py')],capture_output=True)
(D/'preflight.stdout.txt').write_bytes(p.stdout);(D/'preflight.stderr.txt').write_bytes(p.stderr)
r={'exitCode':p.returncode,'signal':None if p.returncode>=0 else -p.returncode,'elapsedSeconds':time.monotonic()-start,'preflightSha256':hashlib.sha256((D/'preflight.py').read_bytes()).hexdigest(),'Chrome':'NOT_RUN','activityCredit':0}
(D/'preflight-terminal.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r));print(p.stdout.decode());print(p.stderr.decode());p.check_returncode()
