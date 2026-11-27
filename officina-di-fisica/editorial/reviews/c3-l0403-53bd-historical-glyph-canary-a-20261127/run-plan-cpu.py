from pathlib import Path
import fcntl,json,os,shutil,subprocess,time
D=Path(__file__).resolve().parent;APP=D.parents[2];TASK=D.parents[5];RUNTIME=TASK/'work/cric-converged-runtime-20261127/officina-di-fisica'
with(TASK/'work/.cric-browser.lock').open('a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);free=shutil.disk_usage(TASK).free
 if free<2*1024**3:raise SystemExit('CPU resource refusal')
 start=time.monotonic();run=subprocess.run(['node',str(D/'observe-exact-plan.mjs'),str(RUNTIME),str(APP/'editorial/reviews/c3-six-heat-phase-core6ae3-independent-a-20261127/candidate.verbatim.json')],cwd=APP,capture_output=True,timeout=30)
 for name,raw in [('stdout',run.stdout),('stderr',run.stderr)]:(D/('plan-cpu-'+name+'.txt')).write_bytes(raw)
 terminal=dict(actualObservedExitCode=run.returncode,elapsedSeconds=time.monotonic()-start,freeBytesAtAcquisition=free,browser='NOT_RUN',activityCredit=0,humanApproval='NOT_RUN');(D/'plan-cpu-terminal.json').write_text(json.dumps(terminal,indent=2)+'\n');print(json.dumps(terminal));raise SystemExit(run.returncode)
