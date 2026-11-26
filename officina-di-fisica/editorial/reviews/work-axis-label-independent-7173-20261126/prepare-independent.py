from pathlib import Path
import json,shutil,subprocess,sys,os,hashlib
APP=Path('/private/tmp/cric-author-a-resident/officina-di-fisica'); SRC=Path('/private/tmp/cric-work-axis-author-ui-app'); AUTH=Path('/private/tmp/cric-work-axis-author-20261126/officina-di-fisica/editorial/author-notes/work-axis-label-correction-20261126')
B=APP/'editorial/reviews/work-axis-label-independent-7173-20261126'; T=Path('/private/tmp/cric-work-axis-independent-a-ui-app'); O=APP/'output/playwright/work-axis-independent-7173-20261126'
REF='b38d8b8dd1dd3d69f558bbe8753d759084aa527f'; FP='95769a789a6eed2cb2dde6bef3bce79d24d0f627af4dd7edcbb373a5d094202d'; ORIGINAL='5d1dc8dc7b601aef959d10d564c75462be74708d'
sha=lambda x:hashlib.sha256(x).hexdigest(); canon=lambda x:json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()+b'\n'
def git(ref,p):return subprocess.check_output(['git','show',ref+':'+p],cwd=APP)
assert not T.exists() and not O.exists(); B.mkdir(parents=True,exist_ok=False);O.mkdir(parents=True)
plan=json.loads((AUTH/'actual-final-ui-40/prepared.json').read_bytes()); fp=plan['runtimeFingerprint'];assert fp['sha256']==FP
T.mkdir()
for name,pin in fp['files'].items():
 if name.startswith('node_modules/'):continue
 raw=(SRC/name).read_bytes();assert sha(raw)==pin,name
 p=T/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(raw)
shutil.copytree(SRC/'tools',T/'tools',dirs_exist_ok=True,ignore=shutil.ignore_patterns('__pycache__'))
os.symlink((SRC/'node_modules').resolve(),T/'node_modules')
oldsrc=git(ORIGINAL,'officina-di-fisica/content/esperienze-C1.json');(B/'original-esperienze-C1.json').write_bytes(oldsrc)
record=next(r for r in json.loads(oldsrc) if r['id']=='SIM-C1-L007-01');assert record==plan['records'][0]['record']
primary={'schemaVersion':'1.0.0','role':'Independent reviewer A; not the Core author','sourceRef':ORIGINAL,'sourcePath':'officina-di-fisica/content/esperienze-C1.json','sourceSha256':sha(oldsrc),'id':record['id'],'record':record,'derivation':'W=F·s=Fs cos(theta). The displacement is +x; only the parallel force component contributes. F=4 N and s=3 m give W=12 cos(theta) J. Positive for theta<90 degrees, zero at90, negative beyond90. At0,90,120,180 degrees the exact physical results are12,0,-6,-12 J. The independent transfer at90 degrees is0 J. This is work of the given force, not a general assertion about the total kinetic-energy change.','manualExactValues':{'0':12,'90':0,'120':-6,'180':-12},'expectedGeometry':'Common tail O=(-0.8,0.28,0); green displacement vector (1.6,0,0), ochre force vector (1.5 cos(theta),0,-1.5 sin(theta)). Display scales differ for force and displacement, so no physical equality can be inferred from their graphical length ratio. Gray axes remain in their plane. Removed y sprite may no longer hide a tail, but collinear arrows at0/180 and an end-on force in Side at90 remain projection limits, not claims that both bodies are separately discernible there.','exposureDisclosure':'Core patch and author technical protocol read before this fresh UI replay. Original source record independently reread; canonical prior numerical review is historical. New review concerns rendering and HTML only; no new question/activity credit. Author geometry conclusions are not used as independent verdicts.','editionScope':'The target is source/published version1 only. Three complete other DRAFT records118/119/140 are co-imported and checked. No DRAFT version of this target is invented.','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
(B/'independent-primary.json').write_bytes(canon(primary))
# Preserve immutable candidate and baseline source for scope/delta checks.
for name,ref in [('candidate-esperimento.js',REF),('baseline-esperimento.js','64aef05bef5ca7ebff8491060762dd4cac0cbb34')]: (B/name).write_bytes(git(ref,'officina-di-fisica/static/js/banchi/voci/esperimento.js'))
script=(AUTH/'collector-c1-derived.mjs').read_bytes();assert sha(script)=='e5fb470573b382d440fd55b50c82f60f8b9edae368b675bf14f2ed96c3c89e95';(B/'collector-c1-derived.mjs').write_bytes(script);(T/'collector-c1-derived.mjs').write_bytes(script)
# Complete existing import context, byte-exact Git blobs.
plan['packageFiles']=[str(T/'editorial/batches'/Path(p).name) for p in plan['packageFiles']]
plan['inputFiles']={str(T/'editorial/batches'/Path(p).name):pin for p,pin in plan['inputFiles'].items()}
for name,pin in plan['inputFiles'].items():
 p=Path(name);raw=git(REF,'officina-di-fisica/editorial/batches/'+p.name);assert sha(raw)==pin;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(raw)
plan['course']='INDEPENDENT_WORK_AXIS_7173';plan['scope']='INDEPENDENT_TARGET_ONLY40; NOT_ALL_VECTOR_EXPERIMENTS';plan['records'][0]['originalJudgment']={'sourcePhysics':'Independently reread and derived in independent-primary.json; no new ID credit','activityCredit':0}
# Keep exact Node representation of cos(120deg), distinct from exact mathematical -6.
expected=json.loads(subprocess.check_output(['node','--input-type=module','-e','console.log(JSON.stringify([0,90,120,180].map(x=>{const y=12*Math.cos(x*Math.PI/180);return Math.abs(y)<1e-11?0:y})))']))
assert expected==[12,0,-5.999999999999997,-12];plan['records'][0]['expectedValues']=expected
plan['numericalReferenceDisclosure']='Exact physical120-degree work is -6 J. Installed Node double representation is independently regenerated from the explicit law; strict equality remains unchanged, no tolerance widening.'
request={'schemaVersion':'1.0.0','candidateRef':REF,'deliveryRef':'7173a92ce980f102f0904175c90c0f7a150b2931','runtimeSha256':FP,'scope':plan['scope'],'primarySha256':sha((B/'independent-primary.json').read_bytes()),'collectorSha256':sha(script),'inputFiles':plan['inputFiles'],'packageFiles':plan['packageFiles'],'draftRecords':plan['draftRecords'],'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
(B/'review-request.json').write_bytes(canon(request));plan['requestFile']=str(B/'review-request.json');plan['requestSha256']=sha((B/'review-request.json').read_bytes())
env={**os.environ,'ASTRA_EXTENSIONS':str(T/'extensions'),'PYTHONDONTWRITEBYTECODE':'1'}
actual=json.loads(subprocess.check_output([sys.executable,'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=T,env=env));assert actual==fp
(O/'prepared.json').write_bytes(canon(plan));info={'candidateApp':str(T),'prepared':str(O/'prepared.json'),'output':str(O),'requestSha256':plan['requestSha256']};(O/'prepared-info.json').write_bytes(canon(info))
runner=(AUTH/'run-author-40.py').read_text().replace("APP=Path('/private/tmp/cric-work-axis-author-20261126/officina-di-fisica')","APP=Path('/private/tmp/cric-author-a-resident/officina-di-fisica')").replace("'independent-reused-primary.json'","'independent-primary.json'").replace("['node',str(script),sys.argv[1]]","['node',str(Path(info['candidateApp'])/'collector-c1-derived.mjs'),sys.argv[1]]")
(B/'run-independent-40.py').write_text(runner)
shutil.copy2(__file__,B/'prepare-independent.py')
print(json.dumps({'prepared':str(O/'prepared-info.json'),'runtime':actual['sha256'],'cases':len(plan['expectedCaseKeys']),'primary':request['primarySha256']}))
