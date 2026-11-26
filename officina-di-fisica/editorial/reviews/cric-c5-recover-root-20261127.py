import hashlib,json,os,subprocess,sys
from pathlib import Path
app=Path.cwd()
mode=sys.argv[1]
if mode=='a50':
 deliveries=[('a','0db824ed411a484f9f9cc17e68f64ff1d2319c0c','editorial/author-notes/cric-c5-001-050-author-a-handoff-20261126.json','e4f0634cd0cf0e0d616b4781a484ed7b01245fedb8c23a63002cc34b76203d5d'),('b','6e02a5bed53a39527dbf2ce98181dc3c324e11f7','editorial/reviews/cric-c5-001-050-independent-handoff-20261127.json','89190d67cd2c975b63d4064201a2c231e09b951a0927016203e8115da82ba02d')]
else:
 deliveries=json.loads(sys.argv[2]);assert mode=='b50'
files={};pending={}
def read_blob(repo,commit,p):
 return subprocess.check_output(['git','-c','gc.auto=0','show',commit+':officina-di-fisica/'+p],cwd=repo,env={**os.environ,'GIT_NO_LAZY_FETCH':'1'})
def collect(repo,commit,p,pin):
 rel=Path(p);assert not rel.is_absolute()and'..'not in rel.parts and rel.parts[0]in('editorial','tools','tests'),p
 b=read_blob(repo,commit,p);assert hashlib.sha256(b).hexdigest()==pin,(p,pin)
 assert p not in files or files[p]['sha256']==pin,p
 dest=app/p
 if dest.exists():assert dest.read_bytes()==b,p
 else:pending[dest]=b
 files[p]={'sourceCommit':commit,'sha256':pin}
 return b
for role,ref,path,pin in deliveries:
 repo='/private/tmp/cric-author-'+role+'-resident'
 raw=collect(repo,ref,path,pin);manifest=json.loads(raw)
 assert manifest['humanApproval']=='NOT_RUN'
 for p,d in manifest['files'].items():collect(repo,ref,p,d if isinstance(d,str)else d['sha256'])
for dest,b in pending.items():dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(b)
receipt=app/f'editorial/reviews/cric-c5-{mode}-root-recovery-20261127.json'
receipt.write_text(json.dumps({'scope':'Exact independently authored and reviewed C5 files','deliveries':deliveries,'files':dict(sorted(files.items()))},indent=2)+'\n')
print('Verified and acquired',len(files),'unique immutable paths across both roles')
