"""Bounded fresh source/math/installed-Node preparation. Never starts Chrome."""
from pathlib import Path
import os,sys,subprocess,fcntl,shutil,time,json,hashlib,types,gzip,zipfile
BASE=Path(__file__).resolve().parent;AUDIT_APP=BASE.parents[2];APP=Path('/private/tmp/cric-midpoint-and-press-20261127/officina-di-fisica')
REF='099fe6614bdaf14702da8a472eea1bb743fd1599';RUNTIME='77c13a37088c8b19e7e56558a85ff8ad644acf8488abb9b5d0a5214991c696d4';PY='/private/tmp/cric-recovery-venv/bin/python'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,data):p.write_text(json.dumps(data,sort_keys=True,ensure_ascii=False,indent=2,default=str)+'\n')
def rebound(fn,**changes):
 fn=getattr(fn,'__wrapped__',fn);return types.FunctionType(fn.__code__,{**fn.__globals__,**changes},fn.__name__,fn.__defaults__,fn.__closure__)
def main():
 with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
  fcntl.flock(lock,fcntl.LOCK_EX);free=shutil.disk_usage(BASE).free
  if free<2*1024**3:raise ValueError('FAIL CLOSED free<2GiB actual='+str(free))
  start=time.monotonic();env={**os.environ,'GIT_NO_LAZY_FETCH':'1','PYTHONDONTWRITEBYTECODE':'1','ASTRA_EXTENSIONS':str(APP/'extensions')};os.environ.update({k:env[k]for k in['GIT_NO_LAZY_FETCH','PYTHONDONTWRITEBYTECODE','ASTRA_EXTENSIONS']})
  if subprocess.check_output(['git','rev-parse','HEAD'],cwd=APP,env=env,text=True).strip()!=REF:raise ValueError('Immutable candidate HEAD differs')
  def fingerprint():return json.loads(subprocess.check_output([PY,'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=APP,env=env))
  before=fingerprint()
  if before['sha256']!=RUNTIME:raise ValueError('Full proposed runtime differs')
  sys.path.insert(0,str(AUDIT_APP))
  from tools.corpus_engineering import bench_mechanics_fluids_activity_verifier as m,bench_fields_optics_activity_verifier as f
  from tools.corpus_engineering.pipeline import digest
  physicsPins={Path(m.__file__):'bea3c473770ffe287a5e9b5b50fccfb5b25b73b2dc217353456e5461b860d193',Path(f.__file__):'47eaceb1497a3a1db95248f271028670ebc2716050dd427a09a580586870ed8b'}
  for p,pin in physicsPins.items():
   if sha(p)!=pin:raise ValueError('Independently read physics dependency changed')
  raw035=rebound(m.runtime_values,APP=APP)();checks035=rebound(m.runtime_checks,runtime_values=lambda:raw035)();exact035=m.exact_checks()
  raw036=f.runtime_values(APP);checks036=f.compare_runtime(raw036);exact036=f.independent_checks()
  sources=json.loads((APP/'content/banchi.json').read_bytes())
  for family,batch,module,raw,checks,exact,count in [('mechanics-fluids','035',m,raw035,checks035,exact035,378),('fields-optics','036',f,raw036,checks036,exact036,1045)]:
   base=AUDIT_APP/f'editorial/reviews/renewal-bench-{family}-{batch}-77c13-20261127';pins=json.loads((base/'source-runtime-pins.json').read_bytes())
   for name,pin in pins['runtimeFiles'].items():
    if sha(APP/name)!=pin or before['files'].get(name)!=pin:raise ValueError('Selected native byte drift:'+name)
   collector=base/f'browser-bench-{family}-77c13.mjs';subprocess.run(['node','--check',str(collector)],env=env,check=True,capture_output=True,timeout=20);compile((base/'run-bounded.py').read_bytes(),str(base/'run-bounded.py'),'exec')
   rows={r['id']:r for r in sources if r['id']in module.READ_SOURCE_SHA256}
   if set(rows)!=set(module.READ_SOURCE_SHA256)or set(exact)!=set(rows)or set(checks)!=set(rows):raise ValueError('Exact source/model ID set differs')
   if (sum(len(v)for v in checks.values())if batch=='035'else sum(v['caseCount']for v in checks.values()))!=count:raise ValueError('Installed model grid incomplete')
   records=[]
   for key,row in sorted(rows.items()):
    if row['kind']!='bench'or digest(row)!=module.READ_SOURCE_SHA256[key]:raise ValueError('Original source frozen hash differs:'+key)
    physicalOk=bool(exact[key])and all(c['ok']for c in exact[key]);installedOk=all(c['ok']for c in checks[key])if batch=='035'else checks[key]['ok']
    if not physicalOk or not installedOk:raise ValueError('Actual independent exact/installed model failed:'+key)
    expected=[(module.sp.sympify(exact[key][i]['independentExact']),u)for i,u in enumerate(module.ASSESSMENT_UNITS[key])]if batch=='035'else module.ASSESSMENT_ORACLES[key]
    if len(row['assessment'])!=len(expected)or any(module.sp.Rational(str(r['value']))!=v or r['unit']!=u for r,(v,u)in zip(row['assessment'],expected)):raise ValueError('Actual source task/units differ from independent solution:'+key)
    if row['prediction']['correct']!=module.EXPECTED_PREDICTIONS[key]:raise ValueError('Source prediction/independent physics differ:'+key)
    if key=='LAB3D-10'and[(r['value'],r['unit'])for r in raw['_addedWaveAssessments']]!=[(1,'mm'),(0,'mm')]:raise ValueError('Consumer-added actual tasks differ')
    records.append({'id':key,'sourceRef':module.SOURCE_REF,'sourcePath':module.SOURCE_PATH,'sourceVersion':row.get('version',1),'sourceSha256':digest(row),'calculationScope':'EXACT_MANUAL_CALCULATION','sourceMathOk':True,'installedNodeOk':True,'exactChecks':exact[key],'installedChecks':checks[key],'manualArithmetic':module.MANUAL[key],'physicalAssumptions':module.ASSUMPTIONS[key],'consumerUI':'NOT_RUN_CURRENT_WHOLE_COHORT','ok':False,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'})
   encoded=json.dumps(raw,sort_keys=True,ensure_ascii=False,separators=(',',':'),allow_nan=False).encode();gzipPath=base/'actual-installed-node-values.json.gz';gzipPath.write_bytes(gzip.compress(encoded,mtime=0))
   save(base/'actual-preflight.json',{'schemaVersion':'1.0.0','candidateCommit':REF,'runtimeSha256':RUNTIME,'preflightOk':True,'installedNodeCases':count,'records':records,'rawCompressedSha256':sha(gzipPath),'rawDecodedSha256':hashlib.sha256(encoded).hexdigest(),'rawDecodedBytes':len(encoded),'preflightProtocolSha256':sha(Path(__file__)),'physicsDependencies':{str(p.relative_to(AUDIT_APP)):sha(p)for p in physicsPins},'disclosure':'Prior independent source/math readings reused; fresh exact/unit/installed-Node calls, not epoch UI acceptance. Existing numeric comparison conventions unchanged, no new tolerance.','consumerUI':'NOT_RUN_CURRENT_WHOLE_COHORT','ok':False,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'})
  after=fingerprint()
  if before!=after:raise ValueError('Full runtime drift during actual CPU preflight')
  save(BASE/'actual-preflight-terminal.json',{'actualExitCode':0,'runtimeBefore':before,'runtimeAfter':after,'freeBytesAtStart':free,'elapsedSeconds':time.monotonic()-start,'protocolSha256':sha(Path(__file__)),'sourceMathInstalledCases':1423,'browserStarted':False,'activityCredit':0})
  with zipfile.ZipFile(BASE/'executed-physics-dependencies.zip','w',compression=zipfile.ZIP_DEFLATED)as z:
   for p in physicsPins:z.writestr(str(p.relative_to(AUDIT_APP)),p.read_bytes())
  print(json.dumps({'actualExitCode':0,'sourceMathInstalledCases':1423,'browserStarted':False,'activityCredit':0}),flush=True)
if __name__=='__main__':main()
