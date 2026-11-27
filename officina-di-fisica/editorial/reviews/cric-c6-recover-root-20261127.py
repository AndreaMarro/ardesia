import hashlib,json,os,subprocess,sys
from pathlib import Path
app=Path.cwd()
mode=sys.argv[1]
assert mode and all(c.isalnum() or c=='-' for c in mode)
deliveries=json.loads(sys.argv[2])
files={};pending={}
prior_path=os.environ.get('CRIC_PRIOR_RECOVERY')
prior=json.loads(Path(prior_path).read_bytes())['files'] if prior_path else {}
replaced={}

def read_blob(repo,commit,p):
 return subprocess.check_output(['git','-c','gc.auto=0','show',commit+':officina-di-fisica/'+p],cwd=repo,env={**os.environ,'GIT_NO_LAZY_FETCH':'1'})
def collect(repo,commit,p,pin):
 rel=Path(p);assert not rel.is_absolute()and'..'not in rel.parts and rel.parts[0]in('editorial','tools','tests'),p
 b=read_blob(repo,commit,p);assert hashlib.sha256(b).hexdigest()==pin,(p,pin)
 assert p not in files or files[p]['sha256']==pin,p
 dest=app/p
 if dest.exists():
  current=dest.read_bytes()
  if current!=b:
   assert p in prior and hashlib.sha256(current).hexdigest()==prior[p]['sha256'],p
   pending[dest]=b
   replaced[p]=prior[p]
 else:pending[dest]=b
 files[p]={'sourceCommit':commit,'sha256':pin}
 return b
for role,ref,path,pin in deliveries:
 repo='/private/tmp/cric-author-'+role+'-resident'
 raw=collect(repo,ref,path,pin);manifest=json.loads(raw)
 assert manifest['humanApproval']=='NOT_RUN'
 for p,d in manifest['files'].items():collect(repo,ref,p,d if isinstance(d,str)else d['sha256'])
for dest,b in pending.items():dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(b)
receipt=app/f'editorial/reviews/cric-c6-{mode}-root-recovery-20261127.json'
receipt.write_text(json.dumps({'scope':'Exact bounded delivery from declared immutable C6 owner or independent reviewer','deliveries':deliveries,'replacedPreviouslyRecoveredPaths':replaced,'files':dict(sorted(files.items()))},indent=2)+'\n')
print('Verified and acquired',len(files),'unique immutable paths across both roles')
