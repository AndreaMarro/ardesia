"""Current exact operators and byte-bound PNG reading metrics; not UI approval."""
from pathlib import Path
import json,hashlib,math,copy,subprocess
OUT=Path(__file__).resolve().parent;OLD=OUT.parent/'C3-36-cb9-independent-20261127'
BROWSER=Path('/private/tmp/cric-vector-apparatus-author-20261126/officina-di-fisica/editorial/reviews/thermal-flow-detail-20261127/actual-browser-third')
def enc(v):return json.dumps(v,sort_keys=True,separators=(',',':'),ensure_ascii=False,allow_nan=False).encode()
def stripped(value):
 if isinstance(value,dict):return{k:([stripped(e)for e in v if e.get('dettaglio')is not True]if k=='elements'else stripped(v))for k,v in value.items()if k!='legend'}
 if isinstance(value,list):return[stripped(v)for v in value]
 return value
rawrows=json.loads((OUT/'actual-arrow-census.json').read_bytes())['records']
added=0;checked=0;detail_cases=[];source_omissions=[]
for group in ('state','calorimetry','first-law','paths','entropy'):
 old=json.loads((OLD/(group+'-actual-code.json')).read_bytes());new=json.loads((OUT/(group+'-actual-code.json')).read_bytes());assert new['runtimeProfileBefore']==new['runtimeProfileAfter']=='3713dfb21a6b3ebad42f8bf24b163af7646793fb5327b1b3ae5d543391c0bfe1';assert enc(stripped(old['records']))==enc(stripped(new['records'])),group
 for a,b in zip(old['records'],new['records']):
  assert a['id']==b['id'];checked+=1
  for ca,cb in zip(a['cases'],b['cases']):
   frames=[('grid',None,ca['elements'],cb['elements'])]+[('clock',sa['time'],sa['elements'],sb['elements'])for sa,sb in zip(ca['clockSamples'],cb['clockSamples'])]
   for kind,t,oldes,newes in frames:
    extra=[e for e in newes if e.get('dettaglio')is True];added+=len(extra)
    for e in extra:
     assert e['kind']=='arrow'and e['c']==0xd49332
     raw=next(r for r in rawrows if r['id']==b['id']);case=next(c for c in raw['cases']if c['kind']==kind and c['x']==cb['x']and c.get('time')==t)
     i=next(i for i,q in enumerate(case['arrows'])if enc({k:q[k]for k in ('a','b','c')})==enc({k:e[k]for k in ('a','b','c')}));assert i>0;primary=case['arrows'][i-1];v=[primary['b'][j]-primary['a'][j]for j in range(3)];length=math.hypot(*v);assert 0<length<.03
     shift=[0,.95,1.05]if b['id']=='SIM-C3-L04-03'else[.55,0,.5]
     origin=[primary['a'][j]+shift[j]for j in range(3)];tip=[origin[j]+32*v[j]for j in range(3)];assert e['a']==origin and e['b']==tip
     detail_cases.append({'id':b['id'],'kind':kind,'x':cb['x'],'time':t,'originalColor':primary['c'],'nominalVector':v,'detailVector':[e['b'][j]-e['a'][j]for j in range(3)],'operator32AndTranslationExactIEEE':True,'sensePreserved':all((e['b'][j]-e['a'][j])*v[j]>0 if v[j]else e['b'][j]==e['a'][j]for j in range(3))})
    if extra and len(newes)==len(oldes)+len(extra):pass
for x in detail_cases:assert x['sensePreserved']
assert checked==36 and added==22,(checked,added)
report_raw=(BROWSER/'report.json').read_bytes();r=json.loads(report_raw);term=json.loads((BROWSER/'terminal.json').read_bytes());assert term['observedExit']==0 and term['runtimeBefore']==term['runtimeAfter']=='3713dfb21a6b3ebad42f8bf24b163af7646793fb5327b1b3ae5d543391c0bfe1';assert hashlib.sha256(report_raw).hexdigest()==term['reportSha256'];assert len(r['actual'])==80 and r['errors']==[]
for case in r['actual']:
 blob=(BROWSER/(case['imageSha']+'.png')).read_bytes();assert hashlib.sha256(blob).hexdigest()==case['imageSha']
key='daf2f53a46a327212c606f88a9903852aae51c7a13636b7d450afa641b6c855c';node="const fs=require('fs'),{PNG}=require('/private/tmp/cric-vector-apparatus-author-20261126/officina-di-fisica/node_modules/playwright-core/lib/utilsBundle.js');const p=PNG.sync.read(fs.readFileSync(process.argv[1])),pts=[];for(let i=0;i<p.width*p.height;i++){const k=4*i;if(p.data[k]===212&&p.data[k+1]===147&&p.data[k+2]===50&&p.data[k+3]===255)pts.push([i%p.width,Math.floor(i/p.width)]);}console.log(JSON.stringify({size:[p.width,p.height],count:pts.length,bbox:pts.length?[Math.min(...pts.map(x=>x[0])),Math.min(...pts.map(x=>x[1])),Math.max(...pts.map(x=>x[0])),Math.max(...pts.map(x=>x[1]))]:null}));"
pixel=json.loads(subprocess.check_output(['node','-e',node,str(BROWSER/(key+'.png'))]))
result={'schemaVersion':'1.0.0','candidateRef':'9e7676590983b2fb0a936567b8054ffb2b80592c','runtimeSha256':term['runtimeBefore'],'modelsAndExistingElementsByteIdentical':36,'addedDeclaredDetailArrows':22,'detailCases':detail_cases,'oldRedInterpretation':'The seven previously unrepresented nonzero transfers now have explicitly marked ochre magnified representations; original primary-color omission persists. Old RED files are not retagged GREEN.','all80ReportAndPngHashesValid':True,'browserReportSha256':term['reportSha256'],'browserProtocolSha256':term['protocolSha256'],'minPhaseFallbackPng':{'sha256':key,'size':pixel['size'],'exactOchrePixels':pixel['count'],'exactOchreBboxInclusive':pixel['bbox']},'occlusionConclusion':'NOT_INFERRED_FROM_ELEMENTS','legibilityJudgment':'PENDING_INDEPENDENT_IMAGE_READING','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'};(OUT/'exact-operator-and-browser-integrity.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps({k:result[k]for k in ('modelsAndExistingElementsByteIdentical','addedDeclaredDetailArrows','all80ReportAndPngHashesValid','minPhaseFallbackPng')}))
