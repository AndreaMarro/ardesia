"""Executed single bounded author checks; no browser, registry, publication or runtime writes."""
from pathlib import Path
import fcntl,hashlib,json,os,shutil,subprocess,sys,time
APP=Path(__file__).resolve().parents[3]
FOLDER=Path(__file__).resolve().parent
sys.path.insert(0,str(APP))
with open('/private/tmp/cric-bounded-local-work.lock','a') as lock:
 fcntl.flock(lock,fcntl.LOCK_EX)
 free=shutil.disk_usage(APP).free
 if free<2*1024**3: raise ValueError('Need at least 2GiB free before author checks')
 from tools.corpus_engineering import c3_heat_transformations_reading_authoring as author
 from tools.corpus_engineering.integration import exercise_package
 from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint
 start=time.time();before=runtime_fingerprint(APP)
 package,bindings=author.write()
 files=[APP/'editorial/batches'/(author.BATCH+suffix+'.json') for suffix in ('','-bindings')]
 first=[p.read_bytes() for p in files]
 assert author.write()==(package,bindings)
 assert first==[p.read_bytes() for p in files], 'Double assembly must preserve exact bytes'
 sources={r['id']:r for r in json.loads((FOLDER/'source-esperienze-C3-5d1dc8.json').read_text())}
 manual=[]
 for row,binding in zip(package['records'],bindings):
  assert binding['candidateSha256']==author.digest(row) and binding['sourceSha256']==author.digest(sources[row['id']])
  tasks=[]
  for x,exact,entry in author.MANUAL[row['id']]:
   if row['id']=='SIM-C3-L03-01':derived=50*x
   elif row['id']=='SIM-C3-L03-03':derived=author.Fraction(4157,500)*x
   elif row['id']=='SIM-C3-L03-04':derived=(80*x+4000)/(x+200)
   elif row['id']=='SIM-C3-L04-01':derived=1000*x/334
   elif row['id']=='SIM-C3-L04-02':derived=author.Fraction(113,50)*x
   else:derived=min(100,max(0,(x-2)*1000/340))
   assert derived==exact
   tasks.append({'inputExact':str(x),'inputUnit':row['control']['unit'],'outputExact':str(exact),'outputUnit':row['measure']['unit'],'numericEntry':entry,'exactErrorOfNumericEntry':str(abs(author.Fraction(entry)-exact))})
  manual.append({'id':row['id'],'sourceVersion':1,'candidateVersion':2,'baseVersion':1,'tasks':tasks,'independentReview':'PENDING','productUI':'NOT_RUN'})
 assert author.Fraction(1300,17)-author.Fraction('76.47')==author.Fraction(1,1700)
 # Unit products for all six physics models, not a claim of independent review.
 import pint
 u=pint.UnitRegistry()
 assert ((50*u.joule/u.kelvin)*(8*u.kelvin)).to('J').magnitude==400
 assert ((1*u.mole)*(8.314*u.joule/u.mole/u.kelvin)*(10*u.kelvin)).check('[energy]')
 assert ((1000*u.joule)/(334*u.joule/u.gram)).check('[mass]')
 assert ((3*u.gram)*(2.26*u.kilojoule/u.gram)).check('[energy]')
 assert ((100*u.gram)*(2*u.joule/u.gram/u.kelvin)*(10*u.kelvin)).to('J').magnitude==2000
 (FOLDER/'author-manual-exact-checks.json').write_text(json.dumps({'role':'AUTHOR_DERIVATIONS_NOT_INDEPENDENT_REVIEW','records':manual,'calorimetry':'Equal specific heat cancels; temperature differences in K or Celsius intervals have equal magnitude.','unitsChecked':True,'activityCredit':0,'humanApproval':'NOT_RUN'},indent=2)+'\n')
 nodeStart=time.time()
 with(FOLDER/'actual-candidate-checks-process.txt').open('xb') as stream:
  run=subprocess.run(['node',str(FOLDER/'validate-candidate-assignments.mjs')],cwd=APP,env={**os.environ,'GIT_NO_LAZY_FETCH':'1'},stdout=stream,stderr=subprocess.STDOUT,timeout=45)
 if run.returncode:raise ValueError('Node author checks failed: '+(FOLDER/'actual-candidate-checks-process.txt').read_text())
 integration=exercise_package(files[0])
 assert first==[p.read_bytes() for p in files]
 after=runtime_fingerprint(APP);assert before==after
 result={'schemaVersion':'1.0.0','role':'AUTHOR_TECHNICAL_RECEIPT_NOT_SCIENTIFIC_APPROVAL','sourceRef':author.SOURCE_REF,'consumerRef':'b9994b9116e87478905191d85cca8037d17ae4bd','doubleAssemblyBytesIdentical':True,'packageCanonicalSha256':author.digest(package),'packageFileSha256':hashlib.sha256(first[0]).hexdigest(),'bindingsFileSha256':hashlib.sha256(first[1]).hexdigest(),'canonicalIntegrationInTemporarySQLite':integration,'actualNodeExitCode':run.returncode,'elapsedSeconds':time.time()-start,'freeBytesAtStart':free,'runtimeBefore':before,'runtimeAfter':after,'activityCredit':0,'productUI':'NOT_RUN','humanApproval':'NOT_RUN','publicationAction':'NONE','independentReview':'PENDING'}
 (FOLDER/'actual-author-checks-receipt.json').write_text(json.dumps(result,indent=2)+'\n')
 print(json.dumps({'nodeExit':run.returncode,'import':integration['firstImport'],'repeat':integration['repeatedImport'],'published':integration['afterPublishedCount'],'runtimeUnchanged':before==after,'activityCredit':0}),flush=True)
