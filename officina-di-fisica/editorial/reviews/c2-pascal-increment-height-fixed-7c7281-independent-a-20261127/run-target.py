from pathlib import Path
import subprocess,sys,time,json,hashlib,os,shutil
D=Path('/private/tmp/cric-author-a-resident/officina-di-fisica/editorial/reviews/c2-pascal-increment-height-fixed-7c7281-independent-a-20261127')
if shutil.disk_usage(D).free<2*1024**3:raise SystemExit('RESOURCE_REFUSAL_BEFORE_TARGET')
cmd=[sys.executable,'-B','-m','unittest','tests.corpus.test_c2_pascal_increment_height_fixed_7c7281_a','-v'];t=time.time();r=subprocess.run(cmd,capture_output=True,timeout=60,env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1'})
for name,b in [('stdout',r.stdout),('stderr',r.stderr)]:(D/('target.'+name+'.txt')).write_bytes(b)
receipt=dict(actualObservedExitCode=r.returncode,signal=None if r.returncode>=0 else-r.returncode,elapsedSeconds=time.time()-t,timeoutSeconds=60,command=cmd,stdoutSha256=hashlib.sha256(r.stdout).hexdigest(),stderrSha256=hashlib.sha256(r.stderr).hexdigest());(D/'target-terminal.json').write_text(json.dumps(receipt,indent=2)+'\n');print(r.stderr.decode()[-4000:],receipt,flush=True);raise SystemExit(r.returncode)
