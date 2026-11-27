from pathlib import Path
import subprocess,hashlib,json,time
D=Path(__file__).resolve().parent;start=time.monotonic();old=hashlib.sha256((D/'actual-head-projection.json').read_bytes()).hexdigest()
with(D/'projection.stdout.txt').open('w')as out,(D/'projection.stderr.txt').open('w')as err:r=subprocess.run(['python3','-B',str(D/'analyze-heads.py')],stdout=out,stderr=err)
new=hashlib.sha256((D/'actual-head-projection.json').read_bytes()).hexdigest();assert old==new
h=lambda n:hashlib.sha256((D/n).read_bytes()).hexdigest();t={'observedExitCode':r.returncode,'durationSeconds':time.monotonic()-start,'moduleSha256':h('analyze-heads.py'),'stdoutSha256':h('projection.stdout.txt'),'stderrSha256':h('projection.stderr.txt'),'projectionJSONUnchangedFromFirstActualExecution':old==new,'newBrowser':'NOT_RUN','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
(D/'projection-terminal.json').write_text(json.dumps(t,indent=2)+'\n');print(json.dumps(t));raise SystemExit(r.returncode)
