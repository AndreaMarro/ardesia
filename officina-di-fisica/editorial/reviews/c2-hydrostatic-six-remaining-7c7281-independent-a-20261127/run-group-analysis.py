from pathlib import Path
import json,subprocess,sys,time,hashlib,os,shutil
A=Path('/private/tmp/cric-author-a-resident/officina-di-fisica');D=A/'editorial/reviews/c2-hydrostatic-six-remaining-7c7281-independent-a-20261127';group=sys.argv[1];F=D/'groups'/group
if shutil.disk_usage(F).free<2*1024**3:raise SystemExit('RESOURCE_REFUSAL_BEFORE_ANALYSIS')
cmd=[sys.executable,'-B',str(D/'analyze-single-group.py'),group];t=time.time();r=subprocess.run(cmd,capture_output=True,timeout=60,env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1'})
for key,b in [('stdout',r.stdout),('stderr',r.stderr)]:(F/('analysis.'+key+'.txt')).write_bytes(b)
rec=dict(actualObservedExitCode=r.returncode,signal=None if r.returncode>=0 else-r.returncode,elapsedSeconds=time.time()-t,command=cmd,stdoutSha256=hashlib.sha256(r.stdout).hexdigest(),stderrSha256=hashlib.sha256(r.stderr).hexdigest());(F/'analysis-terminal.json').write_text(json.dumps(rec,indent=2)+'\n');print(r.stdout.decode()[-1000:],r.stderr.decode()[-1500:],rec,flush=True);raise SystemExit(r.returncode)
