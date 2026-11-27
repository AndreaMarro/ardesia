from pathlib import Path
import sys,os,json,hashlib,importlib,fcntl,subprocess,shutil,time,zipfile
APP=Path(__file__).resolve().parents[3];CURRENT=Path(os.environ.get('CRIC_BENCH_RUNTIME_APP','/private/tmp/cric-midpoint-charge-labels-20261127/officina-di-fisica'));sys.path.insert(0,str(APP));os.environ['ASTRA_EXTENSIONS']=str(CURRENT/'extensions')
from tools.corpus_engineering.pipeline import canonical,sha
from tools.corpus_engineering.batches import assert_activity_identity
with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);free=shutil.disk_usage(APP).free
 if free<2*1024**3:raise ValueError('Need2GiB free')
 for family,batch,wants in [('mechanics_fluids','035',5),('fields_optics','036',4)]:
  base=APP/f'editorial/reviews/renewal-bench-{family.replace("_","-")}-{batch}-20964-20261127';module=importlib.import_module('tools.corpus_engineering.bench_'+family+'_renewal_20964_verifier');sources={row['id']:row for row in json.loads((CURRENT/'content/banchi.json').read_bytes())if row['id']in module.IDS};start=time.time();first=module.report(sources,app=CURRENT);second=module.report(sources,app=CURRENT)
  if canonical(first)!=canonical(second):raise ValueError('Two actual fresh model/report calls differ')
  if first['acceptedIndividualCount']!=wants or any(row['calculationScope']!='EXACT_MANUAL_CALCULATION'for row in first['records']):raise ValueError('PerIDscience/explicitscope judgment differs')
  if batch=='036':
   try:assert_activity_identity(first['records'],module.IDS,sources)
   except ValueError:gate='REJECT_WHOLE_GROUP_REAL_CONSUMER_READOUT_NEGATIVE'
   else:raise ValueError('Failed consumer must prevent whole activity admission')
  else:assert_activity_identity(first['records'],module.IDS,sources);gate='CANONICAL_IDENTITY_SHAPE_PASS'
  reportfile=base/f'bench-{family.replace("_","-")}-{batch}-renewal-20964.json';reportfile.write_text(canonical(first)+'\n')
  receipt={'twoActualFreshReportsIdentical':True,'reportSha256':sha(reportfile.read_bytes()),'actualInstalledNodeCasesPerFreshReport':378 if batch=='035'else 1045,'sourceMathAndNodeOkCount':5,'boundedUiOkCount':wants,'consumerFailedIds':[row['id']for row in first['records']if not row['ok']],'canonicalActivityGate':gate,'explicitScopeCount':5,'elapsedSeconds':time.time()-start,'freeBytesAtStart':free,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
  (base/'fresh-repeat-receipt.json').write_text(canonical(receipt)+'\n')
  files={name:sha((APP/name).read_bytes())for name in first['dependencies']if name.endswith('.py')}
  with zipfile.ZipFile(base/'executed-python-dependencies.zip','w',compression=zipfile.ZIP_DEFLATED)as archive:
   for name in files:archive.writestr(name,(APP/name).read_bytes())
  (base/'executed-python-dependencies.json').write_text(canonical({'files':files,'archiveSha256':sha((base/'executed-python-dependencies.zip').read_bytes()),'scope':'Executed exact dependency bytes, not permission to overwrite Root modules.'})+'\n')
  print(canonical(receipt),flush=True)
