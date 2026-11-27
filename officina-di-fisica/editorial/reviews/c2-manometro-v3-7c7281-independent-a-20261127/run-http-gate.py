from pathlib import Path
import subprocess,sys,time,json,hashlib,os,shutil
D=Path('/private/tmp/cric-author-a-resident/officina-di-fisica/editorial/reviews/c2-manometro-v3-7c7281-independent-a-20261127')
if shutil.disk_usage(D).free<2*1024**3:raise SystemExit('RESOURCE_REFUSAL_BEFORE_HTTP_CHILD')
cmd=[sys.executable,'-B','/private/tmp/c2_manometro_http_gate_a.py'];t=time.time();r=subprocess.run(cmd,capture_output=True,timeout=45,env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1'})
for label,b in [('stdout',r.stdout),('stderr',r.stderr)]:(D/('http-gate.'+label+'.txt')).write_bytes(b)
rec=dict(actualObservedExitCode=r.returncode,signal=None if r.returncode>=0 else-r.returncode,elapsedSeconds=time.time()-t,timeoutSeconds=45,command=cmd,stdoutSha256=hashlib.sha256(r.stdout).hexdigest(),stderrSha256=hashlib.sha256(r.stderr).hexdigest(),browser='NOT_RUN_IN_THIS_SUPPLEMENT');(D/'http-gate-terminal.json').write_text(json.dumps(rec,indent=2)+'\n');print(r.stdout.decode()[-1000:],r.stderr.decode()[-1500:],rec,flush=True);raise SystemExit(r.returncode)
