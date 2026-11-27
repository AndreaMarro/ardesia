from pathlib import Path
import json,hashlib,shutil,subprocess,os
REPO=Path(__file__).resolve().parents[4];APP=REPO/'officina-di-fisica';WORK=REPO.parent;RUNTIME=WORK/'cric-converged-runtime-20261127/officina-di-fisica';ROOT=WORK/'cric-resume-276/officina-di-fisica';F=Path(__file__).parent;sha=lambda b:hashlib.sha256(b).hexdigest();expected='53bd0c149919095e24abc8f490702494b3054367230aa941ff509ce52772d46a';PY=WORK/'cric-runtime-env-20261127/bin/python'
profile=json.loads(subprocess.check_output([str(PY),'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=RUNTIME,env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1','ASTRA_EXTENSIONS':str(RUNTIME/'extensions')},timeout=30));assert profile['sha256']==expected;copied=[]
def copy(source,dest):
 raw=source.read_bytes();dest.parent.mkdir(parents=True,exist_ok=True)
 if dest.exists():assert dest.read_bytes()==raw,str(dest)
 else:dest.write_bytes(raw)
 copied.append({'path':str(dest.relative_to(APP)),'sha256':sha(raw),'readOnlySource':str(source)})
for path,pin in profile['files'].items():
 if path.startswith('node_modules/'):continue
 raw=(RUNTIME/path).read_bytes();assert sha(raw)==pin;copy(RUNTIME/path,APP/path)
# Actual offline coordinator, unchanged; no registry or runtime edits.
for name in['batches.py','integration.py','acceptance_withdrawals.py','review_contract.py','pipeline.py']:
 dest=APP/'tools/corpus_engineering'/name
 if dest.exists():assert dest.read_bytes()==(ROOT/'tools/corpus_engineering'/name).read_bytes()
 else:copy(ROOT/'tools/corpus_engineering'/name,dest)
for name in['runtime_fingerprint.py']:
 copy(RUNTIME/'tools/corpus_engineering'/name,APP/'tools/corpus_engineering'/name)
for name in['corpus-batches-v1.schema.json','corpus-acceptance-withdrawals-v1.schema.json']:
 copy(ROOT/'contracts'/name,APP/'contracts'/name)
copy(ROOT/'tests/corpus/browser-drafts.mjs',APP/'tests/corpus/browser-drafts.mjs')
# Exact registry/ledger context is a private fixture only, never staged or changed.
registry=json.loads((ROOT/'editorial/batches/registry.json').read_bytes());copy(ROOT/'editorial/batches/registry.json',APP/'editorial/batches/registry.json')
reference=registry.get('acceptanceWithdrawals')
if reference:
 raw=(ROOT/reference['path']).read_bytes();assert sha(raw)==reference['sha256'];copy(ROOT/reference['path'],APP/reference['path']);ledger=json.loads(raw)
 for row in ledger['withdrawals']:
  ref=row['evidence'];raw=(ROOT/ref['path']).read_bytes();assert sha(raw)==ref['sha256'];copy(ROOT/ref['path'],APP/ref['path'])
name='experiment-c5-field-spectrum-photon-reading-20261127';dossier=APP/'editorial/reviews/c5-field-spectrum-photon-independent-20261127'
for suffix in['.json','-bindings.json']:copy(dossier/(name+suffix),APP/'editorial/batches'/(name+suffix))
new=json.loads(subprocess.check_output([str(PY),'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=APP,env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1','ASTRA_EXTENSIONS':str(APP/'extensions')},timeout=30));assert new==profile
(F/'private-fixture-recovery.json').write_text(json.dumps({'runtimeCommit':'1b72b71a68a6023ab1c9fa189733947b03029914','runtimeFingerprint':new,'files':copied,'registryAction':'VERBATIM_PRIVATE_CONTEXT_ONLY_NOT_STAGED','rootWrites':False,'activityCredit':0},indent=2)+'\n');print('PRIVATE_FIXTURE_EXACT',len(copied),expected)
