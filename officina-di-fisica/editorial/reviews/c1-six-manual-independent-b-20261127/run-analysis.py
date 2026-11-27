from pathlib import Path
import subprocess,json,hashlib,time
D=Path(__file__).resolve().parent;start=time.monotonic();assert not(D/'review-analysis.stdout.txt').exists()
with(D/'review-analysis.stdout.txt').open('w')as o, (D/'review-analysis.stderr.txt').open('w')as e:r=subprocess.run(['python3','-B',str(D/'review-analysis.py')],stdout=o,stderr=e)
h=lambda n:hashlib.sha256((D/n).read_bytes()).hexdigest();t={'observedExitCode':r.returncode,'durationSeconds':time.monotonic()-start,'analysisModuleSha256':h('review-analysis.py'),'stdoutSha256':h('review-analysis.stdout.txt'),'stderrSha256':h('review-analysis.stderr.txt'),'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
(D/'review-analysis-terminal.json').write_text(json.dumps(t,indent=2)+'\n');print(json.dumps(t));raise SystemExit(r.returncode)
