from pathlib import Path
import fcntl,hashlib,importlib.machinery,importlib.util,json,shutil
D=Path(__file__).resolve().parent;APP=D.parents[2];TASK=D.parents[5];RT=TASK/'work/cric-converged-next-20261127/officina-di-fisica';OLD=APP/'editorial/reviews/c3-l0403-53bd-historical-glyph-canary-a-20261127'
HELPER=APP/'editorial/reviews/c3-vaporization-l0402-canonical-53bd-delivery-a-20261127/canonical-runtime_fingerprint.py.verbatim'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(HELPER)=='c23abf00cb3665ac9d5b90c1f8256852045a7582fa5e8bae5acf31462b619ab8'
with(TASK/'work/.cric-browser.lock').open('a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX)
 if shutil.disk_usage(TASK).free<2*1024**3:raise SystemExit('Guard before fingerprint import')
 loader=importlib.machinery.SourceFileLoader('canonical_fingerprint',str(HELPER));spec=importlib.util.spec_from_loader(loader.name,loader);module=importlib.util.module_from_spec(spec);loader.exec_module(module);fp=module.runtime_fingerprint(RT)
assert fp['sha256']=='0c9d80d28945a62b6e125dd97f55b08de1ac17eabd75e5ff86e05b0a17e0c576'
def wr(p,v):p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
wr(D/'actual-preflight-runtime.json',fp)
pkg=json.loads((D/'candidate.verbatim.json').read_bytes());oldpkg=json.loads((OLD/'320/prepared.json').read_bytes())['draftRecords'];key='SIM-C3-L04-03';record=next(r for r in pkg['records']if r['id']==key)
for r in pkg['records']:
 if r['id']!=key:assert r==next(x for x in oldpkg if x['id']==r['id'])
inputs=D/'canonical-inputs';inputs.mkdir(exist_ok=True)
for old,new in [('candidate.verbatim.json','experiment-c3-heat-transformations-reading-20261127.json'),('bindings.verbatim.json','experiment-c3-heat-transformations-reading-20261127-bindings.json')]:shutil.copyfile(D/old,inputs/new)
for w in(320,1280):
 G=D/str(w);G.mkdir(exist_ok=True);p=json.loads((OLD/str(w)/'prepared.json').read_bytes());p['sourceCommit']='a57cb90252bd9cee71b754ca68f5921efae0f900';p['runtimeFingerprint']=fp;p['draftRecords']=pkg['records'];p['records'][0]['record']=record;p['records'][0]['candidateSha256']='663fa627184358c24bd1766b13c352d2a8bc06355197c5c2d814824bcdaf038d';p['packageFiles']=[str(inputs/'experiment-c3-heat-transformations-reading-20261127.json')];p['inputFiles']={str(f):sha(f)for f in inputs.iterdir()if f.is_file()};p['scope']=f'DISTINCT_A_CURRENT_TEMPERATURE_0C9_{w}_20_CANARY'
 metadata=dict(schemaVersion='1.0.0',scope=p['scope'],sourceCommit=p['sourceCommit'],runtimeSha256=fp['sha256'],candidateCommit='0867e0fae8f1556e2a74a91ff7e198de4ee9ccdf',authorization='ROOT_AFTER_PITOT_AND_B_PREVIEW_CANARY20_PER_WIDTH',oldNegativeCommit='3aa1e7cde2bff4b4794c8d30a57698d7c3a5c76d',assumptions='New water capacity0.42kJ/K read and independently derived; this tiny-energy canary remains entirely in initial solid warming branch.',activityCredit=0,humanApproval='NOT_RUN')
 wr(G/'metadata.json',metadata);p['requestFile']=str(G/'metadata.json');p['requestSha256']=sha(G/'metadata.json');wr(G/'prepared.json',p);wr(G/'request.json',dict(candidateApp=str(RT),prepared=str(G/'prepared.json'),output=str(G/'actual')))
for name in ['run-authorized-group.py','make-visual-pages.py']:shutil.copyfile(OLD/name,D/name)
wr(D/'preflight.json',dict(id=key,sourceCommit=p['sourceCommit'],runtimeSha256=fp['sha256'],candidateCommit='0867e0fae8f1556e2a74a91ff7e198de4ee9ccdf',candidateSha256=p['records'][0]['candidateSha256'],groups=2,casesPerGroup=20,grid=[1],clockTimes=[.125,.25,.375],currentTemperatureCExact=['-10','-35/4','-15/2','-25/4'],priorScientificUIFail='PRESERVED_53BD_UNQUALIFIED_FINAL_MINUS5',fiveOtherRecordsByteIdentical=True,activityCredit=0,humanApproval='NOT_RUN'))
print('Verified0c9 fingerprint and40case preflight; no browser')
