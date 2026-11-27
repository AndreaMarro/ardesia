import pathlib,json,shutil,subprocess,hashlib,time
D=pathlib.Path(__file__).resolve().parent;S=pathlib.Path('/private/tmp/cric-c1-two-families-0818-552-20261127')
start=time.monotonic()
for name in ['report.json','terminal-receipt.json','prepared.json','request.json']:shutil.copyfile(S/name,D/name)
for x in json.loads((D/'selected-index.json').read_text()):
 p=D/x['file'];p.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(S/x['file'],p)
 for s in x['screenshots']:
  p=D/s['file'];p.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(S/s['file'],p)
with(D/'actual-tests.txt').open('w')as out:r=subprocess.run(['python3','-B',str(D/'test_work_observations.py')],stdout=out,stderr=subprocess.STDOUT)
t={'observedExitCode':r.returncode,'durationSeconds':time.monotonic()-start,'testModuleSha256':hashlib.sha256((D/'test_work_observations.py').read_bytes()).hexdigest(),'rawSha256':hashlib.sha256((D/'actual-tests.txt').read_bytes()).hexdigest(),'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
(D/'actual-test-terminal.json').write_text(json.dumps(t,indent=2)+'\n');print(json.dumps(t));raise SystemExit(r.returncode)
