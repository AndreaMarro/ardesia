from pathlib import Path
import hashlib,json,subprocess,time
OUT=Path(__file__).resolve().parent
APP=Path('/private/tmp/cric-scene-annotations-c4-c5-author-20261127/officina-di-fisica')
started=time.monotonic()
def fingerprint():
    return json.loads(subprocess.check_output(['python3','-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=APP))
before=fingerprint()
assert before['sha256']=='440d86b5a3d265139477abfc79276ecf979ea6f210f0e07bebc4a76473a47334'
old=OUT/'actual-independent-comparison.json'
if old.exists():(OUT/'initial-source-preflight-comparison.json').write_bytes(old.read_bytes())
with (OUT/'actual-comparison-fingerprinted-terminal.txt').open('w') as log:
    subprocess.run(['node',str(OUT/'compare-independent.mjs')],stdout=log,stderr=subprocess.STDOUT,check=True)
assert fingerprint()==before
(OUT/'actual-source-runtime-fingerprint.json').write_text(json.dumps(before,sort_keys=True,separators=(',',':'))+'\n')
with (OUT/'actual-browser-process.txt').open('w') as log:
    run=subprocess.run(['node',str(OUT/'browser-canaries.mjs'),str(OUT/'actual-browser')],stdout=log,stderr=subprocess.STDOUT)
report=OUT/'actual-browser/report.json'
result={'observedExit':run.returncode if run.returncode>=0 else None,'signal':-run.returncode if run.returncode<0 else None,
        'durationSeconds':time.monotonic()-started,'protocolSha256':hashlib.sha256((OUT/'browser-canaries.mjs').read_bytes()).hexdigest(),
        'reportSha256':hashlib.sha256(report.read_bytes()).hexdigest() if report.exists() else None,
        'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
(OUT/'actual-browser-terminal.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))
if run.returncode:raise SystemExit(run.returncode)
