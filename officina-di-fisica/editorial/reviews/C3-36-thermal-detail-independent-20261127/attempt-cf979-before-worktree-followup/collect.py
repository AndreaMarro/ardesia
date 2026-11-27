"""One bounded, read-only code observation per group; never browser credit."""
from pathlib import Path
import sys,subprocess,json,hashlib
ROOT=Path('/private/tmp/cric-vector-apparatus-author-20261126/officina-di-fisica');OUT=Path(__file__).resolve().parent
sys.path.insert(0,str(ROOT))
from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint
before=runtime_fingerprint(ROOT);assert before['sha256']=='cf979c7de2d6072da0f998cf581eb09fd5a7e966904abe9ac722e82bc56dbb57',before['sha256']
records=[]
for group in ('state','calorimetry','first-law','paths','entropy'):
 run=subprocess.run(['node',str(OUT/'collect-actual-cf979.mjs'),group],cwd=ROOT,capture_output=True,text=True,timeout=45)
 (OUT/(group+'-node-stderr.txt')).write_text(run.stderr)
 assert run.returncode==0,(group,run.returncode,run.stderr)
 data=json.loads(run.stdout);data.update(runtimeProfileBefore=before['sha256'],runtimeProfileAfter=runtime_fingerprint(ROOT)['sha256'],terminalStatus='COMPLETED_CODE_COLLECTION_ONLY')
 assert data['runtimeProfileAfter']==before['sha256'];assert data['UI']=='NOT_RUN'
 raw=(json.dumps(data,ensure_ascii=False,sort_keys=True,separators=(',',':'))+'\n').encode();f=OUT/(group+'-actual-code.json');assert not f.exists();f.write_bytes(raw)
 records.append({'group':group,'file':f.name,'sha256':hashlib.sha256(raw).hexdigest(),'recordCount':len(data['records']),'gridStates':sum(len(r['cases'])for r in data['records']),'clockStates':sum(len(c['clockSamples'])for r in data['records']for c in r['cases'])})
assert runtime_fingerprint(ROOT)==before
(OUT/'actual-runtime-fingerprint.json').write_text(json.dumps(before,ensure_ascii=False,indent=2)+'\n')
receipt={'runtimeSha256':before['sha256'],'records':records,'UI':'NOT_RUN','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
(OUT/'actual-code-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
