from pathlib import Path
import subprocess,sys,time,json,hashlib,shutil,os
D=Path('/private/tmp/cric-author-a-resident/officina-di-fisica/editorial/reviews/c2-density-pressure-five-1efc-independent-a-20261127')
if shutil.disk_usage(D).free<2*1024**3:raise SystemExit('RESOURCE_REFUSAL_BEFORE_FINAL_TARGET_CHILD')
cmd=[sys.executable,'-B','-m','unittest','tests.corpus.test_c2_density_pressure_five_1efc_preflight_a','tests.corpus.test_c2_density_pressure_five_1efc_actual_a','-v'];t=time.time();r=subprocess.run(cmd,capture_output=True,timeout=60,env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1'})
for kind,b in [('stdout',r.stdout),('stderr',r.stderr)]:(D/('final-target.'+kind+'.txt')).write_bytes(b)
rec=dict(actualObservedExitCode=r.returncode,signal=None if r.returncode>=0 else-r.returncode,elapsedSeconds=time.time()-t,timeoutSeconds=60,command=cmd,stdoutSha256=hashlib.sha256(r.stdout).hexdigest(),stderrSha256=hashlib.sha256(r.stderr).hexdigest());(D/'final-target-terminal.json').write_text(json.dumps(rec,indent=2)+'\n');print(r.stderr.decode()[-4500:],rec,flush=True);raise SystemExit(r.returncode)
