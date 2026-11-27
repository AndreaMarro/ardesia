"""Compose existing719collector inputs; exact source authority, no new importer or runtime."""
from pathlib import Path
import os,sys,fcntl,shutil,subprocess,json,hashlib,math,copy,time
APP=Path(__file__).resolve().parents[3];ROOT=APP.parent;FOLDER=Path(__file__).resolve().parent
sys.path.insert(0,str(APP))
canon=lambda x:json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'),allow_nan=False)
digest=lambda x:hashlib.sha256(canon(x).encode()).hexdigest()
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
RUNTIME_REF='b9994b9116e87478905191d85cca8037d17ae4bd'
DRAFT_REF='d20c200b8731739ef512f7e2820104a7bd755202'
PROTOCOL=Path('/private/tmp/cric-resident-integrator/officina-di-fisica/tools/corpus_engineering/experiment_visibility_ui.mjs')
PIN='719beb3abc01cbf7607dc1d5d1710732cbc59c2aae91112fb6b680dbfbd22d15'
BATCHES=['experiment-c5-wave-basis-reading-20261127','experiment-c5-wave-energy-sound-reading-20261127']

def normalized_numbers(x):
 if isinstance(x,float):
  if not math.isfinite(x):raise ValueError('Nonfinite JSON number')
  return int(x)if x.is_integer()else x
 if isinstance(x,list):return[normalized_numbers(v)for v in x]
 if isinstance(x,dict):return{k:normalized_numbers(v)for k,v in x.items()}
 return x

def verify(prepared):
 assert sha(PROTOCOL)==PIN
 expected={FOLDER/'inputs'/(name+suffix+'.json') for name in BATCHES for suffix in ('','-bindings')}
 assert set((FOLDER/'inputs').iterdir())==expected
 rows={};owner=[]
 source={r['id']:r for r in json.loads(subprocess.check_output(['git','show','5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/esperienze-C5.json'],cwd=ROOT,env={**os.environ,'GIT_NO_LAZY_FETCH':'1'}))}
 for batch in BATCHES:
  for suffix in ('','-bindings'):
   p=FOLDER/'inputs'/(batch+suffix+'.json');raw=subprocess.check_output(['git','show',DRAFT_REF+':officina-di-fisica/editorial/batches/'+p.name],cwd=ROOT,env={**os.environ,'GIT_NO_LAZY_FETCH':'1'})
   assert p.read_bytes()==raw and prepared['inputFiles'][str(p)]==sha(p)
  package=json.loads((FOLDER/'inputs'/(batch+'.json')).read_text());bindings=json.loads((FOLDER/'inputs'/(batch+'-bindings.json')).read_text())
  assert package['schema']=='astra/1' and package['assets']==[]
  for row,b in zip(package['records'],bindings):
   key=row['id'];assert key==b['id'] and key not in rows and digest(row)==b['candidateSha256']
   assert digest(source[key])==b['sourceSha256']and b['sourceRef']=='5d1dc8dc7b601aef959d10d564c75462be74708d'
   rows[key]=row
 assert len(rows)==11 and len(prepared['draftRecords'])==11 and{r['id']for r in prepared['draftRecords']}==set(rows)
 for row in prepared['draftRecords']:assert digest(row)==digest(rows[row['id']]),'Authoritative full edition canonical identity drift'
 for r in prepared['records']:
  original=rows[r['id']];assert digest(r['record'])==r['candidateSha256']==digest(original)
  expected_owner={k:v for k,v in original.items()if k not in ('baseVersion','review')};expected_owner['review']='bozza'
  # JS JSON parsing normalizes integral float spellings; bind BOTH authorities.
  owner.append({'id':r['id'],'candidateCanonicalSha256':digest(original),'candidateNormalizedNumericCanonicalSha256':digest(normalized_numbers(original)),'fullNormalizedOwnerCanonicalSha256':digest(normalized_numbers(expected_owner)),'allFieldsPreservedExceptCanonicalStoreMetadata':['baseVersion','review']})
 return owner

if __name__=='__main__':
 with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
  fcntl.flock(lock,fcntl.LOCK_EX);free=shutil.disk_usage(APP).free
  if free<2*1024**3:raise ValueError('2GiB guard')
  from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint
  fp=runtime_fingerprint(APP);assert fp['sha256']=='7c7281e363c1d723ec005f4d04b2f54b88bc7b660c18b6adb548053816dcbad6'
  run=subprocess.run(['node',str(FOLDER/'compile-selected-states.mjs')],cwd=APP,capture_output=True,text=True,timeout=30);(FOLDER/'actual-preparation-node-process.txt').write_text(run.stdout+run.stderr);assert run.returncode==0
  compiled=json.loads((FOLDER/'actual-selected-state-compilation.json').read_text());records=[];drafts=[];inputs={};packages=[]
  sources={r['id']:r for r in json.loads((APP/'content/esperienze-C5.json').read_text())}
  for batch in BATCHES:
   p=FOLDER/'inputs'/(batch+'.json');packages.append(str(p))
   for suffix in ('','-bindings'):
    path=FOLDER/'inputs'/(batch+suffix+'.json');inputs[str(path)]=sha(path)
   pkg=json.loads(p.read_text());bindings=json.loads((FOLDER/'inputs'/(batch+'-bindings.json')).read_text())
   for row,b in zip(pkg['records'],bindings):
    data=next(r for r in compiled if r['id']==row['id']);drafts.append(row)
    records.append({**data,'record':row,'course':'C5','variant':'draft','sourceSha256':b['sourceSha256'],'candidateSha256':b['candidateSha256'],'clockCases':[],'auxiliaryCases':[],'originalJudgment':{'scope':'DRAFT_ONLY_CANARY_NOT_PUBLISHED_EDITION_REACCEPTANCE','scientificTextReview':'PASS_WITH_FINAL_ADDENDUM','productUI':'NOT_RUN','activityCredit':0}})
  sourcefiles={'officina-di-fisica/content/esperienze-C5.json':sha(APP/'content/esperienze-C5.json')}
  request={'runtimeCommit':RUNTIME_REF,'runtimeSha256':fp['sha256'],'draftCandidateCommit':DRAFT_REF,'inputFiles':inputs,'profiles':8,'selectedDraftControls':22,'expectedCases':264,'scope':'11privateDRAFTs,assignedpointsandallreadingblocks;notfull139gridorfullclock','collectorSha256':PIN,'activityCredit':0,'publicationAction':'NONE'}
  requestfile=FOLDER/'request.json';requestfile.write_text(json.dumps(request,ensure_ascii=False,indent=2)+'\n')
  plan={'schemaVersion':'1.0.0','course':'C5','sourceCommit':RUNTIME_REF,'draftCandidateCommit':DRAFT_REF,'originalRef':'5d1dc8dc7b601aef959d10d564c75462be74708d','requestSha256':sha(requestfile),'requestFile':str(requestfile),'runtimeFingerprint':fp,'records':records,'draftRecords':drafts,'packageFiles':packages,'inputFiles':inputs,'sourceFiles':sourcefiles,'profiles':[{'width':w,'fallback':fall,'view':view}for w in (320,1280)for fall,view in [(False,'orbit'),(False,'side'),(False,'top'),(True,'fixed_projection')]],'expectedOriginalGridInputs':0,'expectedDraftGridInputs':22,'expectedClockInteractions':0,'scope':'BOUNDED_C5_ELEVEN_DRAFT_READING_AND_22_ASSIGNED_VALUES;FULLCLOCK_AND_OTHERGRID_NOTCOVERED','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
  expected=[]
  for r in records:
   for p in plan['profiles']:
    stem='|'.join([r['id'],'draft',str(p['width']),p['view']]);expected+=[stem+'|setup',stem+'|grid|0',stem+'|grid|1']
  plan['expectedCaseKeys']=expected;assert len(expected)==len(set(expected))==264
  owner=verify(plan)
  (FOLDER/'owner-record-canonical-authority.json').write_text(json.dumps(owner,indent=2)+'\n')
  (FOLDER/'prepared.json').write_text(json.dumps(plan,ensure_ascii=False,indent=2)+'\n')
  assert verify(json.loads((FOLDER/'prepared.json').read_text()))==owner
  info={'candidateApp':str(APP),'prepared':str(FOLDER/'prepared.json'),'output':str(FOLDER/'actual-ui-264')};(FOLDER/'run-info.json').write_text(json.dumps(info,indent=2)+'\n')
  (FOLDER/'actual-preflight-receipt.json').write_text(json.dumps({'actualNodeExitCode':run.returncode,'fullRecordAnd4InputFileAuthorityVerified':True,'preparedSha256':sha(FOLDER/'prepared.json'),'ownerCanonicalAuthoritySha256':sha(FOLDER/'owner-record-canonical-authority.json'),'freeBytesAtStart':free,'runtimeSha256':fp['sha256'],'collectorSha256':PIN,'productUI':'NOT_RUN','activityCredit':0},indent=2)+'\n')
  print(json.dumps({'expectedCases':264,'drafts':11,'recordAuthority':'PASS','runtimeSha256':fp['sha256'],'productUI':'NOT_RUN'}),flush=True)
