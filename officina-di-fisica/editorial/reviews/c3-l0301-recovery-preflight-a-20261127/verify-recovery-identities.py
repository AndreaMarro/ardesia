from pathlib import Path
import json,hashlib,importlib.util,sys,shutil
TASK=Path('/Users/andreamarro/Documents/Codex/2026-11-24/codex-cric-full-corpus-scientific-pedagogical');A=TASK/'work/cric-author-a-resident-20261127/officina-di-fisica';D=Path(__file__).resolve().parent;OLD=A/'editorial/reviews/c3-six-heat-phase-core6ae3-independent-a-20261127';RUNTIME=TASK/'work/cric-a-c3-b999-runtime-20261127/officina-di-fisica'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();expected=json.loads((OLD/'actual-current-runtime-fingerprint.json').read_bytes());helper=RUNTIME/'tools/corpus_engineering/runtime_fingerprint.py';assert sha(helper)==expected['protocolSha256']
spec=importlib.util.spec_from_file_location('canonical_c3_recovery_fingerprint',helper);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);fp=m.runtime_fingerprint(RUNTIME);assert fp==expected
old=json.loads((OLD/'groups/sim-c3-l03-01-320/prepared.json').read_bytes());collector=OLD/'canonical-collector-719.verbatim.mjs';assert sha(collector)=='719beb3abc01cbf7607dc1d5d1710732cbc59c2aae91112fb6b680dbfbd22d15'
inputs={}
for p in (D/'canonical-inputs').iterdir():
 assert p.read_bytes()==(OLD/'canonical-inputs'/p.name).read_bytes();inputs[str(p)]=sha(p)
records=[]
for width in (320,1280):
 G=D/str(width);p=json.loads((G/'prepared.json').read_bytes());request=json.loads((G/'request.json').read_bytes())
 assert p['records']==old['records'] and p['draftRecords']==old['draftRecords'] and p['runtimeFingerprint']==expected and p['inputFiles']==inputs
 assert p['sourceCommit']=='b9994b9116e87478905191d85cca8037d17ae4bd' and request['candidateApp']==str(RUNTIME)
 assert p['packageFiles']==[str(D/'canonical-inputs/experiment-c3-heat-transformations-reading-20261127.json')]
 assert p['requestSha256']==sha(G/'metadata.json') and p['requestFile']==str(G/'metadata.json') and request['prepared']==str(G/'prepared.json') and request['output']==str(G/'actual')
 assert not (G/'actual').exists() and not (G/'actual-terminal.json').exists()
 profiles=p['profiles'];assert len(profiles)==4 and {q['view']for q in profiles}=={'orbit','side','top','fixed_projection'} and all(q['width']==width for q in profiles)
 assert all(q['fallback']==(q['view']=='fixed_projection')for q in profiles)
 assert len(p['expectedCaseKeys'])==24 and len(set(p['expectedCaseKeys']))==24
 assert [q['input']for q in p['records'][0]['questions']]==['400','300']
 assert p['records'][0]['grid']==[0,2,6,8,12]
 records.append(dict(width=width,preparedSha256=sha(G/'prepared.json'),metadataSha256=sha(G/'metadata.json'),requestSha256=sha(G/'request.json'),plannedCases=24,answers=['400','300'],browser='NOT_RUN'))
report=dict(schemaVersion='1.0.0',recoveredPublicProofCommit='060153c771d88039109c8fba0d38507d7be50473',candidateCommit='6ae3c2a177bcde74b2bebf8f22c1fa50850b0413',runtimeSourceCommit='b9994b9116e87478905191d85cca8037d17ae4bd',runtimeSha256=fp['sha256'],runtimeFilesVerified=len(fp['files']),runtimeProtocolSha256=fp['protocolSha256'],collectorSha256=sha(collector),runtimeApp=str(RUNTIME),pythonEnvironment=sys.executable,persistentLock=str(TASK/'work/.cric-browser.lock'),freeBytes=shutil.disk_usage(D).free,groups=records,preRebootRaw='LOST_NOT_RECOVERED',browser='NOT_RUN_NOT_AUTHORIZED_DURING_CORE_C2',activityCredit=0,humanApproval='NOT_RUN')
(D/'recovery-identity-check.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
