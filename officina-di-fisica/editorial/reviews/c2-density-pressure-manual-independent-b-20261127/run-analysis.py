from pathlib import Path
import subprocess,json,hashlib,time
D=Path(__file__).resolve().parent;start=time.monotonic();assert not(D/'review-analysis.stdout.txt').exists()
with(D/'review-analysis.stdout.txt').open('w')as out,(D/'review-analysis.stderr.txt').open('w')as err:r=subprocess.run(['/private/tmp/cric-recovery-venv/bin/python','-B',str(D/'review-analysis.py')],stdout=out,stderr=err)
h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();t={'observedExitCode':r.returncode,'durationSeconds':time.monotonic()-start,'analysisModuleSha256':h(D/'review-analysis.py'),'stdoutSha256':h(D/'review-analysis.stdout.txt'),'stderrSha256':h(D/'review-analysis.stderr.txt'),'newBrowser':'NOT_RUN','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
(D/'review-analysis-terminal.json').write_text(json.dumps(t,indent=2)+'\n');print(json.dumps(t));raise SystemExit(r.returncode)
