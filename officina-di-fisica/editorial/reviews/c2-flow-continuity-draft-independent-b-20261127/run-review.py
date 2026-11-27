from pathlib import Path
import json,hashlib,subprocess,importlib.util,time
HERE=Path(__file__).resolve().parent
APP=Path('/private/tmp/cric-wave-zero-readout-20261127/officina-di-fisica')
spec=importlib.util.spec_from_file_location('runtime_fp',APP/'tools/corpus_engineering/runtime_fingerprint.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
before=m.runtime_fingerprint(APP);assert before['sha256']=='3ed5bc77d8320230b62e1c3e6ca3bdd00f240cc64ec236b10fe55a306ca79251'
started=time.monotonic()
p=subprocess.run(['node',str(HERE/'collect-installed.mjs'),str(APP)],capture_output=True)
(HERE/'installed.stdout.txt').write_bytes(p.stdout);(HERE/'installed.stderr.txt').write_bytes(p.stderr)
assert p.returncode==0,(p.returncode,p.stderr.decode())
(HERE/'installed.json').write_bytes(p.stdout)
t=subprocess.run(['python3',str(HERE/'review_tests.py'),'-v'],capture_output=True)
(HERE/'tests.stdout.txt').write_bytes(t.stdout);(HERE/'tests.stderr.txt').write_bytes(t.stderr)
after=m.runtime_fingerprint(APP);assert after==before
receipt={'nodeExitCode':p.returncode,'testExitCode':t.returncode,'signal':None,'elapsedSeconds':time.monotonic()-started,'runtimeSha256':before['sha256'],'runtimeFileCount':len(before['files']),'runtimeUnchanged':True,'collectorSha256':hashlib.sha256((HERE/'collect-installed.mjs').read_bytes()).hexdigest(),'testsSha256':hashlib.sha256((HERE/'review_tests.py').read_bytes()).hexdigest(),'UI':'NOT_RUN','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
(HERE/'actual-terminal.json').write_text(json.dumps(receipt,indent=2)+'\n'); print(json.dumps(receipt));print(t.stderr.decode());t.check_returncode()
