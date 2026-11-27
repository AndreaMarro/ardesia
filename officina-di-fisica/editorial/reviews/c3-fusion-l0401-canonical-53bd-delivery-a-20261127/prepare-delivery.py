"""Build the isolated canonical preview fixture and lossless evidence transport."""
from pathlib import Path
import hashlib,json,shutil,subprocess,zipfile
TASK=Path(__file__).resolve().parents[6]
APP=Path(__file__).resolve().parents[3]
WORK=TASK/'work'
SOURCE=WORK/'cric-converged-runtime-20261127/officina-di-fisica'
OVERLAY=WORK/'cric-a-c3-53bd-preview-app-20261127/officina-di-fisica'
ROOT=WORK/'cric-resume-276'
D=Path(__file__).resolve().parent
OLD=APP/'editorial/reviews/c3-l0401-53bd-independent-a-20261127'
AUTHOR=APP/'editorial/reviews/c3-six-heat-phase-core6ae3-independent-a-20261127'
KEY='SIM-C3-L04-01'; BATCH='experiment-c3-fusion-l0401-reading-53bd-20261127'
REF=subprocess.check_output(['git','rev-parse','6d773702'],cwd=ROOT,text=True).strip()
def sha(x):return hashlib.sha256(x).hexdigest()
def dump(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,sort_keys=True,indent=2)+'\n')
def copy(a,b):b.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(a,b)
fp=json.loads((OLD/'current-runtime-fingerprint.json').read_text())
assert fp['sha256']=='53bd0c149919095e24abc8f490702494b3054367230aa941ff509ce52772d46a'
for name,h in fp['files'].items():
 assert sha((SOURCE/name).read_bytes())==h,name
 if not name.startswith('node_modules/'):copy(SOURCE/name,OVERLAY/name)
node=OVERLAY/'node_modules'
if not node.exists():node.symlink_to(WORK/'cric-resume-276/officina-di-fisica/node_modules',target_is_directory=True)
inputs=[]
for name in ['pipeline.py','review_contract.py','runtime_fingerprint.py','draft_import.py','activity_observations.py','experiment_visibility_request.py','integration.py','batches.py','acceptance_withdrawals.py']:
 path='officina-di-fisica/tools/corpus_engineering/'+name
 raw=subprocess.check_output(['git','show',REF+':'+path],cwd=ROOT)
 # draft_import and fingerprint are actual runtime/epoch dependencies, never silently replace them.
 if name=='draft_import.py':assert sha(raw)==fp['files']['tools/corpus_engineering/draft_import.py']
 if name=='runtime_fingerprint.py':assert sha(raw)==fp['protocolSha256']
 snap='canonical-'+name+'.verbatim'
 (D/snap).write_bytes(raw)
 out=OVERLAY/'tools/corpus_engineering'/name;out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes(raw)
 inputs.append(dict(commit=REF,path=path,snapshot=snap,sha256=sha(raw)))
for name in ['tests/corpus/browser-drafts.mjs']:
 copy(SOURCE/name,OVERLAY/name)
 copy(SOURCE/name,D/'browser-drafts.verbatim.mjs')
for file in (SOURCE/'contracts').glob('corpus-*.json'):copy(file,OVERLAY/'contracts'/file.name)
package=json.loads((AUTHOR/'candidate.verbatim.json').read_text());bindings=json.loads((AUTHOR/'bindings.verbatim.json').read_text())
package['records']=[r for r in package['records'] if r['id']==KEY];bindings=[r for r in bindings if r['id']==KEY]
assert len(package['records'])==len(bindings)==1 and package['assets']==[]
for name,value in [(BATCH+'.json',package),(BATCH+'-bindings.json',bindings)]:
 dump(APP/'editorial/batches'/name,value);copy(APP/'editorial/batches'/name,OVERLAY/'editorial/batches'/name)
signature=sha(json.dumps(dict(record=package['records'][0],assets={},source=dict(id=KEY,ref=bindings[0]['sourceRef'],sha256=bindings[0]['sourceSha256'])),sort_keys=True,separators=(',',':'),ensure_ascii=False,allow_nan=False).encode())
dump(D/'filtered-identity.json',dict(id=KEY,batch=BATCH,recordSha256=bindings[0]['candidateSha256'],sourceSha256=bindings[0]['sourceSha256'],reviewedSignature=signature,sourcePackageSha256=sha((AUTHOR/'candidate.verbatim.json').read_bytes()),sourceBindingsSha256=sha((AUTHOR/'bindings.verbatim.json').read_bytes()),candidateRecordByteEquivalent='JSON_CANONICAL_RECORD_EXACT_NO_FIELD_CHANGES'))
# Archive exact original observation bytes. The schema projection is a documented subset, never a new terminal.
folder='officina-di-fisica/editorial/reviews/'+D.name+'/observations'
files={}
for width in ('320','1280'):
 for file in sorted((OLD/width).rglob('*')):
  if file.is_file():files[folder+'/'+width+'/'+file.relative_to(OLD/width).as_posix()]=file.read_bytes()
visual=json.loads((OLD/'visual-review-per-id.json').read_text());row=visual['records'][0];allread=row['readFiles'];examples=[]
for width in ('320','1280'):
 run=json.loads((OLD/width/'actual/report.json').read_text())
 for entry in run['cases']:
  if entry['caseKey'].endswith('|clock|1'):
   case=json.loads((OLD/width/'actual'/entry['file']).read_text());image=case['screenshots'][0]
   assert any(r['caseKey']==case['caseKey'] and r['sha256']==image['sha256'] for r in allread)
   name=folder+'/actual/'+image['file'];files[name]=(OLD/width/'actual'/image['file']).read_bytes()
   examples.append(dict(caseKey=case['caseKey'],profile=case['profile'],sha256=image['sha256'],path=name.removeprefix('officina-di-fisica/')))
assert len(examples)==8
row.update(reviewedVersion=2,candidateSha256=bindings[0]['candidateSha256'],readFiles=examples,readPngSha256=[r['sha256']for r in examples],representativeSubsetOfRead80=True,all80ReadPngSha256=[r['sha256']for r in allread])
projected=json.dumps(visual,ensure_ascii=False,sort_keys=True,indent=2).encode()+b'\n'
files[folder+'/visual-review-per-id.json']=projected
files[folder+'/source-independent-visual-review.verbatim.json']=(OLD/'visual-review-per-id.json').read_bytes()
files[folder+'/subset-disclosure.json']=json.dumps(dict(scope='8 explicit small-nonzero-clock representatives, one per profile, subset of all80 already read; no new raster or verdict',originalVisualSha256=sha((OLD/'visual-review-per-id.json').read_bytes()),read80Sha256=[r['sha256']for r in allread],terminalPolicy='Original terminal bytes retained; no supervisorResultExitCode synthesized'),sort_keys=True).encode()
archive=D/'observations.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=6)as z:
 for name,raw in sorted(files.items()):
  info=zipfile.ZipInfo(name,(2026,11,27,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;z.writestr(info,raw)
dump(D/'observations-manifest.json',dict(schemaVersion='1.0.0',archiveSha256=sha(archive.read_bytes()),runtimeSha256=fp['sha256'],sourceCommit='1b72b71a68a6023ab1c9fa189733947b03029914',independentBrowserCommit='3b5f2cfac5bbed4aa1895bd246de6c86bb6ac490',files={n:sha(raw)for n,raw in sorted(files.items())},activityCredit=0,humanApproval='NOT_RUN'))
dump(D/'git-inputs.json',dict(schemaVersion='1.0.0',inputs=inputs))
dump(D/'fixture-provision.json',dict(runtimeSha256=fp['sha256'],runtimeFiles=fp['files'],fingerprintHelperSha256=fp['protocolSha256'],canonicalToolsCommit=REF,overlay=str(OVERLAY),readOnlySource=str(SOURCE),batch=BATCH,activityCredit=0,humanApproval='NOT_RUN'))
print(json.dumps(dict(overlay=str(OVERLAY),archiveSha256=sha(archive.read_bytes()),manifestSha256=sha((D/'observations-manifest.json').read_bytes()),signature=signature,inputs=len(inputs))))
