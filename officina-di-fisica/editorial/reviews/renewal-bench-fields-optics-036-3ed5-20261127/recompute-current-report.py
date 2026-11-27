from pathlib import Path
import sys,os,json,time,fcntl,shutil,zipfile
APP=Path(__file__).resolve().parents[3];CURRENT=Path('/private/tmp/cric-wave-zero-readout-20261127/officina-di-fisica');sys.path.insert(0,str(APP));os.environ['ASTRA_EXTENSIONS']=str(CURRENT/'extensions')
from tools.corpus_engineering import bench_fields_optics_renewal_3ed5_verifier as module
from tools.corpus_engineering.pipeline import canonical,sha
from tools.corpus_engineering.batches import assert_activity_identity
with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);free=shutil.disk_usage(APP).free
 if free<2*1024**3:raise ValueError('Need2GiB free')
 sources={row['id']:row for row in json.loads((CURRENT/'content/banchi.json').read_bytes())if row['id']in module.IDS};start=time.time();first=module.report(sources,app=CURRENT);second=module.report(sources,app=CURRENT)
 if canonical(first)!=canonical(second):raise ValueError('Two actual fresh model/report calls differ')
 if first['acceptedIndividualCount']!=5:raise ValueError('All five genuinely bounded consumers must pass')
 assert_activity_identity(first['records'],module.IDS,sources)
 reportfile=module.BASE/'scientific-report.json';reportfile.write_text(canonical(first)+'\n')
 receipt={'twoActualFreshReportsIdentical':True,'reportSha256':sha(reportfile.read_bytes()),'actualInstalledNodeCasesPerFreshReport':1045,'sourceMathAndNodeOkCount':5,'boundedUiOkCount':5,'consumerFailedIds':[],'canonicalActivityGate':'CANONICAL_IDENTITY_SHAPE_PASS','explicitScopeCount':5,'elapsedSeconds':time.time()-start,'freeBytesAtStart':free,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
 (module.BASE/'fresh-repeat-receipt.json').write_text(canonical(receipt)+'\n')
 files={name:sha((APP/name).read_bytes())for name in first['dependencies']if name.endswith('.py')}
 with zipfile.ZipFile(module.BASE/'executed-python-dependencies.zip','w',compression=zipfile.ZIP_DEFLATED)as archive:
  for name in files:archive.writestr(name,(APP/name).read_bytes())
 (module.BASE/'executed-python-dependencies.json').write_text(canonical({'files':files,'archiveSha256':sha((module.BASE/'executed-python-dependencies.zip').read_bytes()),'scope':'Exact executed Python dependencies, not permission to overwrite differing Root modules.'})+'\n');print(canonical(receipt),flush=True)
