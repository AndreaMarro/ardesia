from pathlib import Path
import subprocess,json,time,hashlib
D=Path(__file__).resolve().parent;app='/private/tmp/cric-resident-integrator/officina-di-fisica';start=time.monotonic()
pins=json.loads((D/'actual-root-source-pins.json').read_text())['files']
assert pins,'Empty source pin map'
for name,pin in pins.items():assert hashlib.sha256((Path(app)/name).read_bytes()).hexdigest()==pin,name
p=subprocess.run(['node',str(D/'collect.mjs'),app],capture_output=True);(D/'node.stdout.txt').write_bytes(p.stdout);(D/'node.stderr.txt').write_bytes(p.stderr);p.check_returncode();(D/'installed.json').write_bytes(p.stdout)
t=subprocess.run(['python3',str(D/'review_tests.py'),'-v'],capture_output=True);(D/'tests.stdout.txt').write_bytes(t.stdout);(D/'tests.stderr.txt').write_bytes(t.stderr)
for name,pin in pins.items():assert hashlib.sha256((Path(app)/name).read_bytes()).hexdigest()==pin,name
r={'consumerSourceCommit':'b9530f9be51234a0e9cce760025741031ab3ccfb','sourceFilesBeforeAfterIdentical':len(pins),'nodeExitCode':p.returncode,'testExitCode':t.returncode,'signal':None,'elapsedSeconds':time.monotonic()-start,'collectorSha256':hashlib.sha256((D/'collect.mjs').read_bytes()).hexdigest(),'testsSha256':hashlib.sha256((D/'review_tests.py').read_bytes()).hexdigest(),'UI':'NOT_RUN','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
(D/'actual-terminal.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r));print(t.stderr.decode());t.check_returncode()
