from pathlib import Path
import subprocess,time,json,hashlib
D=Path(__file__).resolve().parent;start=time.monotonic()
p=subprocess.run(['/private/tmp/cric-recovery-venv/bin/python','-B',str(D/'preflight719.py')],capture_output=True);(D/'preflight.stdout.txt').write_bytes(p.stdout);(D/'preflight.stderr.txt').write_bytes(p.stderr)
r={'observedExitCode':p.returncode,'signal':-p.returncode if p.returncode<0 else None,'elapsedSeconds':time.monotonic()-start,'moduleSha256':hashlib.sha256((D/'preflight719.py').read_bytes()).hexdigest(),'Chrome':'NOT_RUN','activityCredit':0};(D/'preflight-terminal.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r));print(p.stdout.decode());print(p.stderr.decode());p.check_returncode()
