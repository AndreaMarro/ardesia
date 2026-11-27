from pathlib import Path
import subprocess,os,json,hashlib,time
D=Path(__file__).resolve().parent
start=time.monotonic();env={**os.environ,'MIDPOINT_CASE_ROOT':str(D.parent/'P-reread77c24/actual-browser')}
with(D/'actual-old77c-label-red.txt').open('w')as o:r=subprocess.run(['python3','-B',str(D/'test_reread.py'),'MidpointReread.test_charge_labels_are_off_geometry_and_accessible'],env=env,stdout=o,stderr=subprocess.STDOUT)
assert r.returncode==1,'Old observed charge-label interference must fail the unchanged label guard'
with(D/'actual-tests.txt').open('w')as o:g=subprocess.run(['python3','-B',str(D/'test_reread.py')],stdout=o,stderr=subprocess.STDOUT)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
(D/'actual-test-terminal.json').write_text(json.dumps({'observedOld77cRedExitCode':r.returncode,'observedCurrentExitCode':g.returncode,'durationSeconds':time.monotonic()-start,'testModuleSha256':sha(D/'test_reread.py'),'old77cRedRawSha256':sha(D/'actual-old77c-label-red.txt'),'currentRawSha256':sha(D/'actual-tests.txt'),'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'},indent=2)+'\n');print((D/'actual-test-terminal.json').read_text());raise SystemExit(g.returncode)
