from pathlib import Path
import hashlib,json,subprocess,time
D=Path(__file__).resolve().parent;start=time.monotonic();assert not(D/'preflight.stdout.txt').exists()
with(D/'preflight.stdout.txt').open('w')as out,(D/'preflight.stderr.txt').open('w')as err:r=subprocess.run(['/private/tmp/cric-recovery-venv/bin/python','-B',str(D/'preflight.py')],stdout=out,stderr=err)
h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();t={'observedExitCode':r.returncode,'observedSignal':-r.returncode if r.returncode<0 else None,'durationSeconds':time.monotonic()-start,'preflightModuleSha256':h(D/'preflight.py'),'stdoutSha256':h(D/'preflight.stdout.txt'),'stderrSha256':h(D/'preflight.stderr.txt'),'Chrome':'NOT_RUN','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
(D/'preflight-terminal.json').write_text(json.dumps(t,indent=2)+'\n');print(json.dumps(t));raise SystemExit(r.returncode)
