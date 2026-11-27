from pathlib import Path,PurePosixPath
import json,hashlib,subprocess,os
CORE=Path('/private/tmp/cric-experiment-contract-fix');APP=CORE/'officina-di-fisica';SOURCE=Path('/private/tmp/cric-vector-apparatus-author-20261126');REF='585a8f8b1afa99de4e1fd67a1909c215b3e0d46a';PREFIX='officina-di-fisica/editorial/author-notes/reader-formula-reflow-20261127/';B=APP/'editorial/reviews/renewal-readers-179-cb9-20261127';B.mkdir();D=B/'verified-author-source';D.mkdir();env={**os.environ,'GIT_NO_LAZY_FETCH':'1'}
raw=subprocess.check_output(['git','-c','gc.auto=0','ls-tree','-r','-z',REF,'--',PREFIX],cwd=CORE,env=env);tree={}
for line in raw.split(b'\0'):
 if not line:continue
 head,name=line.split(b'\t');mode,kind,oid=head.decode().split();assert mode=='100644'and kind=='blob';tree[name.decode()]=oid
copied={}
def copy(relative):
 full=PREFIX+relative;assert full in tree
 path=PurePosixPath(relative);assert not path.is_absolute()and all(p not in ('','.','..')for p in path.parts)
 source=SOURCE/full;assert source.is_file()and not source.is_symlink();data=source.read_bytes();assert hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()==tree[full],'Not immutable Git blob:'+relative
 dest=D/relative;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(data);copied[relative]={'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'gitBlobSha1':tree[full]};return data
handoff=json.loads(copy('full-reader-cb9-author-handoff.json'));assert handoff['cases']==handoff['passed']==358 and handoff['activitiesExamined']==179
expected={PREFIX+k for k in handoff['files']};actual={k for k in tree if k.startswith(PREFIX+'full-reader-replay-cb9/')};assert actual==expected
for name,pin in handoff['files'].items():
 data=copy(name);assert len(data)==pin['bytes']and hashlib.sha256(data).hexdigest()==pin['sha256']
extras=[k[len(PREFIX):]for k in tree if k.startswith(PREFIX+'fixture-cb9/')and not k.endswith('browser-legend-author.mjs')]
for n in extras:copy(n)
(B/'author-input-adoption.json').write_text(json.dumps({'immutableCommit':REF,'sourcePrefix':PREFIX,'sourceWorkspaceReadOnly':str(SOURCE),'transport':'Verified local materialized bytes against immutable Git tree blob SHA1 AND handoff SHA256. GIT_NO_LAZY_FETCH=1; no source import/execution. A prior Git-show of cohort-results observed unavailable promisor blob264f947752d5f2e6ad01d5311d9b212bfa775101 and failed before mutation; this verified local-byte bridge avoids lazy network hydration.','files':copied,'authorActualFiles':len(handoff['files']),'extraProtocolInputFiles':len(extras),'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'},indent=2)+'\n');print('Verified exact643author files +',len(extras),'protocol/input files; no Root or runtime edits')
