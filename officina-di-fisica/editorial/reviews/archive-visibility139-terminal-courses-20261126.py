"""Losslessly retain terminal UI evidence; never convert technical FAIL to PASS."""
from pathlib import Path,PurePosixPath
import hashlib,json,zipfile,collections
APP=Path.cwd();ROOT=APP/'editorial/reviews/visibility139-45888351023-terminal-evidence-20261126';ROOT.mkdir(exist_ok=True)
SPECS={'C2':(159733361,'a4707c40c0d6ed9282e01ef2a4cb9acb3bde20495b06df4c303d502347d4f6fe',15151869883,7440,280),'C3':(186013040,'3fc412e6b66b577fc03e9455444619a13957f1d3263706c8df25811bed2a2ea4',15154792508,11808,56),'C4':(150185140,'5d69ed65634e5c3aa7601b8fcbb539c21c24d7ae72075d16461a56972a75719d',15153222823,7872,24),'C5':(165139573,'81a3748b89b01a1132c9b3d803ce8b730ec31c49c797abfc96168696df8d68d3',15153543264,14464,384),'C6':(57189356,'f4b9012e470bee2d385941f25b6df546f9d50d43a2592823b0bfe2fbb9a10a8c',15154222354,3992,0)}
def sha(b):return hashlib.sha256(b).hexdigest()
def write(p,v):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,indent=2)+'\n')
for course,(size,pin,artifact_id,count,failed)in SPECS.items():
 file=Path('/private/tmp/cric-visibility-'+course+'-45888351023.zip');out=ROOT/course;out.mkdir(exist_ok=True)
 with file.open('rb')as f:assert hashlib.file_digest(f,'sha256').hexdigest()==pin
 assert file.stat().st_size==size
 with zipfile.ZipFile(file)as z:
  names=z.namelist();assert len(names)==len(set(names))
  for i in z.infolist():
   p=PurePosixPath(i.filename);assert not p.is_absolute()and '..'not in p.parts and (i.external_attr>>16)&0o170000!=0o120000
  assert z.testzip()is None
  report_path=f'_temp/experiment-{course}/evidence/report.json';prefix=report_path.removesuffix('report.json');raw=z.read(report_path);report=json.loads(raw);assert report['technicalStatus']==('FAIL'if failed else'ALL_PLANNED_CASES_OBSERVED_REVIEW_NOT_GRANTED')and len(report['cases'])==count and report['sourceCommit']=='64aef05bef5ca7ebff8491060762dd4cac0cbb34'
  assert report['runtimeFingerprint']['sha256']=='4c83e0156b74d5a4cdfad90421f4304e6a7a03bde10d5b125f6635aae7eff907'and report['activityCredit']==0
  prepared_raw=z.read(prefix+'prepared.json');assert sha(prepared_raw)==report['preparedSha256'];plan=json.loads(prepared_raw);expected=set(plan['expectedCaseKeys']);assert len(expected)==count and {c['caseKey']for c in report['cases']}==expected
  byid={(r['id'],r['variant']):r for r in plan['records']};seen=set();images={};failures=[]
  for entry in report['cases']:
   case_raw=z.read(prefix+entry['file']);assert sha(case_raw)==entry['sha256'];case=json.loads(case_raw);assert case['caseKey']==entry['caseKey']and case['technicalOk']==entry['technicalOk']and case['activityCredit']==0 and case['scientificApproval']is False
   assert entry['caseKey']not in seen;seen.add(entry['caseKey'])
   for image in case.get('screenshots',[]):
    path=prefix+image['file'];h=image['sha256']
    if path not in images:assert sha(z.read(path))==h;images[path]=h
    else:assert images[path]==h
   if case['technicalOk']:assert case['screenshots']
   else:
    key=case['caseKey'].split('|');row=byid[key[0],key[1]];item={'caseKey':case['caseKey'],'error':case['error'],'actualModelValueRecorded':bool('model'in case),'originalFailurePreserved':True}
    if key[-2]=='grid':
     index=int(key[-1]);item.update(plannedX=row['grid'][index],frozenExpectedY=row['expectedValues'][index],recordId=row['id'],variant=row['variant'],gridIndex=index)
    failures.append(item)
  assert len(failures)==failed
  for name in ['report.json','prepared.json','terminal-receipt.json','input-preflight.json']:
   if prefix+name in names:(out/name).write_bytes(z.read(prefix+name))
  write(out/'failed-cases-diagnostic-index.json',failures)
  summary={'scope':'Exact terminal technical evidence, not a scientific law finding or activity approval','technicalStatus':report['technicalStatus'],'runId':45888351023,'sourceHead':'07a2dbf574cc52318814a03fbfd04bb5bcab3125','candidateRef':report['sourceCommit'],'runtimeSha256':report['runtimeFingerprint']['sha256'],'artifactId':artifact_id,'artifactBytes':size,'artifactSha256':pin,'zipMembers':len(names),'allMemberCRCAndCaseAndPNGHashesVerified':True,'plannedAndAttemptedCases':count,'technicalPassCases':count-failed,'technicalFailCases':failed,'failureKinds':dict(collections.Counter(c['error']for c in failures)),'browserVersion':report['browserVersion'],'allNineOwnerRecordsChecked':len(report['fullOwnerRecordIdentity']['records'])==9,'guestIsolation':report['guestIsolation'],'actualValuesMissingOnFailures':'Collector catch omits measured model values after failed assertion; do not infer cause or physical failure without new witness'if failed else'NO_FAILURES','scientificCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
 parts=[]
 with file.open('rb')as f:
  for i in range(100):
   data=f.read(40*1024**2)
   if not data:break
   p=out/f'upstream-artifact.zip.part-{i+1:03d}';p.write_bytes(data);parts.append({'path':str(p.relative_to(APP)),'bytes':len(data),'sha256':sha(data)})
 summary['verbatimBoundedParts']=parts;summary['reconstruct']='Concatenate numbered parts; verify whole artifact SHA before extraction.';write(out/'receipt.json',summary);print(course,'ARCHIVED_TERMINAL',count,failed,'NO_SCIENTIFIC_CREDIT',flush=True)
