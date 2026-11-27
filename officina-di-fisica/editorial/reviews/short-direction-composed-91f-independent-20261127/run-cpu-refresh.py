from pathlib import Path
import hashlib,json,subprocess,time
D=Path(__file__).resolve().parent
start=time.monotonic()
with(D/'actual-independent-tests-rerun.txt').open('w')as out:
 test=subprocess.run(['python3','-B',str(D/'test_composed_focus.py')],stdout=out,stderr=subprocess.STDOUT)
r={'executionStatus':'EXECUTED','observedExitCode':test.returncode,'testModuleSha256':hashlib.sha256((D/'test_composed_focus.py').read_bytes()).hexdigest(),'raw':'actual-independent-tests-rerun.txt','rawSha256':hashlib.sha256((D/'actual-independent-tests-rerun.txt').read_bytes()).hexdigest(),'durationSeconds':time.monotonic()-start,'physicalAndGeometricExpectationsUnchangedFrom2dbd5318':True,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
(D/'actual-target-executed-terminal.json').write_text(json.dumps(r,indent=2)+'\n')
if test.returncode:raise SystemExit(test.returncode)
with(D/'actual-head-margin-summary-terminal.txt').open('w')as out:run=subprocess.run(['python3','-B',str(D/'summarize-head-margins.py')],stdout=out,stderr=subprocess.STDOUT)
print(json.dumps({'tests':test.returncode,'margins':run.returncode}))
raise SystemExit(run.returncode)
