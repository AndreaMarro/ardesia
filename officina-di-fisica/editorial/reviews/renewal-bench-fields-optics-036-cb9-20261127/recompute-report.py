from pathlib import Path
import fcntl,sys,shutil,json,hashlib,zipfile
APP=Path(__file__).resolve().parents[3];sys.path.insert(0,str(APP))
from tools.corpus_engineering import bench_fields_optics_renewal_cb9_verifier as v
from tools.corpus_engineering.pipeline import canonical,sha
BASE=Path(__file__).resolve().parent;CURRENT=Path('/private/tmp/cric-method-css-748-independent-app')
with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX)
 if shutil.disk_usage(BASE).free<2*1024**3:raise ValueError('Need2GiB free')
 sources={r['id']:r for r in json.loads((CURRENT/'content/banchi.json').read_bytes())if r['id']in v.IDS}
 first=v.report(sources,app=CURRENT);second=v.report(sources,app=CURRENT)
 if canonical(first)!=canonical(second):raise ValueError('Two fresh model/report calls differ')
 if first['acceptedIndividualCount']!=3:raise ValueError('Preserve exactly2 actual consumer visibility failures')
 (BASE/'bench-fields-optics-036-renewal-cb9.json').write_text(canonical(first)+'\n')
 (BASE/'fresh-repeat-receipt.json').write_text(canonical({'twoFreshCallsIdentical':True,'reportSha256':sha((BASE/'bench-fields-optics-036-renewal-cb9.json').read_bytes()),'sourceMathAndNodeOkCount':5,'boundedUiOkCount':3,'consumerVisibilityFailedIds':['LAB3D-07','LAB3D-10'],'actualNodeCasesPerFreshReport':1045,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'})+'\n')
 files={name:sha((APP/name).read_bytes())for name in first['dependencies']if name.endswith('.py')}
 with zipfile.ZipFile(BASE/'executed-python-dependencies.zip','w',compression=zipfile.ZIP_DEFLATED)as archive:
  for name in files:archive.writestr(name,(APP/name).read_bytes())
 (BASE/'executed-python-dependencies.json').write_text(canonical({'files':files,'archiveSha256':sha((BASE/'executed-python-dependencies.zip').read_bytes())})+'\n')
 print(canonical({'twoActualFreshReportsIdentical':True,'physicsNode':5,'visibilityOk':3,'visibilityFail':2,'activityCredit':0}))
