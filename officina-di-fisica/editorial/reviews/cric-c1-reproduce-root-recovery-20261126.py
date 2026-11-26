"""Recover four immutable crossed-review deliveries, without editorial approval."""
import hashlib,json,subprocess
from pathlib import Path
APP=Path.cwd();REPO=APP.parent
DELIVERIES=[
 ('bb3fa481','editorial/author-notes/cric-c1-001-050-author-a-handoff-20261126.json','66f9f52b86ae8b271b8fa54f8e734f871a52e31a4f95037ecde25f6e2df4209a'),
 ('35b36b13','editorial/reviews/cric-c1-001-050-independent-handoff-20261126.json','afa8f3fb06626a734deae3ab33f13fd1421d732ee397898a8e7d4ae0d01c6e9f'),
 ('b2321dab','editorial/author-notes/cric-c1-051-100-peer-followup-20261126/handoff.json','95b8ccbdce53c51a3cb01f674bd5d4ce48546ff06235695fb5d36611db2dff8f'),
 ('53615cda','editorial/reviews/cric-c1-006-010-independent-handoff-20261126.json','886d65c24a01d33a169dee0d513c45bdc2c3f3ee324402dc222193b31fa0ee32')]
files={};deliveries=[];existing=[]
def blob(commit,path):return subprocess.check_output(['git','-C',str(REPO),'show',commit+':officina-di-fisica/'+path])
for ref,path,expected in DELIVERIES:
 commit=subprocess.check_output(['git','-C',str(REPO),'rev-parse',ref]).decode().strip()
 raw=blob(commit,path);assert hashlib.sha256(raw).hexdigest()==expected,path
 manifest=json.loads(raw);declared={**manifest['files'],path:expected}
 for rel,pin in declared.items():
  assert not Path(rel).is_absolute() and '..'not in Path(rel).parts,rel
  data=blob(commit,rel);assert hashlib.sha256(data).hexdigest()==pin,rel
  if rel in files:assert files[rel]['sha256']==pin,rel
  target=APP/rel
  if target.exists():
   assert target.read_bytes()==data,('Unexpected changed existing file; preserve and review first',rel)
   existing.append(rel)
  else:target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
  files[rel]={'sha256':pin,'sourceCommit':commit}
 deliveries.append({'commit':commit,'handoff':path,'sha256':expected})
out=APP/'editorial/reviews/cric-c1-100-root-recovery-20261126.json'
out.write_text(json.dumps({'scope':'Byte-exact recovery only; first10 already accepted, other90 await actual Root gates','deliveries':deliveries,'files':files,'alreadyIdenticalPaths':sorted(set(existing)),'humanApproval':'NOT_RUN','publicationAction':'NONE'},indent=2)+'\n')
print('RECOVERED',len(files),'files;',len(set(existing)),'already identical; NO new acceptance credit')
