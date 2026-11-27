from pathlib import Path
import subprocess,sys,os,time,hashlib,json,shutil
D=Path('/private/tmp/cric-author-a-resident/officina-di-fisica/editorial/reviews/c2-stevino-manometry-pascal-drafts-independent-a-20261127')
for name,cmd in [('installed-node',['node',str(D/'collect-installed.mjs')]),('independent-report',[sys.executable,'-B',str(D/'analyze.py')]),('target',[sys.executable,'-B','-m','unittest','tests.corpus.test_c2_hydrostatic_reading_four_drafts_a','-v'])]:
 if shutil.disk_usage(D).free<2*1024**3:raise SystemExit('RESOURCE_REFUSAL_BEFORE_'+name+'_CHILD')
 t=time.time();r=subprocess.run(cmd,capture_output=True,timeout=45,env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1'})
 for kind,b in [('stdout',r.stdout),('stderr',r.stderr)]:(D/(name+'.'+kind+'.txt')).write_bytes(b)
 rec=dict(actualObservedExitCode=r.returncode,signal=None if r.returncode>=0 else-r.returncode,elapsedSeconds=time.time()-t,timeoutSeconds=45,command=cmd,stdoutSha256=hashlib.sha256(r.stdout).hexdigest(),stderrSha256=hashlib.sha256(r.stderr).hexdigest(),browser='NOT_RUN');(D/(name+'-terminal.json')).write_text(json.dumps(rec,indent=2)+'\n');print(name,rec, r.stdout.decode()[-500:],r.stderr.decode()[-1800:],flush=True)
 if r.returncode:raise SystemExit(r.returncode)
