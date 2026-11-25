"""Read-only canonical numerical geometry dump; no scientific approval or browser run."""
from pathlib import Path
import sys,json,subprocess,hashlib
APP=Path(__file__).resolve().parents[3];sys.path.insert(0,str(APP))
from tools.corpus_engineering import experiments_force_work_corrected_048_verifier as a,experiments_energy_momentum_corrected_049_verifier as b
from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint
from tools.corpus_engineering.pipeline import digest
FP='b963060675f372b28d79823f92e3a781b32856779fe1dd6a6fbb3feaba30686f'
assert runtime_fingerprint(APP)['sha256']==FP
raw=subprocess.check_output(['git','show',a.SOURCE_REF+':'+a.SOURCE_PATH],cwd=APP);source=json.loads(raw);data={}
for v in (a,b):
 rows={r['id']:r for r in source if r['id'] in v.SPECS};assert all(digest(rows[k])==v.READ_SOURCE_SHA256[k] for k in rows)
 actual=v.runtime_values(rows)
 for key,value in actual.items():
  data[key]={'control':rows[key]['control'],'clock':value.get('clock'),'cases':[{name:c[name] for name in ('x','output','readings','elements','duration','timeSamples') if name in c} for c in value['cases']]}
assert runtime_fingerprint(APP)['sha256']==FP
out={'purpose':'RAW_CANONICAL_GEOMETRY_ONLY_NO_REVIEW_VERDICTS','runtimeProfileBefore':FP,'runtimeProfileAfter':FP,'sourceRef':a.SOURCE_REF,'sourcePath':a.SOURCE_PATH,'sourceFileSha256':hashlib.sha256(raw).hexdigest(),'scriptSha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'scientificApproval':False,'humanApproval':'NOT_RUN','publicationAction':'NONE','records':data}
Path(__file__).with_name('actual-elements.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(len(data),sum(len(v['cases']) for v in data.values()),sum(len(c.get('timeSamples',[])) for v in data.values() for c in v['cases']))
