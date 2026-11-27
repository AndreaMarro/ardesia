from pathlib import Path
from decimal import Decimal
import json,hashlib,math
A=Path('/private/tmp/cric-author-a-resident/officina-di-fisica')
D=A/'editorial/reviews/c2-hydrostatic-exact-json-number-identity-addendum-a-20261127'
D.mkdir(exist_ok=True)
def digest(v):
 return hashlib.sha256(json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':'),allow_nan=False).encode()).hexdigest()
def equal_integer_representations(a,b,path='',changes=None):
 if changes is None:changes=[]
 if type(a) is dict and type(b) is dict:
  if set(a)!=set(b):raise ValueError('Object fields differ:'+path)
  for key in sorted(a):equal_integer_representations(a[key],b[key],path+'/'+key,changes)
 elif type(a) is list and type(b) is list:
  if len(a)!=len(b):raise ValueError('Array lengths differ:'+path)
  for i,(x,y)in enumerate(zip(a,b,strict=True)):equal_integer_representations(x,y,path+'/'+str(i),changes)
 elif type(a) is type(b):
  if type(a) is float and (not math.isfinite(a)or not math.isfinite(b)):raise ValueError('Nonfinite number:'+path)
  if a!=b:raise ValueError('Value differs:'+path)
 elif {type(a),type(b)}=={int,float}:
  floating=a if type(a)is float else b
  integer=a if type(a)is int else b
  if not math.isfinite(floating)or not floating.is_integer()or Decimal(json.dumps(floating,allow_nan=False))!=Decimal(integer):raise ValueError('Not exact integer number representation:'+path)
  if not(path.startswith('/control/')or path.startswith('/references/')):raise ValueError('Unexpected numeric representation path:'+path)
  changes.append(dict(path=path,preparedLexeme=json.dumps(a,allow_nan=False),canonicalLexeme=json.dumps(b,allow_nan=False)))
 else:raise ValueError('Type or nonnumeric difference:'+path)
 return changes
paths=[('draft047',A/'editorial/reviews/c2-hydrostatic-six-remaining-7c7281-independent-a-20261127/groups/draft-l002-01'),('quota',A/'editorial/reviews/c2-hydrostatic-six-remaining-7c7281-independent-a-20261127/groups/draft-l002-02'),('Torricelli',A/'editorial/reviews/c2-hydrostatic-six-remaining-7c7281-independent-a-20261127/groups/draft-l002-03'),('ManometroV3',A/'editorial/reviews/c2-manometro-v3-7c7281-independent-a-20261127'),('oldPascalNegative',A/'editorial/reviews/c2-hydrostatic-six-remaining-7c7281-independent-a-20261127/groups/draft-l003-01'),('finalPascal',A/'editorial/reviews/c2-pascal-increment-height-fixed-7c7281-independent-a-20261127')]
records=[]
for name,folder in paths:
 p=json.loads((folder/'prepared.json').read_bytes());row=p['records'][0];record=row['record'];canonical=next(r for r in p['draftRecords']if r['id']==row['id']);binding=None
 for package in p['packageFiles']:
  path=Path(package);binding_path=path.with_name(path.stem+'-bindings.json')
  for link in json.loads(binding_path.read_bytes()):
   if link['id']==row['id']:binding=link
 assert binding is not None
 changes=equal_integer_representations(record,canonical)
 assert digest(record)==row['candidateSha256']
 assert digest(canonical)==binding['candidateSha256']
 r=dict(name=name,id=row['id'],sourceCommit=p['sourceCommit'],runtimeSha256=p['runtimeFingerprint']['sha256'],preparedPath=(folder/'prepared.json').relative_to(A).as_posix(),preparedSha256=hashlib.sha256((folder/'prepared.json').read_bytes()).hexdigest(),declaredPreparedCandidateSha256=row['candidateSha256'],computedPreparedRecordSha256=digest(record),canonicalDraftRecordSha256=digest(canonical),bindingCandidateSha256=binding['candidateSha256'],exactIntegerNumberRepresentationsOnly=True,changedNumericLexemes=changes,noRawRetag=True,activityCredit=0,humanApproval='NOT_RUN')
 records.append(r)
 print(name,r['computedPreparedRecordSha256'],r['bindingCandidateSha256'],'integerRepresentationPaths',len(changes))
(D/'identity-addendum.json').write_text(json.dumps(dict(schemaVersion='1.0.0',scope='Exact prepared/canonical identity bridge; no approval or raw rewrite',records=records,policy='Only finite exact integer-valued float versus integer changes under control/references; object fields, strings, booleans and noninteger values remain strict; no epsilon',activityCredit=0,humanApproval='NOT_RUN'),indent=2)+'\n')
(D/'verify.py').write_bytes(Path(__file__).read_bytes())
