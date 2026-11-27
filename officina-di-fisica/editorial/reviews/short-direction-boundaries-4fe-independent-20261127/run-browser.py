from pathlib import Path
import hashlib,json,subprocess,time
OUT=Path(__file__).resolve().parent
APP=Path('/private/tmp/cric-c1-work-axis-20261127/officina-di-fisica')
started=time.monotonic()
def fingerprint():
    return json.loads(subprocess.check_output(['python3','-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=APP))
before=fingerprint()
assert before['sha256']=='4fe3c31ff0762c3e9038639320d60d4b8b9a49fe73175e44415c4160b61c1f41'
old=OUT/'actual-independent-comparison.json'
if old.exists():(OUT/'initial-source-preflight-comparison.json').write_bytes(old.read_bytes())
with (OUT/'actual-comparison-fingerprinted-terminal.txt').open('w') as log:
    subprocess.run(['node',str(OUT/'compare-current.mjs')],stdout=log,stderr=subprocess.STDOUT,check=True)
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
