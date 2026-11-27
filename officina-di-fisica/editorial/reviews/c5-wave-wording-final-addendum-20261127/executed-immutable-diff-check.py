from pathlib import Path
import json,subprocess,hashlib,copy
root=Path('/private/tmp/cric-vector-apparatus-author-20261126');f=root/'officina-di-fisica/editorial/reviews/c5-wave-wording-final-addendum-20261127';final='d20c200b8731739ef512f7e2820104a7bd755202';middle='00cbc9c0ee0a7b1d1d175347cc3ba5a41e647da6';canon=lambda x:json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'),allow_nan=False);digest=lambda x:hashlib.sha256(canon(x).encode()).hexdigest()
base=[('4691a70e6d51535b85822a32f3e29143c2c64316','experiment-c5-wave-basis-reading-20261127','SIM-C5-L03-01','e874bc55da70a59069059b220d2a0bfd0c5f9b7089c82a25e9da9af0ed67d03c'),('c5ae34ddeec000a36082c5ce620dc3ff8f018a06','experiment-c5-wave-energy-sound-reading-20261127','SIM-C5-L05-02','1748ec18668ad53ac5ec45c67ead6e4e8b974b9e523d4f5857ae7430db1c795f')];changes=[];allrows=[]
for ref,batch,key,pin in base:
 def get(r,suffix=''):
  path='officina-di-fisica/editorial/batches/'+batch+suffix+'.json';return subprocess.check_output(['git','show',r+':'+path],cwd=root)
 old=json.loads(get(ref));new=json.loads(get(final));intermediate=json.loads(get(middle));
 for suffix in ('','-bindings'):(f/(batch+suffix+'.json')).write_bytes(get(final,suffix))
 assert old['schema']==new['schema']and old['assets']==new['assets']and len(old['records'])==len(new['records'])
 for a,b,c in zip(old['records'],new['records'],intermediate['records']):
  assert a['id']==b['id']==c['id']
  if a['id']!=key:assert a==b==c
  else:
   assert digest(b)==pin
   na,nb,nc=copy.deepcopy(a),copy.deepcopy(b),copy.deepcopy(c)
   ba=na['blocks'].pop();bb=nb['blocks'].pop();bc=nc['blocks'].pop();assert na==nb==nc
   assert ba['type']==bb['type']==bc['type']=='text'
   if key=='SIM-C5-L03-01':assert 'può essere zero' in bb['text']and'da sola non dà'in bb['text']
   else:assert 'aumentato di un’unità'in bb['text']and b==c
   changes.append({'id':key,'oldCandidateSha256':digest(a),'intermediateCandidateSha256':digest(c),'finalCandidateSha256':digest(b),'onlyChangedField':'blocks[4].text','before':ba['text'],'intermediate':bc['text'],'after':bb['text'],'independentReread':'PASS','mathStateControlsModelAndQuestionsUnchanged':True})
  allrows.append(b)
 bindings=json.loads(get(final,'-bindings'))
 assert len(bindings)==len(new['records'])
 for r,b in zip(new['records'],bindings):assert digest(r)==b['candidateSha256']
result={'role':'INDEPENDENT_AI_REREAD_ADDENDUM','finalCandidateCommit':final,'intermediateCommit':middle,'changes':changes,'allOtherNineRowsByteEquivalentInCanonicalJSON':True,'mathematicalAndManualReading':'PASS_ALL11','runtimeUI':'NOT_RUN','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE','historicalFindingsPreserved':True,'oldReports':['officina-di-fisica/editorial/reviews/c5-wave-basis-independent-20261127/independent-review.json','officina-di-fisica/editorial/reviews/c5-wave-energy-sound-independent-20261127/independent-review.json']}
(f/'reread.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print([(r['id'],r['finalCandidateSha256'])for r in changes])
