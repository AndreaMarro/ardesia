from pathlib import Path
import hashlib,json,subprocess,time
D=Path(__file__).resolve().parent;start=time.monotonic()
assert not(D/'actual-tests.txt').exists(),'Keep each prior target immutable'
with(D/'actual-tests.txt').open('w')as o:r=subprocess.run(['python3','-B',str(D/'test_six_observations.py')],stdout=o,stderr=subprocess.STDOUT)
h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
t={'observedExitCode':r.returncode,'durationSeconds':time.monotonic()-start,'testSha256':h(D/'test_six_observations.py'),'rawSha256':h(D/'actual-tests.txt'),'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
(D/'actual-test-terminal.json').write_text(json.dumps(t,indent=2)+'\n');print(json.dumps(t));raise SystemExit(r.returncode)
