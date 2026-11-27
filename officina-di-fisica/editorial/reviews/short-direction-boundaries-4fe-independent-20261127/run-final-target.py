from pathlib import Path
import json,hashlib,subprocess,time
D=Path(__file__).resolve().parent
start=time.monotonic()
with (D/'actual-independent-tests.txt').open('w') as log:
    test=subprocess.run(['python3','-B',str(D/'test_composed_focus.py')],stdout=log,stderr=subprocess.STDOUT)
result={'observedExitCode':test.returncode,'durationSeconds':time.monotonic()-start,'testModuleSha256':hashlib.sha256((D/'test_composed_focus.py').read_bytes()).hexdigest(),'rawSha256':hashlib.sha256((D/'actual-independent-tests.txt').read_bytes()).hexdigest(),'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
(D/'actual-target-terminal.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))
raise SystemExit(test.returncode)
