from pathlib import Path
import sys,json,fcntl,shutil,subprocess,time,hashlib,os
D=Path(__file__).resolve().parent;A=D.parents[2];T=Path('/Users/andreamarro/Documents/Codex/2026-11-24/codex-cric-full-corpus-scientific-pedagogical');sys.path.insert(0,str(A))
with (T/'work/.cric-browser.lock').open('a')as mutex:
 fcntl.flock(mutex,fcntl.LOCK_EX)
 if shutil.disk_usage(D).free<2*1024**3:raise SystemExit('RESOURCE_REFUSAL_BEFORE_TARGET')
 from tools.corpus_engineering import c3_l0401_53bd_browser_a as v
 report=v.report();(D/'independent-browser-review.json').write_text(json.dumps(report,indent=2)+'\n')
 cmd=[sys.executable,'-B','-m','unittest','tests.corpus.test_c3_l0401_53bd_browser_a','-v'];start=time.monotonic();r=subprocess.run(cmd,cwd=A,capture_output=True,timeout=60,env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1'})
 for name,raw in [('stdout',r.stdout),('stderr',r.stderr)]:(D/('browser-target-'+name+'.txt')).write_bytes(raw)
 rec=dict(actualObservedExitCode=r.returncode,signal=-r.returncode if r.returncode<0 else None,elapsedSeconds=time.monotonic()-start,timeoutSeconds=60,timedOut=False,stdoutSha256=hashlib.sha256(r.stdout).hexdigest(),stderrSha256=hashlib.sha256(r.stderr).hexdigest());(D/'browser-target-terminal.json').write_text(json.dumps(rec,indent=2)+'\n');print(r.stderr.decode(),rec,flush=True);raise SystemExit(r.returncode)
