"""Archive exact historical3792 CI success without adopting stale source state."""
from pathlib import Path,PurePosixPath
import hashlib,json,subprocess,sys,zipfile,os
from tools.corpus_engineering.pipeline import load_checkpoint
from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint
APP=Path.cwd();REPO=APP.parent;PIN='5e27eeee4ec5b9ae499f174c633525547d9a423a'
ZIP=Path('/private/tmp/cric-preintegration-success-45877605987.zip')
OUT=APP/'editorial/reviews/preintegration-45877605987-historical-success-20261126';OUT.mkdir(exist_ok=True)
TMP=APP/'var/archive-success-45877605987';TMP.mkdir(parents=True,exist_ok=True)
def sha(b):return hashlib.sha256(b).hexdigest()
def git(path):return subprocess.check_output(['git','-C',str(REPO),'show',PIN+':officina-di-fisica/'+path])
def write(p,v):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,indent=2)+'\n')
with ZIP.open('rb')as f:assert hashlib.file_digest(f,'sha256').hexdigest()=='ce8239b4ba04b48a6648080e4227bdcc87de912c90a0cbc4d3444724d450f026'
assert ZIP.stat().st_size==153505274
pointer_before=(APP/'editorial/corpus/checkpoint.json').read_bytes()
with zipfile.ZipFile(ZIP)as z:
 names=z.namelist();assert len(names)==len(set(names))==2885
 for i in z.infolist():
  p=PurePosixPath(i.filename);assert not p.is_absolute()and '..'not in p.parts and (i.external_attr>>16)&0o170000!=0o120000
 assert z.testzip()is None
 for name in names:
  if name.startswith('preintegration/corpus/')or (name.startswith('corpus-preview-evidence/')and name.endswith(('/report.json','/completion.json'))):
   p=TMP/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(z.read(name))
 questions,activities,metadata=load_checkpoint(TMP/'preintegration/corpus')
 counts=(len(questions),len(activities),sum(r['state']=='REVISED_DRAFT'for r in questions),sum(r['state']in('REVIEWED_EXISTING_EDITION','REVISED_ACTIVITY_DRAFT')for r in activities));assert counts==(4606,385,3792,246),counts
 checkpoint=json.loads(z.read('preintegration/corpus/checkpoint.json'))
 full=z.read('preintegration-full-tests.log');assert b'Ran 1133 tests in 645.861s\n\nOK'in full
 coexist=json.loads(z.read('preintegration/registry-coexistence.json'));assert coexist['beforePublishedCount']==coexist['afterPublishedCount']==991 and coexist['beforePublishedSha256']==coexist['afterPublishedSha256']and coexist['newPublications']==0
 release_sha=sha(z.read('preintegration/officina-release.zip'))
 with zipfile.ZipFile(OUT/'verbatim-run-logs.zip','w',zipfile.ZIP_DEFLATED)as logs:
  log_index={}
  for name in names:
   if name.startswith('preintegration')and name.endswith('.log'):
    data=z.read(name);logs.writestr(name,data);log_index[name]={'bytes':len(data),'sha256':sha(data)}
 write(OUT/'verbatim-run-logs-index.json',log_index)
registry=json.loads(git('editorial/batches/registry.json'))
specs=[*registry['batches'],*({'id':r['revisionPackage'],'activityIds':r['activityIds']}for r in registry['activityBatches']if r.get('revisionPackage'))]
assert len(specs)==249
for spec in specs:
 p=TMP/'frozen-packages'/(spec['id']+'.json');p.parent.mkdir(exist_ok=True);p.write_bytes(git('editorial/batches/'+p.name))
runtime=runtime_fingerprint(APP);assert runtime['sha256']=='1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba'
common={'runtimeFingerprint':runtime}
for key,file in [('protocolSha256','browser-drafts.mjs'),('runnerSha256','browser-batches.mjs'),('helperSha256','browser-batches-resume.mjs')]:
 raw=git('tests/corpus/'+file);assert raw==(APP/'tests/corpus'/file).read_bytes();common[key]=sha(raw)
write(TMP/'validation-inputs.json',{'specs':specs,'common':common})
script="""import{readFile,writeFile}from'node:fs/promises';
import{validateBatchSpec,validateCompletion,sha256}from'../../tests/corpus/browser-batches-resume.mjs';
const root=process.argv[2],out=process.argv[3],{specs,common}=JSON.parse(await readFile(root+'/validation-inputs.json'));
let cases=0;const batches=[];
for(const spec of specs){const id=spec.id,bytes=await readFile(root+'/frozen-packages/'+id+'.json'),pkg=JSON.parse(bytes),report=await readFile(root+'/corpus-preview-evidence/'+id+'/report.json'),marker=JSON.parse(await readFile(root+'/corpus-preview-evidence/'+id+'/completion.json'));validateBatchSpec(pkg,spec);validateCompletion(marker,report,pkg,{batch:id,packageFileSha256:sha256(bytes),...common});cases+=marker.caseCount;batches.push({id,packageSha256:sha256(bytes),caseCount:marker.caseCount});}
if(batches.length!==249||cases!==11427)throw Error('Historical coverage differs');await writeFile(out,JSON.stringify({scope:'Read-only canonical UI validator, exact source5e packages, no persistence/adoption',batches,cases},null,2)+'\\n');console.log('HISTORICAL_UI_VALID249/11427');"""
script_path=APP/'var/archive-success-45877605987-validate.mjs';script_path.write_text(script)
# Script is placed under tools for stable existing validator resolution, then removed.
runner=APP/'tools/corpus_engineering/archive3792-read-only-validator.mjs';assert not runner.exists();runner.write_text(script)
try:subprocess.run(['node',str(runner),str(TMP),str(OUT/'actual-ui-validation.json')],check=True)
finally:runner.unlink()
(OUT/'actual-ui-validator.mjs.txt').write_text(script)
parts=[]
with ZIP.open('rb')as f:
 for i in range(4):
  raw=f.read(40*1024**2);assert raw;p=OUT/f'upstream-artifact.zip.part-{i+1:03d}';p.write_bytes(raw);parts.append({'path':str(p.relative_to(APP)),'bytes':len(raw),'sha256':sha(raw)})
 assert not f.read(1)
assert (APP/'editorial/corpus/checkpoint.json').read_bytes()==pointer_before
receipt={'scope':'Historical exact-source technical CI SUCCESS; not current accepted state or adoption','runId':45877605987,'jobId':140108548946,'headSha':PIN,'artifactId':15146193587,'artifactBytes':153505274,'artifactSha256':'ce8239b4ba04b48a6648080e4227bdcc87de912c90a0cbc4d3444724d450f026','boundedVerbatimArtifactParts':parts,'reconstruct':'Concatenate part001..004; verify whole SHA before extraction.','zipMemberCount':len(names),'allMemberCRCsVerified':True,'checkpoint':checkpoint,'actualCounts':{'questions':4606,'activities':385,'questionDrafts':3792,'reviewedActivities':246},'fullTrackedSuite':{'tests':1133,'seconds':645.861,'observedExitCode':0},'canonicalUIValidator':{'batches':249,'cases':11427,'actualExit':0},'freshAndIncremental':'PASS_IDENTICAL_BYTES_ON_RUNNER','coexistence':'PASS','releaseSha256':release_sha,'releasePackageVerification':'PASS_ON_EXACT_RUN_TREE','rootCheckpointPointerUnchanged':True,'notAdoptedReason':'Current registry has explicit new activity withdrawal and wavelength240 package/peer proof changed after source5e; newer accepted C1/U7 lots await registration. Never retag this historical positive as current.','scientificCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
write(OUT/'receipt.json',receipt);print('HISTORICAL3792_SUCCESS_ARCHIVED_NO_ADOPTION',release_sha,flush=True)
