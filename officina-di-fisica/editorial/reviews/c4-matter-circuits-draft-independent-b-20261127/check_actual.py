from pathlib import Path
from decimal import Decimal
import json,hashlib
from independent_math import exact,value,SPECS,verify_record
D=Path(__file__).resolve().parent;J=lambda p:json.loads(p.read_text());E=lambda p:json.loads(p.read_text(),parse_float=Decimal);H=lambda b:hashlib.sha256(b).hexdigest()
assert H((D/'primary-before-blocks.md').read_bytes())=='5c1b530538dbaa5b66727929fde2013fe512ee1858e8154a8bdc5a7cb2abdb43'
for i in J(D/'git-inputs.json')['inputs']:assert H((D/i['snapshot']).read_bytes())==i['sha256']
pack=J(D/'package.json');sources={r['id']:r for r in J(D/'consumer/content/esperienze-C4.json')};bindings={b['id']:b for b in J(D/'package-bindings.json')};canonical=lambda v:json.dumps(v,sort_keys=True,separators=(',',':'),ensure_ascii=False,allow_nan=False).encode()
for r in pack['records']:
 b=bindings[r['id']];assert H(canonical(r))==b['candidateSha256'];assert H(canonical(sources[r['id']]))==b['sourceSha256'];assert r['section']==sources[r['id']]['section']and r['skill']==sources[r['id']]['skill']
for r in E(D/'package.json')['records']:verify_record(r)
a=E(D/'actual-code.json');rows=[];total=0
for r in a['results']:
 ident=r['id'];lo,hi,step,points,answers,unit=SPECS[ident];lo,hi,step=map(exact,(lo,hi,step));assert len(r['states'])==int((hi-lo)/step)+1;stateproof=[]
 for i,c in enumerate(r['states']):
  observedx=c['x'];assert float(observedx)==float(lo)+i*float(step)
  # Preserve actual JSON lexemes; compare the IEEE representation required by the actual JS producer, no epsilon.
  want=value(ident,observedx);assert float(c['solve']['y'])==float(want)
  stateproof.append({'gridIndex':i,'intendedExactInput':str(lo+i*step),'actualInputLexeme':str(observedx),'physicalExactGivenActualInput':str(want),'actualOutputLexeme':str(c['solve']['y']),'strictIEEERepresentationMatches':True})
 assert len(r['questions'])==2
 if r['variant']=='draft':
  strictStimuli={q['id']:q for q in J(D/'stimuli-prompt-data-only.json')['records']}
  assert [q['prompt']for q in r['questions']]==[q['prompt']for q in strictStimuli[ident]['tasks']]
  for q,point,answer in zip(r['questions'],points,answers):assert exact(q['value'])==value(ident,point,True)==exact(answer)and q['unit']==unit
 else:
  originalPoints={'SIM-C4-L04-01':['8','5'],'SIM-C4-L04-02':['9','6'],'SIM-C4-L05-01':['4','3'],'SIM-C4-L05-02':['6','8'],'SIM-C4-L05-03':['8','0'],'SIM-C4-L05-04':['2','3'],'SIM-C4-L05-05':['0.8','0.6']}[ident]
  for q,point in zip(r['questions'],originalPoints):assert float(q['value'])==float(value(ident,point,True))and q['unit']==unit
 rows.append({'id':ident,'variant':r['variant'],'manualPoints':list(points)if r['variant']=='draft'else originalPoints,'manualExactAnswers':list(answers)if r['variant']=='draft'else[str(value(ident,x,True))for x in originalPoints],'sourceUnits':unit,'states':stateproof,'actualQuestions':r['questions']});total+=len(stateproof)
assert len(rows)==14 and total==160
(D/'actual-comparison.json').write_text(json.dumps({'phase':'CPU_SCIENTIFIC_COMPARISON','candidateCommit':'6ec47222918635ae3ee38a11f4f5b3cbc9ccd5fa','states':total,'records':rows,'bindingIdentity':'ALL7_SOURCE_AND_CANDIDATE_CANONICAL_HASHES_MATCH','actualDraftTasks':14,'originalAndDraftStates':'IDENTICAL_ASSERTED_BY_PRODUCER','Chrome':'NOT_RUN','canonicalDBImport':'NOT_RUN','humanApproval':'NOT_RUN','publicationAction':'NONE','activityCredit':0},ensure_ascii=False,indent=2,default=str)+'\n');print('7drafts,14assigned exact manualtasks,160actual code states; no browser')
