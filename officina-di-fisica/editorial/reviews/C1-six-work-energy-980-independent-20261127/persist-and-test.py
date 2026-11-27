from pathlib import Path
import json,hashlib,shutil,subprocess,time
D=Path(__file__).resolve().parent;S=Path('/private/tmp/cric-c1-two-families-980-552-20261127')
for r in json.loads((D/'selected-index.json').read_text()):
 for f in [r['file']]+[i['file']for i in r['screenshots']]:
  p=D/f;p.parent.mkdir(exist_ok=True,parents=True);shutil.copyfile(S/f,p)
a=time.monotonic()
with(D/'actual-tests.txt').open('w')as o:r=subprocess.run(['python3','-B',str(D/'test_six_observations.py')],stdout=o,stderr=subprocess.STDOUT)
t={'observedExitCode':r.returncode,'durationSeconds':time.monotonic()-a,'testSha256':hashlib.sha256((D/'test_six_observations.py').read_bytes()).hexdigest(),'rawSha256':hashlib.sha256((D/'actual-tests.txt').read_bytes()).hexdigest(),'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
(D/'actual-test-terminal.json').write_text(json.dumps(t,indent=2)+'\n');print(json.dumps(t));raise SystemExit(r.returncode)
